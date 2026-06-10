import React from 'react';
import {View, Text, StyleSheet, Pressable, ViewStyle, StyleProp} from 'react-native';
import Animated, {useSharedValue, useAnimatedStyle, withSpring, withTiming} from 'react-native-reanimated';
import {sfx} from '../audio/sfx';

// Chunky 3D game button (Royal Match / Candy Crush style):
// a colored face sitting on a darker base; pressing pushes the face down
// into the base. Top highlight band fakes a gradient without extra deps.
type Props = {
  label: string;
  sub?: string;                 // small line under the label (e.g. "LEVEL 19")
  color: string;
  onPress?: () => void;
  disabled?: boolean;
  height?: number;
  radius?: number;
  depth?: number;
  style?: StyleProp<ViewStyle>; // outer wrapper (width control)
  icon?: string;                // optional emoji before label
  textSize?: number;
};

function darken(hex: string, f = 0.72) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * f);
  const g = Math.round(((n >> 8) & 255) * f);
  const b = Math.round((n & 255) * f);
  return `rgb(${r},${g},${b})`;
}

export default function GameButton({
  label, sub, color, onPress, disabled, height = 62, radius = 18, depth = 6,
  style, icon, textSize = 20,
}: Props) {
  const press = useSharedValue(0);
  const face = useAnimatedStyle(() => ({transform: [{translateY: press.value * depth}]}));

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => { sfx('tap'); press.value = withTiming(1, {duration: 60}); }}
      onPressOut={() => { press.value = withSpring(0, {damping: 12, stiffness: 400}); }}
      style={[{height: height + depth}, style, disabled && {opacity: 0.55}]}>
      {/* base (3D bottom edge) */}
      <View style={[s.base, {top: depth, height, borderRadius: radius, backgroundColor: darken(color)}]} />
      {/* face */}
      <Animated.View style={[s.face, {height, borderRadius: radius, backgroundColor: color}, face]}>
        <View style={[s.shine, {borderTopLeftRadius: radius, borderTopRightRadius: radius, height: height * 0.45}]} />
        <View style={s.labelRow}>
          {icon ? <Text style={[s.icon, {fontSize: textSize}]}>{icon}</Text> : null}
          <View style={{alignItems: 'center'}}>
            <Text style={[s.label, {fontSize: textSize}]}>{label}</Text>
            {sub ? <Text style={s.sub}>{sub}</Text> : null}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  base: {position: 'absolute', left: 0, right: 0},
  face: {alignItems: 'center', justifyContent: 'center', overflow: 'hidden'},
  shine: {position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.22)'},
  labelRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  icon: {},
  label: {
    color: '#fff', fontWeight: '900', letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.25)', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 2,
  },
  sub: {
    color: 'rgba(255,255,255,0.92)', fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginTop: 1,
    textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 1,
  },
});
