---
title: "effect of diwali on aqi"
description: "made a simple aqi predicting linear regression model and accidentally found out how bad diwali affects AQI"
link: "/blogs/diwaliaqi"
date: "dec 2025"
---

Every year, Diwali brings a burst of lights, celebration, and, unfortunately, a spike in air pollution. Fireworks, increased traffic, and energy usage cause the Air Quality Index (AQI) to soar. This year, I decided to quantify that effect using a **Random Forest Regressor** trained on historical AQI data.

## My Approach

I collected hourly pollutant measurements from key air quality indicators like **CO, NO₂, SO₂, O₃, PM10, PM2.5, and NH₃**. These were aggregated into daily averages, and I added **temporal features** such as month and weekday to capture seasonal patterns.

I then trained a **Random Forest Regressor** to predict the next day's AQI. This model allowed me to see how "normal" air quality would behave and then compare it to the unusual spikes during Diwali.

## Key Findings

### 1. Pre-Diwali Predictions

- The model performed very well on days leading up to the festival, with an **R² score of ~0.86**.
- It could reliably forecast AQI using historical pollutant levels and temporal patterns.

### 2. Diwali Effect

- During the festival, the predicted AQI often **underestimated actual readings by 20–25 points**.
- This shows how Diwali introduces an irregular spike in pollution that traditional temporal patterns cannot fully capture.
- The Month feature could not accurately predict this festival change due to Diwali being quite early this year.

### 3. Feature Importance

- The model highlighted that the **previous day's AQI** was the most influential predictor.
- When this feature was removed, performance dropped, indicating that AQI trends are strongly autocorrelated.

## Observations

- These two reddit posts date just weeks apart: [one on 21st Oct](https://reddit.com/r/pune/comments/1oc8u0w/how_come_pune_got_good_aqi_post_diwali/) before the Lakshmi Pujan and [the other on 6 Nov](https://reddit.com/r/pune/comments/1opnvg0/why_aqi_is_this_bad_today/) even a week after Diwali festival — momentary fun causes long term impact.
- Diwali pushes AQI levels far above normal daily fluctuations.
- Temporal features like weekday or month are insufficient to capture sudden festival-driven surges.
- Predictive models need **event-specific inputs** (like festival dates) to better forecast extreme pollution events.

## Implications

- **Urban planners:** anticipate pollution spikes and manage traffic or industrial activity.
- **Healthcare providers:** warn sensitive populations like children, elderly, and people with respiratory issues.
- **Citizens:** make informed decisions about outdoor activity or preventive measures.

## Source

The complete code and dataset used for this analysis are available on my [GitHub repository](https://github.com/ahhyoushh/AQI-Predictor).

[Go to AQI Project](/projects/aqi)

## Using AI for Cleaner Cities

My Random Forest model demonstrates how **machine learning can capture normal AQI patterns**, but it also highlights the limitations when sudden, human-driven events occur. By combining historical data, temporal features, and event-specific indicators, predictive models could help forecast pollution peaks more accurately and guide preventive action during festivals.

Diwali is beautiful, but its environmental cost is real. Using data and predictive models, we can better understand the consequences and take informed steps to mitigate pollution while still celebrating responsibly.

<div class="note">

Note: My AQI predictions were done based on Pune's AQI dataset from 2017-24 with a large number of values removed due to outliers and missing data.

</div>
