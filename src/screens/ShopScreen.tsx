import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {Pastel, FontSize} from '../theme';
import {
  useEconomyStore, HINT_COST, HINT_PACK_COST, REFILL_COST, LIVES_MAX,
  AD_COIN_REWARD, ADS_PER_DAY, DAILY_FREE_COINS,
  GEMS_PER_REFILL, GEMS_PER_HINT_PACK, GEMS_PER_COIN_BAG, COIN_BAG_AMOUNT,
} from '../store/economyStore';
import {useIapStore, PRODUCTS, Product} from '../store/iapStore';
import {formatPrice} from '../utils/currency';
import AnimatedNumber from '../anim/AnimatedNumber';
import {haptic} from '../store/settingsStore';
import {sfx} from '../audio/sfx';
import {analytics} from '../analytics';
import {showRewardedAd} from '../ads/adStore';

type Props = {navigation: NativeStackNavigationProp<RootStackParamList, 'Shop'>};

export default function ShopScreen({navigation}: Props) {
  const coins = useEconomyStore(s => s.coins);
  const gems  = useEconomyStore(s => s.gems);
  const lives = useEconomyStore(s => s.lives);
  const hints = useEconomyStore(s => s.hints);

  const spendCoins   = useEconomyStore(s => s.spendCoins);
  const spendGems    = useEconomyStore(s => s.spendGems);
  const addHints     = useEconomyStore(s => s.addHints);
  const addCoins     = useEconomyStore(s => s.addCoins);
  const refillLives  = useEconomyStore(s => s.refillLives);
  const adsLeft      = useEconomyStore(s => s.adsLeftToday());
  const canWatchAd   = useEconomyStore(s => s.canWatchAd());
  const recordAd     = useEconomyStore(s => s.recordAdWatch);
  const canClaimFree = useEconomyStore(s => s.canClaimDailyCoins());
  const claimFree    = useEconomyStore(s => s.claimDailyCoins);

  const purchase  = useIapStore(s => s.purchase);
  const restore   = useIapStore(s => s.restore);
  const isOwned   = useIapStore(s => s.isOwned);
  const pending   = useIapStore(s => s.pending);

  React.useEffect(() => { analytics.screen('Shop'); analytics.track('shop_open'); }, []);

  const ok    = () => { haptic('success'); sfx('coin'); };
  const fail  = () => haptic('error');

  // ── coin sinks (spend soft currency) ─────────────────
  const buyWithCoins = (cost: number, give: () => void, item: string) => {
    if (spendCoins(cost)) { give(); ok(); analytics.track('shop_purchase', {item, currency: 'coins', cost}); }
    else fail();
  };
  const buyWithGems = (cost: number, give: () => void, item: string) => {
    if (spendGems(cost)) { give(); ok(); analytics.track('shop_purchase', {item, currency: 'gems', cost}); }
    else fail();
  };

  // ── coin faucets (free / ad, capped) ─────────────────
  const onDailyFree = () => {
    if (claimFree()) { ok(); analytics.track('daily_free_coins'); }
    else fail();
  };
  const onWatchAd = async () => {
    if (!canWatchAd) { fail(); return; }
    analytics.track('ad_started', {placement: 'shop_coins'});
    const earned = await showRewardedAd();
    if (earned) {
      recordAd(); addCoins(AD_COIN_REWARD); ok();
      analytics.track('ad_completed', {placement: 'shop_coins'});
      analytics.track('reward_granted', {type: 'coins', amount: AD_COIN_REWARD});
    } else {
      analytics.track('ad_dismissed', {placement: 'shop_coins'});
    }
  };

  // ── IAP ──────────────────────────────────────────────
  const onBuyProduct = async (p: Product) => {
    haptic('tap');
    const owned = p.oneTime && isOwned(p.id);
    if (owned) return;
    const success = await purchase(p.id);
    if (success) ok(); else fail();
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Pastel.bg} />

      <View style={styles.awning}>
        {[Pastel.coral, Pastel.sun, Pastel.mint, Pastel.sky, Pastel.grape, Pastel.coral, Pastel.sun, Pastel.mint].map((c, i) => (
          <View key={i} style={[styles.stripe, {backgroundColor: c}]} />
        ))}
      </View>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={14}>
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shop</Text>
        <View style={styles.balances}>
          <View style={styles.balPill}><Text style={styles.coinDot}>●</Text><AnimatedNumber value={coins} style={styles.balVal} /></View>
          <View style={styles.balPill}><Text style={styles.gem}>💎</Text><AnimatedNumber value={gems} style={styles.balVal} /></View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Earn coins (free / ad) ─────────────────── */}
        <Text style={styles.section}>EARN COINS</Text>

        <Row emoji="🎁" color={Pastel.mint} title="Daily Free Coins"
          sub={canClaimFree ? `+${DAILY_FREE_COINS} coins · once a day` : 'Come back tomorrow'}
          action={canClaimFree ? 'CLAIM' : 'DONE'}
          disabled={!canClaimFree}
          onPress={onDailyFree} />

        <Row emoji="▶️" color={Pastel.grape} title="Watch an Ad"
          sub={canWatchAd ? `+${AD_COIN_REWARD} coins · ${adsLeft}/${ADS_PER_DAY} left today` : 'Daily limit reached'}
          action={canWatchAd ? 'WATCH' : '0 LEFT'}
          disabled={!canWatchAd}
          onPress={onWatchAd} />

        <Row emoji="💰" color={Pastel.sun} title={`${COIN_BAG_AMOUNT} Coins`}
          sub={`Trade ${GEMS_PER_COIN_BAG} gems for coins`}
          action={`💎 ${GEMS_PER_COIN_BAG}`}
          disabled={gems < GEMS_PER_COIN_BAG}
          onPress={() => buyWithGems(GEMS_PER_COIN_BAG, () => addCoins(COIN_BAG_AMOUNT), 'coin_bag')} />

        {/* ── Power-ups (spend coins, gem alt) ───────── */}
        <Text style={styles.section}>POWER-UPS</Text>
        <Text style={styles.owned}>You own {hints} hint{hints === 1 ? '' : 's'} · {lives}/{LIVES_MAX} lives</Text>

        <Row emoji="💡" color={Pastel.sun} title="Hint" sub="Reveal one pipe"
          action={`● ${HINT_COST}`}
          disabled={coins < HINT_COST}
          onPress={() => buyWithCoins(HINT_COST, () => addHints(1), 'hint')} />

        <Row emoji="✨" color={Pastel.grape} title="Hint Pack" sub="5 hints · save 20%"
          action={`● ${HINT_PACK_COST}`}
          altAction={`💎 ${GEMS_PER_HINT_PACK}`}
          disabled={coins < HINT_PACK_COST}
          altDisabled={gems < GEMS_PER_HINT_PACK}
          onPress={() => buyWithCoins(HINT_PACK_COST, () => addHints(5), 'hint_pack')}
          onAlt={() => buyWithGems(GEMS_PER_HINT_PACK, () => addHints(5), 'hint_pack_gems')} />

        <Row emoji="❤️" color={Pastel.coral} title="Refill Lives" sub={`Fill to ${LIVES_MAX} hearts`}
          action={lives >= LIVES_MAX ? 'FULL' : `● ${REFILL_COST}`}
          altAction={lives >= LIVES_MAX ? undefined : `💎 ${GEMS_PER_REFILL}`}
          disabled={lives >= LIVES_MAX || coins < REFILL_COST}
          altDisabled={lives >= LIVES_MAX || gems < GEMS_PER_REFILL}
          onPress={() => buyWithCoins(REFILL_COST, () => refillLives(), 'refill_lives')}
          onAlt={() => buyWithGems(GEMS_PER_REFILL, () => refillLives(), 'refill_lives_gems')} />

        {/* ── Gems (real-money IAP) ──────────────────── */}
        <Text style={styles.section}>GET GEMS</Text>
        {PRODUCTS.map(p => {
          const owned = p.oneTime && isOwned(p.id);
          const busy = pending === p.id;
          return (
            <TouchableOpacity key={p.id}
              style={[styles.iap, p.highlight && styles.iapHi, owned && {opacity: 0.5}]}
              activeOpacity={0.88}
              disabled={owned || !!pending}
              onPress={() => onBuyProduct(p)}>
              {p.highlight && !owned && <View style={styles.hiBadge}><Text style={styles.hiBadgeTxt}>BEST VALUE</Text></View>}
              <View style={[styles.iapIcon, {backgroundColor: '#ffffff22'}]}><Text style={styles.iapEmoji}>{p.emoji}</Text></View>
              <View style={{flex: 1}}>
                <Text style={[styles.iapTitle, p.highlight && {color: '#fff'}]}>{p.title}</Text>
                <Text style={[styles.iapSub, p.highlight && {color: 'rgba(255,255,255,0.9)'}]}>{p.desc}</Text>
              </View>
              <View style={[styles.priceTag, p.highlight && {backgroundColor: '#fff'}]}>
                {busy
                  ? <ActivityIndicator size="small" color={p.highlight ? Pastel.grape : '#fff'} />
                  : <Text style={[styles.priceTagTxt, p.highlight && {color: Pastel.grape}]}>{owned ? 'OWNED' : formatPrice(p.usd)}</Text>}
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.restore} activeOpacity={0.7} onPress={() => { restore(); haptic('tap'); }}>
          <Text style={styles.restoreTxt}>Restore Purchases</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  emoji, color, title, sub, action, altAction, disabled, altDisabled, onPress, onAlt,
}: {
  emoji: string; color: string; title: string; sub: string;
  action: string; altAction?: string; disabled?: boolean; altDisabled?: boolean;
  onPress: () => void; onAlt?: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, {backgroundColor: color + '22'}]}><Text style={styles.icon}>{emoji}</Text></View>
      <View style={{flex: 1}}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSub}>{sub}</Text>
      </View>
      <View style={{flexDirection: 'row', gap: 6}}>
        {altAction && (
          <TouchableOpacity
            style={[styles.actBtn, {backgroundColor: altDisabled ? Pastel.bgAlt : Pastel.sky}]}
            disabled={altDisabled} activeOpacity={0.85} onPress={onAlt}>
            <Text style={[styles.actTxt, {color: altDisabled ? Pastel.inkDim : '#fff'}]}>{altAction}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actBtn, {backgroundColor: disabled ? Pastel.bgAlt : color}]}
          disabled={disabled} activeOpacity={0.85} onPress={onPress}>
          <Text style={[styles.actTxt, {color: disabled ? Pastel.inkDim : '#fff'}]}>{action}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Pastel.bg},
  awning: {flexDirection: 'row', height: 14},
  stripe: {flex: 1},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 12},
  close: {fontSize: 20, color: Pastel.inkSoft, fontWeight: '700'},
  headerTitle: {fontSize: FontSize.xl, fontWeight: '900', color: Pastel.ink},
  balances: {flexDirection: 'row', gap: 6},
  balPill: {flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Pastel.card, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999},
  coinDot: {color: Pastel.coin, fontSize: 13},
  gem: {fontSize: 12},
  balVal: {color: Pastel.ink, fontSize: 13, fontWeight: '800'},

  scroll: {padding: 16, gap: 10, paddingBottom: 30},
  section: {fontSize: 11, fontWeight: '900', color: Pastel.inkDim, letterSpacing: 1.5, marginTop: 10, marginBottom: 2},
  owned: {color: Pastel.inkSoft, fontSize: FontSize.sm, fontWeight: '600', marginBottom: 2},

  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Pastel.card, borderRadius: 18, padding: 12,
    shadowColor: Pastel.shadow, shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  iconWrap: {width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center'},
  icon: {fontSize: 23},
  cardTitle: {fontSize: FontSize.md, fontWeight: '800', color: Pastel.ink},
  cardSub: {fontSize: FontSize.sm, color: Pastel.inkSoft, marginTop: 1},
  actBtn: {minWidth: 64, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, alignItems: 'center', justifyContent: 'center'},
  actTxt: {fontSize: FontSize.sm, fontWeight: '900'},

  iap: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Pastel.card, borderRadius: 18, padding: 14,
    shadowColor: Pastel.shadow, shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  iapHi: {backgroundColor: Pastel.grape, shadowColor: Pastel.grape, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4},
  hiBadge: {position: 'absolute', top: 8, right: 10, backgroundColor: Pastel.sun, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999},
  hiBadgeTxt: {color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 0.5},
  iapIcon: {width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center'},
  iapEmoji: {fontSize: 24},
  iapTitle: {fontSize: FontSize.md, fontWeight: '800', color: Pastel.ink},
  iapSub: {fontSize: FontSize.sm, color: Pastel.inkSoft, marginTop: 1, maxWidth: 200},
  priceTag: {backgroundColor: Pastel.mint, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9, minWidth: 64, alignItems: 'center'},
  priceTagTxt: {color: '#fff', fontSize: FontSize.sm, fontWeight: '900'},

  restore: {alignItems: 'center', paddingVertical: 14, marginTop: 4},
  restoreTxt: {color: Pastel.inkSoft, fontSize: FontSize.sm, fontWeight: '700', textDecorationLine: 'underline'},
});
