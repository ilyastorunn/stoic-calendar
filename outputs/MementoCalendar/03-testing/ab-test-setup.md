# A/B Testing Setup - Memento Calendar

**Generated:** 2026-03-03
**Platform:** Apple App Store (Product Page Optimization)

---

## Prerequisites

- App must be live on the App Store (confirmed: yes)
- Need sufficient traffic for statistical significance (~1000 impressions per variant minimum)
- Apple PPO supports testing: screenshots, app icon, app preview video
- Apple PPO does NOT support testing: title, subtitle, description, keywords

---

## Test 1: Screenshot Order (Start Immediately)

**Hypothesis:** Leading with the widget screenshot will increase conversion rate because widgets are the premium differentiator and the most visually distinctive feature.

**Setup:**
1. Go to App Store Connect > Memento Calendar > Product Page Optimization
2. Click "Create Test"
3. Treatment A (Control): Current screenshot order
4. Treatment B: Move widget/home-screen screenshot to position #1
5. Traffic allocation: 50% / 50%
6. Start date: March 10, 2026
7. Minimum duration: 14 days
8. End date: March 24, 2026

**Success metric:** Conversion rate (product page views to first-time downloads)
**Minimum improvement to declare winner:** 5% relative lift

**After test concludes:**
- If Treatment B wins: Apply winning variant permanently
- If no significant difference: Keep control, move to Test 2

---

## Test 2: Screenshot Style (After Test 1)

**Hypothesis:** Screenshots with text overlays (headlines describing features) outperform raw app screenshots.

**Setup:**
1. Treatment A (Control): Winning variant from Test 1
2. Treatment B: Same screenshots with added headline text overlays (per visual-assets-spec.md)
3. Traffic: 50/50
4. Duration: 14 days minimum

---

## Test 3: App Preview Video (After Test 2)

**Hypothesis:** Adding a 15-second preview video showing the grid filling in will increase conversion by making the core concept immediately understandable.

**Setup:**
1. Treatment A: No video (screenshots only)
2. Treatment B: 15-second preview video + same screenshots
3. Duration: 21 days (video tests need more data)

---

## Metadata A/B Testing (Manual Method)

Since Apple PPO does not support text testing, use this manual approach:

### Subtitle Test
1. **Version 1.0.2:** Use subtitle "Year Progress & Time Tracker"
2. **Track metrics for 30 days:** keyword rankings, conversion rate, impressions
3. **Version 1.0.3:** Switch to subtitle "Year Progress Widget & Grid"
4. **Track metrics for 30 days:** compare same metrics
5. **Keep the winner**

### Tools for Tracking
- Free: App Store Connect Analytics (impressions, downloads, conversion rate)
- Paid: AppFollow, Sensor Tower, or AppTweak (keyword rankings, competitor tracking)

---

## Key Metrics to Track

| Metric | Where to Find | Check Frequency |
|--------|---------------|-----------------|
| Impressions | App Store Connect > Analytics | Weekly |
| Product Page Views | App Store Connect > Analytics | Weekly |
| Conversion Rate | App Store Connect > Analytics | Weekly |
| Downloads | App Store Connect > Analytics | Weekly |
| Keyword Rankings | ASO tool (AppFollow/Sensor Tower) | Weekly |

---

## Action Items

- [ ] Verify you have at least 2 screenshot variants ready
- [ ] Set up Test 1 in App Store Connect PPO by March 10, 2026
- [ ] Set a calendar reminder to check results on March 24, 2026
- [ ] Record baseline conversion rate before any test starts
- [ ] Document results in a simple spreadsheet for future reference
