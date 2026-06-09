import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEconomyStore} from './economyStore';
import {analytics} from '../analytics';

// ── In-app purchase catalog ─────────────────────────────────────
// Hard currency (gems) + consumables + the non-consumable "remove ads".
// Grants are applied client-side here; a real build swaps `purchase()` for
// react-native-iap with server/receipt validation (see TODO below).

export type Product = {
  id: string;
  title: string;
  desc: string;
  usd: number;              // base price; displayed in the user's local currency
  emoji: string;
  kind: 'gems' | 'bundle' | 'noads';
  grantGems?: number;
  grantCoins?: number;
  grantHints?: number;
  refill?: boolean;
  highlight?: boolean;      // featured / best value
  oneTime?: boolean;        // non-consumable (remove ads, starter)
};

export const PRODUCTS: Product[] = [
  {id: 'gems_small',  title: 'Pouch of Gems',  desc: '50 gems',  usd: 0.99, emoji: '💎', kind: 'gems', grantGems: 50},
  {id: 'gems_medium', title: 'Sack of Gems',   desc: '160 gems · +10% bonus', usd: 2.99, emoji: '💎', kind: 'gems', grantGems: 160, highlight: true},
  {id: 'gems_large',  title: 'Chest of Gems',  desc: '600 gems · +20% bonus', usd: 9.99, emoji: '💎', kind: 'gems', grantGems: 600},
  {id: 'starter',     title: 'Starter Bundle', desc: '120 gems · 500 coins · 10 hints · full lives',
    usd: 1.99, emoji: '🎒', kind: 'bundle', grantGems: 120, grantCoins: 500, grantHints: 10, refill: true, highlight: true, oneTime: true},
  {id: 'noads',       title: 'Remove Ads',     desc: 'Hide banners forever · keep rewarded ads',
    usd: 2.99, emoji: '🚫', kind: 'noads', oneTime: true},
];

const KEY = '@echo_iap_v1';

interface IapState {
  owned: string[];          // ids of owned one-time products
  removeAds: boolean;
  pending: string | null;   // product id currently purchasing
  loaded: boolean;
  load: () => Promise<void>;
  isOwned: (id: string) => boolean;
  purchase: (id: string) => Promise<boolean>;
  restore: () => Promise<void>;
}

export const useIapStore = create<IapState>((set, get) => {
  const persist = () => {
    const {owned, removeAds} = get();
    AsyncStorage.setItem(KEY, JSON.stringify({owned, removeAds}));
  };

  return {
    owned: [],
    removeAds: false,
    pending: null,
    loaded: false,

    load: async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) { const p = JSON.parse(raw); set({owned: p.owned ?? [], removeAds: p.removeAds ?? false, loaded: true}); }
        else set({loaded: true});
      } catch { set({loaded: true}); }
    },

    isOwned: (id) => get().owned.includes(id),

    // TODO(real IAP): replace this stub body with react-native-iap:
    //   requestPurchase({sku:id}) → finishTransaction → validate receipt →
    //   then apply grants. Keep the same grant logic below.
    purchase: async (id) => {
      const p = PRODUCTS.find(x => x.id === id);
      if (!p) return false;
      if (p.oneTime && get().isOwned(id)) return false;   // already owned
      set({pending: id});
      analytics.track('iap_start', {product: id, usd: p.usd});

      // Simulate the store sheet round-trip.
      await new Promise<void>(r => setTimeout(() => r(), 600));

      const eco = useEconomyStore.getState();
      if (p.grantGems)  eco.addGems(p.grantGems);
      if (p.grantCoins) eco.addCoins(p.grantCoins);
      if (p.grantHints) eco.addHints(p.grantHints);
      if (p.refill)     eco.refillLives();
      if (p.kind === 'noads') set({removeAds: true});
      if (p.oneTime)    set({owned: [...get().owned, id]});

      set({pending: null});
      persist();
      analytics.track('iap_complete', {product: id, usd: p.usd});
      return true;
    },

    // TODO(real IAP): react-native-iap getAvailablePurchases() → re-grant
    // non-consumables (noads, starter). Consumables are not restorable.
    restore: async () => {
      analytics.track('iap_restore');
      // stub: nothing to restore in the simulated build
      await new Promise<void>(r => setTimeout(() => r(), 300));
    },
  };
});
