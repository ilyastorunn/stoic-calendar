/**
 * Stoic Circular Widget
 * Pro-only home screen widget displaying timeline progress as a circular ring
 * Medium widget size with percentage and days remaining
 */

import SwiftUI
import WidgetKit

// MARK: - Circular Widget View

struct StoicCircularWidgetView: View {
    var entry: StoicGridEntry
    @Environment(\.colorScheme) var systemColorScheme
    @Environment(\.widgetFamily) var family

    var body: some View {
        if !entry.isPro {
            // Show upgrade placeholder for free users
            ProUpgradePlaceholderView()
        } else if let timeline = entry.timeline {
            // Show circular progress for Pro users
            ZStack {
                backgroundColor

                if family == .systemSmall {
                    // Small widget: Compact layout
                    VStack(spacing: 6) {
                        // Circular progress ring (compact)
                        ZStack {
                            // Empty track
                            Circle()
                                .stroke(emptyColor, lineWidth: 6)

                            // Progress arc
                            Circle()
                                .trim(from: 0, to: CGFloat(timeline.progressPercentage) / 100.0)
                                .stroke(
                                    filledColor,
                                    style: StrokeStyle(lineWidth: 6, lineCap: .round)
                                )
                                .rotationEffect(.degrees(-90))

                            // Center: percentage only
                            Text("\(timeline.progressPercentage)%")
                                .font(.system(size: 20, weight: .semibold))
                                .foregroundColor(primaryColor)
                        }
                        .frame(height: 80)
                        .padding(.horizontal, 8)

                        // Timeline title below ring
                        Text(timeline.title)
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(secondaryColor)
                            .lineLimit(1)
                    }
                    .padding(12)
                } else {
                    // Medium widget: Full layout with title, ring, days, and footer
                    VStack(spacing: 8) {
                        // Timeline title
                        Text(timeline.title)
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(secondaryColor)
                            .lineLimit(1)

                        // Circular progress ring
                        ZStack {
                            // Empty track
                            Circle()
                                .stroke(emptyColor, lineWidth: 8)

                            // Progress arc
                            Circle()
                                .trim(from: 0, to: CGFloat(timeline.progressPercentage) / 100.0)
                                .stroke(
                                    filledColor,
                                    style: StrokeStyle(lineWidth: 8, lineCap: .round)
                                )
                                .rotationEffect(.degrees(-90))

                            // Center content
                            VStack(spacing: 2) {
                                Text("\(timeline.progressPercentage)%")
                                    .font(.system(size: 24, weight: .semibold))
                                    .foregroundColor(primaryColor)

                                if timeline.daysRemaining > 0 {
                                    Text("\(timeline.daysRemaining)d")
                                        .font(.system(size: 11))
                                        .foregroundColor(secondaryColor)
                                } else {
                                    Text("done")
                                        .font(.system(size: 11))
                                        .foregroundColor(secondaryColor)
                                }
                            }
                        }
                        .frame(height: 100)
                        .padding(.horizontal, 4)

                        // Footer stats
                        Text("\(timeline.daysPassed) of \(timeline.totalDays) days")
                            .font(.system(size: 11))
                            .foregroundColor(secondaryColor)
                    }
                    .padding(16)
                }
            }
            .widgetURL(URL(string: "stoiccalendar://home"))
            .containerBackground(for: .widget) {
                backgroundColor
            }
        } else {
            // No timeline state
            ZStack {
                backgroundColor

                VStack(spacing: 8) {
                    Image(systemName: "calendar")
                        .font(.system(size: 32))
                        .foregroundColor(secondaryColor)
                    Text("No Timeline")
                        .font(.caption)
                        .foregroundColor(secondaryColor)
                }
            }
            .containerBackground(for: .widget) {
                backgroundColor
            }
        }
    }

    // MARK: - Computed Properties

    private var effectiveColorScheme: ColorScheme {
        if let themeMode = entry.settings?.themeMode {
            if themeMode == "light" { return .light }
            if themeMode == "dark" { return .dark }
        }
        return systemColorScheme
    }

    private var backgroundColor: Color {
        effectiveColorScheme == .dark ? Color.black : Color.white
    }

    private var primaryColor: Color {
        effectiveColorScheme == .dark ? Color.white : Color.black
    }

    private var secondaryColor: Color {
        Color(red: 0.557, green: 0.557, blue: 0.576) // iOS gray
    }

    private var filledColor: Color {
        // Use the user's selected grid color theme for the progress ring
        getColorForTheme(entry.settings?.gridColorTheme ?? "classic", scheme: effectiveColorScheme, filled: true)
    }

    private var emptyColor: Color {
        // Use the user's selected grid color theme for the empty track
        getColorForTheme(entry.settings?.gridColorTheme ?? "classic", scheme: effectiveColorScheme, filled: false)
    }
}

// MARK: - Widget Configuration

struct StoicCircularWidget: Widget {
    let kind = "StoicCircularWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: SelectTimelineIntent.self, provider: StoicGridProvider()) { entry in
            StoicCircularWidgetView(entry: entry)
        }
        .configurationDisplayName("Circular Progress")
        .description("Pie chart showing timeline completion")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
