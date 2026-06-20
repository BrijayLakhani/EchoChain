import React, {useRef, useMemo, useState, useEffect} from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, Pressable, Dimensions,
  InteractionManager,
} from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withRepeat, withTiming, withSequence,
  FadeInDown,
} from 'react-native-reanimated';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Svg, {Path as SvgPath} from 'react-native-svg';
import {RootStackParamList} from '../navigation/AppNavigator';
import {LEVELS} from '../engine/levels';
import {useProgressStore} from '../store/progressStore';
import {haptic} from '../store/settingsStore';
import {Colors, FontSize, FlowColors} from '../theme';
import JourneyBackground from '../components/JourneyBackground';
import Mascot from '../components/Mascot';

type Props = {navigation: NativeStackNavigationProp<RootStackParamList, 'LevelSelect'>};

const SCREEN_W = Dimensions.get('window').width;
const CX     = SCREEN_W / 2;
const NODE   = 66;
const LIFT   = 6;     // 3D depth (bottom shade offset)
const ROW_H  = 104;
const TOP    = 56;
const BOTTOM = 140;
const AMP    = 70;    // horizontal wind amplitude
const FREQ   = 0.82;
const TILE   = 1200;  // vertical slice height — keeps each SVG bitmap small

const CHAPTER_SIZE = 5;
const CHAPTERS: {name: string; color: string; char: string}[] = [
  {name: 'Meadow',     color: FlowColors.G, char: '🐰'},
  {name: 'River',      color: FlowColors.B, char: '🐸'},
  {name: 'Amber Wood', color: FlowColors.O, char: '🦊'},
  {name: 'Twilight',   color: FlowColors.P, char: '🦉'},
  {name: 'Summit',     color: FlowColors.R, char: '🐉'},
  {name: 'Coral Bay',  color: FlowColors.T, char: '🐢'},
  {name: 'Sunset',     color: FlowColors.Y, char: '🦜'},
  {name: 'Orchard',    color: FlowColors.K, char: '🐝'},
  {name: 'Glacier',    color: FlowColors.W, char: '🐧'},
  {name: 'Volcano',    color: FlowColors.N, char: '🦎'},
];
const chapterFor = (i: number) => CHAPTERS[Math.floor(i / CHAPTER_SIZE) % CHAPTERS.length];

function nodeX(i: number) { return CX + AMP * Math.sin(i * FREQ); }
function nodeY(i: number) { return TOP + i * ROW_H; }

// Shade a hex color darker for the 3D base ring.
function darken(hex: string, f = 0.78) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * f);
  const g = Math.round(((n >> 8) & 255) * f);
  const b = Math.round((n & 255) * f);
  return `rgb(${r},${g},${b})`;
}

export default function LevelSelectScreen({navigation}: Props) {
  const completed = useProgressStore(s => s.completed);
  const unlocked  = useProgressStore(s => s.unlocked);
  const solvedCount = LEVELS.filter(l => completed[l.id] !== undefined).length;

  const currentIndex = useMemo(() => {
    const idx = LEVELS.findIndex(l => unlocked.includes(l.id) && completed[l.id] === undefined);
    return idx < 0 ? Math.max(0, LEVELS.length - 1) : idx;
  }, [unlocked, completed]);

  const contentHeight = TOP + (LEVELS.length - 1) * ROW_H + BOTTOM;

  // Smooth cubic path winding through every node centre.
  const pathD = useMemo(() => {
    let d = `M ${nodeX(0)} ${nodeY(0)}`;
    for (let i = 0; i < LEVELS.length - 1; i++) {
      const x1 = nodeX(i), y1 = nodeY(i);
      const x2 = nodeX(i + 1), y2 = nodeY(i + 1);
      const my = (y1 + y2) / 2;
      d += ` C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`;
    }
    return d;
  }, []);

  const scrollRef = useRef<ScrollView>(null);
  const didScroll = useRef(false);

  // The map (100 nodes + tiled SVG) is heavy to mount and was blocking the
  // navigation transition for several seconds. Render a light loader first,
  // then build the map after the screen has animated in.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => setReady(true));
    return () => task.cancel();
  }, []);

  // Centre target for the active level.
  const focusY = Math.max(0, nodeY(currentIndex) - 300);

  // Scroll once the content has actually been measured — reliable even after a
  // navigation.reset (the old setTimeout fired before layout and landed at top).
  const onContentSize = (_w: number, h: number) => {
    if (didScroll.current || h < focusY + 200) return;
    didScroll.current = true;
    scrollRef.current?.scrollTo({y: focusY, animated: false});
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={14}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Journey</Text>
          <Text style={styles.headerSub}>{solvedCount} solved</Text>
        </View>
        <View style={{width: 36}} />
      </View>

      {!ready ? (
        <View style={styles.loader}>
          <LottieView
            source={require('../assets/loading.json')}
            autoPlay loop style={{width: 140, height: 110}} />
          <Text style={styles.loadingTxt}>Loading journey…</Text>
        </View>
      ) : (
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} onContentSizeChange={onContentSize}>
        <View style={{height: contentHeight, width: SCREEN_W}}>
          <JourneyBackground width={SCREEN_W} height={contentHeight} />

          {/* winding trail — tiled so no single SVG rasterizes a huge bitmap */}
          {Array.from({length: Math.ceil(contentHeight / TILE)}).map((_, t) => {
            const y0 = t * TILE;
            const th = Math.min(TILE, contentHeight - y0);
            return (
              <Svg key={`trail${t}`} pointerEvents="none"
                style={{position: 'absolute', left: 0, top: y0, width: SCREEN_W, height: th}}
                width={SCREEN_W} height={th} viewBox={`0 ${y0} ${SCREEN_W} ${th}`}>
                <SvgPath d={pathD} stroke="#E4DACB" strokeWidth={14} fill="none" strokeLinecap="round" />
                <SvgPath d={pathD} stroke="#F4ECDF" strokeWidth={5} fill="none" strokeLinecap="round" strokeDasharray="2 16" />
              </Svg>
            );
          })}

          {/* chapter labels + mascots */}
          {LEVELS.map((_, i) => {
            if (i % CHAPTER_SIZE !== 0) return null;
            const ch = chapterFor(i);
            const x = nodeX(i), y = nodeY(i);
            const left = x < CX;
            return (
              <View key={`ch${i}`} pointerEvents="none"
                style={[styles.chapterTag, {top: y - 96, [left ? 'right' : 'left']: SCREEN_W * 0.5 + 30} as any]}>
                <View style={[styles.chapterPill, {backgroundColor: ch.color}]}>
                  <Text style={styles.chapterTxt}>{ch.name}</Text>
                </View>
                <View style={{marginTop: 4, alignSelf: left ? 'flex-end' : 'flex-start'}}>
                  <Mascot size={40} color={ch.color} mood="happy" bob />
                </View>
              </View>
            );
          })}

          {/* nodes */}
          {LEVELS.map((level, i) => {
            const isSolved   = completed[level.id] !== undefined;
            const isUnlocked = unlocked.includes(level.id);
            const isCurrent  = i === currentIndex;
            const stars      = completed[level.id] ?? 0;
            const color      = chapterFor(i).color;
            return (
              <PathNode
                key={level.id}
                x={nodeX(i)} y={nodeY(i)} index={i}
                num={level.id} title={level.title}
                solved={isSolved} unlocked={isUnlocked} current={isCurrent}
                stars={stars} color={color}
                onPress={() => { if (isUnlocked) { haptic('tap'); navigation.navigate('Game', {levelId: level.id}); } }}
              />
            );
          })}
        </View>
      </ScrollView>
      )}
    </SafeAreaView>
  );
}

function PathNode({
  x, y, index, num, title, solved, unlocked, current, stars, color, onPress,
}: {
  x: number; y: number; index: number; num: number; title: string;
  solved: boolean; unlocked: boolean; current: boolean; stars: number; color: string;
  onPress: () => void;
}) {
  const press = useSharedValue(0);
  const pulse = useSharedValue(0);

  React.useEffect(() => {
    if (current) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1, {duration: 900}),
          withTiming(0, {duration: 900}),
        ), -1, false);
    }
  }, [current]);

  const fill   = solved ? color : unlocked ? '#FFFFFF' : '#E7E0D5';
  const base   = solved ? darken(color) : unlocked ? darken(color, 0.92) : '#CFC6B8';
  const border = solved ? color : unlocked ? color : '#CFC6B8';

  const faceStyle = useAnimatedStyle(() => ({transform: [{translateY: press.value * LIFT}]}));
  const ringStyle = useAnimatedStyle(() => ({opacity: 0.5 * (1 - pulse.value), transform: [{scale: 1 + pulse.value * 0.5}]}));
  const pillStyle = useAnimatedStyle(() => ({transform: [{translateY: pulse.value * -6}]}));

  return (
    <Animated.View
      entering={index < 14 ? FadeInDown.delay(index * 14).springify().damping(16).stiffness(260) : undefined}
      style={[styles.nodeAbs, {left: x - NODE / 2, top: y - NODE / 2}]}>

      {current && <Animated.View style={[styles.ring, {borderColor: color}, ringStyle]} />}

      {current && (
        <Animated.View style={[styles.playPill, {backgroundColor: color}, pillStyle]}>
          <Text style={styles.playPillTxt}>PLAY</Text>
          <View style={[styles.playTail, {borderTopColor: color}]} />
        </Animated.View>
      )}

      <Pressable
        onPress={onPress}
        onPressIn={() => { press.value = withSpring(1, {damping: 14, stiffness: 320}); }}
        onPressOut={() => { press.value = withSpring(0, {damping: 14, stiffness: 320}); }}
        disabled={!unlocked}>
        <View style={[styles.base, {backgroundColor: base}]} />
        <Animated.View style={[styles.face, {backgroundColor: fill, borderColor: border}, faceStyle]}>
          {solved
            ? <Text style={styles.check}>✓</Text>
            : <Text style={[styles.num, {color: unlocked ? color : '#B3A998'}]}>{unlocked ? num : '🔒'}</Text>}
        </Animated.View>
      </Pressable>

      {unlocked && <Text style={styles.title} numberOfLines={1}>{title}</Text>}
      {solved && (
        <View style={styles.stars}>
          {[0, 1, 2].map(s => (
            <Text key={s} style={[styles.star, {opacity: s < stars ? 1 : 0.28}]}>★</Text>
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Colors.bg},
  loader: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  loadingTxt: {marginTop: 8, fontSize: FontSize.sm, fontWeight: '700', color: Colors.textDim},

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  back: {fontSize: 28, color: Colors.textPrimary, fontWeight: '300', lineHeight: 32},
  headerCenter: {alignItems: 'center'},
  headerTitle: {fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary},
  headerSub: {fontSize: 11, color: Colors.textDim, fontWeight: '600', marginTop: 1},

  nodeAbs: {position: 'absolute', width: NODE, alignItems: 'center'},

  base: {
    position: 'absolute', top: LIFT, width: NODE, height: NODE, borderRadius: NODE / 2,
  },
  face: {
    width: NODE, height: NODE, borderRadius: NODE / 2, borderWidth: 3,
    alignItems: 'center', justifyContent: 'center',
  },
  num: {fontSize: 22, fontWeight: '900'},
  check: {fontSize: 26, color: '#fff', fontWeight: '800'},

  ring: {
    position: 'absolute', top: 0, width: NODE, height: NODE, borderRadius: NODE / 2, borderWidth: 3,
  },
  playPill: {
    position: 'absolute', top: -34, alignSelf: 'center', zIndex: 6,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.2, shadowRadius: 3, elevation: 5,
  },
  playPillTxt: {color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 1},
  playTail: {
    position: 'absolute', bottom: -5, alignSelf: 'center', left: '50%', marginLeft: -5,
    width: 0, height: 0, borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 6,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
  },

  title: {
    marginTop: LIFT + 7, fontSize: 11, fontWeight: '800', color: Colors.textPrimary,
    textAlign: 'center', maxWidth: 120, overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.82)', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2,
  },
  stars: {flexDirection: 'row', gap: 1, marginTop: 2},
  star: {fontSize: 11, color: '#FFB923'},

  chapterTag: {position: 'absolute', alignItems: 'center', zIndex: 2},
  chapterPill: {paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3},
  chapterTxt: {color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 0.5},
});
