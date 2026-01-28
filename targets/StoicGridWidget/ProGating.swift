/**
 * Pro Gating Utilities
 * Shared logic for determining if widgets require Pro subscription
 * and displaying upgrade placeholders for locked features
 */

import SwiftUI
import WidgetKit

// MARK: - Pro Gating Logic

struct ProGating {
    private static let appGroupId = "group.com.stoiccalendar.shared"

    /// Load Pro status from App Groups
    /// Returns false if not Pro or if data unavailable
    /// TEMPORARY: Hardcoded to true for testing - remove before production
    static func loadProStatus() -> Bool {
        return true // 🔥 TEMP: Always return true for testing

        // Original code (uncomment when ready for production):
        // guard let userDefaults = UserDefaults(suiteName: appGroupId),
        //       let proStatusString = userDefaults.string(forKey: "widget_is_pro") else {
        //     return false
        // }
        // return proStatusString == "true"
    }

    /// Check if grid widget requires Pro based on timeline type and widget family
    static func gridRequiresPro(timelineType: String?, family: WidgetFamily) -> Bool {
        guard let type = timelineType else { return false }

        // Custom timelines are Pro-only in all sizes
        if type == "custom" {
            return true
        }

        // Monthly large is Pro-only
        if type == "month" && family == .systemLarge {
            return true
        }

        return false
    }

    /// Text widget is entirely Pro
    static var textWidgetRequiresPro: Bool { true }

    /// Percentage fill widget is entirely Pro
    static var percentageFillRequiresPro: Bool { true }

    /// Circular home screen widget is entirely Pro
    static var circularWidgetRequiresPro: Bool { true }
}

// MARK: - Pro Upgrade Placeholder View

/// Displayed when a Pro-only widget is used by a free user
struct ProUpgradePlaceholderView: View {
    @Environment(\.widgetFamily) var family
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        ZStack {
            backgroundColor

            VStack(spacing: spacing) {
                Image(systemName: "lock.fill")
                    .font(.system(size: iconSize, weight: .light))
                    .foregroundColor(secondaryColor)

                Text("Pro")
                    .font(.system(size: titleSize, weight: .semibold))
                    .foregroundColor(primaryColor)

                if family != .systemSmall {
                    Text("Upgrade in app")
                        .font(.system(size: captionSize))
                        .foregroundColor(secondaryColor)
                }
            }
        }
        .widgetURL(URL(string: "stoiccalendar://paywall"))
        .containerBackground(for: .widget) {
            backgroundColor
        }
    }

    // MARK: - Styling

    private var backgroundColor: Color {
        colorScheme == .dark ? Color.black : Color.white
    }

    private var primaryColor: Color {
        colorScheme == .dark ? Color.white : Color.black
    }

    private var secondaryColor: Color {
        Color(red: 0.557, green: 0.557, blue: 0.576) // iOS gray
    }

    private var iconSize: CGFloat {
        switch family {
        case .systemSmall: return 24
        case .systemMedium: return 32
        case .systemLarge: return 40
        default: return 32
        }
    }

    private var titleSize: CGFloat {
        switch family {
        case .systemSmall: return 14
        case .systemMedium: return 18
        case .systemLarge: return 22
        default: return 18
        }
    }

    private var captionSize: CGFloat {
        switch family {
        case .systemMedium: return 11
        case .systemLarge: return 12
        default: return 11
        }
    }

    private var spacing: CGFloat {
        switch family {
        case .systemSmall: return 6
        case .systemMedium: return 8
        case .systemLarge: return 10
        default: return 8
        }
    }
}
