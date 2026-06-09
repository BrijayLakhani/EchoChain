// Lazy Firebase Analytics forwarder.
//
// This keeps the app building offline: if @react-native-firebase/analytics is
// NOT installed, every call here is a safe no-op. Once you:
//   1. add android/app/google-services.json,
//   2. npm i @react-native-firebase/app @react-native-firebase/analytics,
//   3. apply the com.google.gms.google-services Gradle plugin, and rebuild,
// these calls begin forwarding to real Firebase Analytics automatically.

type FirebaseAnalytics = {
  logEvent: (name: string, params?: Record<string, any>) => Promise<void>;
  logScreenView: (p: {screen_name: string; screen_class?: string}) => Promise<void>;
  setAnalyticsCollectionEnabled: (v: boolean) => Promise<void>;
};

let cached: FirebaseAnalytics | null | undefined;

function fb(): FirebaseAnalytics | null {
  if (cached !== undefined) return cached;
  try {
    // Indirect require so Metro doesn't hard-fail when the module is absent.
    const mod = require('@react-native-firebase/analytics');
    cached = (mod.default ? mod.default() : mod()) as FirebaseAnalytics;
  } catch {
    cached = null; // not installed yet — stay a no-op
  }
  return cached;
}

export const firebaseAdapter = {
  available: () => fb() !== null,
  event: (name: string, params?: Record<string, any>) => { fb()?.logEvent(name, params).catch(() => {}); },
  screen: (name: string) => { fb()?.logScreenView({screen_name: name, screen_class: name}).catch(() => {}); },
  setEnabled: (v: boolean) => { fb()?.setAnalyticsCollectionEnabled(v).catch(() => {}); },
};
