/**
 * App Groups Module - Expo Modules Implementation
 *
 * Provides access to UserDefaults with App Groups suite name,
 * enabling data sharing between the main app and widget extensions.
 */

import ExpoModulesCore

public class AppGroupsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("AppGroups")

    AsyncFunction("setSharedData") { (appGroupId: String, key: String, value: String) in
      guard let userDefaults = UserDefaults(suiteName: appGroupId) else {
        throw AppGroupsError.failedToAccessGroup(appGroupId)
      }

      userDefaults.set(value, forKey: key)
      userDefaults.synchronize()
    }

    AsyncFunction("getSharedData") { (appGroupId: String, key: String) -> String? in
      guard let userDefaults = UserDefaults(suiteName: appGroupId) else {
        throw AppGroupsError.failedToAccessGroup(appGroupId)
      }

      return userDefaults.string(forKey: key)
    }

    AsyncFunction("removeSharedData") { (appGroupId: String, key: String) in
      guard let userDefaults = UserDefaults(suiteName: appGroupId) else {
        throw AppGroupsError.failedToAccessGroup(appGroupId)
      }

      userDefaults.removeObject(forKey: key)
      userDefaults.synchronize()
    }
  }
}

enum AppGroupsError: Error {
  case failedToAccessGroup(String)
}

extension AppGroupsError: LocalizedError {
  var errorDescription: String? {
    switch self {
    case .failedToAccessGroup(let groupId):
      return "Failed to access App Group: \(groupId)"
    }
  }
}
