---
name: competitor-tracking
description: When the user wants to monitor competitor apps on an ongoing basis — tracking metadata changes, keyword shifts, screenshot updates, rating trends, or new features. Use when the user mentions "competitor monitoring", "track competitors", "competitor alert", "competitor changed their title", "watch a competitor app", "competitor weekly report", "competitive intelligence", or "what changed in competitor's listing". For a one-time deep competitive analysis, see competitor-analysis. For market-wide chart movements, see market-movers.
metadata:
  version: 1.0.0
---

# Competitor Tracking

You set up and run ongoing competitor surveillance — catching metadata changes, keyword shifts, rating drops, and new feature launches before they impact your rankings.

## Setup: Define Your Watchlist

1. Check for `app-marketing-context.md`
2. Ask: **Who are your top 3–5 competitors?**
3. Ask: **How often do you want to review?** (weekly recommended)
4. Ask: **What are you most concerned about?** (keywords, ratings, creative, pricing)

## What to Track

### Metadata Changes

```bash
GET /v1/apps/:id  # title, subtitle, description
```

Watch for:
- **Title changes** — new keyword being targeted, repositioning
- **Subtitle changes** — testing new hooks or keywords
- **Description changes** — messaging strategy shift
- **Screenshot updates** — new creative direction or A/B test winner shipped

### Keyword Ranking Changes

```bash
GET /v1/apps/:id/keywords
GET /v1/keywords/ranks?keyword=[shared keyword]
```

Watch for:
- Keywords they're newly ranking for
- Keywords they dropped (opportunity)
- A competitor jumping above you for a shared keyword

### Ratings and Reviews

```bash
GET /v1/apps/:id/reviews?sort=recent&limit=20
```

Watch for:
- Rating drop (they shipped a bad update — opportunity)
- Surge of 1-stars around a specific complaint (user pain you could solve)

### Chart Positions

```bash
GET /v1/market/movers?genre=[genre_id]&country=us
```

## Weekly Competitive Report Template

```
Competitive Update — Week of [Date]

CHANGES DETECTED:
━━━━━━━━━━━━━━━━━
[Competitor Name]
  Metadata: [changed / no change]
    → [specific change if any]
  Top keywords: [gained X / lost Y / stable]
  Rating: [X.X → X.X]
  Chart position: [#N → #N in category]

OPPORTUNITIES IDENTIFIED:
1. [Competitor X dropped keyword Y — consider targeting it]
2. [Competitor X has surge of complaints about Z — your strength]

THREATS:
1. [Competitor X now ranks #3 for [keyword] — we're at #8]

ACTION ITEMS:
1. [Specific response to a change]
```

## Competitive Response Playbook

| What changed | Response |
|-------------|---------|
| Competitor targets your #1 keyword in title | Defend: fully optimize metadata; increase ASA bids |
| Competitor drops a keyword you share | Opportunity: double down |
| Competitor upgrades screenshots | Audit yours — are they still best in category? |
| Competitor rating drops below 4.0 | Mention your rating in promotional text |
| New competitor enters top 10 | Run full `competitor-analysis` on them |

## Related Skills

- `competitor-analysis` — Deep one-time competitive strategy
- `keyword-research` — Act on the keyword gaps you find
- `market-movers` — Catch chart-level competitor movements automatically
- `apple-search-ads` — Respond to competitor keyword moves with ASA bids
