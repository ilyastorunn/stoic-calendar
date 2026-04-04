---
name: market-pulse
description: When the user wants a comprehensive App Store market overview, daily/weekly market briefing, or combined view of chart movements, trending keywords, featured apps, and new releases. Also use when the user mentions "market overview", "what's happening on the App Store", "market briefing", "weekly report", "market trends", or "state of the market". For chart-specific rank changes only, see market-movers. For keyword trends only, see keyword-research.
metadata:
  version: 1.0.0
---

# Market Pulse

You provide a comprehensive market overview by combining multiple data signals: chart movements, trending keywords, featured apps, new releases, and category dynamics.

## Initial Assessment

1. Check for `app-marketing-context.md`
2. Ask for **scope**: entire App Store or specific category
3. Ask for **country** (default: US)
4. Ask for **format**: quick briefing (default), detailed report, or competitive focus

## Data Collection

Gather from multiple sources in parallel:

1. **`get_market_movers`** — Chart gainers, losers, new entries, exits
2. **`get_market_activity`** — All significant chart movements
3. **`get_trending_keywords`** — Keywords with rising search volume
4. **`get_featured_apps`** — What Apple is featuring today
5. **`get_new_releases`** — Recent launches
6. **`get_new_number_1`** — Apps that just hit #1
7. **`get_category_top`** — Current chart standings
8. **`get_downloads_to_top`** — Download benchmarks for the category

## Market Briefing Framework

### 1. Headlines

Top 3-5 most important market events right now.

### 2. Chart Dynamics

| Movement | Apps | Significance |
|----------|------|-------------|
| Biggest gainer | | |
| Biggest loser | | |
| New entries | | |

### 3. Trending Keywords

| Keyword | Growth | Volume | Difficulty | Relevance |
|---------|--------|--------|------------|-----------|

### 4. Apple Featuring

| Featured Spot | App | Category | Why It Matters |
|--------------|-----|----------|----------------|
| App of the Day | | | |
| Game of the Day | | | |

### 5. New Launches & Breakouts

| App | Developer | Days Since Launch | Current Rank |
|-----|-----------|------------------|--------------|

## Output Formats

### Quick Briefing (default)

```markdown
## App Store Pulse — [Date]

### 🔥 Headlines
- ...

### 📊 Chart Movers
Top Gainers: [App] +X, [App] +Y
Top Losers: [App] -X, [App] -Y
New: [App] entered at #Z

### 📈 Trending
Keywords rising: "keyword1" (+X%), "keyword2" (+Y%)

### ⭐ Featured Today
App of the Day: [App]
Theme: [collection name]

### 💡 What This Means for You
- [1 actionable takeaway]
- [1 opportunity to watch]
- [1 threat to monitor]
```

## Related Skills

- `market-movers` — Deep dive into specific chart rank changes
- `keyword-research` — Explore trending keywords further
- `competitor-analysis` — Analyze specific competitors spotted in movers
- `app-store-featured` — Strategy for getting featured based on current patterns
- `ua-campaign` — Adjust spend based on category benchmarks
