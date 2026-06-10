import React, {useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Modal} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withDelay, withTiming,
  FadeIn, ZoomIn,
} from 'react-native-reanimated';
import {Colors, FontSize, Pastel} from '../theme';
import {calcStars} from '../engine/flowEngine';
import Confetti from './Confetti';
import Mascot from './Mascot';
import AnimatedNumber from '../anim/AnimatedNumber';
import PressableScale from '../anim/PressableScale';
import LottieView from 'lottie-react-native';

interface Props {
  visible: boolean;
  levelId: number;
  levelTitle: string;
  moves: number;
  gridSize: number;
  rewardCoins?: number;
  onNext: (() => void) | null;
  onReplay: () => void;
  onMenu: () => void;
}

const GOLD  = '#FFB923';
const EMPTY = '#D8CFC6';
const STAR_MESSAGES: Record<number, string> = {1: 'Puzzle solved!', 2: 'Nice work!', 3: 'Perfect!'};

export default function WinOverlay({
  visible, levelId, levelTitle, moves, gridSize, rewardCoins = 0, onNext, onReplay, onMenu,
}: Props) {
  const earned = calcStars(moves, gridSize);
  const s0 = useSharedValue(0);
  const s1 = useSharedValue(0);
  const s2 = useSharedValue(0);
  const stars = [s0, s1, s2];

  useEffect(() => {
    if (!visible) { stars.forEach(s => (s.value = 0)); return; }
    // Snappy: stars land within ~400ms total, never gating the buttons.
    const spring = {damping: 9, stiffness: 280};
    s0.value = withDelay(80,  withSpring(1, spring));
    s1.value = withDelay(160, withSpring(1, spring));
    s2.value = withDelay(240, withSpring(1, spring));
  }, [visible]);

  const st0 = useAnimatedStyle(() => ({transform: [{scale: s0.value}, {rotate: `${(1 - s0.value) * -40}deg`}]}));
  const st1 = useAnimatedStyle(() => ({transform: [{scale: s1.value}, {rotate: `${(1 - s1.value) * -40}deg`}]}));
  const st2 = useAnimatedStyle(() => ({transform: [{scale: s2.value}, {rotate: `${(1 - s2.value) * -40}deg`}]}));
  const starStyles = [st0, st1, st2];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onMenu}>
      <Animated.View entering={FadeIn.duration(140)} style={styles.backdrop}>
        <Confetti run={visible} count={earned >= 3 ? 32 : 20} />
        {visible && (
          <LottieView source={require('../assets/win.json')} autoPlay loop={false} style={styles.lottie} />
        )}

        <Animated.View entering={ZoomIn.springify().damping(15).stiffness(260)} style={styles.card}>
          <View style={styles.mascotWrap}>
            <Mascot size={88}
              color={earned >= 3 ? Pastel.mint : earned === 2 ? Pastel.sky : Pastel.sun}
              mood={earned >= 3 ? 'happy' : earned === 2 ? 'wink' : 'sleepy'} />
          </View>

          <View style={styles.starsRow}>
            {[0, 1, 2].map(i => (
              <Animated.View key={i} style={starStyles[i]}>
                <Text style={[styles.star, {color: i < earned ? GOLD : EMPTY}]}>★</Text>
              </Animated.View>
            ))}
          </View>

          <Text style={styles.message}>{STAR_MESSAGES[earned]}</Text>
          <Text style={styles.levelLine}>Level {levelId} · {levelTitle}</Text>
          <Text style={styles.movesLine}>{moves} moves</Text>

          {rewardCoins > 0 && (
            <Animated.View entering={FadeIn.delay(200).duration(140)} style={styles.coinPill}>
              <Text style={styles.coinDot}>●</Text>
              <Text style={styles.coinTxt}>+</Text>
              <AnimatedNumber value={rewardCoins} style={styles.coinTxt} />
            </Animated.View>
          )}

          <View style={styles.actions}>
            {onNext && (
              <PressableScale style={styles.btnPrimary} onPress={onNext}>
                <Text style={styles.btnPrimaryTxt}>Next Level →</Text>
              </PressableScale>
            )}
            <PressableScale style={styles.btnOutline} onPress={onReplay}>
              <Text style={styles.btnOutlineTxt}>Play Again</Text>
            </PressableScale>
            <TouchableOpacity style={styles.btnGhost} onPress={onMenu} activeOpacity={0.8}>
              <Text style={styles.btnGhostTxt}>All Levels</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28},
  lottie: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%'},
  card: {
    width: '100%', backgroundColor: Colors.bg, borderRadius: 28, paddingVertical: 36, paddingHorizontal: 28, alignItems: 'center',
    shadowColor: '#000', shadowOffset: {width: 0, height: 12}, shadowOpacity: 0.22, shadowRadius: 28, elevation: 16,
  },
  mascotWrap: {marginTop: -78, marginBottom: 8},
  starsRow: {flexDirection: 'row', gap: 6, marginBottom: 22},
  star: {fontSize: 52, lineHeight: 58},
  message: {fontSize: FontSize.xxl, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5, marginBottom: 4},
  levelLine: {fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 3},
  movesLine: {fontSize: FontSize.sm, color: Colors.textDim, marginBottom: 14},
  coinPill: {flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#FFC24B22', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, marginBottom: 24},
  coinDot: {color: '#FFC24B', fontSize: 14},
  coinTxt: {color: '#B8860B', fontSize: FontSize.md, fontWeight: '900'},
  actions: {width: '100%', gap: 10},
  btnPrimary: {backgroundColor: Colors.textPrimary, paddingVertical: 16, borderRadius: 16, alignItems: 'center'},
  btnPrimaryTxt: {fontSize: FontSize.md, fontWeight: '800', color: Colors.bg, letterSpacing: 0.3},
  btnOutline: {borderWidth: 1.5, borderColor: Colors.borderDark, paddingVertical: 14, borderRadius: 16, alignItems: 'center'},
  btnOutlineTxt: {fontSize: FontSize.md, fontWeight: '600', color: Colors.textSecondary},
  btnGhost: {paddingVertical: 10, alignItems: 'center'},
  btnGhostTxt: {fontSize: FontSize.sm, color: Colors.textDim},
});
