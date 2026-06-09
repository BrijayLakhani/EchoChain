import React, {useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing,
} from 'react-native-reanimated';
import {Pastel} from '../theme';

type Props = {
  size?: number;
  color?: string;
  mood?: 'happy' | 'wink' | 'sleepy';
  bob?: boolean;     // gentle idle float
};

// Cartoon "dot face" mascot, built from plain Views. Idle bob + squash runs on
// the UI thread via Reanimated so it never stutters.
export default function Mascot({size = 96, color = Pastel.mint, mood = 'happy', bob = true}: Props) {
  const y = useSharedValue(0);
  const sq = useSharedValue(1);

  useEffect(() => {
    if (!bob) return;
    y.value = withRepeat(
      withSequence(
        withTiming(-size * 0.07, {duration: 900, easing: Easing.inOut(Easing.quad)}),
        withTiming(0, {duration: 900, easing: Easing.inOut(Easing.quad)}),
      ), -1, false);
    sq.value = withRepeat(
      withSequence(
        withTiming(1.04, {duration: 900, easing: Easing.inOut(Easing.quad)}),
        withTiming(1, {duration: 900, easing: Easing.inOut(Easing.quad)}),
      ), -1, false);
  }, [bob, size]);

  const aStyle = useAnimatedStyle(() => ({
    transform: [{translateY: y.value}, {scaleY: sq.value}],
  }));

  const eye = Math.round(size * 0.12);
  const cheek = Math.round(size * 0.13);
  const eyeTop = size * 0.36;
  const eyeGap = size * 0.22;

  return (
    <Animated.View style={[{width: size, height: size}, aStyle]}>
      <View style={[styles.body, {width: size, height: size, borderRadius: size / 2, backgroundColor: color}]}>
        {mood === 'wink' ? (
          <View style={[styles.wink, {width: eye * 1.4, height: eye * 0.36, left: size / 2 - eyeGap - eye / 2, top: eyeTop + eye / 2, borderRadius: 4}]} />
        ) : (
          <View style={[styles.eye, eyeStyle(eye, mood), {left: size / 2 - eyeGap - eye / 2, top: eyeTop}]} />
        )}
        <View style={[styles.eye, eyeStyle(eye, mood), {left: size / 2 + eyeGap - eye / 2, top: eyeTop}]} />

        <View style={[styles.cheek, {width: cheek, height: cheek * 0.7, borderRadius: cheek, left: size * 0.18, top: size * 0.55}]} />
        <View style={[styles.cheek, {width: cheek, height: cheek * 0.7, borderRadius: cheek, right: size * 0.18, top: size * 0.55}]} />

        <View style={[styles.smile, {
          width: size * 0.3, height: size * 0.16,
          borderBottomLeftRadius: size * 0.2, borderBottomRightRadius: size * 0.2,
          left: size / 2 - size * 0.15, top: size * 0.52,
          borderColor: 'rgba(0,0,0,0.55)',
        }]} />
      </View>
    </Animated.View>
  );
}

function eyeStyle(eye: number, mood: string) {
  if (mood === 'sleepy') return {width: eye, height: eye * 0.4, borderRadius: 4};
  return {width: eye, height: eye, borderRadius: eye / 2};
}

const styles = StyleSheet.create({
  body: {alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    shadowColor: Pastel.shadow, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.18, shadowRadius: 8, elevation: 4},
  eye: {position: 'absolute', backgroundColor: '#2E2A3A'},
  wink: {position: 'absolute', backgroundColor: '#2E2A3A'},
  cheek: {position: 'absolute', backgroundColor: 'rgba(255,120,120,0.45)'},
  smile: {position: 'absolute', borderWidth: 3, borderTopWidth: 0, backgroundColor: 'transparent'},
});
