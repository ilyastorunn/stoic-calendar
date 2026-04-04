# /aso-connect - App Store Connect Integration

## Usage
```bash
/aso-connect setup                # Initial setup wizard
/aso-connect status               # Check app status
/aso-connect sync                 # Sync metadata to ASC
```

## Subcommands

### setup
Interactive wizard: API Key config → App selection → Credential storage → Connection test

### status
Full status report including version state, build validity, metadata completeness per field/locale.

### sync
```bash
/aso-connect sync                 # Sync all fields
/aso-connect sync --field keywords
/aso-connect sync --locale tr
/aso-connect sync --dry-run       # Preview only
```

## Credentials
`~/.aso/credentials.json`:
```json
{
  "key_id": "XXXXXXXXXX",
  "issuer_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "key_path": "~/.aso/AuthKey_XXXXXXXXXX.p8"
}
```

## Pre-Flight Checks
- API credentials valid
- App exists and accessible
- Version in editable state
- Character limits respected
- Required fields filled

## Troubleshooting
- "Invalid credentials": verify Key ID (10 chars), Issuer ID (UUID), .p8 file
- "App not found": re-run setup
- "Version not editable": create new version with `/aso-release create X.Y.Z`
