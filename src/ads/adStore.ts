import {create} from 'zustand';
import {AdProvider, RewardResult} from './AdProvider';
import {AdMobProvider} from './AdMobProvider';

// Real Google AdMob rewarded ads. (The StubAdProvider + countdown modal below
// remain only as an offline/dev fallback and are no longer the default.)
class StubAdProvider implements AdProvider {
  loadRewarded() {/* no-op for stub */}
  showRewarded(): Promise<RewardResult> {
    return useAdStore.getState()._present();
  }
}

export const adProvider: AdProvider = new AdMobProvider();
// To force the simulated ad instead (e.g. no network in dev):
//   export const adProvider: AdProvider = new StubAdProvider();
void StubAdProvider;

interface AdState {
  visible: boolean;
  secondsLeft: number;
  _resolve: ((r: RewardResult) => void) | null;
  // internal — opens modal, returns a promise the modal settles
  _present: () => Promise<RewardResult>;
  // UI hooks
  tick: () => void;
  finish: () => void;   // countdown reached 0 → reward
  dismiss: () => void;  // user closed early → no reward
}

const AD_SECONDS = 5;

export const useAdStore = create<AdState>((set, get) => ({
  visible: false,
  secondsLeft: AD_SECONDS,
  _resolve: null,

  _present: () =>
    new Promise<RewardResult>(resolve => {
      set({visible: true, secondsLeft: AD_SECONDS, _resolve: resolve});
    }),

  tick: () => {
    const s = get().secondsLeft - 1;
    if (s <= 0) get().finish();
    else set({secondsLeft: s});
  },

  finish: () => {
    get()._resolve?.({completed: true});
    set({visible: false, _resolve: null, secondsLeft: AD_SECONDS});
  },

  dismiss: () => {
    get()._resolve?.({completed: false});
    set({visible: false, _resolve: null, secondsLeft: AD_SECONDS});
  },
}));

/** Convenience: show a rewarded ad, resolve true if the user earned it. */
export async function showRewardedAd(): Promise<boolean> {
  const r = await adProvider.showRewarded();
  return r.completed;
}
