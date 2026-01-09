/**
 * App Groups Module - iOS Native Implementation
 *
 * Provides access to UserDefaults with App Groups suite name,
 * enabling data sharing between the main app and widget extensions.
 */

import ExpoModulesCore
import Foundation

public class AppGroupsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("AppGroups")

    /**
     * Write a string value to the App Groups shared container
     *
     * @param appGroupId - The App Group suite name (e.g., "group.com.stoiccalendar.shared")
     * @param key - The key to store the value under
     * @param value - The string value to store
     */
    AsyncFunction("setSharedData") { (appGroupId: String, key: String, value: String) in
      guard let userDefaults = UserDefaults(suiteName: appGroupId) else {
        throw NSError(
          domain: "AppGroupsModule",
          code: 1,
          userInfo: [NSLocalizedDescriptionKey: "Failed to access App Group: \(appGroupId)"]
        )
      }

      userDefaults.set(value, forKey: key)
      userDefaults.synchronize()
    }

    /**
     * Read a string value from the App Groups shared container
     *
     * @param appGroupId - The App Group suite name
     * @param key - The key to retrieve
     * @returns The stored string value, or nil if not found
     */
    AsyncFunction("getSharedData") { (appGroupId: String, key: String) -> String? in
      guard let userDefaults = UserDefaults(suiteName: appGroupId) else {
        throw NSError(
          domain: "AppGroupsModule",
          code: 1,
          userInfo: [NSLocalizedDescriptionKey: "Failed to access App Group: \(appGroupId)"]
        )
      }

      return userDefaults.string(forKey: key)
    }

    /**
     * Remove a value from the App Groups shared container
     *
     * @param appGroupId - The App Group suite name
     * @param key - The key to remove
     */
    AsyncFunction("removeSharedData") { (appGroupId: String, key: String) in
      guard let userDefaults = UserDefaults(suiteName: appGroupId) else {
        throw NSError(
          domain: "AppGroupsModule",
          code: 1,
          userInfo: [NSLocalizedDescriptionKey: "Failed to access App Group: \(appGroupId)"]
        )
      }

      userDefaults.removeObject(forKey: key)
      userDefaults.synchronize()
    }
  }
}
