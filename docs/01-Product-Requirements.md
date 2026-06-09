# FLOW — Product Requirements Document (PRD)

**App:** FLOW (package `com.echochain`)
**Type:** Offline single-player pipe-connection puzzle game (React Native 0.85, Android)
**Owner:** yatrawithmaps@gmail.com
**Status:** v1 in active development
**Last updated:** 2026-06-04

---

## 1. Vision & Summary
FLOW is a calm, polished "connect the pipes / fill the grid" puzzle game inspired by Flow Free and the look-and-feel of Two Dots. The player draws colored paths between matching endpoints so that every cell of the grid is filled and every pair is connected. The product goal is a friendly, progression-driven casual game with light meta-systems (lives, coins, daily challenge) and a non-intrusive monetization layer (rewarded ads), shippable offline with no account required.

## 2. Goals
- **G1** — Deliver a satisfying core puzzle loop (draw → connect → win → next).
- **G2** — Provide a continuous, motivating progression (numbered Journey map, 25+ levels, progressively harder).
- **G3** — Add retention meta-systems: lives economy, coins, hints, daily challenge + streak.
- **G4** — Monetize without harming UX: optional rewarded ads for hints/coins.
- **G5** — Ship legally compliant (Privacy Policy, Terms, consent) on Google Play.

## 3. Non-Goals (v1)
- No user accounts, login, cloud save, or social features (app is offline by decision).
- No multiplayer / leaderboards backend.
- No in-app purchases (IAP) in v1 — only rewarded ads. (IAP is a v2 candidate.)
- No second game mode (e.g. a literal Two-Dots dot-linking board).

## 4. Target Users & Personas
- **Casual commuter** — short sessions, wants quick wins, values "Continue".
- **Completionist** — chases 3 stars and the daily streak.
- **Lapsed returner** — re-engaged by daily challenge and life refills.

## 5. Core Game Loop
1. Player opens app → Home shows lives, coins, progress, daily card.
2. Tap **Continue** → next unsolved level (spends 1 life, refunded on win).
3. Draw paths on the grid; progress bar tracks connected pipes.
4. On full, valid fill → **Win overlay** (stars by move efficiency, coin reward on first clear).
5. **Next Level** (replace) / **Play Again** / **All Levels**.

## 6. Features (v1)

### 6.1 Puzzle Engine
- Grid sizes 4×4 → 7×7. Each level defines endpoints (`dots`) + a `solution` grid.
- Win = full coverage + each pipe connects its two endpoints (`isComplete`).
- Stars by move count vs grid size (`calcStars`): ≤1.2× cells = 3★, ≤2.2× = 2★, else 1★.
- 25 levels shipped, generated to be guaranteed solvable (single Hamiltonian path cut into colored segments).

### 6.2 Progression — "Journey" Map
- Continuous numbered serpentine map (no difficulty sections).
- Node states: locked / unlocked / solved (+ star display).
- Unlock-next-on-win.

### 6.3 Lives Economy
- Max 5 lives; regen 1 per 8 min.
- Entering a non-daily level costs 1 life; **refunded on win** (only failures/quits cost).
- Out-of-lives gate → wait or visit Shop.

### 6.4 Coins
- Earned on first clear: `stars × 15`. Daily challenge: +60.
- Spent in Shop on hints / hint packs / life refill.

### 6.5 Hints (Powerup)
- Reveals one not-yet-solved pipe via DFS Hamiltonian solver over the solution.
- Consumes 1 owned hint; if none, routes to Shop (or rewarded ad — see 6.8).

### 6.6 Daily Challenge + Streak
- Deterministic level-of-the-day (date-seeded).
- Streak increments on consecutive days; resets if a day is skipped.

### 6.7 Settings
- Sound toggle, Haptics toggle (Vibration API), Reset progress, About.
- Links to Privacy Policy & Terms (see Legal).

### 6.8 Monetization — Rewarded Ads (stubbed in v1)
- "Watch ad → free hint" and/or "Watch ad → coins".
- v1 ships a **simulated** ad provider; AdMob drops in later via the `AdProvider` interface.

### 6.9 Legal & Consent
- First-run **consent gate**: accept Privacy Policy & Terms; analytics opt-in.
- In-app Privacy Policy and Terms screens.

### 6.10 Analytics
- Event + screen tracking through a provider-agnostic layer with a Firebase adapter.
- Gated by user consent (opt-out respected).

## 7. Out-of-Scope but Designed (future)
| Area | Why deferred | Doc ref |
|------|--------------|---------|
| Accounts / Auth / OAuth | Offline by decision | Security & Access §Auth |
| Email verification / password reset | Needs backend + auth | Security & Access §Auth |
| Rate limiting | No server endpoints exist | Security & Access §Rate limiting |
| IAP | v2 monetization | this PRD §3 |

## 8. Success Metrics (KPIs)
- D1 / D7 retention; daily challenge completion rate; streak length distribution.
- Levels/session; hint usage; rewarded-ad opt-in rate; ad eCPM (post-AdMob).
- Crash-free sessions ≥ 99.5%.

## 9. Release Criteria
- All 25 levels solvable; no dead-end navigation; consent gate enforced on first run.
- Privacy Policy + Terms reachable; analytics respects opt-out.
- Play Store listing + data-safety form completed (reflecting analytics + ads).
