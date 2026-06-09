import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {LEVELS} from '../engine/levels';

const KEY = '@echo_daily_v1';

// Local date key, e.g. "2026-06-04"
export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Deterministic level pick for a given date.
export function dailyLevelId(key = todayKey()): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return LEVELS[h % LEVELS.length].id;
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return todayKey(d);
}

// 7-day streak reward ladder (coins). Escalates, day 7 is a big payout.
export const STREAK_REWARDS = [20, 30, 45, 60, 80, 110, 200];
export function streakRewardFor(streak: number): number {
  if (streak <= 0) return STREAK_REWARDS[0];
  return STREAK_REWARDS[(streak - 1) % STREAK_REWARDS.length];
}
// Which rung (0-6) the given streak lands on.
export function streakRung(streak: number): number {
  if (streak <= 0) return 0;
  return (streak - 1) % STREAK_REWARDS.length;
}

interface DailyState {
  streak: number;
  lastDoneKey: string | null;
  loaded: boolean;
  load: () => Promise<void>;
  isDoneToday: () => boolean;
  completeToday: () => void;
}

export const useDailyStore = create<DailyState>((set, get) => {
  const persist = () => {
    const {streak, lastDoneKey} = get();
    AsyncStorage.setItem(KEY, JSON.stringify({streak, lastDoneKey}));
  };
  return {
    streak: 0,
    lastDoneKey: null,
    loaded: false,

    load: async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const p = JSON.parse(raw);
          // Break the streak if a day was skipped.
          let streak = p.streak ?? 0;
          if (p.lastDoneKey && p.lastDoneKey !== todayKey() && p.lastDoneKey !== yesterdayKey()) {
            streak = 0;
          }
          set({streak, lastDoneKey: p.lastDoneKey ?? null, loaded: true});
        } else {
          set({loaded: true});
        }
      } catch {
        set({loaded: true});
      }
    },

    isDoneToday: () => get().lastDoneKey === todayKey(),

    completeToday: () => {
      if (get().isDoneToday()) return;
      const continues = get().lastDoneKey === yesterdayKey();
      set({
        streak: continues ? get().streak + 1 : 1,
        lastDoneKey: todayKey(),
      });
      persist();
    },
  };
});
