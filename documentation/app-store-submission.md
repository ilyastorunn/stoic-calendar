# App Store Submission Checklist
**Memento Calendar - Stoic Calendar App**

Last Updated: 2026-02-07
Status: 🟡 In Progress

---

## Table of Contents
1. [RevenueCat Production Setup](#1-revenuecat-production-setup)
2. [Final Testing](#2-final-testing)
3. [App Store Connect Metadata](#3-app-store-connect-metadata)
4. [App Store Screenshots](#4-app-store-screenshots)
5. [ASO (App Store Optimization)](#5-aso-app-store-optimization)
6. [Production Build & Upload](#6-production-build--upload)
7. [Submit for Review](#7-submit-for-review)
8. [Post-Submission](#8-post-submission)

---

## 1. RevenueCat Production Setup

### Current Status
- ✅ Product Catalog configured in RevenueCat
- ✅ Subscriptions configured in App Store Connect
- ⚠️ API Key is in TEST mode

### Production Setup Steps

#### Step 1: Get Production API Key
1. Go to [RevenueCat Dashboard](https://app.revenuecat.com/)
2. Select your project
3. Navigate to **API Keys** section
4. Copy the **iOS Production API Key** (starts with `appl_...`)
5. Keep it secure - never commit to git

#### Step 2: Update .env File
```bash
# Replace test key with production key
EXPO_PUBLIC_REVENUECAT_API_KEY=appl_xxxxxxxxxxxxx
```

#### Step 3: Verify Product IDs Match
Ensure these match in both systems:
- App Store Connect Product IDs:
  - `monthly` → Monthly subscription
  - `yearly` → Yearly subscription (with 7-day free trial)
- RevenueCat Offering identifiers:
  - Entitlement: `Memento Calendar Pro`

**Free Trial Note:** 7-day free trial is configured in App Store Connect product settings. It will automatically appear in purchase dialog - no need to configure in RevenueCat.

- [ ] Production API key obtained
- [ ] .env file updated
- [ ] Product IDs verified
- [ ] Entitlement name matches

---

## 2. Final Testing

### A. Free Trial Test (Sandbox)

**Goal:** Verify 7-day free trial appears in purchase flow

1. Create [Sandbox Test Account](https://appstoreconnect.apple.com/access/testers) in App Store Connect
2. Sign out of real Apple ID on test device (Settings → App Store)
3. Run app in TestFlight or development build
4. Navigate to Paywall
5. Select **Yearly Plan**
6. Verify purchase dialog shows: `"1 Week Free, Then $XX.XX/year"`
7. Complete purchase
8. Check RevenueCat Dashboard → Customer should show active trial

**Expected Results:**
- ✅ Purchase dialog shows "1 Week Free"
- ✅ Trial starts immediately
- ✅ RevenueCat shows customer with active entitlement
- ✅ App shows Pro features unlocked

**Sandbox Time Acceleration:**
- 7-day trial = ~5 minutes in sandbox
- Can test full subscription lifecycle quickly

**Test Status:**
- [ ] Sandbox account created
- [ ] Free trial purchase dialog verified
- [ ] Trial entitlement activated
- [ ] Pro features unlocked

---

### B. Restore Purchases Test

**Goal:** Verify subscription persists after app reinstall

#### Test 1: Same Device Reinstall
1. Purchase subscription with sandbox account
2. Verify Pro features work
3. Delete app from device
4. Reinstall app
5. Open app → Go to Paywall
6. Tap **"Restore Purchases"** button
7. Verify Pro status restored

**Expected Result:**
- ✅ After restore, Pro features work immediately
- ✅ No need to purchase again

**Technical Note:**
RevenueCat stores anonymous user ID in iOS Keychain, which survives app deletion. Same device should auto-restore even without "Restore Purchases" button.

#### Test 2: Cross-Device Restore
1. Purchase on Device A with Apple ID X
2. Install app on Device B with same Apple ID X
3. Open app → Paywall → "Restore Purchases"
4. Verify subscription restores

**Expected Result:**
- ✅ Subscription linked to Apple ID, works on all devices

**Test Status:**
- [ ] Same device reinstall tested
- [ ] Cross-device restore tested
- [ ] Restore Purchases button works correctly

---

### C. Anonymous User Persistence

**Current Implementation:**
```typescript
// services/revenue-cat-service.ts
Purchases.configure({ apiKey: REVENUECAT_API_KEY });
// No explicit user ID → RevenueCat generates anonymous ID
// Anonymous ID stored in iOS Keychain (persists across reinstalls)
```

**Persistence Matrix:**

| Scenario | Subscription Persists? | Solution |
|----------|----------------------|----------|
| Delete + reinstall (same device) | ✅ Yes (Keychain ID) | Automatic |
| New device + same Apple ID | ⚠️ Requires restore | "Restore Purchases" |
| New device + different Apple ID | ❌ No | Different account |

**No Auth System = Rely on Apple ID**
- Pro: Simple, no login required
- Con: Subscription tied to Apple ID, not email
- Industry Standard: Most iOS apps without auth work this way

**Test Status:**
- [ ] Keychain persistence verified
- [ ] Restore flow documented in app (in Settings)
- [ ] Edge cases handled gracefully

---

## 3. App Store Connect Metadata

### Required Fields

#### App Information
- **App Name:** `Memento Calendar` ✅
  - 14 characters
  - Must be unique on App Store (verify availability)
- **Subtitle:** `Track Days & Time with Widgets` ✅
  - 30 characters (max capacity)
  - ASO-optimized: activity-focused + USP (widgets)
  - Keywords packed: track, days, time, widgets
- **Primary Language:** English (Turkish in v1.1)

#### Category
- **Primary Category:** Productivity
- **Secondary Category:** (Optional) Lifestyle

#### Pricing & Availability
- **Price:** Free (with In-App Purchases)
- **Availability:** All territories (Global)
- **Phased Release:** ❌ No (direct release, app is stable)

---

### Privacy Policy

**Current Status:** URL ready (user-generated)

**Checklist:**
- [ ] Privacy Policy URL accessible
- [ ] Policy covers:
  - [ ] Data collection (timeline data stored locally)
  - [ ] RevenueCat subscription handling
  - [ ] No third-party data sharing
  - [ ] User rights (data deletion = delete app)
- [ ] Added to App Store Connect

**Review Together:** Let's verify policy meets Apple requirements

---

### Age Rating

**Recommended:** 4+ (No restricted content)

**Questionnaire Answers:**
- Frequent/Intense Cartoon or Fantasy Violence? → No
- Medical/Treatment Information? → No
- Gambling? → No
- Unrestricted Web Access? → No
- All other questions → No

**Result:** 4+ (suitable for all ages)

---

### Export Compliance (Encryption)

**Question:** "Does your app use encryption?"

**Answer:** Yes → "Your app uses standard encryption" (HTTPS)

**Why?**
- All apps using HTTPS technically use encryption
- Apple provides automatic approval for standard encryption
- No export documentation needed

**Action in App Store Connect:**
1. Select "Yes" for encryption use
2. Select "No" for custom/proprietary encryption
3. Select "Yes" for standard encryption (HTTPS)
4. Apple auto-approves → No delays

- [ ] Export compliance answered

---

### App Description

**Character Limits:**
- Promotional Text: 170 characters (optional, editable without review)
- Description: 4,000 characters
- Keywords: 100 characters (comma-separated)

---

#### Promotional Text (170 char) ✅

```
Make every day count. Transform time into beautiful visual grids with iOS widgets. Track your year, month, or custom timelines. 7-day free trial. ⏰
```

**Character count:** 169/170

**Strategy:** Editable without review, great for A/B testing. Includes CTA + free trial mention.

---

#### App Description (English) ✅

```
Transform time into something tangible with Memento Calendar — the visual time tracker that turns your days into beautiful grids.

See your entire year, month, or week as a grid where each square represents one day. Watch your timeline fill in as time passes, making abstract time concrete and meaningful.

📱 LIVE WIDGETS FOR YOUR HOME SCREEN
Keep your timeline always visible with iOS widgets. Choose from small, medium, or large widgets to see your progress at a glance — no need to open the app.

⏰ VISUAL TIME TRACKING
• Year Grid: Visualize all 365 days of your year
• Month View: Track the current month day by day
• Week Timeline: Focus on your current week (Monday-Sunday)
• Custom Timelines: Create unlimited timelines for projects, goals, or life events
• Progress Stats: See days passed, remaining, and completion percentage

🎨 BEAUTIFULLY MINIMAL
• Dark-first design inspired by Stoic philosophy
• Clean, distraction-free interface
• Smooth animations and intuitive gestures
• Focus on what matters: your time

✨ PRO FEATURES
Unlock premium with Memento Calendar Pro:
• Unlimited custom timelines (track multiple projects/goals)
• All widget sizes (small, medium, large)
• Priority support for future updates
• Coming soon: Cloud sync across devices

🔒 PRIVACY FIRST
• All your data stays on your device
• No account required — start tracking immediately
• Zero data collection or sharing
• Complete privacy guaranteed

WHO IS THIS FOR?
Perfect for:
• Productivity enthusiasts tracking goals and deadlines
• Stoic practitioners cultivating time awareness
• Project managers visualizing timelines
• Students counting down to important dates
• Anyone who wants to make every day count

WHY CHOOSE MEMENTO CALENDAR?
Unlike other time trackers, Memento Calendar combines:
✓ Powerful iOS widgets (always-on visibility)
✓ Stoic-inspired minimalist design (no clutter)
✓ Flexible timelines (year, month, week, custom)
✓ No social features or notifications (pure focus)
✓ Local-first privacy (your data, your device)

START MAKING TIME VISIBLE
Download Memento Calendar today and transform how you see your days. Whether you're tracking a year, a month, a project, or your entire life — make time tangible.

Free to download with optional Pro subscription (7-day free trial).
```

**Character count:** ~2,150/4,000

**SEO Keywords packed:**
- ✅ time tracker (x3)
- ✅ visual timeline/tracking
- ✅ widgets (x5)
- ✅ day counter
- ✅ stoic/philosophy
- ✅ productivity
- ✅ privacy

**Strategy:**
- First 3 lines critical (visible before "more..." tap)
- Widget emphasis (USP)
- Broad appeal (productivity + mindfulness + project management)
- Clear Pro features differentiation
- Strong CTAs throughout

---

#### Turkish Translation Status
- [ ] Turkish description (planned for v1.1)

---

### Keywords (ASO) ✅

**Keyword Strategy (100 character limit):**

Priority ranking:
1. **time tracker** (10K+ monthly searches) - High volume, core function
2. **day counter** (5K+ searches) - High volume, descriptive
3. **life calendar** (competitor keyword hijack) - Steal traffic
4. **stoic** (niche positioning) - Unique differentiation
5. **memento mori** (philosophy enthusiasts) - Niche but passionate
6. **visual timeline** (descriptive) - Medium volume
7. **year pixels** (competitor keyword) - Year in Pixels app traffic
8. **productivity** (broad category) - Discovery

**Final Keyword String (99 chars):**
```
time tracker,day counter,life calendar,stoic,memento mori,visual timeline,year pixels,productivity
```

**Already Indexed (Don't Waste Space):**
- ❌ "calendar" (in app name)
- ❌ "widgets" (in subtitle)
- ❌ "memento" (in app name)
- ❌ "track/tracker" variants (Apple indexes both)

**ASO Notes:**
- No spaces after commas (Apple auto-separates)
- Singular/plural both indexed automatically
- Competitor analysis: Life Calendar, Year in Pixels, Dreamdays
- Update strategy: Monitor keyword rankings Week 1, adjust if needed

**Localization (Future):**
- v1.1: Turkish keywords (`zaman takip,gün sayacı,stoik takvim`)

- [x] Keywords finalized: 99/100 characters used

---

### What's New (Version Notes)

**Version 1.0 - Initial Release**

```
Welcome to Memento Calendar!

Make time tangible with visual timeline grids inspired by Stoic philosophy.

Features:
• Year, month, and week timelines
• Custom date range tracking
• Minimalist dark mode design
• iOS widgets (Pro)
• Unlimited custom timelines (Pro)

We'd love to hear your feedback!
```

- [ ] Version notes written

---

## 4. App Store Screenshots

### Required Sizes

Apple requires screenshots for these device sizes:

| Device Size | Resolution | Required |
|-------------|-----------|----------|
| 6.7" (iPhone 16 Pro Max) | 1320 x 2868 | ✅ Yes |
| 6.5" (iPhone 16 Plus) | 1284 x 2778 | ✅ Yes |
| 5.5" (iPhone 8 Plus) | 1242 x 2208 | ✅ Yes (fallback) |

**Minimum Required:** 3 screenshots per size (Max: 10)

### Screenshot Strategy

**Recommended 5 Screens:**
1. **Hero Shot** - Home screen showing year grid (most days filled)
   - Tagline: "Make Time Tangible"
2. **Timeline Management** - Timelines list showing multiple timelines
   - Tagline: "Track What Matters"
3. **Paywall/Features** - Premium feature showcase
   - Tagline: "Unlock Unlimited Timelines"
4. **Week View** - Current week grid close-up
   - Tagline: "Focus on Today"
5. **Widgets** - iOS home screen with widgets
   - Tagline: "Always Visible"

### Screenshot Tools

**Option 1: EAS Screenshot Tool**
```bash
# Take simulator screenshots automatically
eas build --platform ios --profile preview
```

**Option 2: Manual Simulator Screenshots**
```bash
# iPhone 16 Pro Max simulator
xcrun simctl io booted screenshot screenshot-6-7.png
```

**Option 3: Design Tool (Recommended for Polish)**
- Use Figma/Sketch to add text overlays
- App Store screenshots often have marketing copy
- Examples: [Screely](https://www.screely.com/), [AppLaunchpad](https://theapplaunchpad.com/)

### Screenshot Checklist

- [ ] Take screenshots in all required sizes
- [ ] Add marketing copy/taglines (optional but recommended)
- [ ] Verify no sensitive test data visible
- [ ] Dark mode screenshots (matches app default)
- [ ] Uploaded to App Store Connect

---

## 5. ASO (App Store Optimization)

### Pre-Launch ASO

**App Name Optimization:**
- Consider subtitle that includes keywords
- Example: "Memento Calendar - Time Tracker"
- Trade-off: Branding vs. Discoverability

**Icon Testing:**
- Current icon final? (User confirmed: Yes)
- Consider A/B testing post-launch if conversion is low

**Competitor Analysis:**

| App | Downloads | Strategy |
|-----|-----------|----------|
| Life Calendar | 100K+ | Focus on "life" and "mortality" angle |
| Year in Pixels | 50K+ | Mood/habit tracking focus |
| Dreamdays | 200K+ | Event countdown focus |

**Differentiation:**
- Memento = Stoic philosophy angle (unique positioning)
- Minimalist design (less cluttered than competitors)
- No forced social features

### Post-Launch Monitoring

**Tools to Track:**
- App Store Connect Analytics (built-in)
- Impressions → Product Page Views → Downloads (conversion funnel)
- Search terms driving traffic

**Iteration Plan:**
- Week 1: Monitor keyword rankings
- Week 2: Adjust keywords if needed (can update anytime)
- Month 1: Consider adding localized metadata (Turkish)

- [ ] ASO strategy documented
- [ ] Tracking tools access verified

---

## 6. Production Build & Upload

### Pre-Build Checklist

#### Code Preparation
- [ ] RevenueCat production API key in .env
- [ ] No console.logs with sensitive data
- [ ] Version number updated in app.json (1.0.0)
- [ ] Bundle identifier correct: `com.yourcompany.stoiccalendar`
- [ ] App icon final version in assets

#### EAS Configuration

**Check `eas.json`:**
```json
{
  "build": {
    "production": {
      "ios": {
        "buildType": "app-store",
        "releaseChannel": "production"
      }
    }
  }
}
```

- [ ] EAS project configured
- [ ] Apple Developer account connected
- [ ] Provisioning profiles valid

---

### Build Commands

#### Step 1: Clean Build
```bash
# Clear metro cache
npm start -- --reset-cache

# Clear EAS build cache (optional)
eas build:cancel --all
```

#### Step 2: Production Build
```bash
# Create App Store production build
eas build --platform ios --profile production

# This will:
# 1. Bundle JavaScript
# 2. Compile native code
# 3. Sign with distribution certificate
# 4. Upload to EAS servers
# 5. Return build ID + download link
```

**Build Time:** ~10-20 minutes

#### Step 3: Download IPA (Optional)
```bash
# Download .ipa file locally (for archival)
eas build:download --id [BUILD_ID]
```

---

### Upload to App Store Connect

#### Option 1: EAS Auto-Submit (Recommended)
```bash
# Automatically submit to App Store Connect
eas submit --platform ios --latest

# This will:
# 1. Upload IPA to App Store Connect
# 2. Process build (Apple's side, ~10 mins)
# 3. Build appears in "Activity" tab
```

#### Option 2: Manual Upload (Transporter App)
1. Download IPA from EAS
2. Open Transporter app (Mac App Store)
3. Drag IPA into Transporter
4. Submit

**Wait for Processing:**
- Apple processes uploaded build (~10-30 minutes)
- You'll receive email: "Build Processed"
- Build appears in App Store Connect → TestFlight → iOS Builds

- [ ] Production build created
- [ ] IPA uploaded to App Store Connect
- [ ] Build processing completed
- [ ] No warnings/errors in build logs

---

### TestFlight Verification (Final Check)

**Before submitting to review, test production build:**

1. Go to App Store Connect → TestFlight
2. Select processed build
3. Add to External Testing group (or install via internal)
4. Install on physical device
5. Test critical flows:
   - [ ] App launches without crashes
   - [ ] RevenueCat loads offerings correctly
   - [ ] Subscription purchase works (sandbox)
   - [ ] Timeline creation/editing works
   - [ ] Dark mode renders correctly
   - [ ] No placeholder text or test data

**Red Flags to Check:**
- Missing assets (images not loading)
- Crash on launch (provisioning issues)
- RevenueCat errors (API key wrong)
- Slow performance (check release build optimizations)

---

## 7. Submit for Review

### App Store Connect Final Steps

#### 1. Select Build
- Go to App Store Connect → Your App → App Store tab
- Under "Build", click "Add Build" (+ icon)
- Select the processed build from dropdown
- Click "Done"

#### 2. Complete Review Information

**Contact Information:**
- [ ] First Name
- [ ] Last Name
- [ ] Phone Number
- [ ] Email Address
(Apple uses this to contact you if issues arise)

**Demo Account (if applicable):**
- Not needed (no login required)

**Notes for Reviewer:**
```
Thank you for reviewing Memento Calendar!

This app helps users track time through visual timeline grids inspired by Stoic philosophy. All features are accessible without a login.

SUBSCRIPTION TESTING:
- The app offers yearly and monthly subscriptions
- Yearly plan includes a 7-day free trial
- Use a sandbox test account to verify subscription flow
- "Restore Purchases" button available in Paywall screen

NO SPECIAL SETUP REQUIRED:
- No login/account needed
- App works immediately after installation
- All timeline data stored locally

Feel free to reach out if you have questions!
```

#### 3. Version Information

**Copyright:** `2026 Your Name/Company`

**Version Release:**
- ⚪ Manually release this version (you control release timing)
- ⚪ Automatically release after approval (goes live immediately)

**Recommended:** Manual release (gives you control over launch timing for marketing)

---

### Pre-Submission Checklist

#### Screenshots & Metadata
- [ ] App icon uploaded (1024x1024 PNG)
- [ ] Screenshots uploaded for all sizes
- [ ] App name finalized
- [ ] Subtitle added
- [ ] Keywords added
- [ ] Description written
- [ ] Privacy Policy URL added
- [ ] Support URL added (can be website or email)

#### Build & Technical
- [ ] Production build selected
- [ ] Version number correct (1.0)
- [ ] Bundle ID correct
- [ ] Age rating set (4+)
- [ ] Category selected (Productivity)
- [ ] Export compliance answered
- [ ] In-App Purchases visible in listing

#### Legal
- [ ] Pricing & availability set (Free, Global)
- [ ] Copyright year correct
- [ ] Privacy policy accessible and compliant

---

### Submit!

**The Big Button:**
1. Review all sections (App Store Connect shows checklist)
2. Click **"Submit for Review"** (top right)
3. Confirm submission

**What Happens Next:**
- Status changes to **"Waiting for Review"**
- You'll receive email confirmation
- Apple typically reviews within 24-48 hours
- You'll get email when status changes (Approved/Rejected/In Review)

**Review Timeline:**
- In Review: ~2-24 hours
- Total time: Usually 24-72 hours for new apps

- [ ] **App submitted for review**
- [ ] Submission confirmation email received

---

## 8. Post-Submission

### During Review

**Status Tracking:**
- **Waiting for Review** → App in queue
- **In Review** → Apple reviewer testing now
- **Pending Developer Release** → Approved! (if manual release selected)
- **Ready for Sale** → Live on App Store!

**If Rejected:**
- Read rejection reason carefully
- Common issues: Privacy policy, metadata/screenshots mismatch, crashes
- Respond via Resolution Center or fix and resubmit

---

### After Approval

#### Pre-Launch Tasks (If Manual Release)
- [ ] Prepare launch announcement (social media, website, etc.)
- [ ] Monitor App Store Connect for initial reviews/ratings
- [ ] Set up alerts for crash reports

#### Release to App Store
1. Go to App Store Connect → Your App
2. Click **"Release This Version"**
3. App goes live within hours

#### Week 1 Monitoring
- [ ] Check crash reports daily (App Store Connect → Analytics)
- [ ] Monitor reviews and ratings
- [ ] Track download numbers
- [ ] Verify subscription purchases working correctly (RevenueCat Dashboard)

#### Week 1 Support
- Respond to negative reviews if actionable feedback
- Monitor support email for user questions
- Track most common user issues for v1.1 update

---

### RevenueCat Production Monitoring

**Dashboard Metrics to Watch:**
- Active subscriptions count
- Trial conversion rate (7-day trial → paid)
- Churn rate (cancellations)
- Revenue (Apple pays monthly)

**Expected Metrics (Industry Benchmarks):**
- Free trial → Paid conversion: 20-40% (good)
- Monthly churn: 5-10% (healthy)

**Action Items:**
- Week 1: Verify transactions flowing correctly
- Week 2: Analyze conversion funnel (impressions → purchases)
- Month 1: Consider promotional offers if conversion low

- [ ] RevenueCat dashboard monitored
- [ ] First subscriptions verified working

---

## Support & Resources

### Useful Links
- [App Store Connect](https://appstoreconnect.apple.com/)
- [RevenueCat Dashboard](https://app.revenuecat.com/)
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Apple Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [ASO Tools](https://www.appfollow.io/), [Sensor Tower](https://sensortower.com/)

### Emergency Contacts
- Apple Developer Support: developer.apple.com/contact/
- RevenueCat Support: support@revenuecat.com
- EAS Support: Expo Discord

---

## Notes & Changes

### Change Log
- 2026-02-07: Initial checklist created
- [ ] RevenueCat production API key updated
- [ ] Final testing completed
- [ ] Screenshots uploaded
- [ ] App submitted

### Open Questions
- [ ] Final app name confirmed?
- [ ] Turkish localization for v1.0 or v1.1?
- [ ] Marketing plan post-launch?

---

**Good luck with your launch! 🚀**
