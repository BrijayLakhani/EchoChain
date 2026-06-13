import React from 'react';
import {Text, StyleSheet, View} from 'react-native';
import Animated, {FadeInUp, FadeOutUp} from 'react-native-reanimated';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useToastStore} from '../store/toastStore';
import {Pastel, FontSize} from '../theme';

// Branded slide-in toast, mounted once at app root. Triggered via toast().
const ICON = {info: 'ℹ️', error: '📡', success: '✅'} as const;
const COLOR = {info: Pastel.ink, error: '#2E2A3A', success: Pastel.mint} as const;

export default function Toast() {
  const msg  = useToastStore(s => s.msg);
  const kind = useToastStore(s => s.kind);
  if (!msg) return null;

  return (
    <SafeAreaView edges={['top']} style={styles.host} pointerEvents="none">
      <Animated.View entering={FadeInUp.duration(220)} exiting={FadeOutUp.duration(180)}
        style={[styles.toast, {backgroundColor: COLOR[kind]}]}>
        <Text style={styles.icon}>{ICON[kind]}</Text>
        <Text style={styles.txt}>{msg}</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  host: {position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center', zIndex: 9999},
  toast: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 8, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, maxWidth: '90%',
    shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.25, shadowRadius: 10, elevation: 8,
  },
  icon: {fontSize: 16},
  txt: {color: '#fff', fontSize: FontSize.sm, fontWeight: '800', flexShrink: 1},
});
