import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppNavigator, {RootStackParamList} from './src/navigation/AppNavigator';
import RewardedAdModal from './src/components/RewardedAdModal';
import Toast from './src/components/Toast';
import ErrorBoundary from './src/components/ErrorBoundary';
import {useConsentStore} from './src/store/consentStore';
import {useProfileStore} from './src/store/profileStore';
import {useIapStore} from './src/store/iapStore';
import {useEconomyStore} from './src/store/economyStore';
import {analytics} from './src/analytics';
import {initSfx} from './src/audio/sfx';
import mobileAds from 'react-native-google-mobile-ads';
import LoadingScreen from './src/components/LoadingScreen';

export default function App() {
  const loadConsent = useConsentStore(s => s.load);
  const loadProfile = useProfileStore(s => s.load);
  const loadEconomy = useEconomyStore(s => s.load);
  const loadIap     = useIapStore(s => s.load);
  const [route, setRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    initSfx();
    // The dev/test phone is registered so the real ad unit serves Google TEST
    // ads to it (always fills, no self-click ban). Only this device is affected;
    // real users get live ads.
    mobileAds()
      .setRequestConfiguration({testDeviceIdentifiers: ['55BEBFCB87410BB1C470D9D82F39CAD6']})
      .catch(() => {})
      .finally(() => { mobileAds().initialize().catch(() => {}); });
    (async () => {
      const minSplash = new Promise<void>(res => setTimeout(() => res(), 300));
      await Promise.all([loadConsent(), loadProfile(), loadEconomy(), loadIap(), minSplash]);
      const accepted = useConsentStore.getState().accepted;
      setRoute(accepted ? 'Home' : 'Consent');
      analytics.track('app_open');
    })();
  }, []);

  if (!route) return <LoadingScreen />; // branded splash while stores hydrate

  return (
    <ErrorBoundary>
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <NavigationContainer>
          <AppNavigator initialRoute={route} />
        </NavigationContainer>
        <RewardedAdModal />
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
