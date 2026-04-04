# Appeeky — App Store Connect Metrics

Synced Sales and Trends data from your connected App Store Connect account — real downloads, revenue, IAPs, and subscriptions. No ASC credentials needed per request; data is synced nightly into Appeeky.

**Base URL:** `https://api.appeeky.com`
**Auth:** `X-API-Key` header (REST) or `Authorization: Bearer` (MCP)
**Plan:** Indie or higher — 2 credits per request

> **Requires:** Connect your ASC API key and Vendor Number in appeeky.com → Settings → Integrations. Data syncs nightly. Up to 90 days of history.

## Why Use This vs. Appeeky Estimates

| Data | Appeeky Connect | Appeeky Intelligence |
|------|----------------|---------------------|
| Downloads | **Exact** (from ASC) | Estimated |
| Revenue | **Exact** (from ASC) | Estimated |
| IAP count | **Exact** (from ASC) | Not available |
| Subscriptions | **Exact** snapshot | Not available |
| Free trials | **Exact** snapshot | Not available |
| Competitor data | ✗ | ✓ |
| Any app | Own apps only | Any app |

## Endpoints

### Overview Metrics

```bash
GET /v1/connect/metrics?from=YYYY-MM-DD&to=YYYY-MM-DD&appId=optional
```

**Example:**
```bash
curl "https://api.appeeky.com/v1/connect/metrics?from=2026-02-19&to=2026-03-21" \
  -H "X-API-Key: $KEY"
```

**Response:**
```json
{
  "data": {
    "totals": {
      "downloads": 1250,
      "revenue": 89.5,
      "subscriptions": 42,
      "trials": 12,
      "iap_count": 320
    },
    "apps": [...],
    "rows": [...]
  }
}
```

### List Apps with Metrics

```bash
GET /v1/connect/metrics/apps
```

### App Detail (Daily Series + Countries)

```bash
GET /v1/connect/metrics/apps/:appId?from=YYYY-MM-DD&to=YYYY-MM-DD
```

Response includes:
- `daily[]` — `metric_date`, `downloads`, `revenue`, `subscriptions`, `trials`, `iap_count`
- `countries[]` — `country` (ISO code), `downloads`, `revenue`
- `totals` — Aggregated totals for the range

## Common Workflows

### Performance snapshot for the last 30 days

```bash
curl -H "X-API-Key: $KEY" \
  "https://api.appeeky.com/v1/connect/metrics/apps/$APP_ID"
```

### Trend analysis — compare two periods

```bash
# Current month
curl -H "X-API-Key: $KEY" \
  "https://api.appeeky.com/v1/connect/metrics/apps/$APP_ID?from=2026-03-01&to=2026-03-21"

# Previous month (same window)
curl -H "X-API-Key: $KEY" \
  "https://api.appeeky.com/v1/connect/metrics/apps/$APP_ID?from=2026-02-01&to=2026-02-21"
```
