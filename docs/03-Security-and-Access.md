# FLOW — Security & Access Document

**Last updated:** 2026-06-04

---

## 1. Security Posture Summary
FLOW v1 is an **offline, account-less** Android game. The attack surface is intentionally minimal: no user accounts, no auth, no remote APIs, no PII collected by the app itself. The main third-party data flows are **analytics (Firebase, opt-in)** and **ads (AdMob, when enabled)**.

## 2. Data Inventory
| Data | Stored where | Sensitivity | Notes |
|------|--------------|-------------|-------|
| Game progress (completed, unlocked) | On-device AsyncStorage | Low | No PII |
| Economy (lives, coins, hints) | On-device AsyncStorage | Low | No PII |
| Daily streak | On-device AsyncStorage | Low | No PII |
| Settings + consent flags | On-device AsyncStorage | Low | Consent record |
| Analytics events | Firebase (if opt-in) | Medium | Pseudonymous app-instance id, device/usage metrics |
| Ad identifiers | AdMob (if enabled) | Medium | Advertising ID (GAID) |

No passwords, emails, locations, contacts, or payment data are collected in v1.

## 3. Authentication & Access — DECISION: OUT OF SCOPE (offline)
The product decision for v1 is **no accounts**. The following are therefore **not implemented**, documented here as the design for a future "online" version.

| Requested item | v1 status | Future design (when accounts added) |
|----------------|-----------|--------------------------------------|
| Sign up / Login flow | ❌ Not present | Firebase Auth or Supabase Auth; email+password and Google OAuth |
| Email verification | ❌ Not present | Provider-issued verification email; gate features until verified |
| Password reset | ❌ Not present | Provider reset email + deep-link reset screen |
| OAuth (Google, etc.) | ❌ Not present | Google Sign-In via provider SDK; Apple Sign-In required for iOS |
| Rate limiting (brute force) | ❌ N/A (no endpoints) | Enforced server-side: per-IP + per-account throttling, exponential backoff, CAPTCHA after N failures, lockout + alerting |

**Why N/A now:** brute-force / credential attacks require an authentication endpoint. FLOW exposes none. If/when a backend is added, rate limiting MUST be implemented server-side (client throttling is not a security control).

## 4. Local Data Integrity
- AsyncStorage is app-private (Android sandbox). Not encrypted — acceptable because data is non-sensitive (game progress).
- "Reset progress" in Settings clears all keys (`AsyncStorage.clear()`), with confirmation.
- No secrets are shipped in the bundle. (Firebase/AdMob config files are not secrets but should still be added via your own project, not committed if you prefer.)

## 5. Permissions
| Permission | Reason |
|------------|--------|
| `INTERNET` | Analytics/ads delivery (when enabled) |
| `VIBRATE` | Haptic feedback |
| `ACCESS_NETWORK_STATE` (added by Firebase/ads) | Connectivity checks |
| Advertising ID (declared by AdMob) | Ad personalization (respect consent) |

Principle of least privilege: no camera, location, storage, contacts, or mic.

## 6. Third-Party Data Processors
| Processor | Purpose | Activated when | Compliance |
|-----------|---------|----------------|------------|
| Google Firebase Analytics | Usage analytics | User opts in | Must appear in Privacy Policy + Play Data Safety |
| Google AdMob | Rewarded ads | Ads enabled | Must request consent (GDPR/UMP), disclose in Privacy Policy |

## 7. Consent & Privacy Controls
- First-run **consent gate**: user accepts Privacy Policy + Terms; chooses analytics opt-in/out.
- Settings → "Privacy choices": toggle analytics anytime (writes `consentStore`).
- Analytics layer hard-checks consent before forwarding any event.
- For EU users + ads: integrate Google UMP consent (TODO when AdMob is added).

## 8. Compliance Checklist (Google Play)
- [ ] Privacy Policy URL in Play Console + in-app (in-app screen present).
- [ ] Data Safety form: declare analytics + ad identifiers.
- [ ] Families/age rating set; if targeting children, ads must be child-safe (or disabled) and analytics restricted.
- [ ] UMP/GDPR consent for ads in EEA.
- [ ] Account deletion: N/A (no accounts) — state this in the policy.

## 9. Incident & Update Process
- Crash monitoring via Firebase Crashlytics (recommended add-on).
- Security updates: bump RN/deps quarterly; monitor `npm audit`.
