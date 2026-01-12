/**
 * Stoic Calendar Widgets
 * Home Screen & Lock Screen Widget Extensions
 *
 * Displays active timeline as a grid of dots (1 dot = 1 day)
 */

import WidgetKit
import SwiftUI
import AppIntents

// MARK: - Data Models

/// Timeline data read from App Groups
struct WidgetTimelineData: Codable {
    let id: String
    let type: String
    let title: String
    let startDate: String
    let endDate: String
    let daysPassed: Int
    let daysRemaining: Int
    let totalDays: Int
    let progressPercentage: Int
}

/// Settings data read from App Groups
struct WidgetSettingsData: Codable {
    let gridColorTheme: String
    let themeMode: String
}


// MARK: - AppIntent Configuration

/// Timeline entity for widget configuration picker
struct TimelineEntity: AppEntity {
    let id: String
    let title: String

    static var typeDisplayRepresentation: TypeDisplayRepresentation {
        TypeDisplayRepresentation(name: "Timeline")
    }

    static var defaultQuery = TimelineQuery()

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(title: "\(title)")
    }
}

/// Query provider to fetch available timelines from App Groups
struct TimelineQuery: EntityQuery {
    private let appGroupId = "group.com.stoiccalendar.shared"

    func entities(for identifiers: [TimelineEntity.ID]) async throws -> [TimelineEntity] {
        let allTimelines = loadAllTimelines()
        return allTimelines.filter { identifiers.contains($0.id) }
    }

    func suggestedEntities() async throws -> [TimelineEntity] {
        return loadAllTimelines()
    }

    private func loadAllTimelines() -> [TimelineEntity] {
        guard let userDefaults = UserDefaults(suiteName: appGroupId),
              let jsonString = userDefaults.string(forKey: "widget_all_timelines"),
              let data = jsonString.data(using: .utf8),
              let timelinesData = try? JSONDecoder().decode([WidgetTimelineData].self, from: data) else {
            return []
        }

        return timelinesData.map { TimelineEntity(id: $0.id, title: $0.title) }
    }
}

/// Intent for selecting which timeline to display in widget
struct SelectTimelineIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "Select Timeline"
    static var description = IntentDescription("Choose which timeline to display in this widget")

    @Parameter(title: "Timeline")
    var timeline: TimelineEntity?
}

// MARK: - Widget Entry

struct StoicGridEntry: TimelineEntry {
    let date: Date
    let timeline: WidgetTimelineData?
    let settings: WidgetSettingsData?
}

// MARK: - Timeline Provider

struct StoicGridProvider: AppIntentTimelineProvider {
    typealias Entry = StoicGridEntry
    typealias Intent = SelectTimelineIntent

    private let appGroupId = "group.com.stoiccalendar.shared"

    func placeholder(in context: Context) -> StoicGridEntry {
        StoicGridEntry(
            date: Date(),
            timeline: WidgetTimelineData(
                id: "placeholder",
                type: "year",
                title: "2026",
                startDate: "2026-01-01T00:00:00.000Z",
                endDate: "2026-12-31T23:59:59.999Z",
                daysPassed: 7,
                daysRemaining: 358,
                totalDays: 365,
                progressPercentage: 2
            ),
            settings: WidgetSettingsData(
                gridColorTheme: "classic",
                themeMode: "dark"
            )
        )
    }

    func snapshot(for configuration: SelectTimelineIntent, in context: Context) async -> StoicGridEntry {
        return loadTimelineData(for: configuration)
    }

    func timeline(for configuration: SelectTimelineIntent, in context: Context) async -> Timeline<StoicGridEntry> {
        let entry = loadTimelineData(for: configuration)

        // Update every hour, or at midnight for day changes
        let calendar = Calendar.current
        let now = Date()
        let nextMidnight = calendar.startOfDay(for: calendar.date(byAdding: .day, value: 1, to: now)!)
        let nextHour = calendar.date(byAdding: .hour, value: 1, to: now)!

        let nextUpdate = min(nextMidnight, nextHour)

        return Timeline(entries: [entry], policy: .after(nextUpdate))
    }

    /// Load timeline and settings data from App Groups
    /// If configuration has a selected timeline, load that specific timeline
    /// Otherwise, fallback to active timeline (backward compatibility)
    private func loadTimelineData(for configuration: SelectTimelineIntent) -> StoicGridEntry {
        guard let userDefaults = UserDefaults(suiteName: appGroupId) else {
            return StoicGridEntry(date: Date(), timeline: nil, settings: nil)
        }

        // Load timeline data based on configuration
        let timelineData: WidgetTimelineData? = {
            // If user selected a specific timeline in widget configuration
            if let selectedTimeline = configuration.timeline {
                // Load all timelines and find the selected one
                guard let jsonString = userDefaults.string(forKey: "widget_all_timelines"),
                      let data = jsonString.data(using: .utf8),
                      let allTimelines = try? JSONDecoder().decode([WidgetTimelineData].self, from: data) else {
                    return nil
                }
                return allTimelines.first { $0.id == selectedTimeline.id }
            } else {
                // No specific timeline selected - fallback to active timeline (backward compatibility)
                guard let jsonString = userDefaults.string(forKey: "widget_active_timeline"),
                      let data = jsonString.data(using: .utf8) else {
                    return nil
                }
                return try? JSONDecoder().decode(WidgetTimelineData.self, from: data)
            }
        }()

        let settingsData: WidgetSettingsData? = {
            guard let jsonString = userDefaults.string(forKey: "widget_settings"),
                  let data = jsonString.data(using: .utf8) else {
                return nil
            }
            return try? JSONDecoder().decode(WidgetSettingsData.self, from: data)
        }()

        return StoicGridEntry(date: Date(), timeline: timelineData, settings: settingsData)
    }
}

// MARK: - Home Screen Widget View

struct StoicGridWidgetView: View {
    @Environment(\.widgetFamily) var family
    @Environment(\.colorScheme) var systemColorScheme

    var entry: StoicGridEntry

    var body: some View {
        if let timeline = entry.timeline {
            ZStack {
                backgroundColor

                VStack(spacing: 8) {
                    // Title
                    Text(timeline.title)
                        .font(.system(size: titleFontSize, weight: .semibold))
                        .foregroundColor(textColor)
                        .lineLimit(1)

                    // Grid
                    GeometryReader { geometry in
                        StoicGridView(
                            daysPassed: timeline.daysPassed,
                            totalDays: timeline.totalDays,
                            colorTheme: entry.settings?.gridColorTheme ?? "classic",
                            effectiveColorScheme: effectiveColorScheme,
                            containerSize: geometry.size
                        )
                    }

                    // Progress text
                    if family != .systemSmall {
                        Text("\(timeline.daysPassed) of \(timeline.totalDays) days")
                            .font(.system(size: captionFontSize))
                            .foregroundColor(secondaryTextColor)
                    }
                }
                .padding(paddingSize)
            }
            .widgetURL(URL(string: "stoiccalendar://home"))
            .containerBackground(for: .widget) {
                backgroundColor
            }
        } else {
            // No active timeline
            ZStack {
                backgroundColor

                VStack(spacing: 8) {
                    Image(systemName: "calendar")
                        .font(.system(size: 32))
                        .foregroundColor(secondaryTextColor)

                    Text("No Active Timeline")
                        .font(.caption)
                        .foregroundColor(secondaryTextColor)
                }
            }
            .containerBackground(for: .widget) {
                backgroundColor
            }
        }
    }

    // MARK: - Computed Properties

    private var backgroundColor: Color {
        effectiveColorScheme == .dark ? Color.black : Color.white
    }

    private var textColor: Color {
        effectiveColorScheme == .dark ? Color.white : Color.black
    }

    private var secondaryTextColor: Color {
        Color(red: 0.557, green: 0.557, blue: 0.576) // iOS gray
    }

    private var effectiveColorScheme: ColorScheme {
        if let themeMode = entry.settings?.themeMode {
            if themeMode == "light" { return .light }
            if themeMode == "dark" { return .dark }
        }
        return systemColorScheme
    }

    private var titleFontSize: CGFloat {
        switch family {
        case .systemSmall: return 14
        case .systemMedium: return 16
        case .systemLarge: return 18
        default: return 16
        }
    }

    private var captionFontSize: CGFloat {
        switch family {
        case .systemMedium: return 11
        case .systemLarge: return 12
        default: return 10
        }
    }

    private var paddingSize: CGFloat {
        switch family {
        case .systemSmall: return 12
        case .systemMedium: return 14
        case .systemLarge: return 16
        default: return 12
        }
    }
}

// MARK: - Lock Screen Provider (Simple TimelineProvider for lock screen widgets)

struct StoicLockScreenProvider: TimelineProvider {
    typealias Entry = StoicGridEntry

    private let appGroupId = "group.com.stoiccalendar.shared"

    func placeholder(in context: Context) -> StoicGridEntry {
        StoicGridEntry(
            date: Date(),
            timeline: WidgetTimelineData(
                id: "placeholder",
                type: "year",
                title: "2026",
                startDate: "2026-01-01T00:00:00.000Z",
                endDate: "2026-12-31T23:59:59.999Z",
                daysPassed: 7,
                daysRemaining: 358,
                totalDays: 365,
                progressPercentage: 2
            ),
            settings: WidgetSettingsData(
                gridColorTheme: "classic",
                themeMode: "dark"
            )
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (StoicGridEntry) -> Void) {
        let entry = loadActiveTimelineData()
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<StoicGridEntry>) -> Void) {
        let entry = loadActiveTimelineData()

        // Update every hour
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }

    /// Load active timeline data from App Groups (lock screen widgets don't have configuration)
    private func loadActiveTimelineData() -> StoicGridEntry {
        guard let userDefaults = UserDefaults(suiteName: appGroupId) else {
            return StoicGridEntry(date: Date(), timeline: nil, settings: nil)
        }

        let timelineData: WidgetTimelineData? = {
            guard let jsonString = userDefaults.string(forKey: "widget_active_timeline"),
                  let data = jsonString.data(using: .utf8) else {
                return nil
            }
            return try? JSONDecoder().decode(WidgetTimelineData.self, from: data)
        }()

        let settingsData: WidgetSettingsData? = {
            guard let jsonString = userDefaults.string(forKey: "widget_settings"),
                  let data = jsonString.data(using: .utf8) else {
                return nil
            }
            return try? JSONDecoder().decode(WidgetSettingsData.self, from: data)
        }()

        return StoicGridEntry(date: Date(), timeline: timelineData, settings: settingsData)
    }
}

// MARK: - Lock Screen Widget View

struct StoicLockScreenWidgetView: View {
    @Environment(\.widgetFamily) var family
    var entry: StoicGridEntry

    var body: some View {
        if let timeline = entry.timeline {
            switch family {
            case .accessoryCircular:
                // Circular widget: Progress ring
                ZStack {
                    Circle()
                        .stroke(Color.white.opacity(0.3), lineWidth: 4)
                    Circle()
                        .trim(from: 0, to: CGFloat(timeline.progressPercentage) / 100.0)
                        .stroke(Color.white, style: StrokeStyle(lineWidth: 4, lineCap: .round))
                        .rotationEffect(.degrees(-90))
                    Text("\(timeline.progressPercentage)%")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(.white)
                }
                .widgetURL(URL(string: "stoiccalendar://home"))

            case .accessoryRectangular:
                // Rectangular widget: Title + progress bar
                VStack(alignment: .leading, spacing: 4) {
                    Text(timeline.title)
                        .font(.headline)
                        .foregroundColor(.white)
                        .lineLimit(1)

                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 3)
                                .fill(Color.white.opacity(0.3))
                            RoundedRectangle(cornerRadius: 3)
                                .fill(Color.white)
                                .frame(width: geo.size.width * CGFloat(timeline.progressPercentage) / 100.0)
                        }
                    }
                    .frame(height: 6)

                    Text("\(timeline.daysPassed)/\(timeline.totalDays) days")
                        .font(.caption2)
                        .foregroundColor(.white.opacity(0.8))
                }
                .widgetURL(URL(string: "stoiccalendar://home"))

            case .accessoryInline:
                // Inline widget: Text only
                Text("\(timeline.title): \(timeline.progressPercentage)%")
                    .widgetURL(URL(string: "stoiccalendar://home"))

            default:
                Text(timeline.title)
            }
        } else {
            // No active timeline
            switch family {
            case .accessoryCircular:
                Image(systemName: "calendar")
                    .font(.title2)
            case .accessoryRectangular:
                Text("No Timeline")
                    .font(.caption)
            case .accessoryInline:
                Text("No Timeline")
            default:
                Text("No Timeline")
            }
        }
    }
}

// MARK: - Grid View Component

struct StoicGridView: View {
    let daysPassed: Int
    let totalDays: Int
    let colorTheme: String
    let effectiveColorScheme: ColorScheme
    let containerSize: CGSize

    var body: some View {
        Canvas { context, size in
            let layout = calculateGridLayout(
                totalDays: totalDays,
                width: size.width,
                height: size.height
            )

            // Center the grid
            let offsetX = (size.width - layout.gridWidth) / 2
            let offsetY = (size.height - layout.gridHeight) / 2

            // Draw each dot
            for index in 0..<totalDays {
                let row = index / layout.columns
                let col = index % layout.columns

                let x = offsetX + CGFloat(col) * (layout.dotSize + layout.spacing)
                let y = offsetY + CGFloat(row) * (layout.dotSize + layout.spacing)

                let isFilled = index < daysPassed
                let color = isFilled ? filledColor : emptyColor

                let rect = CGRect(x: x, y: y, width: layout.dotSize, height: layout.dotSize)
                let path = Circle().path(in: rect)

                context.fill(path, with: .color(color))
            }
        }
    }

    private var filledColor: Color {
        getColorForTheme(colorTheme, scheme: effectiveColorScheme, filled: true)
    }

    private var emptyColor: Color {
        getColorForTheme(colorTheme, scheme: effectiveColorScheme, filled: false)
    }
}

// MARK: - Grid Layout Calculator

struct GridLayout {
    let columns: Int
    let rows: Int
    let dotSize: CGFloat
    let spacing: CGFloat
    let gridWidth: CGFloat
    let gridHeight: CGFloat
}

/// Calculate optimal grid layout with optimizations for large timelines
func calculateGridLayout(totalDays: Int, width: CGFloat, height: CGFloat) -> GridLayout {
    guard totalDays > 0 && width > 0 && height > 0 else {
        return GridLayout(columns: 0, rows: 0, dotSize: 0, spacing: 0, gridWidth: 0, gridHeight: 0)
    }

    // Step 1: Determine optimal columns (optimized for large timelines)
    let optimalColumns: Int

    if totalDays <= 7 {
        // Week: single row
        optimalColumns = totalDays
    } else if totalDays <= 49 {
        // Small grids: 7 columns
        optimalColumns = 7
    } else if totalDays <= 100 {
        // Medium grids: 10 columns
        optimalColumns = 10
    } else if totalDays <= 180 {
        // Medium-large grids: 15 columns
        optimalColumns = 15
    } else {
        // Large grids (365 days): More aggressive columns for better visibility
        let aspectRatio = width / height
        if aspectRatio > 1.5 {
            // Wide widgets (medium, large): Use more columns
            optimalColumns = 30
        } else if aspectRatio > 1.0 {
            optimalColumns = 25
        } else {
            // Narrow widgets (small): Still use many columns to keep dots visible
            optimalColumns = 20
        }
    }

    // Step 2: Calculate rows
    let rows = Int(ceil(Double(totalDays) / Double(optimalColumns)))

    // Step 3: Calculate spacing ratio (reduced for large timelines)
    let spacingRatio: CGFloat = totalDays > 180 ? 0.08 : 0.15 // 8% for large timelines, 15% for small

    // Step 4: Calculate maximum dot size
    let maxDotSizeFromWidth = width / (CGFloat(optimalColumns) + CGFloat(optimalColumns - 1) * spacingRatio)
    let maxDotSizeFromHeight = height / (CGFloat(rows) + CGFloat(rows - 1) * spacingRatio)

    var dotSize = min(maxDotSizeFromWidth, maxDotSizeFromHeight)

    // Step 5: Clamp dot size based on widget size
    // Smaller minimum for large timelines to improve visibility
    let minDotSize: CGFloat = totalDays > 180 ? 3 : 5
    let maxDotSize: CGFloat = totalDays > 180 ? 10 : 14
    dotSize = max(minDotSize, min(maxDotSize, dotSize))

    // Step 6: Calculate spacing
    let spacing = dotSize * spacingRatio

    // Step 7: Calculate grid dimensions
    let gridWidth = CGFloat(optimalColumns) * dotSize + CGFloat(optimalColumns - 1) * spacing
    let gridHeight = CGFloat(rows) * dotSize + CGFloat(rows - 1) * spacing

    return GridLayout(
        columns: optimalColumns,
        rows: rows,
        dotSize: floor(dotSize),
        spacing: floor(spacing),
        gridWidth: floor(gridWidth),
        gridHeight: floor(gridHeight)
    )
}

// MARK: - Color Theme Mapping

/// Get color for a theme and color scheme (maps from constants/theme.ts GridColorPalettes)
func getColorForTheme(_ theme: String, scheme: ColorScheme, filled: Bool) -> Color {
    switch (theme, scheme, filled) {
    // Classic Blue
    case ("classic", .dark, true): return Color(hex: "#007AFF")
    case ("classic", .dark, false): return Color(hex: "#333333")
    case ("classic", .light, true): return Color(hex: "#007AFF")
    case ("classic", .light, false): return Color(hex: "#D1D1D6")

    // Forest Green
    case ("forest", .dark, true): return Color(hex: "#30D158")
    case ("forest", .dark, false): return Color(hex: "#333333")
    case ("forest", .light, true): return Color(hex: "#34C759")
    case ("forest", .light, false): return Color(hex: "#D1D1D6")

    // Sunset Orange
    case ("sunset", .dark, true): return Color(hex: "#FF9F0A")
    case ("sunset", .dark, false): return Color(hex: "#333333")
    case ("sunset", .light, true): return Color(hex: "#FF9500")
    case ("sunset", .light, false): return Color(hex: "#D1D1D6")

    // Monochrome
    case ("monochrome", .dark, true): return Color.white
    case ("monochrome", .dark, false): return Color(hex: "#333333")
    case ("monochrome", .light, true): return Color.black
    case ("monochrome", .light, false): return Color(hex: "#D1D1D6")

    // Default: classic blue
    default: return Color(hex: "#007AFF")
    }
}

// MARK: - Color Extension

extension Color {
    /// Initialize Color from hex string (e.g., "#007AFF")
    init(hex: String) {
        var hexSanitized = hex.trimmingCharacters(in: .whitespacesAndNewlines)
        hexSanitized = hexSanitized.hasPrefix("#") ? String(hexSanitized.dropFirst()) : hexSanitized

        var rgbValue: UInt64 = 0
        Scanner(string: hexSanitized).scanHexInt64(&rgbValue)

        let r = Double((rgbValue & 0xff0000) >> 16) / 255.0
        let g = Double((rgbValue & 0x00ff00) >> 8) / 255.0
        let b = Double(rgbValue & 0x0000ff) / 255.0

        self.init(red: r, green: g, blue: b)
    }
}

// MARK: - Home Screen Widget Configuration

struct StoicGridWidget: Widget {
    let kind: String = "StoicGridWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: SelectTimelineIntent.self, provider: StoicGridProvider()) { entry in
            StoicGridWidgetView(entry: entry)
        }
        .configurationDisplayName("Stoic Grid")
        .description("Visualize your timeline progress as a grid of days")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

// MARK: - Lock Screen Widget Configuration

struct StoicLockScreenWidget: Widget {
    let kind: String = "StoicLockWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: StoicLockScreenProvider()) { entry in
            StoicLockScreenWidgetView(entry: entry)
        }
        .configurationDisplayName("Stoic Progress")
        .description("Track your timeline progress on the lock screen")
        .supportedFamilies([.accessoryCircular, .accessoryRectangular, .accessoryInline])
    }
}

// MARK: - Widget Bundle (Main Entry Point)

@main
struct StoicWidgetBundle: WidgetBundle {
    var body: some Widget {
        StoicGridWidget()
        StoicLockScreenWidget()
    }
}
