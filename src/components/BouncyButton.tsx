import React, {useRef} from 'react';
import {Animated, Pressable, ViewStyle, StyleProp, GestureResponderEvent} from 'react-native';
import {sfx} from '../audio/sfx';

type Props = {
  children: React.ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  hitSlop?: number;
};

// Press-to-squish button — spring scale on press for a playful, juicy feel.
export default function BouncyButton({children, onPress, style, disabled, hitSlop}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const to = (v: number, bounce = 0) =>
    Animated.spring(scale, {toValue: v, useNativeDriver: true, speed: 40, bounciness: bounce}).start();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      onPressIn={() => { sfx('tap'); to(0.94); }}
      onPressOut={() => to(1, 8)}>
      <Animated.View style={[style, {transform: [{scale}]}]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
