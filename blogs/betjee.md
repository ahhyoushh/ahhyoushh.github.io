---
title: "The BetJee Project: Scaling Prediction Markets"
date: "Feb 2026"
category: "Systems Engineering"
---

The journey from a viral weekend prototype to a professional realtime exchange.

## Select Platform Version

### Version 1.0 (Legacy) — The Viral Prototype
Serverless architecture, sigmoid bonding curves, and the lesson of the 1.2 million request "hug of death."

[Read V1 Deep-Dive](#v1-report)

### Version 2.0 (Current) — The Realtime Exchange
WebSocket architecture via Durable Objects, Binary LMSR engine, and integrated Algo Trading Studio.

[Explore V2 Features](/blogs/betjee_v2)

---

<div class="note">

Showing Legacy V1 Report below. For the latest architecture, see V2.

</div>

| Project | Uptime | Requests | Views | Users | Egress |
|---------|--------|----------|-------|-------|--------|
| BetJee | 48 Hours | 1.2 Million | 11k | 2.4k | 13GB (264%) |

## 1. Introduction: The "Meme" Economy

In the Indian engineering ecosystem, the **Joint Entrance Examination (JEE)** is the ultimate arbiter of fate. As the exam happens across multiple days and shifts, the difficulty varies. Students obsess over which shift was the "hardest", often betting that their shift was the toughest by human nature (since it's a percentile-based exam).

![Google Analytics Overview](/assets/betjee/google_analytics.png)
*Fig 1. Performance Overview: 11k views in 48 hours ([Google Analytics](https://analytics.google.com/analytics/web/#/a249287112p523693725/reports/dashboard?r=13601545908&params=_u.comparisonOption%3Ddisabled%26_u.date00%3D20260208%26_u.date01%3D20260212&discardConfirmed=true))*

It started as a meme on **r/JEENEETARDS** (<https://www.reddit.com/r/JEENEETards>).

Post made:

<https://www.reddit.com/r/JEENEETards/comments/1r04qpp/so_i_made_it/>

I realized this was a perfect use case for a **Prediction Market**—an exchange where the price of an asset (a specific shift) reflects the collective belief of the crowd. I built **BetJee** to test this hypothesis. It spiraled from a weekend project into a distributed system handling **1.2 million requests**.

![Realtime Active Users](/assets/betjee/active_user_count.png)
*Fig 2. Realtime Traffic: ~200 concurrent users constantly betting*

This is a deep dive into the architecture, the math behind the economy, and why I had to shut it down due to database egress limits (264% of quota) and my upcoming **12th-grade Board Exams** eating up my time.

## 2. Database Architecture: The Ledger

Because this was a financial system (even with fake currency), data integrity was crucial. I designed a normalized PostgreSQL schema.

All schemas, policies and trade_rpc queries are available on [GitHub](https://github.com/ahhyoushh/BetJee)

### A. Schema Definitions

I separated user identity (`users`) from authentication secrets (`accounts`) to ensure security.

**The Market State:**
This table held the live state of every shift. I used an integer for `remaining_shares` to represent the liquidity pool. Markets were fixed to be 21s1, 21s2, 22s1, 22s2, 23s1, 23s2, 24s1, 24s2, 28s1 and 28s2.

```sql
CREATE TABLE markets (
  shift_id INTEGER PRIMARY KEY,
  code TEXT NOT NULL, -- e.g., "27 JAN S1"
  remaining_shares INTEGER NOT NULL, -- The liquidity pool
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**The Immutable Ledger:**
Every trade was recorded here. This allowed me to reconstruct the entire market history if the state ever corrupted. I enforced an immutable record using `GENERATED ALWAYS AS IDENTITY`.

*Note on Short Selling:* The schema supports negative integers for shares. This enabled **Short Selling**—allowing users to bet *against* a shift being hard. If a user sold shares they didn't own, they entered a negative position (e.g., -10 shares), effectively increasing the liquidity pool and driving the price down.

```sql
CREATE TABLE transactions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id TEXT REFERENCES users(id),
  shift_id INTEGER REFERENCES markets(shift_id),
  shares INTEGER NOT NULL, -- Positive for Buy, Negative for Sell
  price NUMERIC NOT NULL, -- Execution price
  type TEXT CHECK (type IN ('buy', 'sell')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**The Defense Layer:**
There were around 800 bot accounts created on the initial Linear-bonding curve model, manipulating the market. To fight botnets, I tracked IP addresses in a Redis-like structure within Postgres to rate-limit trades.

```sql
CREATE TABLE ip_limits (
  ip_address TEXT PRIMARY KEY,
  last_username TEXT,
  last_trade_at TIMESTAMP WITH TIME ZONE
);
```

### B. Row Level Security (RLS) Policies

I implemented a **"Service-Role Only"** write architecture. While the public (`anon`) could *read* the market data to render charts, they could effectively *never* write to the database directly. All writes had to go through the Edge Functions (RPC).

**Policy: Public Read Access**

```sql
CREATE POLICY "public read markets" ON markets
FOR SELECT
TO anon
USING (true);
```

**Policy: Service-Only Write Access**

```sql
CREATE POLICY "service only users" ON users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

## 3. The Pricing Engine: Solving the "Whale" Problem

**The Problem:**
My initial prototype used a **Linear Bonding Curve** (Price = k * Supply). This failed immediately. A single "whale" (a user with high capital, mostly a bot-manipulated user) bought 500 shares, pushing the price linearly to infinity and crashing the market liquidity.

![Initial Market State (Linear Curve)](/assets/betjee/initial_linear_market.png)
*Fig 3. Early prototype using Linear Bonding Curve (Highly Volatile and bot sensitive)*

**The Solution:**
I pivoted to a **Sigmoid Bonding Curve**. This acts as an Automated Market Maker (AMM).

- **Low Demand:** Price increases slowly.
- **Mid Demand:** Price accelerates (high volatility).
- **High Demand:** Price plateaus as it approaches the cap.

![Sigmoid Curve Implementation](/assets/betjee/sigmoid_curve.png)
*Fig 4. Stabilized Market after Sigmoid Update*

### The Mathematics

To model this, I utilized the logistic function. The price $P$ as a function of remaining supply $x$ is defined as:

$$
P(x) = P_(min) + (P_(max) - P_(min)) / (1 + e^(-k(x - x_0)))
$$

Where:
- $k$ is the **steepness** (volatility).
- $x_0$ is the **midpoint** (where price action is most volatile).
- $P_(min)$ and $P_(max)$ are the hard floors and caps.

This formula ensures that as shares become scarce ($x -> 0$), the price exponentially approaches the maximum, making it mathematically impossible to corner the entire market.

### The Implementation (PL/pgSQL)

I moved the pricing logic *inside* the database using a Postgres RPC function (`handle_trade`) to ensure it executed atomically.

```sql
-- Calculate Price at Start
v_price_start := v_price_min + (v_price_max - v_price_min) /
(1 + EXP(-v_sigmoid_steepness * (((p_total_shares_cap - v_remaining_shares) / v_max_tradable_shares) - v_sigmoid_mid_point)));

-- Calculate Price at End (After shares are removed)
v_price_end := v_price_min + (v_price_max - v_price_min) /
(1 + EXP(-v_sigmoid_steepness * (((p_total_shares_cap - (v_remaining_shares - p_shares)) / v_max_tradable_shares) - v_sigmoid_mid_point)));

-- Execution Price = Average of Start and End
v_avg_price := (v_price_start + v_price_end) / 2.0;
```

## 4. Advanced Features: Stop Loss & Recursive Execution

A major challenge was implementing **Stop Losses** in a serverless environment. Since I couldn't afford to run a 24/7 background worker to check prices, I used an **Event-Driven Recursive Trigger**.

![Short Selling and Stop Loss Interface](/assets/betjee/short%20selling%20stop%20loss.webp)
*Fig 5. Short Selling & Stop Loss Interface ([Reddit Update](https://www.reddit.com/r/betjee/comments/1r0zrf6/stop_loss_and_short_selling_live_please_report/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button))*

**The Logic:**
Inside the `handle_trade` SQL function, after a trade executes and the price shifts, the system immediately checks the `stop_losses` table. If the new price crosses a user's trigger threshold, the function **recursively calls itself** to execute the stop-loss order within the same transaction block.

This ensured that stop losses were executed instantly with zero latency, purely within the database layer.

```sql
-- 8. TRIGGER STOP LOSSES (Recursion)
FOR v_sl_record IN
  DELETE FROM stop_losses
  WHERE shift_id = p_shift_id
  AND ((shares < 0 AND trigger_price >= v_price_end) OR (shares > 0 AND trigger_price <= v_price_end))
  RETURNING *
LOOP
  -- Execute force trade
  PERFORM handle_trade(v_sl_record.user_id, v_sl_record.shift_id, v_sl_record.shares, ... 'SYSTEM', TRUE);
END LOOP;
```

## 5. Concurrency: The "Double Spend" Race Condition

**The Problem:**
With 200 trades per minute, Race Conditions were inevitable. If User A and User B buy the last 10 shares at the exact same millisecond, a standard `SELECT` then `UPDATE` would result in negative inventory (a double spend).

**The Fix:**
I enforced **Pessimistic Locking** using the `FOR UPDATE` clause.

```sql
-- LOCK ROWS (Concurrency Safety)
-- This line halts any other transaction trying to touch this specific market
-- until the current transaction commits or rolls back.
SELECT remaining_shares INTO v_remaining_shares
FROM markets
WHERE shift_id = p_shift_id FOR UPDATE;

-- LIQUIDITY CHECK (Atomic)
IF p_shares > 0 AND (v_remaining_shares - p_shares) < p_min_market_shares THEN
    RAISE EXCEPTION 'Liquidity Limit: Cannot buy, market is dry.';
END IF;
```

## 6. Security: The Bot War and "The Wipe"

As the platform trended, botnets arrived. They created thousands of accounts to farm the signup bonus and manipulate prices.

**Evidence of bot manipulation:**
- [Reddit Post 1 (Bot Manipulation)](https://www.reddit.com/r/betjee/comments/1r0i8iw/comment/o4jtiz5/)
- [Reddit Post 2 (Harshad Mehta Pump)](https://www.reddit.com/r/JEENEETards/comments/1r0f85y/harshad_mehta/)
- [Reddit Post 3 (Market Boosting)](https://www.reddit.com/r/JEENEETards/comments/1r0fit1/boosting_24s2_be_ready/)

**The Problem:**
Banning an account wasn't enough; they would just create more. Furthermore, if I banned a bot that held 50% of the shares, those shares would be "frozen," destroying the market liquidity.

**The Fix: "Scorched Earth" Protocol**
I wrote a `wipeUserCompletely` function in Deno. It utilized heuristic analysis (e.g., >3 accounts created on one IP in <15 seconds).

**Code Segment: The Deflationary Wipe**
This function deletes the user and their positions but **does not refund the shares to the market pool**. The shares are effectively "burned." This prevents the price from crashing, preserving value for legitimate investors.

```js
// Deno Edge Function
export async function wipeUserCompletely(supa: any, usernames: string[], ip: string) {
  console.log(`[WIPE] Wiping users: ${usernames.join(", ")} on IP ${ip}`);

  // 1. Delete Transactions (Erase history)
  await supa.from("transactions").delete().in("user_id", usernames);

  // 2. Delete Positions (The "Burn")
  // We delete the ownership record, but we DO NOT increment 'remaining_shares'
  // in the markets table. The supply stays constricted.
  await supa.from("positions").delete().in("user_id", usernames);

  // 3. Delete Authentication
  await supa.from("accounts").delete().in("username", usernames);
  await supa.from("users").delete().in("id", usernames);
}
```

## 7. Architecture & Scalability Challenges

### The "Realtime" Illusion

Supabase offers Realtime (WebSockets), but the free tier has concurrent connection limits. With 2,300+ users, I couldn't use it.

![API Calls Report](/assets/betjee/supabase_report.png)
*Fig 6. API Traffic Spike: 1.2M+ calls in 48 hours*

**The Solution:**
I implemented an optimized **Polling Architecture**. The client requested `delta` (changes since the last timestamp) every 3 seconds.

- **Pros:** Stateless, simple, worked within standard HTTP request quotas.
- **Cons:** Created massive egress traffic (13GB+), hitting **264%** of my Supabase limit.

![Supabase Egress Limit](/assets/betjee/egrees_limit.png)
*Fig 7. Consequence of Polling: 264% Egress Limit Reached*

### The Frontend Tax Bug

To reduce server load, I calculated the estimated tax (1.67%) on the client side using Vanilla JS.

**The Mistake:** I updated the Sigmoid `steepness` parameter on the backend SQL but forgot to push the update to the frontend `app.js`.

**The Result:** Users saw one price on the UI, but the trade executed at a slightly different price.

**The Lesson:** Never duplicate business logic. The database should be the **Single Source of Truth**.

## 8. The Community Irony

Perhaps the most educational aspect of this project wasn't the code, but the sociology.

One of the users created a subreddit, **r/betjee** ([link](https://www.reddit.com/r/betjee/)), for me to gather feedback and bug reports. It grew to over 30 active members quickly. However, as I focused entirely on fixing critical backend scaling issues (and studying for Physics), I was unable to moderate the community actively.

In a twist of irony, the creator of the subreddit, removed me from the moderation team. The community I built to discuss the algorithm and errors actively, is now, to my knowledge, being used for unrelated promotions.

It was a harsh lesson: **Decentralized systems are great for code, but communities require centralized and trustworthy leadership.**

## 9. Conclusion

BetJee was a crash course in high-frequency system design. I went from knowing nothing about what the stock market is to managing a trading engine with over 200 transactions a minute.

However, the reality of cloud costs and the imminent reality of my **12th-grade Board Exams** forced me to shut it down.

Final reddit post:

<https://www.reddit.com/r/betjee/comments/1r18jkc/and_it_ends/>
