import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@echo_consent_v1';

interface ConsentState {
  accepted: boolean;          // accepted Privacy Policy + Terms
  analyticsEnabled: boolean;  // opt-in for anonymous analytics
  loaded: boolean;
  load: () => Promise<void>;
  accept: (analyticsEnabled: boolean) => void;
  setAnalytics: (v: boolean) => void;
}

export const useConsentStore = create<ConsentState>((set, get) => {
  const persist = () => {
    const {accepted, analyticsEnabled} = get();
    AsyncStorage.setItem(KEY, JSON.stringify({accepted, analyticsEnabled}));
  };
  return {
    accepted: false,
    analyticsEnabled: true,
    loaded: false,
    load: async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const p = JSON.parse(raw);
          set({accepted: !!p.accepted, analyticsEnabled: p.analyticsEnabled !== false, loaded: true});
        } else {
          set({loaded: true});
        }
      } catch {
        set({loaded: true});
      }
    },
    accept: (analyticsEnabled) => { set({accepted: true, analyticsEnabled}); persist(); },
    setAnalytics: (v) => { set({analyticsEnabled: v}); persist(); },
  };
});
