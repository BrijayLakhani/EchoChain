import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, StatusBar, Modal, BackHandler} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/AppNavigator';
import {LEVELS} from '../engine/levels';
import {useGameStore} from '../store/gameStore';
import {useProgressStore} from '../store/progressStore';
import {useEconomyStore, COINS_PER_STAR, DAILY_REWARD, LIVES_MAX} from '../store/economyStore';
import {useDailyStore, streakRewardFor} from '../store/dailyStore';
import {eventMultiplier} from '../store/eventsStore';
import {haptic} from '../store/settingsStore';
import {sfx} from '../audio/sfx';
import {analytics} from '../analytics';
import {showRewardedAd} from '../ads/adStore';
import {calcStars} from '../engine/flowEngine';
import FlowGrid from '../components/FlowGrid';
import WinOverlay from '../components/WinOverlay';
import PreLevelModal from '../components/PreLevelModal';
import PauseOverlay from '../components/PauseOverlay';
import ConfirmDialog from '../components/ConfirmDialog';
import {Pastel, FontSize, FlowColors} from '../theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Game'>;
  route: RouteProp<RootStackParamList, 'Game'>;
};

const ACCENT = [FlowColors.G, FlowColors.B, FlowColors.O, FlowColors.P, FlowColors.R];

export default function GameScreen({navigation, route}: Props) {
  const {levelId: routeLevelId, daily} = route.params;
  // Active level lives in state so "Next Level" loads in-place (no screen
  // navigation → no journey flash / double-modal flicker between puzzles).
  const [levelId, setLevelId] = useState(routeLevelId);
  const level = LEVELS.find(l => l.id === levelId)!;
  const accent = ACCENT[(levelId - 1) % ACCENT.length];
  const cells = level.gridSize * level.gridSize;
  const par3 = Math.ceil(cells * 1.2);
  const par2 = Math.ceil(cells * 2.2);

  const paths        = useGameStore(s => s.paths);
  const activeKey    = useGameStore(s => s.activeKey);
  const moves        = useGameStore(s => s.moves);
  const isWon        = useGameStore(s => s.isWon);
  const startLevel   = useGameStore(s => s.startLevel);
  const startDraw    = useGameStore(s => s.startDraw);
  const continueDraw = useGameStore(s => s.continueDraw);
  const endDraw      = useGameStore(s => s.endDraw);
  const resetLevel   = useGameStore(s => s.resetLevel);
  const applyHint    = useGameStore(s => s.applyHint);

  const {markCompleted, unlockLevel} = useProgressStore();
  const bestStars   = useProgressStore(s => s.completed[levelId] ?? 0);
  const hints       = useEconomyStore(s => s.hints);
  const spendLife   = useEconomyStore(s => s.spendLife);
  const addLife     = useEconomyStore(s => s.addLife);
  const addCoins    = useEconomyStore(s => s.addCoins);
  const addHints    = useEconomyStore(s => s.addHints);
  const useHintItem = useEconomyStore(s => s.useHint);
  const canWatchAd  = useEconomyStore(s => s.canWatchAd);
  const recordAd    = useEconomyStore(s => s.recordAdWatch);
  const completeDaily = useDailyStore(s => s.completeToday);
  const dailyDone     = useDailyStore(s => s.isDoneToday);

  const [started, setStarted]   = useState(false);   // false → pre-level briefing
  const [paused, setPaused]     = useState(false);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const [gated, setGated]   = useState(false);
  const [reward, setReward] = useState(0);
  const chargedRef = useRef(false);

  // Reset board + briefing whenever level changes.
  useEffect(() => {
    startLevel(level);
    chargedRef.current = false;
    setStarted(false);
    setPaused(false);
    setConfirmQuit(false);
    setGated(false);
    setReward(0);
    analytics.screen(daily ? 'DailyGame' : 'Game');
  }, [levelId]);

  // Begin play — charge a life (non-daily), refunded on win.
  const beginLevel = () => {
    if (!daily) {
      if (spendLife()) chargedRef.current = true;
      else { setGated(true); analytics.track('out_of_lives', {levelId}); }
    }
    setStarted(true);
    analytics.track('level_start', {levelId, daily: !!daily});
  };

  useEffect(() => {
    if (!isWon) return;
    haptic('success');
    const stars = calcStars(moves, level.gridSize);
    const firstClear = useProgressStore.getState().completed[levelId] === undefined;
    markCompleted(levelId, stars);
    const next = LEVELS.find(l => l.id === levelId + 1);
    if (next) unlockLevel(next.id);

    if (chargedRef.current) addLife();   // winning is free — refund the life

    let coins = 0;
    if (firstClear) coins += stars * COINS_PER_STAR;
    if (daily && !dailyDone()) {
      completeDaily();
      const newStreak = useDailyStore.getState().streak;
      coins += DAILY_REWARD + streakRewardFor(newStreak);   // streak ladder bonus
    }
    coins = Math.round(coins * eventMultiplier());           // event multiplier
    if (coins > 0) { addCoins(coins); setTimeout(() => sfx('coin'), 650); }
    setReward(coins);
    analytics.track('level_win', {levelId, daily: !!daily, stars, moves, coins});
  }, [isWon]);

  // Hardware back — respect the same flow as the on-screen back button.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isWon) return false;
      if (paused) { setPaused(false); return true; }
      if (!started) { navigation.goBack(); return true; }
      requestExit();
      return true;
    });
    return () => sub.remove();
  }, [isWon, paused, started]);

  const requestExit = () => {
    if (chargedRef.current) setConfirmQuit(true);   // warn: life already spent
    else doExit();
  };
  const doExit = () => {
    setConfirmQuit(false);
    navigation.goBack();
  };

  const handleDragStart = useCallback((r: number, c: number) => startDraw(r, c),    [startDraw]);
  const handleDragMove  = useCallback((r: number, c: number) => continueDraw(r, c), [continueDraw]);
  const handleDragEnd   = useCallback(() => endDraw(), [endDraw]);

  const onHint = async () => {
    if (isWon) return;
    if (useHintItem()) {
      applyHint(); haptic('tap');
      analytics.track('hint_used', {levelId, source: 'owned'});
      return;
    }
    analytics.track('out_of_hints', {levelId});
    haptic('error');
    // Out of hints → offer a rewarded ad, but only if the daily ad cap allows.
    if (!canWatchAd()) { navigation.navigate('Shop'); return; }
    analytics.track('ad_started', {placement: 'hint'});
    const earned = await showRewardedAd();
    if (earned) {
      recordAd();                                    // count against daily cap
      analytics.track('ad_completed', {placement: 'hint'});
      addHints(1);
      if (useHintItem()) {
        applyHint(); haptic('tap');
        analytics.track('reward_granted', {type: 'hint'});
        analytics.track('hint_used', {levelId, source: 'ad'});
      }
    } else {
      analytics.track('ad_dismissed', {placement: 'hint'});
      navigation.navigate('Shop');
    }
  };

  const nextLevel = LEVELS.find(l => l.id === levelId + 1);

  const connected = level.dots.filter(dot => {
    const p = paths[dot.key] || [];
    if (p.length < 2) return false;
    const f = p[0], la = p[p.length - 1];
    return (f[0]===dot.from[0]&&f[1]===dot.from[1]&&la[0]===dot.to[0]&&la[1]===dot.to[1]) ||
           (f[0]===dot.to[0] &&f[1]===dot.to[1] &&la[0]===dot.from[0]&&la[1]===dot.from[1]);
  }).length;
  const pct = level.dots.length > 0 ? connected / level.dots.length : 0;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Pastel.bg} />

      {/* ── Top bar ──────────────────────────────────── */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => { haptic('tap'); requestExit(); }} hitSlop={16} style={styles.iconBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.titleBlock}>
          <Text style={[styles.levelLabel, {color: accent}]}>{daily ? 'DAILY CHALLENGE' : `LEVEL ${level.id}`}</Text>
          <Text style={styles.levelName}>{level.title}</Text>
        </View>
        <TouchableOpacity onPress={() => { haptic('tap'); setPaused(true); }} hitSlop={16} style={styles.iconBtn}>
          <Text style={styles.pauseIcon}>⏸</Text>
        </TouchableOpacity>
      </View>

      {/* ── HUD chips + progress ─────────────────────── */}
      <View style={styles.progressSection}>
        <View style={styles.track}>
          <View style={[styles.fill, {width: `${pct * 100}%` as any, backgroundColor: accent}]} />
        </View>
        <View style={styles.metaRow}>
          <View style={styles.chip}>
            <Text style={styles.chipIcon}>🔗</Text>
            <Text style={styles.chipTxt}>{connected}/{level.dots.length}</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipIcon}>👣</Text>
            <Text style={styles.chipTxt}>{moves}</Text>
          </View>
        </View>
      </View>

      {/* ── Framed board ─────────────────────────────── */}
      <View style={styles.gridArea}>
        <View style={[styles.boardFrame, {borderColor: accent + '33'}]}>
          <FlowGrid
            level={level}
            paths={paths}
            activeKey={activeKey}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
          />
        </View>
      </View>

      {/* ── Hint button ──────────────────────────────── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.hintBtn} activeOpacity={0.85} onPress={onHint}>
          <Text style={styles.hintEmoji}>💡</Text>
          <Text style={styles.hintTxt}>Hint</Text>
          <View style={styles.hintBadge}>
            <Text style={styles.hintBadgeTxt}>{hints > 0 ? hints : '+'}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* ── Pre-level briefing ───────────────────────── */}
      <PreLevelModal
        visible={!started && !gated}
        daily={!!daily}
        levelId={level.id}
        title={level.title}
        pipes={level.dots.length}
        gridSize={level.gridSize}
        par3={par3}
        par2={par2}
        bestStars={bestStars}
        hints={hints}
        accent={accent}
        onPlay={beginLevel}
        onClose={() => navigation.goBack()}
      />

      {/* ── Pause menu ───────────────────────────────── */}
      <PauseOverlay
        visible={paused}
        onResume={() => setPaused(false)}
        onRestart={() => { setPaused(false); resetLevel(); }}
        onExit={() => { setPaused(false); navigation.goBack(); }}
      />

      {/* ── Quit confirm (costs a life) ──────────────── */}
      <ConfirmDialog
        visible={confirmQuit}
        title="Are you sure?"
        message="You'll lose a life if you leave now."
        confirmLabel="Exit to Map"
        onConfirm={doExit}
        onCancel={() => setConfirmQuit(false)}
      />

      <WinOverlay
        visible={isWon}
        levelId={level.id}
        levelTitle={level.title}
        moves={moves}
        gridSize={level.gridSize}
        rewardCoins={reward}
        onNext={(!daily && nextLevel) ? () => setLevelId(nextLevel.id) : null}
        onReplay={() => { resetLevel(); }}
        onMenu={() => navigation.reset(daily
          ? {index: 0, routes: [{name: 'Home'}]}
          : {index: 1, routes: [{name: 'Home'}, {name: 'LevelSelect'}]})}
      />

      {/* ── Out-of-lives gate ────────────────────────── */}
      <Modal visible={gated} transparent animationType="fade" onRequestClose={() => navigation.goBack()}>
        <View style={styles.gateBackdrop}>
          <View style={styles.gateCard}>
            <Text style={styles.gateHeart}>💔</Text>
            <Text style={styles.gateTitle}>Out of lives</Text>
            <Text style={styles.gateSub}>Wait for a life to refill, or grab more in the shop.</Text>
            <TouchableOpacity
              style={[styles.gateBtn, {backgroundColor: Pastel.mint}]}
              activeOpacity={0.88}
              onPress={() => { navigation.goBack(); navigation.navigate('Shop'); }}>
              <Text style={styles.gateBtnTxt}>Go to Shop</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gateGhost} activeOpacity={0.8} onPress={() => navigation.goBack()}>
              <Text style={styles.gateGhostTxt}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Pastel.bg},

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 4, paddingBottom: 6,
  },
  iconBtn: {padding: 6, minWidth: 40, alignItems: 'center'},
  backArrow: {fontSize: 32, color: Pastel.ink, fontWeight: '300', lineHeight: 36},
  pauseIcon: {fontSize: 20, color: Pastel.inkSoft, lineHeight: 28},
  titleBlock: {alignItems: 'center'},
  levelLabel: {fontSize: FontSize.xs, fontWeight: '900', color: Pastel.inkDim, letterSpacing: 2, marginBottom: 2},
  levelName: {fontSize: FontSize.lg, fontWeight: '800', color: Pastel.ink},

  progressSection: {paddingHorizontal: 20, paddingBottom: 10, gap: 8},
  track: {height: 6, backgroundColor: Pastel.bgAlt, borderRadius: 3, overflow: 'hidden'},
  fill: {height: '100%', borderRadius: 3},
  metaRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Pastel.card, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5,
    shadowColor: Pastel.shadow, shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  chipIcon: {fontSize: 12},
  chipTxt: {fontSize: FontSize.sm, fontWeight: '900', color: Pastel.ink},

  gridArea: {flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12},
  boardFrame: {
    backgroundColor: Pastel.card, borderRadius: 24, padding: 10, borderWidth: 3,
    shadowColor: Pastel.shadow, shadowOffset: {width: 0, height: 6}, shadowOpacity: 0.12, shadowRadius: 14, elevation: 5,
  },

  bottomBar: {alignItems: 'center', paddingBottom: 18, paddingTop: 4},
  hintBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Pastel.card, paddingHorizontal: 22, paddingVertical: 13, borderRadius: 999,
    shadowColor: Pastel.shadow, shadowOffset: {width: 0, height: 3}, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  hintEmoji: {fontSize: 18},
  hintTxt: {fontSize: FontSize.md, fontWeight: '800', color: Pastel.ink},
  hintBadge: {
    minWidth: 22, height: 22, borderRadius: 11, backgroundColor: Pastel.sun,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  hintBadgeTxt: {fontSize: 12, fontWeight: '900', color: '#fff'},

  gateBackdrop: {flex: 1, backgroundColor: 'rgba(46,42,58,0.55)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30},
  gateCard: {width: '100%', backgroundColor: Pastel.bg, borderRadius: 26, padding: 28, alignItems: 'center'},
  gateHeart: {fontSize: 44, marginBottom: 8},
  gateTitle: {fontSize: FontSize.xl, fontWeight: '900', color: Pastel.ink, marginBottom: 6},
  gateSub: {fontSize: FontSize.sm, color: Pastel.inkSoft, textAlign: 'center', marginBottom: 22, lineHeight: 20},
  gateBtn: {width: '100%', paddingVertical: 15, borderRadius: 16, alignItems: 'center'},
  gateBtnTxt: {fontSize: FontSize.md, fontWeight: '800', color: '#fff'},
  gateGhost: {paddingVertical: 12},
  gateGhostTxt: {fontSize: FontSize.sm, color: Pastel.inkSoft, fontWeight: '600'},
});
