import React, {useEffect} from 'react';
import {TextInput, TextStyle, StyleProp} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedProps, withTiming, Easing,
} from 'react-native-reanimated';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

type Props = {value: number; style?: StyleProp<TextStyle>; duration?: number};

// Smoothly counts up/down to `value` on the UI thread — the polished coin/gem
// tick you see in real games. Uses an un-editable TextInput because Reanimated
// can animate its `text` prop directly (Text children can't be animated).
export default function AnimatedNumber({value, style, duration = 320}: Props) {
  const sv = useSharedValue(value);

  useEffect(() => {
    sv.value = withTiming(value, {duration, easing: Easing.out(Easing.cubic)});
  }, [value]);

  const props = useAnimatedProps(() => {
    const n = Math.round(sv.value);
    return {text: String(n), defaultValue: String(n)} as any;
  });

  return (
    <AnimatedTextInput
      editable={false}
      underlineColorAndroid="transparent"
      style={[{padding: 0}, style]}
      animatedProps={props}
      value={String(Math.round(value))}
    />
  );
}
