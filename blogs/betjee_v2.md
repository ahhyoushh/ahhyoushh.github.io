---
title: "BetJee v2: Engineering a High-Performance Realtime Exchange"
date: "March 2026"
status: "Active / Version 2"
---

# The evolution from polling to WebSockets, and from sigmoid curves to Binary LMSR.

| Stack | Realtime | Latency | Engine | Language |
|-------|----------|---------|--------|----------|
| Next.js + CF Workers | Durable Objects | ~150ms | Binary LMSR | BetJeeScript |

## 1. Architecture: The Stateful Edge

BetJee v1's polling architecture was stateless but expensive, generating 1.2M requests in 48 hours. v2 moves the market state to the **Edge** using **Cloudflare Durable Objects (DO)**.

By maintaining persistent WebSocket connections, the DO acts as a single source of truth for prices. The **WebSocket Hibernation API** is critical here—it allows the DO to "sleep" while idle, staying comfortably within free-tier execution limits while serving hundreds of concurrent users.

## 2. Pricing Engine: Independent Binary Pools

V2 discards the shared sigmoid curve for **Independent Binary Market Pools**. Each market (Shift or Mention) has its own liquidity parameter $b$ and quantity $q$.

```sql
-- Price(YES) = exp(q/b) / (exp(q/b) + 1)
v_price_yes := exp(v_q / v_b) / (1 + exp(v_q / v_b));
```

$$
\text{Price(YES)} = \frac{e^{q/b}}{1 + e^{q/b}}
$$

This ensures mathematical fairness: prices asymptotically approach 0 or 1 but never reach them, and the house loss is strictly bounded to $b \cdot \ln(2)$ per market.

## 3. Algo Trading: The BetJeeScript Compiler

To allow automated trading without risking server integrity, I built a custom **DSL (BetJeeScript)**. The compiler uses `acorn` to parse user code into an **Abstract Syntax Tree (AST)**.

The AST is strictly audited before execution: loops (`for`, `while`) and external APIs (`fetch`, `window`) are banned at the node level. This guarantees O(1) execution time and zero sandbox escapes.

## 4. Realtime Sync: Zustand Sliced Updates

The Next.js frontend uses **Zustand** for state management. To handle high-frequency price updates, components subscribe only to specific slices of the market state. A price change in Shift 3 only re-renders the Shift 3 row, keeping the UI buttery smooth even during peak volatility.

## 5. Concurrency: Atomic Memory Cooldowns

V1's IP-based rate limiting moved to **In-Memory Cooldowns** within the Durable Object. Instead of hitting KV (which has slow write propagation), the DO tracks `botId -> lastTrade` in a private Map. This provides **atomic check-and-set** logic, preventing race conditions from high-frequency bots.

## 6. Conclusion

BetJee v2 represents a shift from "viral prototype" to "financial system." It combines the atomicity of Postgres with the low-latency of the Edge, creating a robust platform for community-driven belief aggregation.
