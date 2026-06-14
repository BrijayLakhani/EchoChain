import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {Pastel, FontSize} from '../theme';
import {
  useEconomyStore, HINT_COST, HINT_PACK_COST, REFILL_COST, LIVES_MAX,
  AD_COIN_REWARD, ADS_PER_DAY, DAILY_FREE_COINS,
} from '../store/economyStore';
import AnimatedNumber from '../anim/AnimatedNumber';
import {haptic} from '../store/settingsStore';
import {sfx} from '../audio/sfx';
import {analytics} from '../analytics';
import {showRewardedAd} from '../ads/adStore';
import {isOnline} from '../utils/net';
import {toast} from '../store/toastStore';

type Props = {navigation: NativeStackNavigationProp<RootStackParamList, 'Shop'>};

export default function ShopScreen({navigation}: Props) {
  const coins = useEconomyStore(s => s.coins);
  const lives = useEconomyStore(s => s.lives);
  const hints = useEconomyStore(s => s.hints);

  const spendCoins   = useEconomyStore(s => s.spendCoins);
  const addHints     = useEconomyStore(s => s.addHints);
  const addCoins     = useEconomyStore(s => s.addCoins);
  const refillLives  = useEconomyStore(s => s.refillLives);
  const adsLeft      = useEconomyStore(s => s.adsLeftToday());
  const canWatchAd   = useEconomyStore(s => s.canWatchAd());
  const recordAd     = useEconomyStore(s => s.recordAdWatch);
  const canClaimFree = useEconomyStore(s => s.canClaimDailyCoins());
  const claimFree    = useEconomyStore(s => s.claimDailyCoins);

  React.useEffect(() => { analytics.screen('Shop'); analytics.track('shop_open'); }, []);

  const ok   = () => { haptic('success'); sfx('coin'); };
  const fail = () => haptic('error');

  const buyWithCoins = (cost: number, give: () => void, item: string) => {
    if (spendCoins(cost)) { give(); ok(); analytics.track('shop_purchase', {item, currency: 'coins', cost}); }
    else fail();
  };

  const onDailyFree = () => {
    if (claimFree()) { ok(); analytics.track('daily_free_coins'); } else fail();
  };

  const onWatchAd = async () => {
    if (!canWatchAd) { fail(); return; }
    if (!(await isOnline())) { fail(); toast('No internet — connect to watch ads', 'error'); return; }
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
        <View style={styles.balPill}>
          <Text style={styles.coinDot}>●</Text><AnimatedNumber value={coins} style={styles.balVal} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

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

        <Text style={styles.section}>POWER-UPS</Text>
        <Text style={styles.owned}>You own {hints} hint{hints === 1 ? '' : 's'} · {lives}/{LIVES_MAX} lives</Text>

        <Row emoji="💡" color={Pastel.sun} title="Hint" sub="Reveal one pipe"
          action={`● ${HINT_COST}`}
          disabled={coins < HINT_COST}
          onPress={() => buyWithCoins(HINT_COST, () => addHints(1), 'hint')} />

        <Row emoji="✨" color={Pastel.grape} title="Hint Pack" sub="5 hints · save 20%"
          action={`● ${HINT_PACK_COST}`}
          disabled={coins < HINT_PACK_COST}
          onPress={() => buyWithCoins(HINT_PACK_COST, () => addHints(5), 'hint_pack')} />

        <Row emoji="❤️" color={Pastel.coral} title="Refill Lives" sub={`Fill to ${LIVES_MAX} hearts`}
          action={lives >= LIVES_MAX ? 'FULL' : `● ${REFILL_COST}`}
          disabled={lives >= LIVES_MAX || coins < REFILL_COST}
          onPress={() => buyWithCoins(REFILL_COST, () => refillLives(), 'refill_lives')} />

        <Text style={styles.note}>Watch ads to earn coins — then spend them on hints and lives. More ways to earn coming soon!</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  emoji, color, title, sub, action, disabled, onPress,
}: {
  emoji: string; color: string; title: string; sub: string;
  action: string; disabled?: boolean; onPress: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, {backgroundColor: color + '22'}]}><Text style={styles.icon}>{emoji}</Text></View>
      <View style={{flex: 1}}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSub}>{sub}</Text>
      </View>
      <TouchableOpacity
        style={[styles.actBtn, {backgroundColor: disabled ? Pastel.bgAlt : color}]}
        disabled={disabled} activeOpacity={0.85} onPress={onPress}>
        <Text style={[styles.actTxt, {color: disabled ? Pastel.inkDim : '#fff'}]}>{action}</Text>
      </TouchableOpacity>
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
  balPill: {flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Pastel.card, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999},
  coinDot: {color: Pastel.coin, fontSize: 14},
  balVal: {color: Pastel.ink, fontSize: 14, fontWeight: '800'},

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
  actBtn: {minWidth: 70, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, alignItems: 'center', justifyContent: 'center'},
  actTxt: {fontSize: FontSize.sm, fontWeight: '900'},

  note: {fontSize: FontSize.sm, color: Pastel.inkDim, textAlign: 'center', lineHeight: 19, marginTop: 14, paddingHorizontal: 10},
});
