# /aso-release - Version & Release Management

## Subcommands

```bash
/aso-release create 1.0.0         # New version in PREPARE_FOR_SUBMISSION state
/aso-release attach               # Attach latest valid build (or --build-id ID)
/aso-release submit               # Submit for App Review (--expedite flag available)
/aso-release notes                # Generate What's New from git commits or CHANGELOG
/aso-release phased [start|pause|resume|complete]  # Phased release control
```

## Version States
```
PREPARE_FOR_SUBMISSION → WAITING_FOR_REVIEW → IN_REVIEW → PENDING_DEVELOPER_RELEASE → READY_FOR_SALE
```

## Phased Release Schedule
| Day | Percentage |
|-----|-----------|
| 1   | 1%        |
| 2   | 2%        |
| 3   | 5%        |
| 4   | 10%       |
| 5   | 20%       |
| 6   | 50%       |
| 7   | 100%      |

## What's New Generation
Reads git commits since tag → generates user-friendly notes with emoji sections:
- New Features
- Improvements
- Bug Fixes

## Pre-Submission Checklist
- [ ] Build attached (VALID state)
- [ ] Description filled (all locales)
- [ ] Keywords filled (all locales)
- [ ] Screenshots uploaded
- [ ] Privacy Policy URL live
- [ ] Support URL live
- [ ] Age rating configured
