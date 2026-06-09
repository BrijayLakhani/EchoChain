import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated, Dimensions, Easing} from 'react-native';
import {Pastel} from '../theme';

const W = Dimensions.get('window').width;
const H = Dimensions.get('window').height;
const COLORS = [Pastel.coral, Pastel.sun, Pastel.mint, Pastel.sky, Pastel.grape, Pastel.bubble, Pastel.teal];

type Props = {run: boolean; count?: number};

// Lightweight confetti burst using Animated — no native lib.
export default function Confetti({run, count = 36}: Props) {
  const pieces = useRef(
    Array.from({length: count}, () => ({
      x: Math.random() * W,
      delay: Math.random() * 250,
      dur: 1600 + Math.random() * 1400,
      drift: (Math.random() - 0.5) * 140,
      size: 7 + Math.random() * 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rounded: Math.random() > 0.5,
      progress: new Animated.Value(0),
      spin: new Animated.Value(0),
    })),
  ).current;

  useEffect(() => {
    if (!run) return;
    const anims = pieces.map(p => {
      p.progress.setValue(0);
      p.spin.setValue(0);
      return Animated.parallel([
        Animated.timing(p.progress, {toValue: 1, duration: p.dur, delay: p.delay, easing: Easing.in(Easing.quad), useNativeDriver: true}),
        Animated.timing(p.spin, {toValue: 1, duration: p.dur, delay: p.delay, easing: Easing.linear, useNativeDriver: true}),
      ]);
    });
    Animated.stagger(8, anims).start();
  }, [run]);

  if (!run) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => {
        const translateY = p.progress.interpolate({inputRange: [0, 1], outputRange: [-40, H * 0.9]});
        const translateX = p.progress.interpolate({inputRange: [0, 1], outputRange: [0, p.drift]});
        const rotate = p.spin.interpolate({inputRange: [0, 1], outputRange: ['0deg', '720deg']});
        const opacity = p.progress.interpolate({inputRange: [0, 0.85, 1], outputRange: [1, 1, 0]});
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute', left: p.x, top: 0,
              width: p.size, height: p.size,
              borderRadius: p.rounded ? p.size / 2 : 2,
              backgroundColor: p.color,
              opacity,
              transform: [{translateY}, {translateX}, {rotate}],
            }}
          />
        );
      })}
    </View>
  );
}
