# FLOW — Technical Architecture Document

**Last updated:** 2026-06-04

---

## 1. Stack
| Layer | Choice |
|-------|--------|
| Framework | React Native 0.85.3 (Hermes), TypeScript |
| Navigation | `@react-navigation/native` + native-stack |
| State | Zustand stores (no Redux) |
| Persistence | `@react-native-async-storage/async-storage` |
| Haptics | Built-in `Vibration` API (perm `android.permission.VIBRATE`) |
| Analytics | Provider-agnostic layer + Firebase adapter (lazy) |
| Ads | `AdProvider` interface; stub now, AdMob later |
| Platform | Android (iOS structurally supported, not yet built) |

No backend. All state is on-device.

## 2. Module Map
```
src/
  engine/
    types.ts          # FlowLevel, FlowDot, Difficulty
    levels.ts         # 25 level definitions (dots + solution grids)
    flowEngine.ts     # win check, hint solver, stars, path utils
  store/
    gameStore.ts      # active puzzle state + drag handlers + applyHint
    progressStore.ts  # completed{} + unlocked[] (persisted)
    economyStore.ts   # lives, coins, hints, regen (persisted)
    dailyStore.ts     # daily streak + level-of-day (persisted)
    settingsStore.ts  # sound, haptics, + haptic() helper (persisted)
    consentStore.ts   # legal acceptance + analytics opt-in (persisted)   [NEW]
  analytics/
    index.ts          # track(), screen(), setEnabled() — provider-agnostic [NEW]
    firebaseAdapter.ts# lazy Firebase Analytics forwarder                   [NEW]
  ads/
    AdProvider.ts     # interface + StubAdProvider (rewarded)               [NEW]
  components/
    FlowGrid.tsx      # grid render + PanResponder drawing
    WinOverlay.tsx    # win modal (stars, rewards, actions)
    ResourceBar.tsx   # lives + coins pills
  screens/
    HomeScreen, LevelSelectScreen, GameScreen,
    ShopScreen, SettingsScreen,
    PrivacyPolicyScreen, TermsScreen, ConsentScreen   [NEW]
  navigation/AppNavigator.tsx
  theme/index.ts      # Colors, Pastel, FlowColors, type scale
```

## 3. Data Models
```ts
FlowLevel { id, title, difficulty, gridSize, dots: FlowDot[], solution: string[][] }
FlowDot   { key, from:[r,c], to:[r,c] }
Paths     = Record<colorKey, [r,c][]>
```
Persisted keys (AsyncStorage):
- `@echo_completed`, `@echo_unlocked`
- `@echo_economy_v1`, `@echo_daily_v1`, `@echo_settings_v1`
- `@echo_consent_v1` (NEW)

## 4. Core Algorithms
- **Win check** (`isComplete`): full coverage + endpoint match per pipe.
- **Hint solver** (`solvePipePath`): DFS Hamiltonian path through a color's solution cells from `from`→`to`; small regions (≤14 cells) so cost is trivial.
- **Lives regen** (`economyStore.regen`): time-anchored accrual; `lastRefillAt` carries leftover time for smooth refills.
- **Daily pick** (`dailyLevelId`): hash(dateKey) % levelCount → deterministic.

## 5. Navigation Graph
```
Home ─┬─ Game(levelId, daily?)
      ├─ LevelSelect ─ Game
      ├─ Shop
      ├─ Settings ─┬─ PrivacyPolicy
      │            └─ Terms
ConsentScreen (first-run gate, before Home content is actionable)
```
Win-overlay actions use `navigation.reset` to a canonical stack to prevent back-stack dead-ends (regression fixed in v1).

## 6. Analytics Architecture
- `analytics.track(event, props)` and `analytics.screen(name)` are the only call sites used by the app.
- Internally fan out to registered adapters. `firebaseAdapter` lazy-`require`s `@react-native-firebase/analytics`; if the native module isn't installed it no-ops (keeps app building offline).
- All forwarding is gated by `consentStore.analyticsEnabled`.
- **To activate Firebase:** add `google-services.json`, `npm i @react-native-firebase/app @react-native-firebase/analytics`, apply the `com.google.gms.google-services` Gradle plugin, rebuild.

## 7. Ads Architecture
- `AdProvider` interface: `loadRewarded()`, `showRewarded(): Promise<{completed:boolean}>`.
- `StubAdProvider` resolves after a simulated countdown modal.
- Swap to `AdMobProvider` (react-native-google-mobile-ads) later; call sites unchanged.

## 8. Build & Run
- Metro: `npx react-native start`; `adb reverse tcp:8081 tcp:8081`.
- Android build: `android/gradlew.bat app:assembleDebug` then `adb install -r`.
- Native rebuild required only when adding native deps or manifest perms (e.g. VIBRATE, Firebase, AdMob).

## 9. Known Constraints / Tech Debt
- iOS project not yet validated.
- Analytics/ads are code-complete but inert until keys/SDKs are added.
- No automated test suite yet (Jest configured; unit tests TBD for engine + economy).
