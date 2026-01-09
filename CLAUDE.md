# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Stoic Calendar is a React Native/Expo mobile application for tracking time through visual timeline grids. The app uses a Stoic-inspired minimalist design philosophy and focuses on making time passage tangible through day-by-day grid visualizations.

**Current Status**: MVP (Minimum Viable Product) - local-only AsyncStorage persistence with Firebase-ready data structures for future cloud sync.

## Development Commands

### Starting the App

```bash
npm install              # Install dependencies
npx expo start           # Start development server
npm run android          # Run on Android emulator
npm run ios              # Run on iOS simulator
npm run web              # Run in web browser
```

### Code Quality

```bash
npm run lint             # Run ESLint (expo lint)
```

### Utilities

```bash
npm run reset-project    # Reset to blank app (moves starter code to app-example/)
```

## Architecture

### File-Based Routing (Expo Router)

The app uses Expo Router's file-based routing system with a tab-based navigation structure:

- `app/_layout.tsx` - Root layout with theme provider
- `app/(tabs)/_layout.tsx` - Tab navigation layout with custom FloatingTabBar
- `app/(tabs)/home.tsx` - Home screen (displays active timeline)
- `app/(tabs)/timelines.tsx` - Timeline management screen
- `app/(tabs)/settings.tsx` - Settings screen

The `(tabs)` folder name creates a route group without affecting the URL structure.

### Data Flow Architecture

**Storage Layer** (`services/storage.ts`):

- AsyncStorage wrapper for all data persistence
- Centralized storage operations for timelines and settings
- Firebase-ready data structure (all data is stored in a format that can be migrated to Firestore)
- Key functions: `loadTimelines()`, `saveTimeline()`, `getActiveTimeline()`, `setActiveTimeline()`

**Business Logic Layer** (`services/timeline-calculator.ts`):

- Timeline creation from types (YEAR, MONTH, WEEK, CUSTOM)
- Progress calculations (days passed, remaining, percentage)
- Timeline validation and updates
- Key functions: `createTimeline()`, `calculateTimelineStats()`, `updateWeekTimeline()`

**UI Components** (`components/`):

- `stoic-grid.tsx` - Core grid visualization component (displays timeline as grid of squares)
- `timeline-card.tsx` - Timeline list item with progress display
- `timeline-form-modal.tsx` - Modal for creating/editing timelines
- `floating-tab-bar.tsx` - Custom bottom navigation bar
- `settings-group.tsx` - Settings screen grouped sections

### Type System (`types/timeline.ts`)

Core data model:

```typescript
interface Timeline {
  id: string;              // Unique identifier
  type: TimelineType;      // 'year' | 'month' | 'week' | 'custom'
  title: string;           // Display name (e.g., "2026", "This Week")
  startDate: string;       // ISO 8601 format
  endDate: string;         // ISO 8601 format
  createdAt: string;       // ISO 8601 format
  isActive: boolean;       // Only one timeline is active (displayed on home)
  widgetPreferences?: WidgetPreferences; // Reserved for future iOS widget
}
```

### Date Utilities (`utils/date-helpers.ts`)

Centralized date manipulation functions:

- `getStartOfCurrentYear()`, `getEndOfCurrentYear()` - Current year boundaries
- `getStartOfCurrentMonth()`, `getEndOfCurrentMonth()` - Current month boundaries
- `getStartOfCurrentWeek()`, `getEndOfCurrentWeek()` - Current week boundaries (Monday-Sunday)
- `getDaysPassed()`, `getDaysRemaining()`, `getTotalDays()` - Progress calculations
- `getProgressPercentage()` - Returns 0-100 percentage
- `toISOString()`, `nowISO()` - ISO 8601 date formatting

### Grid Layout Utilities (`utils/grid-layout.ts`)

Grid rendering calculations:

- Determines grid dimensions based on total days
- Calculates square sizes and spacing
- Handles responsive layout for different screen sizes

## Important Patterns

### Timeline Types

1. **YEAR**: Fixed year timeline (e.g., 2026)
2. **MONTH**: Fixed month timeline (e.g., January 2026)
3. **WEEK**: Auto-updating current week (Monday-Sunday)
4. **CUSTOM**: User-defined date range

### Active Timeline Pattern

- Only ONE timeline can be `isActive: true` at a time
- Active timeline is displayed on the Home screen
- Use `setActiveTimeline(id)` to switch active timeline (automatically updates all timeline flags)

### Week Timeline Auto-Update

Week timelines should auto-update to current week:

- Check with `weekTimelineNeedsUpdate(timeline)`
- Update with `updateWeekTimeline(timeline)`
- App should check on launch or when user navigates to home

## Path Aliases

The project uses `@/` as an alias for the root directory:

```typescript
import { Timeline } from '@/types/timeline';
import { loadTimelines } from '@/services/storage';
import { StoicGrid } from '@/components/stoic-grid';
```

## Technology Stack

- **Framework**: React Native 0.81.5 with Expo SDK 54
- **Routing**: Expo Router 6.0 (file-based routing)
- **State**: React hooks (no external state management)
- **Storage**: AsyncStorage (local persistence)
- **Animations**: React Native Reanimated 4.1
- **TypeScript**: Strict mode enabled

## Future Integration Notes

### Firebase (Not Active in MVP)

- `services/firebase-service.ts` contains placeholder structure
- Data structure is Firebase-ready (all dates in ISO 8601, flat structure)
- To activate: Install `firebase` package and implement functions in firebase-service.ts
- See inline TODO comments for implementation guidance

### RevenueCat (Not Active in MVP)

- `services/revenue-cat-service.ts` contains placeholder for subscription management
- Reserved for future premium features

### iOS Widgets (Not Active in MVP)

- Timeline model includes `widgetPreferences` field
- Reserved for future WidgetKit integration

## Design Philosophy

**Dark-Mode-First**: App defaults to dark mode (`DEFAULT_SETTINGS.themeMode = 'dark'`)

**Stoic Minimalism**:

- Clean, focused UI with minimal distractions
- Grid-based visualization makes time tangible
- No gamification or notifications
- Emphasizes awareness over motivation

**Firebase-Ready Structure**:

- All data uses ISO 8601 date strings
- Flat data structure (no nested objects that can't serialize)
- Ready for Firestore migration without data model changes
