import React, {useEffect, useRef} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Animated, StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {useProgressStore} from '../store/progressStore';
import {LEVELS} from '../engine/levels';
import {Colors, Spacing, Radii, FontSize, FlowColors} from '../theme';

type Props = {navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>};

const DIFF_GROUPS = [
  {key: 'easy',   label: 'Easy',   count: 5,  color: '#4CAF7D'},
  {key: 'medium', label: 'Medium', count: 5,  color: '#E8B84B'},
  {key: 'hard',   label: 'Hard',   count: 5,  color: '#E8772E'},
  {key: 'expert', label: 'Expert', count: 5,  color: '#D94F3D'},
];

// Small decorative pipe preview dots
const DEMO_COLORS = [FlowColors.R, FlowColors.B, FlowColors.G, FlowColors.Y, FlowColors.O, FlowColors.P];

export default function HomeScreen({navigation}: Props) {
  const load      = useProgressStore(s => s.load);
  const completed = useProgressStore(s => s.completed);

  const fadeIn  = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    load();
    Animated.parallel([
      Animated.timing(fadeIn,  {toValue: 1, duration: 480, useNativeDriver: true}),
      Animated.timing(slideUp, {toValue: 0, duration: 480, useNativeDriver: true}),
    ]).start();
  }, []);

  const totalSolved = Object.keys(completed).length;

  const solvedByDiff = (diff: string) =>
    LEVELS.filter(l => l.difficulty === diff && completed[l.id] !== undefined).length;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      <Animated.View style={[styles.content, {opacity: fadeIn, transform: [{translateY: slideUp}]}]}>

        {/* Logo / title area */}
        <View style={styles.hero}>
          {/* Decorative pipe dots */}
          <View style={styles.demoRow}>
            {DEMO_COLORS.map((c, i) => (
              <View key={i} style={[styles.demoDot, {backgroundColor: c}]} />
            ))}
          </View>

          <Text style={styles.title}>Flow</Text>
          <Text style={styles.sub}>Connect the dots. Fill the grid.</Text>

          {totalSolved > 0 && (
            <Text style={styles.progress}>{totalSolved} of 20 solved</Text>
          )}
        </View>

        {/* Difficulty cards */}
        <View style={styles.grid}>
          {DIFF_GROUPS.map(g => {
            const solved = solvedByDiff(g.key);
            const pct    = solved / g.count;
            return (
              <TouchableOpacity
                key={g.key}
                style={styles.diffCard}
                activeOpacity={0.82}
                onPress={() => navigation.navigate('LevelSelect', {difficulty: g.key as any})}>
                <View style={[styles.diffBar, {backgroundColor: g.color + '22'}]}>
                  <View style={[styles.diffFill, {width: `${pct*100}%` as any, backgroundColor: g.color}]} />
                </View>
                <View style={[styles.diffDot, {backgroundColor: g.color}]} />
                <Text style={[styles.diffLabel, {color: g.color}]}>{g.label}</Text>
                <Text style={styles.diffCount}>{solved}/{g.count}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Primary CTA */}
        <TouchableOpacity
          style={styles.playBtn}
          activeOpacity={0.85}
          onPress={() => {
            const firstUnsolved = LEVELS.find(l => !completed[l.id]);
            if (firstUnsolved) navigation.navigate('Game', {levelId: firstUnsolved.id});
            else navigation.navigate('LevelSelect', {});
          }}>
          <Text style={styles.playText}>
            {totalSolved === 0 ? 'Start Playing' : totalSolved === 20 ? 'Play Again' : 'Continue'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.allBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('LevelSelect', {})}>
          <Text style={styles.allText}>Browse all puzzles</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Colors.bg},
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    justifyContent: 'center',
  },

  hero: {alignItems: 'center', marginBottom: Spacing.xl},

  demoRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  demoDot: {
    width: 16, height: 16,
    borderRadius: 8,
  },

  title: {
    fontSize: 52,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -2,
    marginBottom: 6,
  },
  sub: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    letterSpacing: 0.1,
    marginBottom: 8,
  },
  progress: {
    fontSize: FontSize.sm,
    color: Colors.textDim,
    fontWeight: '600',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  diffCard: {
    width: '47.5%',
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  diffBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 3,
  },
  diffFill: {
    height: 3,
    borderRadius: 2,
  },
  diffDot: {
    width: 12, height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  diffLabel: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    marginBottom: 2,
  },
  diffCount: {
    fontSize: FontSize.xs,
    color: Colors.textDim,
    fontWeight: '500',
  },

  playBtn: {
    backgroundColor: Colors.textPrimary,
    paddingVertical: 18,
    borderRadius: Radii.lg,
    alignItems: 'center',
    marginBottom: Spacing.sm,
    shadowColor: Colors.textPrimary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  playText: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.bg,
    letterSpacing: 0.3,
  },

  allBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  allText: {
    fontSize: FontSize.sm,
    color: Colors.textDim,
  },
});
