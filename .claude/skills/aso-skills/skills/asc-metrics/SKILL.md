---
name: asc-metrics
description: When the user wants to analyze their own app's actual performance data from App Store Connect — real downloads, revenue, IAP, subscriptions, trials, or country breakdowns synced via Appeeky Connect. Use when the user asks about "my downloads", "my revenue", "how is my app performing", "ASC data", "sales and trends", "my subscription numbers", "App Store Connect metrics", or wants to compare periods or top markets. For third-party app estimates, see app-analytics. For subscription analytics depth, see monetization-strategy.
metadata:
  version: 1.0.0
---

# ASC Metrics

You analyze the user's **official App Store Connect data** synced into Appeeky — exact downloads, revenue, IAP, subscriptions, and trials. This is first-party data, not estimates.

## Prerequisites

- Appeeky account with ASC connected (Settings → Integrations → App Store Connect)
- Indie plan or higher (2 credits per request)
- Data syncs nightly; up to 90 days of history available

If ASC is not connected, prompt the user to connect it at appeeky.com/settings and return.

## Initial Assessment

1. Check for `app-marketing-context.md` — read it for app context
2. Ask: **What do you want to analyze?** (downloads, revenue, subscriptions, country breakdown, trend comparison)
3. Ask: **Which time period?** (default: last 30 days)
4. Ask: **Specific app or all apps?**

## Fetching Data

### Step 1 — List available apps

```bash
GET /v1/connect/metrics/apps
```

### Step 2 — Get overview (portfolio)

```bash
GET /v1/connect/metrics?from=YYYY-MM-DD&to=YYYY-MM-DD
```

### Step 3 — Get app detail (single app)

```bash
GET /v1/connect/metrics/apps/:appId?from=YYYY-MM-DD&to=YYYY-MM-DD
```

Response includes: `daily[]`, `countries[]`, `totals`.

## Analysis Frameworks

### Period-over-Period Comparison

Fetch two equal-length windows and compare:

| Metric | Prior Period | Current Period | Change |
|--------|-------------|----------------|--------|
| Downloads | [N] | [N] | [+/-X%] |
| Revenue | $[N] | $[N] | [+/-X%] |
| Subscriptions | [N] | [N] | [+/-X%] |
| Trials | [N] | [N] | [+/-X%] |
| Trial → Sub Rate | [X]% | [X]% | [+/-X pp] |

**What to look for:**
- Downloads rising but revenue flat → pricing or paywall issue
- Trials rising but conversions flat → paywall or onboarding issue
- Revenue rising but downloads flat → good monetization improvement

### Country Breakdown

Sort `countries[]` by downloads and revenue:
1. **Top 5 by downloads** — Are you investing in ASO for these markets?
2. **Top 5 by revenue** — Higher ARPD = prioritize ASO
3. **High downloads, low revenue** — Markets with weak monetization
4. **Low downloads, high revenue** — Under-tapped premium markets (localize)

### Revenue Quality Check

| Metric | Formula | Benchmark |
|--------|---------|-----------|
| ARPD | Revenue / Downloads | > $0.05 good; > $0.20 excellent |
| Trial rate | Trials / Downloads | > 20% means strong paywall reach |
| Sub conversion | Subscriptions / Trials | > 25% is strong |

## Output Format

### Performance Snapshot

```
📊 [App Name] — [Period]

Downloads:     [N]  ([+/-X%] vs prior period)
Revenue:       $[N] ([+/-X%])
Subscriptions: [N]  ([+/-X%])
Trials:        [N]  ([+/-X%])
IAP Count:     [N]  ([+/-X%])
Trial→Sub:     [X]%

Top Markets (downloads):
  1. [Country] — [N] downloads, $[N]
  2. [Country] — [N] downloads, $[N]
  3. [Country] — [N] downloads, $[N]

Key Observations:
- [What the trend means]
- [Any anomaly and likely cause]
- [Opportunity identified]

Recommended Actions:
1. [Specific action based on data]
2. [Specific action based on data]
```

## Related Skills

- `app-analytics` — Full analytics stack setup and KPI framework
- `monetization-strategy` — Improve subscription conversion and paywall
- `retention-optimization` — Reduce churn using the metrics as input
- `localization` — Expand top-performing markets seen in country data
