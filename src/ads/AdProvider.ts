// Rewarded-ad abstraction. The app depends only on this interface, so swapping
// the StubAdProvider for a real AdMob provider later touches no UI code.
//
// To go live with AdMob:
//   npm i react-native-google-mobile-ads
//   set your app id (AndroidManifest) + rewarded ad unit ids
//   implement AdMobProvider below and register it in ads/adStore.ts.

export interface RewardResult {
  completed: boolean; // true => user watched to the end and earned the reward
}

export interface AdProvider {
  /** Preload (optional for stub). */
  loadRewarded(): void;
  /** Show a rewarded ad; resolves when closed. */
  showRewarded(): Promise<RewardResult>;
}
