import {create} from 'zustand';
import {Vibration} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@echo_settings_v1';

interface SettingsState {
  sound: boolean;
  haptics: boolean;
  colorblind: boolean;
  turbo: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  setSound: (v: boolean) => void;
  setHaptics: (v: boolean) => void;
  setColorblind: (v: boolean) => void;
  setTurbo: (v: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => {
  const persist = () => {
    const {sound, haptics, colorblind, turbo} = get();
    AsyncStorage.setItem(KEY, JSON.stringify({sound, haptics, colorblind, turbo}));
  };
  return {
    sound: true,
    haptics: true,
    colorblind: false,
    turbo: false,
    loaded: false,
    load: async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const p = JSON.parse(raw);
          set({
            sound: p.sound ?? true,
            haptics: p.haptics ?? true,
            colorblind: p.colorblind ?? false,
            turbo: p.turbo ?? false,
            loaded: true,
          });
        } else set({loaded: true});
      } catch { set({loaded: true}); }
    },
    setSound: (v) => { set({sound: v}); persist(); },
    setHaptics: (v) => { set({haptics: v}); persist(); },
    setColorblind: (v) => { set({colorblind: v}); persist(); },
    setTurbo: (v) => { set({turbo: v}); persist(); },
  };
});

// Lightweight haptic helper — respects the user's setting. Uses the built-in
// Vibration API so no native module/rebuild is required.
type Buzz = 'tap' | 'success' | 'error';
const PATTERNS: Record<Buzz, number | number[]> = {
  tap: 12,
  success: [0, 30, 60, 30],
  error: [0, 60, 40, 60],
};

export function haptic(kind: Buzz = 'tap') {
  if (!useSettingsStore.getState().haptics) return;
  try { Vibration.vibrate(PATTERNS[kind]); } catch {}
}
