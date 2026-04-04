# App Store Connect API Agent

Direct API access to App Store Connect without external dependencies.

## Authentication Methods

### 1. API Key Authentication (Recommended)
Requires: Issuer ID, Key ID, Private Key (.p8 file)

### 2. JWT Token Generation
```python
import jwt, time, json, os

def generate_asc_token():
    creds_path = os.path.expanduser("~/.aso/credentials.json")
    with open(creds_path) as f:
        creds = json.load(f)
    with open(os.path.expanduser(creds["privateKeyPath"])) as f:
        private_key = f.read()
    now = int(time.time())
    payload = {"iss": creds["issuerId"], "iat": now, "exp": now + 1200, "aud": "appstoreconnect-v1"}
    headers = {"alg": "ES256", "kid": creds["keyId"], "typ": "JWT"}
    return jwt.encode(payload, private_key, algorithm="ES256", headers=headers)
```

### 3. API Request Helper (urllib, no deps)
```python
import urllib.request, urllib.error, json

def asc_request(token, method, endpoint, body=None):
    url = f"https://api.appstoreconnect.apple.com/v1{endpoint}"
    req = urllib.request.Request(url, method=method)
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Content-Type", "application/json")
    if body:
        req.data = json.dumps(body).encode()
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())
```

## Core API Operations

### List Apps
```python
GET /apps
```

### Get App Details
```python
GET /apps/{id}
```

### List App Store Versions
```python
GET /apps/{id}/appStoreVersions
```

## Metadata Operations

### Get Localizations
```python
GET /appStoreVersions/{id}/appStoreVersionLocalizations
```

### Update Localization
```python
PATCH /appStoreVersionLocalizations/{id}
Body: {
  "data": {
    "type": "appStoreVersionLocalizations",
    "id": "{id}",
    "attributes": {
      "description": "...",
      "keywords": "...",
      "promotionalText": "..."
    }
  }
}
```

### Create New Locale
```python
POST /appStoreVersionLocalizations
```

## App Info (Title/Subtitle)

### Get App Info Localizations
```python
GET /appInfos/{id}/appInfoLocalizations
```

### Update App Info
```python
PATCH /appInfoLocalizations/{id}
Body: {
  "data": {
    "type": "appInfoLocalizations",
    "id": "{id}",
    "attributes": {
      "name": "App Title",
      "subtitle": "App Subtitle"
    }
  }
}
```

## In-App Purchases

### List IAPs
```python
GET /apps/{id}/inAppPurchasesV2
```

### List Subscriptions
```python
GET /apps/{id}/subscriptionGroups
```

## iris API (Web Session)

For operations not in public API (privacy labels, IAP attachment to version):
- Session file: ~/.aso/web-session.json
- Base URL: https://appstoreconnect.apple.com/iris/v1

## Dependencies
```bash
pip3 install PyJWT cryptography
```

## Credential Storage
- `~/.aso/credentials.json` — `{ issuerId, keyId, privateKeyPath }`
- `~/.aso/web-session.json` — `{ cookies, expires }`
