# /aso-assets - Screenshots & In-App Purchases

## Screenshot Pipeline
1. **Spec Generation** → AI creates bold headline specs (e.g., "TRACK TRADING CARD PRICES")
2. **User Captures** → Simulator screenshots (full data, 9:41 status bar, consistent mode)
3. **Gemini MCP** → Generates 3 polished versions per spec (background color + headline + device frame)
4. **Upload** → Push to App Store Connect via ASC API

## Usage
```bash
/aso-assets screenshots           # Full workflow
/aso-assets screenshots --upload  # Upload existing to ASC
/aso-assets screenshots --specs-only
/aso-assets iap                   # Interactive IAP setup
/aso-assets iap --list            # List existing IAPs
/aso-assets iap --create "Pro Monthly" --type subscription --price 4.99
```

## Screenshot Dimensions
| Device | Resolution |
|--------|-----------|
| iPhone 6.5" | 1242×2688 |
| iPhone 6.7" | 1290×2796 (default) |
| iPhone 6.9" | 1320×2868 |
| iPad Pro 12.9" | 2048×2732 |

## IAP Types
- `CONSUMABLE`
- `NON_CONSUMABLE`
- `AUTO_RENEWABLE_SUBSCRIPTION`
- `NON_RENEWING_SUBSCRIPTION`

## Common IAP Patterns
```
Credit packs:
  com.app.credits.5   → $0.99
  com.app.credits.20  → $3.99
  com.app.credits.50  → $8.99

Subscriptions:
  com.app.pro.monthly  → $4.99/mo
  com.app.pro.yearly   → $39.99/yr
  com.app.lifetime     → $99.99
```

## Prerequisites
- Screenshots: Gemini MCP + `GEMINI_API_KEY`
- IAP: `~/.aso/credentials.json`
