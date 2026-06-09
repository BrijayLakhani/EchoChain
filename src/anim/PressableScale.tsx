import React from 'react';
import {ViewStyle, StyleProp, GestureResponderEvent} from 'react-native';
import {Pressable} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
} from 'react-native-reanimated';
import {sfx} from '../audio/sfx';

type Props = {
  children: React.ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  hitSlop?: number;
  sound?: boolean;
  pressedScale?: number;
};

// Springy, tactile button press (Duolingo-style squish). Reanimated-driven so
// the scale runs on the UI thread — buttery even under JS load.
export default function PressableScale({
  children, onPress, style, disabled, hitSlop, sound = true, pressedScale = 0.93,
}: Props) {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({transform: [{scale: scale.value}]}));

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      onPressIn={() => { if (sound) sfx('tap'); scale.value = withTiming(pressedScale, {duration: 70}); }}
      onPressOut={() => { scale.value = withSpring(1, {damping: 9, stiffness: 320}); }}>
      <Animated.View style={[style, aStyle]}>{children}</Animated.View>
    </Pressable>
  );
}
