import React, {useEffect, useRef} from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {useProgressStore} from '../store/progressStore';
import {useEconomyStore} from '../store/economyStore';
import {useDailyStore, dailyLevelId} from '../store/dailyStore';
import {useSettingsStore, haptic} from '../store/settingsStore';
import {useProfileStore} from '../store/profileStore';
import {LEVELS} from '../engine/levels';
import {Pastel, FontSize} from '../theme';
import ResourceBar from '../components/ResourceBar';
import PressableScale from '../anim/PressableScale';
import BlobBackground from '../components/BlobBackground';
import Mascot from '../components/Mascot';

type Props = {navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>};

const LOGO = [Pastel.coral, Pastel.sky, Pastel.mint, Pastel.sun];
const DOT_SIZE = 52;
const DOT_GAP  = 12;

export default function HomeScreen({navigation}: Props) {
  const loadProgress = useProgressStore(s => s.load);
  const completed    = useProgressStore(s => s.completed);
  const loadEconomy  = useEconomyStore(s => s.load);
  const loadDaily    = useDailyStore(s => s.load);
  const loadSettings = useSettingsStore(s => s.load);
  const streak       = useDailyStore(s => s.streak);
  const isDoneToday  = useDailyStore(s => s.isDoneToday);

  const fade   = useRef(new Animated.Value(0)).current;
  const scale  = useRef(new Animated.Value(0.86)).current;
  const slideY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    loadProgress(); loadEconomy(); loadDaily(); loadSettings();
    Animated.parallel([
      Animated.timing(fade,   {toValue: 1, duration: 480, useNativeDriver: true}),
      Animated.spring(scale,  {toValue: 1, useNativeDriver: true, speed: 13, bounciness: 9}),
      Animated.timing(slideY, {toValue: 0, duration: 460, useNativeDriver: true}),
    ]).start();
  }, []);

  const totalSolved = Object.keys(completed).length;
  const playLabel =
    totalSolved === 0            ? 'Play'
    : totalSolved === LEVELS.length ? 'Play Again'
    : 'Continue';

  const handlePlay = () => {
    haptic('tap');
    const firstUnsolved = LEVELS.find(l => !completed[l.id]);
    if (firstUnsolved) navigation.navigate('Game', {levelId: firstUnsolved.id});
    else navigation.navigate('LevelSelect');
  };

  const playDaily = () => {
    haptic('tap');
    navigation.navigate('Game', {levelId: dailyLevelId(), daily: true});
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Pastel.bg} />
      <BlobBackground />

      {/* ── Top bar: avatar + resources + settings ────── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.avatar} activeOpacity={0.85} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.avatarFace}>{useProfileStore(s => s.avatar)}</Text>
        </TouchableOpacity>
        <ResourceBar
          onPressLives={() => navigation.navigate('Shop')}
          onPressCoins={() => navigation.navigate('Shop')}
        />
        <View style={{flex: 1}} />
        <TouchableOpacity style={styles.gear} activeOpacity={0.8} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.gearIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.inner, {opacity: fade, transform: [{translateY: slideY}]}]}>

        {/* ── Hero ─────────────────────────────────────── */}
        <View style={styles.hero}>
          <Animated.View style={[styles.dotGrid, {transform: [{scale}]}]}>
            {LOGO.map((c, i) => <View key={i} style={[styles.logoDot, {backgroundColor: c}]} />)}
          </Animated.View>
          <Text style={styles.title}>FLOW</Text>
          <Text style={styles.sub}>CONNECT · FILL · SOLVE</Text>

          {/* Friendly host mascots peeking by the logo */}
          <View style={styles.mascotLeft} pointerEvents="none">
            <Mascot size={56} color={Pastel.coral} mood="happy" />
          </View>
          <View style={styles.mascotRight} pointerEvents="none">
            <Mascot size={46} color={Pastel.sky} mood="wink" />
          </View>
        </View>

        {/* ── Daily challenge card ─────────────────────── */}
        <TouchableOpacity style={styles.daily} activeOpacity={0.9} onPress={playDaily}>
          <View style={[styles.dailyIcon, {backgroundColor: isDoneToday() ? Pastel.mint : Pastel.grape}]}>
            <Text style={styles.dailyEmoji}>{isDoneToday() ? '✓' : '★'}</Text>
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.dailyTitle}>Daily Challenge</Text>
            <Text style={styles.dailySub}>
              {isDoneToday() ? 'Done today — come back tomorrow' : 'Solve today’s puzzle for coins'}
            </Text>
          </View>
          {streak > 0 && (
            <View style={styles.streak}>
              <Text style={styles.streakFire}>🔥</Text>
              <Text style={styles.streakNum}>{streak}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* ── Buttons ──────────────────────────────────── */}
        <View style={styles.actions}>
          <PressableScale style={styles.playBtn} onPress={handlePlay}>
            <Text style={styles.playTxt}>{playLabel}</Text>
          </PressableScale>

          <View style={styles.secondaryRow}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              activeOpacity={0.85}
              onPress={() => { haptic('tap'); navigation.navigate('LevelSelect'); }}>
              <Text style={styles.secondaryEmoji}>🗺️</Text>
              <Text style={styles.secondaryTxt}>Levels</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryBtn}
              activeOpacity={0.85}
              onPress={() => { haptic('tap'); navigation.navigate('Shop'); }}>
              <Text style={styles.secondaryEmoji}>🛍️</Text>
              <Text style={styles.secondaryTxt}>Shop</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Pastel.bg},

  topBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 18, paddingTop: 6, paddingBottom: 2,
  },
  avatar: {
    width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Pastel.grape,
    shadowColor: Pastel.shadow, shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.12, shadowRadius: 4, elevation: 2,
  },
  avatarFace: {fontSize: 20},
  gear: {
    width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Pastel.card,
    shadowColor: Pastel.shadow, shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.07, shadowRadius: 4, elevation: 2,
  },
  gearIcon: {fontSize: 18, color: Pastel.inkSoft},

  inner: {flex: 1, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 22},

  hero: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  mascotLeft:  {position: 'absolute', left: -6, top: '34%'},
  mascotRight: {position: 'absolute', right: 0, top: '46%'},
  dotGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    width: DOT_SIZE * 2 + DOT_GAP, gap: DOT_GAP, justifyContent: 'center', marginBottom: 26,
  },
  logoDot: {width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2},

  title: {fontSize: 66, fontWeight: '900', color: Pastel.ink, letterSpacing: -3, marginBottom: 8},
  sub: {fontSize: 12, color: Pastel.inkDim, letterSpacing: 2.4, fontWeight: '700', marginBottom: 24},

  progressTrack: {width: 200, height: 8, borderRadius: 4, backgroundColor: Pastel.bgAlt, overflow: 'hidden'},
  progressFill: {height: '100%', borderRadius: 4, backgroundColor: Pastel.mint},
  progressTxt: {fontSize: 12, color: Pastel.inkSoft, fontWeight: '700', marginTop: 8},

  daily: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Pastel.card, borderRadius: 22, padding: 14, marginBottom: 16,
    shadowColor: Pastel.shadow, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3,
  },
  dailyIcon: {width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center'},
  dailyEmoji: {fontSize: 24, color: '#fff', fontWeight: '800'},
  dailyTitle: {fontSize: FontSize.md, fontWeight: '800', color: Pastel.ink},
  dailySub: {fontSize: FontSize.sm, color: Pastel.inkSoft, marginTop: 2},
  streak: {alignItems: 'center'},
  streakFire: {fontSize: 18},
  streakNum: {fontSize: 13, fontWeight: '900', color: Pastel.coral},

  actions: {gap: 12},
  playBtn: {
    backgroundColor: Pastel.mint, paddingVertical: 18, borderRadius: 18, alignItems: 'center',
    shadowColor: Pastel.mint, shadowOffset: {width: 0, height: 6}, shadowOpacity: 0.4, shadowRadius: 14, elevation: 6,
  },
  playTxt: {fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: 0.3},
  secondaryRow: {flexDirection: 'row', gap: 12},
  secondaryBtn: {
    flex: 1, flexDirection: 'row', gap: 8, backgroundColor: Pastel.card,
    paddingVertical: 15, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    shadowColor: Pastel.shadow, shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.07, shadowRadius: 5, elevation: 2,
  },
  secondaryEmoji: {fontSize: 17},
  secondaryTxt: {fontSize: FontSize.md, fontWeight: '800', color: Pastel.ink},
});
