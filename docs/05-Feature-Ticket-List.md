# FLOW — Feature Ticket List

**Last updated:** 2026-06-04
Legend: ✅ done · 🟡 in this change · ⬜ todo · 🚫 out-of-scope (offline decision)

---

## Epic A — Core Game (shipped)
| ID | Ticket | Status |
|----|--------|--------|
| A1 | Puzzle engine: win check, paths, stars | ✅ |
| A2 | 25 solvable levels (4×4–7×7) | ✅ |
| A3 | FlowGrid drag drawing | ✅ |
| A4 | Win overlay + stars | ✅ |
| A5 | Journey map (continuous, no difficulty sections) | ✅ |
| A6 | Fix win-overlay back-stack dead-ends (reset stack + onRequestClose) | ✅ |

## Epic B — Meta Systems (shipped)
| ID | Ticket | Status |
|----|--------|--------|
| B1 | Lives economy + 8-min regen, charge/refund | ✅ |
| B2 | Coins (earn on first clear / daily) | ✅ |
| B3 | Hints powerup + DFS solver | ✅ |
| B4 | Daily challenge + streak | ✅ |
| B5 | Shop (hints, pack, refill) | ✅ |
| B6 | Settings (sound, haptics, reset) | ✅ |
| B7 | Pastel/playful visual redesign | ✅ |

## Epic C — Legal & Compliance
| ID | Ticket | Status |
|----|--------|--------|
| C1 | Privacy Policy screen | 🟡 |
| C2 | Terms & Conditions screen | 🟡 |
| C3 | First-run consent gate (cookies/consent equivalent) | 🟡 |
| C4 | Settings links to Privacy/Terms + analytics opt-in toggle | 🟡 |
| C5 | Play Console: Privacy URL + Data Safety form | ⬜ (manual, store-side) |

> Note: "Cookies consent" is web terminology. The mobile equivalent shipped here is a **first-run consent gate** covering local storage + analytics + ads disclosure.

## Epic D — Auth & Security
| ID | Ticket | Status |
|----|--------|--------|
| D1 | Sign up / Login flow | 🚫 offline (designed in Security doc) |
| D2 | Email verification | 🚫 offline |
| D3 | Password reset flow | 🚫 offline |
| D4 | OAuth (Google, etc.) | 🚫 offline |
| D5 | Rate limiting (brute-force) | 🚫 N/A — no auth endpoints |
| D6 | VIBRATE permission (haptics) | ✅ |
| D7 | Reset-progress data clear | ✅ |

## Epic E — Analytics & Tracking
| ID | Ticket | Status |
|----|--------|--------|
| E1 | Provider-agnostic analytics layer (`track`, `screen`) | 🟡 |
| E2 | Firebase Analytics adapter (lazy-loaded) | 🟡 |
| E3 | Instrument key events (level_start/win, hint_used, ad_watched, shop_purchase, daily_complete) | 🟡 |
| E4 | Screen tracking on navigation | 🟡 |
| E5 | Consent-gated forwarding | 🟡 |
| E6 | Activate Firebase (add google-services.json + deps + rebuild) | ⬜ (needs your keys) |

## Epic F — Monetization
| ID | Ticket | Status |
|----|--------|--------|
| F1 | `AdProvider` interface | 🟡 |
| F2 | `StubAdProvider` + RewardedAdModal | 🟡 |
| F3 | "Watch ad → free hint" entry on hint flow | 🟡 |
| F4 | "Watch ad → coins" entry in Shop | 🟡 |
| F5 | Real AdMob integration (`react-native-google-mobile-ads`) | ⬜ (needs AdMob IDs + rebuild) |
| F6 | UMP/GDPR ad consent (EEA) | ⬜ (with F5) |
| F7 | IAP (remove ads / coin packs) | ⬜ (v2) |

## Epic G — Quality & Release
| ID | Ticket | Status |
|----|--------|--------|
| G1 | Unit tests: engine (isComplete, solvePipePath, calcStars) | ⬜ |
| G2 | Unit tests: economy regen + daily streak | ⬜ |
| G3 | accessibilityLabels on icon buttons | ⬜ |
| G4 | iOS build validation | ⬜ |
| G5 | Crashlytics | ⬜ |

## Activation Checklist (manual, needs your accounts/keys)
1. **Firebase:** create project → add Android app `com.echochain` → download `google-services.json` to `android/app/` → `npm i @react-native-firebase/app @react-native-firebase/analytics` → add gms plugin → rebuild. (Activates E6.)
2. **AdMob:** create app + rewarded ad units → `npm i react-native-google-mobile-ads` → set app IDs → replace `StubAdProvider` with `AdMobProvider` → rebuild. (Activates F5/F6.)
3. **Play Console:** host Privacy Policy URL, complete Data Safety (analytics + ads), set content rating.
