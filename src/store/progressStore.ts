import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProgressState {
  // levelId → stars (1–3). Missing key = not completed.
  completed: Record<number, number>;
  // set of unlocked level IDs
  unlocked: number[];
  // load from storage on boot
  load: () => Promise<void>;
  // called when a level is won
  markCompleted: (levelId: number, stars: number) => Promise<void>;
  // unlock a level (called when previous is beaten)
  unlockLevel: (levelId: number) => Promise<void>;
}

const STORAGE_KEY_COMPLETED = '@echo_completed';
const STORAGE_KEY_UNLOCKED  = '@echo_unlocked';

export const useProgressStore = create<ProgressState>((set, get) => ({
  completed: {},
  unlocked: [1],

  load: async () => {
    try {
      const [c, u] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_COMPLETED),
        AsyncStorage.getItem(STORAGE_KEY_UNLOCKED),
      ]);
      set({
        completed: c ? JSON.parse(c) : {},
        unlocked: u ? JSON.parse(u) : [1],
      });
    } catch (_) {
      // ignore — fresh start
    }
  },

  markCompleted: async (levelId, stars) => {
    const prev = get().completed;
    const best = Math.max(prev[levelId] ?? 0, stars);
    const next = {...prev, [levelId]: best};
    set({completed: next});
    await AsyncStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(next));
  },

  unlockLevel: async (levelId) => {
    const prev = get().unlocked;
    if (prev.includes(levelId)) return;
    const next = [...prev, levelId];
    set({unlocked: next});
    await AsyncStorage.setItem(STORAGE_KEY_UNLOCKED, JSON.stringify(next));
  },
}));
