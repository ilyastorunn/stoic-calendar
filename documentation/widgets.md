# Stoic Calendar Widgets Documentation

This document provides comprehensive information about the iOS widget implementation in Stoic Calendar.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Widget Types](#widget-types)
4. [Data Flow](#data-flow)
5. [Widget Configuration](#widget-configuration)
6. [File Structure](#file-structure)
7. [Development Workflow](#development-workflow)
8. [Troubleshooting](#troubleshooting)
9. [Future Enhancements](#future-enhancements)

---

## Overview

Stoic Calendar offers two types of iOS widgets:

1. **Home Screen Widgets** - Configurable timeline grid visualization (Small, Medium, Large)
2. **Lock Screen Widgets** - Always show active timeline (Circular, Rectangular, Inline)

**Key Features:**
- Independent widget configuration (each widget can show a different timeline)
- Dark mode support with proper background rendering
- Optimized grid layout for large timelines (365 days)
- Real-time sync with app data via App Groups
- iOS 17+ AppIntent system for widget configuration

---

## Architecture

### High-Level Flow

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   React Native  │─────▶│   App Groups     │─────▶│  Swift Widgets  │
│   (App)         │      │  (Shared Data)   │      │  (WidgetKit)    │
└─────────────────┘      └──────────────────┘      └─────────────────┘
        │                         │                          │
        │                         │                          │
   TypeScript                  JSON                       Swift
  AsyncStorage              UserDefaults              WidgetKit API
```

### Components

1. **App Layer (TypeScript)**
   - `services/widget-data-service.ts` - Exports data to App Groups
   - Calls sync functions when timelines change

2. **Shared Storage (App Groups)**
   - Container ID: `group.com.stoiccalendar.shared`
   - Stores JSON strings for timeline data, settings, and metadata

3. **Widget Layer (Swift)**
   - `targets/StoicGridWidget/StoicGridWidget.swift` - All widget code
   - Reads from App Groups and renders UI

---

## Widget Types

### 1. Home Screen Widgets (Configurable)

**Provider:** `StoicGridProvider` (AppIntentTimelineProvider)
**Configuration:** `AppIntentConfiguration` with `SelectTimelineIntent`

**Sizes:**
- **Small** (systemSmall) - Compact grid view
- **Medium** (systemMedium) - Grid with progress text
- **Large** (systemLarge) - Full grid with progress text

**Features:**
- User can select which timeline to display (via Edit Widget)
- Shows grid of dots (1 dot = 1 day)
- Displays timeline title and progress
- Supports all theme colors and modes

**User Experience:**
1. Add widget to home screen
2. Long press → Edit Widget
3. Select timeline from picker
4. Widget shows selected timeline (independent of app's active timeline)

### 2. Lock Screen Widgets (Active Timeline Only)

**Provider:** `StoicLockScreenProvider` (TimelineProvider)
**Configuration:** `StaticConfiguration` (no configuration needed)

**Types:**
- **Circular** (accessoryCircular) - Progress ring with percentage
- **Rectangular** (accessoryRectangular) - Title + progress bar + stats
- **Inline** (accessoryInline) - Text only: "Timeline: XX%"

**Features:**
- Always show active timeline (too small for configuration)
- Minimalist design for lock screen aesthetic
- Auto-updates hourly

---

## Data Flow

### 1. App → App Groups

**When:** Timeline CRUD operations, settings changes, app launch

**Function:** `syncAllWidgetData()` in `widget-data-service.ts`

```typescript
// Syncs 3 pieces of data:
await syncActiveTimelineToWidget();     // Active timeline stats
await syncAllTimelinesToWidget();       // All timelines array (for picker)
await syncSettingsToWidget();           // Theme settings
```

**App Groups Keys:**
```typescript
{
  ACTIVE_TIMELINE: 'widget_active_timeline',   // WidgetTimelineData
  ALL_TIMELINES: 'widget_all_timelines',       // WidgetTimelineData[]
  SETTINGS: 'widget_settings',                 // WidgetSettingsData
  LAST_UPDATE: 'widget_last_update',           // ISO timestamp
}
```

**Data Structures:**

```typescript
interface WidgetTimelineData {
  id: string;
  type: string;              // 'year' | 'month' | 'week' | 'custom'
  title: string;             // "2026", "January 2026", "This Week"
  startDate: string;         // ISO 8601
  endDate: string;           // ISO 8601
  daysPassed: number;
  daysRemaining: number;
  totalDays: number;
  progressPercentage: number; // 0-100
}

interface WidgetSettingsData {
  gridColorTheme: string;    // 'classic' | 'forest' | 'sunset' | 'monochrome'
  themeMode: string;         // 'system' | 'light' | 'dark'
}
```

### 2. App Groups → Widgets

**When:** Widget requests timeline (initial load, hourly refresh)

**Function:** `loadTimelineData(for configuration:)` in Swift

```swift
// Home screen widgets:
if let selectedTimeline = configuration.timeline {
  // Load specific timeline from ALL_TIMELINES array
  return allTimelines.first { $0.id == selectedTimeline.id }
} else {
  // Fallback to ACTIVE_TIMELINE (backward compatibility)
  return activeTimeline
}

// Lock screen widgets:
// Always load ACTIVE_TIMELINE
```

### 3. Widget Refresh Schedule

**Home Screen Widgets:**
- Updates every hour OR at midnight (whichever comes first)
- Purpose: Keep day progress accurate

**Lock Screen Widgets:**
- Updates every hour
- Purpose: Keep percentage accurate

**Manual Refresh:**
- When app syncs data: `ExtensionStorage.reloadWidget()`

---

## Widget Configuration

### AppIntent System (iOS 17+)

Home screen widgets use iOS 17's AppIntent system for configuration.

**Key Components:**

1. **TimelineEntity** (AppEntity)
   ```swift
   struct TimelineEntity: AppEntity {
       let id: String
       let title: String
   }
   ```
   - Represents a selectable timeline
   - Displayed in widget configuration picker

2. **TimelineQuery** (EntityQuery)
   ```swift
   struct TimelineQuery: EntityQuery {
       func suggestedEntities() async throws -> [TimelineEntity]
   }
   ```
   - Fetches available timelines from App Groups
   - Reads `widget_all_timelines` key

3. **SelectTimelineIntent** (WidgetConfigurationIntent)
   ```swift
   struct SelectTimelineIntent: WidgetConfigurationIntent {
       @Parameter(title: "Timeline")
       var timeline: TimelineEntity?
   }
   ```
   - Optional parameter (nil = show active timeline)
   - Passed to widget provider

4. **StoicGridProvider** (AppIntentTimelineProvider)
   ```swift
   struct StoicGridProvider: AppIntentTimelineProvider {
       typealias Intent = SelectTimelineIntent

       func timeline(for configuration: Intent, in context: Context) async -> Timeline<Entry>
   }
   ```
   - Receives configuration with selected timeline
   - Loads appropriate data from App Groups

**Why Optional Parameter?**
- Backward compatibility: Existing widgets show active timeline
- Default behavior: New widgets show active timeline until configured
- User choice: Can explicitly select any timeline

---

## File Structure

### Swift Files

```
targets/StoicGridWidget/
├── StoicGridWidget.swift          # Main widget implementation
│   ├── Data Models
│   │   ├── WidgetTimelineData
│   │   ├── WidgetSettingsData
│   │   └── StoicGridEntry
│   ├── AppIntent Infrastructure
│   │   ├── TimelineEntity
│   │   ├── TimelineQuery
│   │   └── SelectTimelineIntent
│   ├── Providers
│   │   ├── StoicGridProvider (Home screen, configurable)
│   │   └── StoicLockScreenProvider (Lock screen, active only)
│   ├── Views
│   │   ├── StoicGridWidgetView (Home screen)
│   │   ├── StoicLockScreenWidgetView (Lock screen)
│   │   └── StoicGridView (Canvas grid renderer)
│   ├── Grid Layout
│   │   ├── GridLayout struct
│   │   └── calculateGridLayout() function
│   ├── Theme
│   │   └── getColorForTheme() function
│   └── Widget Configurations
│       ├── StoicGridWidget
│       ├── StoicLockScreenWidget
│       └── StoicWidgetBundle (@main)
├── expo-target.config.json        # Widget target config
├── Info.plist
├── Assets.xcassets/
└── generated.entitlements          # App Groups entitlement
```

### TypeScript Files

```
services/
└── widget-data-service.ts
    ├── Interfaces
    │   ├── WidgetTimelineData
    │   └── WidgetSettingsData
    ├── Functions
    │   ├── syncActiveTimelineToWidget()     # Sync active timeline stats
    │   ├── syncAllTimelinesToWidget()       # Sync all timelines array
    │   ├── syncSettingsToWidget()           # Sync theme settings
    │   ├── syncAllWidgetData()              # Convenience: sync all
    │   └── getWidgetData()                  # Debug: read from App Groups
    └── ExtensionStorage usage
        └── @bacons/apple-targets
```

### Integration Points

**Widget sync is called in:**

1. `app/_layout.tsx`
   - On app launch: `syncAllWidgetData()`

2. `app/(tabs)/timelines.tsx`
   - On timeline create: `syncAllTimelinesToWidget()` + `syncActiveTimelineToWidget()`
   - On timeline delete: `syncAllTimelinesToWidget()`
   - On active change: `syncActiveTimelineToWidget()`

3. `app/(tabs)/settings.tsx` (future)
   - On theme change: `syncSettingsToWidget()`

---

## Development Workflow

### Prerequisites

- **Development Build Required**: Widgets don't work in Expo Go
- **iOS 17+**: AppIntent APIs require iOS 17
- **App Groups**: Must be configured in app.json and Xcode

### Setup

1. **App Groups Configuration**

   `app.json`:
   ```json
   {
     "ios": {
       "entitlements": {
         "com.apple.security.application-groups": [
           "group.com.stoiccalendar.shared"
         ]
       }
     }
   }
   ```

   `targets/StoicGridWidget/expo-target.config.json`:
   ```json
   {
     "entitlements": {
       "com.apple.security.application-groups": [
         "group.com.stoiccalendar.shared"
       ]
     }
   }
   ```

2. **Dependencies**

   ```bash
   npm install @bacons/apple-targets
   ```

3. **Build Commands**

   ```bash
   # Development build (widgets work)
   npx expo run:ios

   # Expo Go (widgets DON'T work)
   npx expo start  # ❌ Widgets won't appear
   ```

### Making Changes

**TypeScript Changes (widget-data-service.ts):**
- Metro bundler restart is sufficient
- Changes take effect immediately in app
- Widget sees changes on next refresh

**Swift Changes (StoicGridWidget.swift):**
- Requires full native build: `npx expo run:ios`
- Metro restart NOT sufficient
- Xcode recompilation needed

### Testing Workflow

1. **Add widget to home screen**
   - Long press home screen → "+" button → Search "Stoic"
   - Add Small/Medium/Large widget

2. **Configure widget**
   - Long press widget → "Edit Widget"
   - Select timeline from picker
   - Tap outside to save

3. **Verify independence**
   - Add 2 widgets with different timelines
   - Change active timeline in app
   - Confirm widgets don't change

4. **Test dark mode**
   - Enable dark mode
   - Confirm no white border around widget

5. **Test large timelines**
   - Configure widget with 365-day timeline
   - Confirm dots are visible (not too small)

### Debugging

**Check App Groups data:**
```typescript
// In app console (React Native)
import { getWidgetData } from '@/services/widget-data-service';

console.log(getWidgetData());
// Should show: { timeline, settings, lastUpdate }
```

**Check widget logs:**
```swift
// In StoicGridWidget.swift, add:
print("📱 Widget loaded timeline:", timeline?.title ?? "none")
```

View in Xcode Console:
```bash
# Filter for widget logs
Window → Devices and Simulators → View Device Logs
# Or: Xcode → Open Developer Tool → Console
```

---

## Troubleshooting

### Widget Not Appearing

**Problem:** Widget doesn't show in widget gallery

**Solutions:**
1. Ensure development build: `npx expo run:ios` (not Expo Go)
2. Check `expo-target.config.json` exists
3. Verify `@bacons/apple-targets` plugin in `app.json`
4. Clean build: `rm -rf ios && npx expo run:ios`

### Widget Shows "No Timeline"

**Problem:** Widget displays empty state

**Solutions:**
1. Check App Groups data is written:
   ```typescript
   import { syncAllWidgetData } from '@/services/widget-data-service';
   await syncAllWidgetData();
   console.log(getWidgetData()); // Should show data
   ```

2. Verify App Groups ID matches:
   - Swift: `group.com.stoiccalendar.shared`
   - TypeScript: `group.com.stoiccalendar.shared`

3. Check entitlements are correct in both app and widget

### Configuration Not Showing

**Problem:** "Edit Widget" doesn't show timeline picker

**Solutions:**
1. Verify iOS 17+ simulator/device
2. Check `AppIntentConfiguration` is used (not `StaticConfiguration`)
3. Rebuild: `npx expo run:ios` (Swift changes require native build)
4. Remove and re-add widget

### All Widgets Show Same Timeline

**Problem:** Changing active timeline updates all widgets

**Solutions:**
1. Verify `syncAllTimelinesToWidget()` is called:
   ```typescript
   // Should be in timelines.tsx after CRUD operations
   await syncAllTimelinesToWidget();
   ```

2. Check `widget_all_timelines` key exists in App Groups:
   ```typescript
   const data = getWidgetData();
   console.log(data); // Should include all timelines
   ```

3. Rebuild after adding `syncAllTimelinesToWidget()` calls

### Dark Mode White Border

**Problem:** Widget has white border in dark mode

**Solution:**
Ensure `.containerBackground(for: .widget)` is present:
```swift
.containerBackground(for: .widget) {
    backgroundColor
}
```

### 365-Day Timeline Too Small

**Problem:** Year timeline dots not visible in small/medium widgets

**Solution:**
Grid layout optimization is in `calculateGridLayout()`:
- 365 days: 20-30 columns (was 15-20)
- Spacing: 5% (was 10%)
- Dot size: 3-10px (was 6-14px)

Already implemented. If still too small, adjust in Swift:
```swift
// Line ~474 in StoicGridWidget.swift
let minDotSize: CGFloat = totalDays > 180 ? 3 : 5  // Decrease to 2
```

---

## Future Enhancements

### Planned Features

1. **Interactive Widgets (iOS 17)**
   - Tap day in grid to mark as milestone
   - Button to switch to next timeline

   Implementation:
   ```swift
   Button(intent: NextTimelineIntent()) {
       Text("Next")
   }
   ```

2. **Widget Themes (Independent of App)**
   - Add theme parameter to SelectTimelineIntent
   - User can choose widget color independent of app

   ```swift
   struct SelectTimelineIntent: WidgetConfigurationIntent {
       @Parameter(title: "Timeline")
       var timeline: TimelineEntity?

       @Parameter(title: "Theme")
       var theme: ThemeEntity?  // New parameter
   }
   ```

3. **Smart Refresh Schedule**
   - Week timelines: Refresh at Monday 00:00
   - Month timelines: Refresh at 1st of month
   - Reduces unnecessary updates

4. **Widget Previews**
   - Show preview in widget gallery with sample data
   - Implement `preview` in TimelineProvider

5. **StandBy Mode Optimization**
   - Larger dots for StandBy display
   - Higher contrast colors

### Technical Debt

1. **Grid Layout Algorithm**
   - Current implementation is ported from TypeScript
   - Consider native Swift implementation for better performance
   - Add unit tests for grid calculations

2. **Error Handling**
   - Add fallback UI for missing data
   - Better error messages in widget
   - Sentry integration for widget crashes

3. **Data Persistence**
   - Consider using SQLite instead of JSON strings
   - Faster queries for large timeline lists
   - Better data integrity

4. **Testing**
   - Add widget UI tests
   - Test configuration flow
   - Test data sync edge cases

---

## Additional Resources

### Apple Documentation

- [WidgetKit Documentation](https://developer.apple.com/documentation/widgetkit)
- [App Intents Documentation](https://developer.apple.com/documentation/appintents)
- [App Groups Documentation](https://developer.apple.com/documentation/bundleresources/entitlements/com_apple_security_application-groups)

### Expo Documentation

- [@bacons/apple-targets](https://github.com/EvanBacon/apple-targets)
- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)

### Related Files

- `CLAUDE.md` - Project overview and architecture
- `documentation/north_star_stoic_calendar (1).md` - Product vision
- `documentation/stoic_calendar_app_mvp_plan (1).md` - MVP specifications

---

## Changelog

### 2026-01-12 - Widget Configuration & Optimization

**Added:**
- Independent widget configuration with iOS 17+ AppIntent
- Timeline picker in widget configuration
- Separate provider for lock screen widgets
- Optimized grid layout for 365-day timelines
- Dark mode border fix with containerBackground

**Changed:**
- `StoicGridProvider`: TimelineProvider → AppIntentTimelineProvider
- `StoicGridWidget`: StaticConfiguration → AppIntentConfiguration
- Grid layout: Max 30 columns for large timelines (was 20)
- Spacing ratio: 5% for large timelines (was 10%)
- Dot size range: 3-10px for large timelines (was 6-14px)

**Fixed:**
- All widgets showing same timeline (now independently configurable)
- White border in dark mode (containerBackground added)
- 365-day timeline dots too small (optimized layout)

**Files Modified:**
- `targets/StoicGridWidget/StoicGridWidget.swift`
- `services/widget-data-service.ts`
- `app/(tabs)/timelines.tsx`

---

*Last Updated: January 12, 2026*
*Version: 1.1.0*
*Author: Stoic Calendar Team*
