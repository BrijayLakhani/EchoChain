import {create} from 'zustand';
import {todayKey} from './dailyStore';
import {getSecure, setSecure} from '../utils/secureStore';

// ── Economy tuning ──────────────────────────────────────────────
export const LIVES_MAX        = 5;
export const REFILL_MS         = 8 * 60 * 1000;   // one life every 8 min
export const HINT_COST         = 50;              // coins per hint
export const HINT_PACK_COST     = 200;            // 5 hints (save 20%)
export const REFILL_COST        = 120;            // coins to fully refill lives
export const COINS_PER_STAR     = 15;             // first-clear reward
export const DAILY_REWARD        = 60;            // daily challenge coins

// Free / ad-gated faucets (anti-exploit: capped + cooldown)
export const DAILY_FREE_COINS   = 30;             // once per calendar day
export const AD_COIN_REWARD      = 25;            // coins per rewarded ad
export const ADS_PER_DAY         = 8;             // hard daily cap on rewarded ads

// Hard-currency (gems) sinks — premium shortcuts
export const GEMS_PER_REFILL     = 8;
export const GEMS_PER_HINT_PACK   = 20;           // 5 hints
export const GEMS_PER_COIN_BAG    = 12;           // 500 coins
export const COIN_BAG_AMOUNT      = 500;

const KEY = '@echo_economy_v2';

interface Persisted {
  lives: number;
  coins: number;
  gems: number;
  hints: number;
  lastRefillAt: number;     // epoch ms anchor for regen accounting
  adDay: string;            // calendar day the ad counter belongs to
  adsWatchedToday: number;
  freeClaimDay: string;     // last day daily-free-coins was claimed
}

interface EconomyState extends Persisted {
  loaded: boolean;
  load: () => Promise<void>;

  // lives
  nextLifeIn: () => number;
  spendLife: () => boolean;
  addLife: (n?: number) => void;
  refillLives: () => void;

  // coins (soft currency)
  addCoins: (n: number) => void;
  spendCoins: (n: number) => boolean;

  // gems (hard currency — IAP only sources)
  addGems: (n: number) => void;
  spendGems: (n: number) => boolean;

  // hints
  addHints: (n: number) => void;
  useHint: () => boolean;

  // rewarded-ad cap (per calendar day)
  adsLeftToday: () => number;
  canWatchAd: () => boolean;
  recordAdWatch: () => void;

  // daily free coins (cooldown)
  canClaimDailyCoins: () => boolean;
  claimDailyCoins: () => boolean;   // true if granted
}

function freshPersisted(): Persisted {
  return {
    lives: LIVES_MAX, coins: 0, gems: 0, hints: 1,
    lastRefillAt: Date.now(), adDay: todayKey(), adsWatchedToday: 0, freeClaimDay: '',
  };
}

// Roll the per-day ad counter over at midnight.
function rollDay(p: Persisted): Persisted {
  const t = todayKey();
  if (p.adDay !== t) return {...p, adDay: t, adsWatchedToday: 0};
  return p;
}

// Compute life regen since lastRefillAt, capping at MAX.
function regen(p: Persisted): Persisted {
  if (p.lives >= LIVES_MAX) return {...p, lastRefillAt: Date.now()};
  const now = Date.now();
  const elapsed = now - p.lastRefillAt;
  const gained = Math.floor(elapsed / REFILL_MS);
  if (gained <= 0) return p;
  const lives = Math.min(LIVES_MAX, p.lives + gained);
  const leftover = elapsed - gained * REFILL_MS;
  const lastRefillAt = lives >= LIVES_MAX ? now : now - leftover;
  return {...p, lives, lastRefillAt};
}

export const useEconomyStore = create<EconomyState>((set, get) => {
  const persist = () => {
    const {lives, coins, gems, hints, lastRefillAt, adDay, adsWatchedToday, freeClaimDay} = get();
    setSecure(KEY, {lives, coins, gems, hints, lastRefillAt, adDay, adsWatchedToday, freeClaimDay});
  };

  return {
    ...freshPersisted(),
    loaded: false,

    load: async () => {
      try {
        const saved = await getSecure<Persisted>(KEY);
        const base: Persisted = saved ? {...freshPersisted(), ...saved} : freshPersisted();
        set({...regen(rollDay(base)), loaded: true});
      } catch {
        set({loaded: true});
      }
    },

    // ── lives ──────────────────────────────────────────
    nextLifeIn: () => {
      const {lives, lastRefillAt} = regen(get());
      if (lives >= LIVES_MAX) return 0;
      return REFILL_MS - ((Date.now() - lastRefillAt) % REFILL_MS);
    },
    spendLife: () => {
      const cur = regen(get());
      if (cur.lives <= 0) { set(cur); return false; }
      const lives = cur.lives - 1;
      const lastRefillAt = cur.lives >= LIVES_MAX ? Date.now() : cur.lastRefillAt;
      set({...cur, lives, lastRefillAt}); persist();
      return true;
    },
    addLife: (n = 1) => {
      const cur = regen(get());
      set({...cur, lives: Math.min(LIVES_MAX, cur.lives + n)}); persist();
    },
    refillLives: () => { set({lives: LIVES_MAX, lastRefillAt: Date.now()}); persist(); },

    // ── coins ──────────────────────────────────────────
    addCoins: (n) => { if (n <= 0) return; set({coins: get().coins + n}); persist(); },
    spendCoins: (n) => {
      if (n <= 0 || get().coins < n) return false;
      set({coins: get().coins - n}); persist();
      return true;
    },

    // ── gems ───────────────────────────────────────────
    addGems: (n) => { if (n <= 0) return; set({gems: get().gems + n}); persist(); },
    spendGems: (n) => {
      if (n <= 0 || get().gems < n) return false;
      set({gems: get().gems - n}); persist();
      return true;
    },

    // ── hints ──────────────────────────────────────────
    addHints: (n) => { if (n <= 0) return; set({hints: get().hints + n}); persist(); },
    useHint: () => {
      if (get().hints <= 0) return false;
      set({hints: get().hints - 1}); persist();
      return true;
    },

    // ── rewarded-ad daily cap ─────────────────────────
    adsLeftToday: () => {
      const p = rollDay(get());
      return Math.max(0, ADS_PER_DAY - p.adsWatchedToday);
    },
    canWatchAd: () => get().adsLeftToday() > 0,
    recordAdWatch: () => {
      const p = rollDay(get());
      set({...p, adsWatchedToday: p.adsWatchedToday + 1}); persist();
    },

    // ── daily free coins (one calendar day) ───────────
    canClaimDailyCoins: () => get().freeClaimDay !== todayKey(),
    claimDailyCoins: () => {
      if (!get().canClaimDailyCoins()) return false;
      set({coins: get().coins + DAILY_FREE_COINS, freeClaimDay: todayKey()}); persist();
      return true;
    },
  };
});
