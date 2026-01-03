# NorthStar.md — Stoic Calendar

This document defines the immutable design and product principles of the Stoic Calendar app.
All future design, UI, UX, motion, and code decisions must align with this file.

---

## 1. Product Philosophy

Stoic Calendar exists to make time *visible*, not actionable.

- No urgency
- No productivity pressure
- No gamification

Time is presented neutrally, calmly, and honestly.
The UI never tells the user what to do — it only shows reality.

Widgets are the product.
The app is a configuration tool.

---

## 2. Core Design Principles

1. **Quiet UI**
   - No visual noise
   - No decorative elements
   - Empty space is intentional

2. **Single Focus**
   - One widget shows one timeline
   - One screen has one primary purpose

3. **Truthful Visualization**
   - One dot always equals one real day
   - No grouping, no averages, no abstraction

4. **Non-Emotional Tone**
   - UI does not motivate or warn
   - Visuals speak without commentary

5. **Widget-First Hierarchy**
   - Widgets define visual language
   - App mirrors widget behavior

---

## 3. Color System

### Base Colors
- Apple semantic system colors only:
  - `systemBackground`
  - `secondarySystemBackground`
  - `label`
  - `secondaryLabel`

### Accent Color
- Single accent tone (cool blue / indigo range)
- Used only for:
  - Filled dots
  - Selected states

### Rules
- No gradients
- No shadows
- No opacity tricks
- Automatic light / dark adaptation

---

## 4. Typography

### Base Font
- SF Pro (default iOS)

### Accent Font
- Serif font used **only** for:
  - Timeline titles
  - Year labels

### Rules
- No font mixing beyond this
- No decorative weights
- Typography must never compete with the grid

---

## 5. Grid System (Stoic Grid)

### Definition
- 1 dot = 1 day
- Dot states:
  - Filled → past
  - Empty → future

### Layout Rules
- Grid must always fit its container
- Dot count never changes
- Dot size and spacing scale dynamically

### Prohibited
- Scrollable grids in widgets
- Grouped dots
- Rounded containers around grid

---

## 6. Motion

### Allowed
- Subtle fill animation on initial render
- Linear or ease-in-out timing

### Forbidden
- Bounce
- Spring effects
- Attention-grabbing transitions

Widgets may be fully static.

---

## 7. Interaction

- No gestures inside widgets
- No long-press logic beyond system default
- App interactions are minimal and predictable

---

## 8. Content Rules

- No motivational quotes
- No countdown language
- No alerts related to time passing

Text exists only to label what is being shown.

---

## 9. What This App Is NOT

- Not a habit tracker
- Not a planner
- Not a productivity tool
- Not a reminder app

---

## 10. Decision Filter

If a design or feature decision is unclear, ask:

> "Does this make time clearer without making it louder?"

If the answer is no — it does not belong in Stoic Calendar.

