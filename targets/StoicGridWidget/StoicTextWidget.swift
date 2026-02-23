/**
 * Stoic Text Widget
 * Pro-only widget displaying timeline progress as minimalist text
 * Shows "X days left" in stoic typography
 */

import SwiftUI
import WidgetKit

// MARK: - Text Widget View

struct StoicTextWidgetView: View {
    var entry: StoicGridEntry
    @Environment(\.colorScheme) var systemColorScheme

    var body: some View {
        if !entry.isPro {
            // Show upgrade placeholder for free users
            ProUpgradePlaceholderView()
        } else if let timeline = entry.timeline {
            // Show text content for Pro users
            ZStack {
                VStack(spacing: 12) {
                    // Timeline title (uppercase, tracked)
                    Text(timeline.title)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(secondaryColor)
                        .textCase(.uppercase)
                        .tracking(1.5)
                        .lineLimit(1)

                    // Primary text: "7 days left" or "Complete"
                    if timeline.daysRemaining > 0 {
                        HStack(alignment: .firstTextBaseline, spacing: 4) {
                            Text("\(timeline.daysRemaining)")
                                .font(.system(size: 48, weight: .thin))
                                .foregroundColor(primaryColor)
                            Text(timeline.daysRemaining == 1 ? "day left" : "days left")
                                .font(.system(size: 16, weight: .light))
                                .foregroundColor(secondaryColor)
                        }
                    } else {
                        Text("Complete")
                            .font(.system(size: 36, weight: .thin))
                            .foregroundColor(primaryColor)
                    }

                    // Subtle separator line
                    Rectangle()
                        .fill(secondaryColor.opacity(0.3))
                        .frame(width: 40, height: 1)

                    // Footer: "X of Y"
                    Text("\(timeline.daysPassed) of \(timeline.totalDays)")
                        .font(.system(size: 12, weight: .regular))
                        .foregroundColor(secondaryColor)
                }
                .padding(16)
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
                        .font(.system(size: 28))
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
}

// MARK: - Widget Configuration

struct StoicTextWidget: Widget {
    let kind = "StoicTextWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: SelectTimelineIntent.self, provider: StoicGridProvider()) { entry in
            StoicTextWidgetView(entry: entry)
        }
        .configurationDisplayName("Days Remaining")
        .description("Minimalist text showing days left in your timeline")
        .supportedFamilies([.systemMedium])
        .contentMarginsDisabled()
    }
}
