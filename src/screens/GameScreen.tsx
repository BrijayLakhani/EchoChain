import React, {useCallback, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/AppNavigator';
import {LEVELS} from '../engine/levels';
import {useGameStore} from '../store/gameStore';
import {useProgressStore} from '../store/progressStore';
import FlowGrid from '../components/FlowGrid';
import WinOverlay from '../components/WinOverlay';
import {Colors, Spacing, Radii, FontSize} from '../theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Game'>;
  route: RouteProp<RootStackParamList, 'Game'>;
};

const DIFF_COLOR: Record<string, string> = {
  easy:   '#4CAF7D',
  medium: '#E8B84B',
  hard:   '#E8772E',
  expert: '#D94F3D',
};

export default function GameScreen({navigation, route}: Props) {
  const {levelId} = route.params;
  const level = LEVELS.find(l => l.id === levelId)!;

  const paths       = useGameStore(s => s.paths);
  const activeKey   = useGameStore(s => s.activeKey);
  const moves       = useGameStore(s => s.moves);
  const isWon       = useGameStore(s => s.isWon);
  const startLevel  = useGameStore(s => s.startLevel);
  const startDraw   = useGameStore(s => s.startDraw);
  const continueDraw= useGameStore(s => s.continueDraw);
  const endDraw     = useGameStore(s => s.endDraw);
  const resetLevel  = useGameStore(s => s.resetLevel);

  const {markCompleted, unlockLevel} = useProgressStore();

  useEffect(() => {
    startLevel(level);
  }, [levelId]);

  useEffect(() => {
    if (isWon) {
      markCompleted(levelId, 3);
      const next = LEVELS.find(l => l.id === levelId + 1);
      if (next) unlockLevel(next.id);
    }
  }, [isWon]);

  const handleDragStart = useCallback((row: number, col: number) => {
    startDraw(row, col);
  }, [startDraw]);

  const handleDragMove = useCallback((row: number, col: number) => {
    continueDraw(row, col);
  }, [continueDraw]);

  const handleDragEnd = useCallback(() => {
    endDraw();
  }, [endDraw]);

  const nextLevel = LEVELS.find(l => l.id === levelId + 1);
  const diffColor = DIFF_COLOR[level.difficulty] ?? Colors.textDim;
  const diffLabel = level.difficulty.charAt(0).toUpperCase() + level.difficulty.slice(1);

  // Count connected pairs
  const connected = level.dots.filter(dot => {
    const p = paths[dot.key] || [];
    if (p.length < 2) return false;
    const f = p[0], l = p[p.length-1];
    return (f[0]===dot.from[0]&&f[1]===dot.from[1]&&l[0]===dot.to[0]&&l[1]===dot.to[1]) ||
           (f[0]===dot.to[0]  &&f[1]===dot.to[1]  &&l[0]===dot.from[0]&&l[1]===dot.from[1]);
  }).length;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={16} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.levelTitle}>{level.title}</Text>
          <View style={[styles.diffPill, {backgroundColor: diffColor + '22'}]}>
            <Text style={[styles.diffText, {color: diffColor}]}>{diffLabel}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={resetLevel} hitSlop={16} style={styles.resetBtn}>
          <Text style={styles.resetText}>↺</Text>
        </TouchableOpacity>
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statLabel}>
          <Text style={styles.statNum}>{connected}</Text>/{level.dots.length} connected
        </Text>
        <Text style={styles.statLabel}>
          <Text style={styles.statNum}>{moves}</Text> moves
        </Text>
      </View>

      {/* Grid */}
      <View style={styles.gridWrap}>
        <FlowGrid
          level={level}
          paths={paths}
          activeKey={activeKey}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        />
      </View>

      {/* Hint */}
      <Text style={styles.hint}>
        {activeKey
          ? 'Drag to draw · lift finger to stop'
          : 'Press and drag from a dot to draw'}
      </Text>

      <WinOverlay
        visible={isWon}
        levelTitle={level.title}
        moves={moves}
        onNext={nextLevel ? () => navigation.replace('Game', {levelId: nextLevel.id}) : null}
        onReplay={() => { resetLevel(); }}
        onMenu={() => navigation.navigate('LevelSelect')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Colors.bg},

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {padding: 4},
  backText: {fontSize: 28, color: Colors.textPrimary, fontWeight: '300', lineHeight: 32},
  headerCenter: {alignItems: 'center', flex: 1},
  levelTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  diffPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radii.full,
  },
  diffText: {fontSize: FontSize.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8},
  resetBtn: {padding: 4},
  resetText: {fontSize: 22, color: Colors.textSecondary},

  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statLabel: {fontSize: FontSize.sm, color: Colors.textSecondary},
  statNum: {fontWeight: '700', color: Colors.textPrimary},

  gridWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },

  hint: {
    textAlign: 'center',
    fontSize: FontSize.sm,
    color: Colors.textDim,
    paddingBottom: Spacing.lg,
  },
});
