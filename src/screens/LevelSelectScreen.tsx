import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/AppNavigator';
import {LEVELS} from '../engine/levels';
import {useProgressStore} from '../store/progressStore';
import {Colors, Spacing, Radii, FontSize, FlowColors} from '../theme';
import {Difficulty} from '../engine/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'LevelSelect'>;
  route: RouteProp<RootStackParamList, 'LevelSelect'>;
};

const DIFF_COLOR: Record<string, string> = {
  easy:   '#4CAF7D',
  medium: '#E8B84B',
  hard:   '#E8772E',
  expert: '#D94F3D',
};

const DOT_KEYS = ['R','B','G','Y','O','P'];

export default function LevelSelectScreen({navigation, route}: Props) {
  const filterDiff = route.params?.difficulty;
  const completed  = useProgressStore(s => s.completed);
  const unlocked   = useProgressStore(s => s.unlocked);

  const levels = filterDiff
    ? LEVELS.filter(l => l.difficulty === filterDiff)
    : LEVELS;

  const title = filterDiff
    ? filterDiff.charAt(0).toUpperCase() + filterDiff.slice(1)
    : 'All Puzzles';

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{width: 32}} />
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {levels.map(level => {
          const isUnlocked = unlocked.includes(level.id);
          const isSolved   = completed[level.id] !== undefined;
          const diffColor  = DIFF_COLOR[level.difficulty];

          return (
            <TouchableOpacity
              key={level.id}
              style={[styles.card, !isUnlocked && styles.cardLocked]}
              activeOpacity={0.82}
              onPress={() => isUnlocked && navigation.navigate('Game', {levelId: level.id})}>

              {/* Left accent */}
              <View style={[styles.accent, {backgroundColor: diffColor}]} />

              {/* Level number */}
              <View style={styles.numWrap}>
                <Text style={[styles.num, {color: isUnlocked ? diffColor : Colors.textDim}]}>
                  {level.id}
                </Text>
              </View>

              {/* Info */}
              <View style={styles.info}>
                <Text style={[styles.cardTitle, !isUnlocked && {color: Colors.textDim}]}>
                  {level.title}
                </Text>
                <View style={styles.metaRow}>
                  {/* Color dots preview */}
                  <View style={styles.dotsPreview}>
                    {level.dots.slice(0, 5).map((d, i) => (
                      <View
                        key={i}
                        style={[styles.previewDot, {backgroundColor: FlowColors[d.key] ?? '#888'}]}
                      />
                    ))}
                  </View>
                  <Text style={styles.meta}>
                    {level.gridSize}×{level.gridSize} · {level.dots.length} pipes
                  </Text>
                </View>
              </View>

              {/* Status */}
              <View style={styles.status}>
                {!isUnlocked
                  ? <Text style={styles.lockIcon}>⌒</Text>
                  : isSolved
                  ? <View style={[styles.checkCircle, {backgroundColor: diffColor}]}>
                      <Text style={styles.checkMark}>✓</Text>
                    </View>
                  : <View style={styles.emptyCircle} />
                }
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{height: Spacing.xl}} />
      </ScrollView>
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
  back: {fontSize: 28, color: Colors.textPrimary, fontWeight: '300', lineHeight: 32},
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
  },

  list: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },

  card: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.lg,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 76,
  },
  cardLocked: {opacity: 0.5},

  accent: {
    width: 4,
    alignSelf: 'stretch',
    marginRight: 0,
  },

  numWrap: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  num: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    lineHeight: 30,
  },

  info: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingRight: Spacing.sm,
  },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dotsPreview: {
    flexDirection: 'row',
    gap: 3,
  },
  previewDot: {
    width: 8, height: 8,
    borderRadius: 4,
  },
  meta: {
    fontSize: FontSize.xs,
    color: Colors.textDim,
  },

  status: {
    paddingRight: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    fontSize: 18,
    color: Colors.textDim,
  },
  checkCircle: {
    width: 24, height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  emptyCircle: {
    width: 22, height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Colors.borderDark,
  },
});
