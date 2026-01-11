require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'app-groups'
  s.version        = package['version']
  s.summary        = package['description'] || 'App Groups module for widget data sharing'
  s.description    = package['description'] || 'App Groups module for widget data sharing'
  s.license        = package['license']
  s.author         = package['author']
  s.homepage       = package['homepage'] || 'https://github.com/stoiccalendar'
  s.platform       = :ios, '13.0'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "ios/**/*.{h,m,swift}"
end
