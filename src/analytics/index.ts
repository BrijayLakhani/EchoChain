// Provider-agnostic analytics facade.
//
// The whole app calls only `track()` and `screen()`. Forwarding is gated by the
// user's consent (consentStore.analyticsEnabled). Today it fans out to the
// Firebase adapter (lazy) and a dev console logger; add more adapters here
// (Amplitude, PostHog, …) without touching call sites.

import {firebaseAdapter} from './firebaseAdapter';
import {useConsentStore} from '../store/consentStore';

export type EventName =
  | 'app_open'
  | 'consent_set'
  | 'level_start'
  | 'level_win'
  | 'level_reset'
  | 'hint_used'
  | 'out_of_hints'
  | 'out_of_lives'
  | 'ad_started'
  | 'ad_completed'
  | 'ad_dismissed'
  | 'reward_granted'
  | 'shop_open'
  | 'shop_purchase'
  | 'daily_open'
  | 'daily_complete'
  | 'daily_free_coins'
  | 'iap_start'
  | 'iap_complete'
  | 'iap_restore';

function enabled(): boolean {
  // Default-allow before the store has loaded would risk pre-consent tracking,
  // so require an explicit opt-in flag.
  return useConsentStore.getState().analyticsEnabled === true &&
         useConsentStore.getState().accepted === true;
}

export const analytics = {
  track(event: EventName, props: Record<string, any> = {}) {
    if (__DEV__) console.log('[analytics]', event, props);
    if (!enabled()) return;
    firebaseAdapter.event(event, props);
  },

  screen(name: string) {
    if (__DEV__) console.log('[analytics] screen', name);
    if (!enabled()) return;
    firebaseAdapter.screen(name);
  },

  // Call when the user changes their analytics preference.
  setEnabled(v: boolean) {
    firebaseAdapter.setEnabled(v);
  },
};
