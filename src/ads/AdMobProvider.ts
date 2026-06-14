import {AdProvider, RewardResult} from './AdProvider';
import {
  RewardedAd, RewardedAdEventType, AdEventType, TestIds,
} from 'react-native-google-mobile-ads';
import {toast} from '../store/toastStore';

// Real AdMob rewarded ads. IMPORTANT: in development we use Google's TEST ad
// unit — clicking your OWN live ads gets the AdMob account banned. The real
// unit id is only used in production (release) builds.
const REAL_REWARDED = 'ca-app-pub-1602636341466055/2327351833';
const UNIT_ID = __DEV__ ? TestIds.REWARDED : REAL_REWARDED;

export class AdMobProvider implements AdProvider {
  loadRewarded() {/* each showRewarded() loads a fresh ad on demand */}

  showRewarded(): Promise<RewardResult> {
    return new Promise<RewardResult>(resolve => {
      let earned = false;
      let settled = false;
      const ad = RewardedAd.createForAdRequest(UNIT_ID, {
        requestNonPersonalizedAdsOnly: false,
      });

      const done = (completed: boolean) => {
        if (settled) return;
        settled = true;
        try { l1(); l2(); l3(); l4(); } catch {}
        resolve({completed});
      };

      const l1 = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
        try { ad.show(); } catch { done(false); }
      });
      const l2 = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => { earned = true; });
      const l3 = ad.addAdEventListener(AdEventType.CLOSED, () => done(earned));
      const l4 = ad.addAdEventListener(AdEventType.ERROR, () => {
        toast('Ad not available right now — try again soon', 'error');
        done(false);
      });

      try { ad.load(); } catch { done(false); }
    });
  }
}
