# Stoic Calendar — MVP Product & Build Plan

## 1. Product Vision

**Core Idea**
Stoic Calendar is a widget-first iOS app that visualizes the passage of time in a concrete, non-intrusive way. Instead of abstract numbers, time is represented as a grid of dots — each dot corresponding to a real unit of time already lived or still remaining.

**Primary Value**
- Make time *visible*
- Encourage calm awareness, not urgency
- Enable better time management through visual reality

The app is intentionally minimal. Widgets are the product; the app exists mainly to configure them.

---

## 2. Core Concepts

### Stoic Grid
- 1 dot = 1 day
- Passed days = filled dots
- Remaining days = empty dots
- Dot count always reflects the real duration (no grouping, no abstraction)

Examples:
- Year → 365 dots
- Week → 7 dots
- Custom deadline (e.g. 3 years) → 1095 dots

The grid always fits the available space by dynamically scaling dot size and spacing.

---

## 3. App Structure (MVP)

### Screens

#### 1. Home / Timeline Screen
Purpose:
- Slightly more descriptive version of the widget
- No analytics, no extra insights

Content:
- Timeline title (e.g. "2025", "This Month", "Project X")
- Stoic grid visualization
- Minimal secondary text only if needed

Design notes:
- Calm, centered layout
- Grid is the primary focus

---

#### 2. Customize Widgets Screen
Purpose:
- Create and manage timelines
- Assign timelines to widgets

Features:
- Create new timeline:
  - Type: Year / Month / Week / Custom
  - For custom: name + deadline date
- List of existing timelines
- Widget preview shown in a modal

---

#### 3. Settings Screen
Purpose:
- Global preferences

MVP settings:
- App appearance (system light/dark)
- Basic info / about

(Account, sync, and advanced options are post-MVP)

---

## 4. Widget Strategy (Core Focus)

### Widget Sizes (All included in MVP)
- Small
- Medium
- Large

### Widget Behavior
- One widget shows exactly one timeline
- No interaction inside widgets
- Widgets update automatically at 00:00

### Update Logic
- Widgets are time-aware
- At midnight, one more dot becomes filled
- No manual refresh needed

---

## 5. Data Model (Local, MVP)

Each timeline stores:
- `id`
- `type` (year | month | week | custom)
- `title`
- `startDate`
- `endDate`
- `createdAt`
- `widgetPreferences` (size, future visual options)
- `accentOverride` (reserved for post-MVP)

Data is stored locally. The model is Firebase-ready but does not require authentication in MVP.

---

## 6. Technical Stack

- React Native
- Expo (managed workflow)
- iOS Widgets via Expo config plugins + native widget extension
- Local storage for MVP

Firebase, authentication, and cloud sync are planned for post-MVP.

---

## 7. Visual & Style Brief (High Level)

### Design Principles
- Apple Human Interface Guidelines compliant
- Minimal, calm, neutral
- No gamification
- No urgency-driven UI

### Color
- Apple semantic system colors
- Single custom accent tone (subtle blue/indigo)
- Automatic light/dark support

### Typography
- SF Pro as base font
- Serif accent font for timeline titles (stoic tone)

### Motion
- Subtle grid fill animation on initial render
- No haptics in MVP
- Widgets may remain static or minimally animated

---

## 8. Monetization (Post-MVP Planning)

MVP:
- All features unlocked

Post-MVP ideas:
- Custom timeline limits
- Additional visual styles
- Advanced widget layouts

RevenueCat planned but not required for MVP implementation.

---

## 9. Non-Goals (Important)

The following are explicitly out of scope for MVP:
- Analytics dashboards
- Productivity metrics
- Gamification
- Social or sharing features
- Excessive text or explanations

---

## 10. MVP Success Criteria

- Widgets clearly convey remaining time at a glance
- User understands the grid without explanation
- App feels native, quiet, and intentional
- Widgets update reliably at day boundaries

---

This document is intended to be used as a single source of truth for vibe-coding tools (Claude, Manus, etc.) and as the foundation for a future NorthStar.md style guide.

