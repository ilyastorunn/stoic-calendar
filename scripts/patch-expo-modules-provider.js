#!/usr/bin/env node
/**
 * Patch ExpoModulesProvider.swift to include AppGroupsModule
 *
 * This script should be run after `pod install` or `npx expo prebuild`
 * to register the local AppGroupsModule since expo-modules-autolinking
 * doesn't automatically detect modules in the local modules/ directory.
 *
 * Usage: node scripts/patch-expo-modules-provider.js
 */

const fs = require('fs');
const path = require('path');

const PROVIDER_PATH = path.join(
  __dirname,
  '..',
  'ios',
  'Pods',
  'Target Support Files',
  'Pods-stoiccalendar',
  'ExpoModulesProvider.swift'
);

function patchExpoModulesProvider() {
  console.log('[AppGroups] Patching ExpoModulesProvider.swift...');

  if (!fs.existsSync(PROVIDER_PATH)) {
    console.log('[AppGroups] ExpoModulesProvider.swift not found. Run "pod install" first.');
    process.exit(1);
  }

  let content = fs.readFileSync(PROVIDER_PATH, 'utf8');

  // Check if already patched
  if (content.includes('import app_groups')) {
    console.log('[AppGroups] Already patched. Skipping.');
    return;
  }

  // Add import statement after ExpoModulesCore
  if (!content.includes('import app_groups')) {
    content = content.replace(
      'import ExpoModulesCore\n',
      'import ExpoModulesCore\nimport app_groups\n'
    );
  }

  // Add AppGroupsModule to the modules array
  if (!content.includes('AppGroupsModule.self')) {
    content = content.replace(
      'return [\n',
      'return [\n      AppGroupsModule.self,\n'
    );
  }

  fs.writeFileSync(PROVIDER_PATH, content, 'utf8');
  console.log('[AppGroups] Successfully patched ExpoModulesProvider.swift');
}

patchExpoModulesProvider();
