# /aso-build - Xcode Build & Upload

Requires: XcodeBuildMCP installed (macOS 14.5+, Xcode 16.x+, valid code signing)

## Usage
```bash
/aso-build                        # Full build + archive + upload
/aso-build --simulator            # Simulator build only
/aso-build --device               # Device build only
/aso-build --archive              # Archive only
/aso-build --upload               # Upload to ASC only
```

## Pipeline
1. Locate Xcode project
2. Display available schemes
3. Compile for target (simulator / device)
4. Create archive
5. Upload to App Store Connect

## Available MCP Tools (when configured)
- Project discovery across directories
- Scheme enumeration
- Simulator and device compilation
- App execution on simulators
- Build log retrieval

## Fallback (no XcodeBuildMCP)
Use native xcodebuild commands directly (manual archiving, export options, auth credentials required).

## Full Workflow Context
```bash
/aso-connect setup      # 1. Configure credentials
/aso AppName            # 2. Generate metadata
/aso-assets screenshots # 3. Prepare assets
/aso-release create X.Y.Z  # 4. Create version
/aso-build              # 5. Build & upload
/aso-release attach     # 6. Attach build
/aso-connect sync       # 7. Sync metadata
/aso-release submit     # 8. Submit for review
```
