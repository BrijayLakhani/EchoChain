# FLOW — Frontend Specification

**Last updated:** 2026-06-04

---

## 1. Design Language
- **Style:** Two-Dots-inspired pastel + playful. Rounded chunky cards, soft shadows, candy accents, bouncy spring animations.
- **Tone:** calm, friendly, uncluttered.

## 2. Design Tokens (`src/theme/index.ts`)
**Pastel palette**
| Token | Hex | Use |
|-------|-----|-----|
| `bg` | #FBF7F0 | screen background |
| `bgAlt` | #F3ECE0 | panels / tracks |
| `card` | #FFFFFF | cards, pills |
| `ink` | #2E2A3A | primary text |
| `inkSoft` | #6C6680 | secondary text |
| `inkDim` | #A9A2B8 | tertiary text |
| `mint` | #5CC9A7 | primary action |
| `sky / coral / sun / grape / bubble / teal` | — | accents |
| `heart` | #FF5A6E | lives |
| `coin` | #FFC24B | coins |

**Pipe colors** (`FlowColors`): R, B, G, Y, O, P, T, K, N, W.

**Type scale** (`FontSize`): xs 11 → xxxl 36. **Radii**: sm 8 → full 999.

## 3. Screen Specs

### 3.1 ConsentScreen (first run) — NEW
- Full-screen gate. Logo, short value line, summary of data use.
- Links: Privacy Policy, Terms (open respective screens).
- Toggle: "Allow anonymous analytics" (default on, user-changeable).
- Primary button **Agree & Continue** → writes consent, routes to Home.
- Cannot be dismissed without accepting Privacy + Terms.

### 3.2 HomeScreen
- Top bar: lives pill (♥ + count), coins pill (● + count), settings gear.
- Hero: 2×2 logo dots (spring scale-in), "FLOW", tagline, progress bar + "x / N solved".
- Daily Challenge card: icon (★ / ✓ done), title, subtitle, 🔥 streak badge.
- Actions: **Continue/Play** (mint), row of **Levels** + **Shop**.
- Animations: fade + slide-up on mount.

### 3.3 LevelSelectScreen ("Journey")
- Header: "Journey", "x / N solved".
- Continuous serpentine map; nodes weave left/center/right with slanted connectors.
- Node states: solved (filled accent + ✓ + stars), unlocked (outline + number + title), locked (faded).
- Accent color cycles per node.

### 3.4 GameScreen
- Top bar: back ‹, "LEVEL n / DAILY CHALLENGE" + title, reset ↺.
- Progress: thin accent fill bar; "x / N pipes" + "n moves".
- `FlowGrid`: drag to draw; pipes render as rounded segments, endpoints as dots.
- Bottom: **Hint** pill (💡 + "Hint" + badge count / "+").
- Win → `WinOverlay`. Out-of-lives → gate modal.

### 3.5 WinOverlay
- Stars (staggered bounce), message by star count, "Level n · title", moves, **+coins** pill.
- Actions: **Next Level →** (non-daily, if exists), **Play Again**, **All Levels**.
- `onRequestClose` (hardware back) = All Levels.

### 3.6 ShopScreen
- Header: close ✕, "Shop", coin balance.
- Cards: Hint (50), Hint Pack (5 / 200), Refill Lives (120, disabled when full).
- "Watch ad for a free hint" (rewarded stub) — NEW.
- "Claim free coins" helper.

### 3.7 SettingsScreen
- Toggles: Sound, Haptics.
- "Privacy choices" → analytics opt-in toggle. — NEW
- Links: Privacy Policy, Terms. — NEW
- Reset progress (destructive, confirm). About.

### 3.8 PrivacyPolicyScreen / TermsScreen — NEW
- Scrollable long-form text; header with close.

## 4. Component Inventory
| Component | Responsibility |
|-----------|----------------|
| `FlowGrid` | Grid render + PanResponder drag → row/col callbacks |
| `WinOverlay` | Win modal |
| `ResourceBar` | Lives + coins pills (with regen timer) |
| `RewardedAdModal` (NEW) | Simulated ad countdown, resolves completion |
| `ConsentGate` (NEW) | First-run routing wrapper |

## 5. Interaction & Motion
- Buttons: `activeOpacity` 0.8–0.9; haptic `tap` on press (respects setting).
- Win: backdrop fade + card spring + star stagger.
- Map connectors: rotated rects (`transformOrigin: left center`).

## 6. Accessibility
- Min tap target ≥ 40dp (hitSlop on icons).
- Color is never the only signal (numbers, checks, labels accompany color).
- TODO: `accessibilityLabel`s on icon-only buttons; dynamic font scaling pass.

## 7. Empty/Edge States
- 0 lives → gate modal with timer + shop/ad.
- Out of hints → badge shows "+", tapping routes to Shop / rewarded ad.
- All levels solved → "Play Again".
- Daily done → card shows ✓ "come back tomorrow".
