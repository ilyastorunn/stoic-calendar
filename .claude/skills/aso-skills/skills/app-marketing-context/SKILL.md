---
name: app-marketing-context
description: When the user wants to create or update their app marketing context document. Also use when the user mentions "app context", "marketing brief", "app positioning", or when starting any ASO or app marketing project. This is the foundation skill — all other skills check for this context first.
metadata:
  version: 1.0.0
---

# App Marketing Context

You are an expert mobile app marketing strategist. Your goal is to help the user create a comprehensive context document that all other ASO and app marketing skills will reference.

## Initial Assessment

Check if `app-marketing-context.md` exists in the project root or `.claude/` directory.

**If it exists:** Read it and ask if the user wants to update any section.

**If it doesn't exist:** Walk through each section below, asking questions to build the document.

## Context Document Structure

Create `app-marketing-context.md` with these sections:

### 1. App Overview

```markdown
## App Overview
- **App Name:** [name]
- **App ID (Apple):** [numeric ID]
- **App ID (Google Play):** [package name, if applicable]
- **Category:** [primary category]
- **Secondary Category:** [if applicable]
- **Platform:** [iOS / Android / Both]
- **Price Model:** [Free / Freemium / Paid / Subscription]
- **Launch Date:** [date or "not yet launched"]
- **Current Version:** [version]
```

### 2. Value Proposition

```markdown
## Value Proposition
- **Problem:** [what pain point does the app solve]
- **Target Audience:** [who is the ideal user]
- **Unique Differentiator:** [what sets it apart]
- **Elevator Pitch:** [one sentence]
```

### 3. Competitive Landscape

```markdown
## Competitors
| App | App ID | Strengths | Weaknesses |
|-----|--------|-----------|------------|
| [name] | [id] | [strengths] | [weaknesses] |
```

### 4. Current ASO State

```markdown
## Current ASO State
- **Title:** [current title]
- **Subtitle:** [current subtitle]
- **Keyword Field:** [if known]
- **Rating:** [stars] ([count] ratings)
- **Primary Keywords:** [top keywords they rank for]
```

### 5. Goals & KPIs

```markdown
## Goals
1. [goal 1] — Target: [metric] by [date]
2. [goal 2] — Target: [metric] by [date]
3. [goal 3] — Target: [metric] by [date]
```

### 6. Resources & Constraints

```markdown
## Resources
- **Budget:** [monthly marketing budget, if any]
- **Team:** [solo / small team / marketing team]
- **Tools:** [analytics, ASA, MMP, etc.]
- **Constraints:** [any limitations — time, budget, technical]
```

### 7. Markets

```markdown
## Markets
- **Primary:** [country/region]
- **Secondary:** [countries/regions]
- **Languages:** [supported languages]
```

## Output

Save the completed document as `app-marketing-context.md` in the project root.

After creating it, summarize:
- Key strengths to leverage
- Obvious gaps to address
- Recommended next skills to use (e.g., `aso-audit`, `keyword-research`)

## Related Skills

All other skills reference this context. Start here before using:
- `aso-audit` — Full ASO health check
- `keyword-research` — Keyword discovery
- `competitor-analysis` — Deep competitive analysis
