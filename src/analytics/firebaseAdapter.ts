// Firebase Analytics forwarder (modular API, react-native-firebase v24).
//
// Lazy-loaded so the app still builds/runs if the native module is missing:
// every call is a safe no-op until @react-native-firebase/analytics is linked
// and android/app/google-services.json is present.

type Bound = {
  event: (name: string, params?: Record<string, any>) => void;
  screen: (name: string) => void;
  setEnabled: (v: boolean) => void;
};

let cached: Bound | null | undefined;

function api(): Bound | null {
  if (cached !== undefined) return cached;
  try {
    const a = require('@react-native-firebase/analytics');
    const inst = a.getAnalytics();
    cached = {
      event: (name, params) => { a.logEvent(inst, name, params).catch(() => {}); },
      screen: (name) => { a.logScreenView(inst, {screen_name: name, screen_class: name}).catch(() => {}); },
      setEnabled: (v) => { a.setAnalyticsCollectionEnabled(inst, v).catch(() => {}); },
    };
  } catch {
    cached = null; // not linked yet — stay a no-op
  }
  return cached;
}

export const firebaseAdapter = {
  available: () => api() !== null,
  event: (name: string, params?: Record<string, any>) => api()?.event(name, params),
  screen: (name: string) => api()?.screen(name),
  setEnabled: (v: boolean) => api()?.setEnabled(v),
};
