/**
 * Stoic Percentage Fill Widget
 * Pro-only widget displaying progress percentage with proportional background fill
 * Small widget size showing percentage and days remaining
 */

import SwiftUI
import WidgetKit

// MARK: - Percentage Fill Widget View

struct StoicPercentageFillWidgetView: View {
    var entry: StoicGridEntry
    @Environment(\.colorScheme) var systemColorScheme

    var body: some View {
        if !entry.isPro {
            // Show upgrade placeholder for free users
            ProUpgradePlaceholderView()
        } else if let timeline = entry.timeline {
            // Show percentage content for Pro users
            ZStack {
                // Background fill from bottom, proportional to progress (edge-to-edge)
                GeometryReader { geo in
                    VStack {
                        Spacer()
                        Rectangle()
                            .fill(fillColor)
                            .frame(height: geo.size.height * CGFloat(timeline.progressPercentage) / 100.0)
                    }
                }
                .ignoresSafeArea()

                // Content overlay
                VStack(spacing: 4) {
                    Text("\(timeline.progressPercentage)%")
                        .font(.system(size: 36, weight: .semibold))
                        .foregroundColor(primaryColor)

                    if timeline.daysRemaining > 0 {
                        Text("\(timeline.daysRemaining)d left")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(secondaryColor)
                    } else {
                        Text("done")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(secondaryColor)
                    }
                }
            }
            .widgetURL(URL(string: "stoiccalendar://home"))
            .containerBackground(for: .widget) {
                backgroundColor
            }
        } else {
            // No timeline state
            ZStack {
                VStack(spacing: 8) {
                    Image(systemName: "calendar")
                        .font(.system(size: 24))
                        .foregroundColor(secondaryColor)
                    Text("No Timeline")
                        .font(.system(size: 10))
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

    private var fillColor: Color {
        // Use the user's selected grid color theme for the fill
        getColorForTheme(entry.settings?.gridColorTheme ?? "classic", scheme: effectiveColorScheme, filled: true)
    }
}

// MARK: - Widget Configuration

struct StoicPercentageFillWidget: Widget {
    let kind = "StoicPercentageFillWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: SelectTimelineIntent.self, provider: StoicGridProvider()) { entry in
            StoicPercentageFillWidgetView(entry: entry)
        }
        .configurationDisplayName("Progress Fill")
        .description("Visual percentage with background fill")
        .supportedFamilies([.systemSmall])
        .contentMarginsDisabled()
    }
}
