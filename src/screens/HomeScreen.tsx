import React, {useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, StatusBar, Dimensions} from 'react-native';
import Animated, {FadeInDown, FadeIn} from 'react-native-reanimated';
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
import JourneyBackground from '../components/JourneyBackground';
import Mascot from '../components/Mascot';
import Hud from '../components/Hud';
import GameButton from '../anim/GameButton';

type Props = {navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>};

const {width: W, height: H} = Dimensions.get('window');
const LOGO = [Pastel.coral, Pastel.sky, Pastel.mint, Pastel.sun];
const DOT = 38;

export default function HomeScreen({navigation}: Props) {
  const loadProgress = useProgressStore(s => s.load);
  const completed    = useProgressStore(s => s.completed);
  const loadEconomy  = useEconomyStore(s => s.load);
  const loadDaily    = useDailyStore(s => s.load);
  const loadSettings = useSettingsStore(s => s.load);
  const streak       = useDailyStore(s => s.streak);
  const isDoneToday  = useDailyStore(s => s.isDoneToday);
  const avatar       = useProfileStore(s => s.avatar);

  useEffect(() => {
    loadProgress(); loadEconomy(); loadDaily(); loadSettings();
  }, []);

  const nextLevel = LEVELS.find(l => !completed[l.id]);
  const allDone   = !nextLevel;

  const handlePlay = () => {
    haptic('tap');
    if (nextLevel) navigation.navigate('Game', {levelId: nextLevel.id});
    else navigation.navigate('LevelSelect');
  };

  const playDaily = () => {
    haptic('tap');
    navigation.navigate('Game', {levelId: dailyLevelId(), daily: true});
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      {/* Full-bleed illustrated scenery (saga-game style) */}
      <JourneyBackground width={W} height={H + 60} />

      <SafeAreaView style={styles.safe}>
        {/* ── Top HUD ─────────────────────────────────── */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.avatar} activeOpacity={0.85} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.avatarFace}>{avatar}</Text>
          </TouchableOpacity>
          <Hud
            onPressLives={() => navigation.navigate('Shop')}
            onPressCoins={() => navigation.navigate('Shop')}
            onPressGems={() => navigation.navigate('Shop')}
          />
          <View style={{flex: 1}} />
          <TouchableOpacity style={styles.round} activeOpacity={0.85} onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.roundIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* ── Hero: logo panel + mascots ──────────────── */}
        <View style={styles.hero}>
          <Animated.View entering={FadeInDown.springify().damping(15).stiffness(220)} style={styles.logoCard}>
            <View style={styles.dotGrid}>
              {LOGO.map((c, i) => <View key={i} style={[styles.logoDot, {backgroundColor: c}]} />)}
            </View>
            <Text style={styles.title}>Dotwise</Text>
            <Text style={styles.sub}>CONNECT · FILL · SOLVE</Text>
          </Animated.View>

          <View style={styles.mascotLeft} pointerEvents="none">
            <Mascot size={62} color={Pastel.coral} mood="happy" />
          </View>
          <View style={styles.mascotRight} pointerEvents="none">
            <Mascot size={50} color={Pastel.sky} mood="wink" />
          </View>
        </View>

        {/* ── Bottom action stack ─────────────────────── */}
        <Animated.View entering={FadeIn.delay(80).duration(200)} style={styles.actions}>
          {/* Daily challenge banner */}
          <TouchableOpacity style={styles.daily} activeOpacity={0.9} onPress={playDaily}>
            <View style={[styles.dailyIcon, {backgroundColor: isDoneToday() ? Pastel.mint : Pastel.grape}]}>
              <Text style={styles.dailyEmoji}>{isDoneToday() ? '✓' : '★'}</Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.dailyTitle}>Daily Challenge</Text>
              <Text style={styles.dailySub}>
                {isDoneToday() ? 'Done — back tomorrow' : 'Bonus coins today'}
              </Text>
            </View>
            {streak > 0 && (
              <View style={styles.streak}>
                <Text style={styles.streakFire}>🔥</Text>
                <Text style={styles.streakNum}>{streak}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Big 3D play button — Royal Match style */}
          <GameButton
            label={allDone ? 'PLAY AGAIN' : 'PLAY'}
            sub={allDone ? 'ALL CLEAR!' : `LEVEL ${nextLevel!.id}`}
            color={Pastel.mint}
            height={66}
            textSize={22}
            onPress={handlePlay}
          />

          <View style={styles.row}>
            <GameButton
              label="Journey" icon="🗺️" color={Pastel.sky} height={52} textSize={15}
              style={{flex: 1}}
              onPress={() => { haptic('tap'); navigation.navigate('LevelSelect'); }}
            />
            <GameButton
              label="Shop" icon="🛍️" color={Pastel.grape} height={52} textSize={15}
              style={{flex: 1}}
              onPress={() => { haptic('tap'); navigation.navigate('Shop'); }}
            />
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#BCE6F7'},
  safe: {flex: 1, paddingHorizontal: 18},

  topBar: {flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 8},
  avatar: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Pastel.grape, borderWidth: 2, borderColor: '#fff',
    shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3,
  },
  avatarFace: {fontSize: 21},
  round: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(30,30,46,0.55)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)',
  },
  roundIcon: {fontSize: 18},

  hero: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  logoCard: {
    backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: 28,
    paddingHorizontal: 38, paddingVertical: 26, alignItems: 'center',
    shadowColor: '#000', shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.18, shadowRadius: 16, elevation: 8,
  },
  dotGrid: {flexDirection: 'row', flexWrap: 'wrap', width: DOT * 2 + 10, gap: 10, justifyContent: 'center', marginBottom: 14},
  logoDot: {width: DOT, height: DOT, borderRadius: DOT / 2},
  title: {fontSize: 40, fontWeight: '900', color: Pastel.ink, letterSpacing: -1.5},
  sub: {fontSize: 10, color: Pastel.inkDim, letterSpacing: 2.2, fontWeight: '800', marginTop: 4},

  mascotLeft:  {position: 'absolute', left: 2, top: '22%'},
  mascotRight: {position: 'absolute', right: 4, bottom: '18%'},

  actions: {gap: 12, paddingBottom: 18},
  daily: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: 20, padding: 12,
    shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.14, shadowRadius: 8, elevation: 4,
  },
  dailyIcon: {width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center'},
  dailyEmoji: {fontSize: 21, color: '#fff', fontWeight: '800'},
  dailyTitle: {fontSize: FontSize.md, fontWeight: '900', color: Pastel.ink},
  dailySub: {fontSize: FontSize.sm, color: Pastel.inkSoft, marginTop: 1},
  streak: {alignItems: 'center'},
  streakFire: {fontSize: 17},
  streakNum: {fontSize: 12, fontWeight: '900', color: Pastel.coral},

  row: {flexDirection: 'row', gap: 12},
});
