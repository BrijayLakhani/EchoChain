import React, {useEffect, useRef} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Modal} from 'react-native';
import {useAdStore} from '../ads/adStore';
import {Pastel, FontSize} from '../theme';

// Simulated rewarded-ad UI. Mounted once at app root (App.tsx).
// Real AdMob would replace this with the SDK's native ad surface.
export default function RewardedAdModal() {
  const visible     = useAdStore(s => s.visible);
  const secondsLeft = useAdStore(s => s.secondsLeft);
  const tick        = useAdStore(s => s.tick);
  const dismiss     = useAdStore(s => s.dismiss);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (visible) {
      timer.current = setInterval(() => tick(), 1000);
    }
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={dismiss}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.tag}>AD</Text>
          <Text style={styles.play}>▶</Text>
          <Text style={styles.title}>Your reward is on the way</Text>
          <Text style={styles.sub}>Watch to the end to claim it.</Text>

          <View style={styles.countWrap}>
            <Text style={styles.count}>{secondsLeft}</Text>
          </View>

          <TouchableOpacity style={styles.skip} activeOpacity={0.8} onPress={dismiss}>
            <Text style={styles.skipTxt}>Skip (no reward)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {flex: 1, backgroundColor: 'rgba(46,42,58,0.78)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28},
  card: {width: '100%', backgroundColor: Pastel.bg, borderRadius: 26, padding: 30, alignItems: 'center'},
  tag: {alignSelf: 'flex-start', backgroundColor: Pastel.inkDim, color: '#fff', fontSize: 11, fontWeight: '900', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden'},
  play: {fontSize: 54, color: Pastel.grape, marginTop: 10, marginBottom: 6},
  title: {fontSize: FontSize.lg, fontWeight: '900', color: Pastel.ink, textAlign: 'center'},
  sub: {fontSize: FontSize.sm, color: Pastel.inkSoft, marginTop: 6, marginBottom: 18, textAlign: 'center'},
  countWrap: {width: 56, height: 56, borderRadius: 28, backgroundColor: Pastel.grape, alignItems: 'center', justifyContent: 'center', marginBottom: 18},
  count: {fontSize: 24, fontWeight: '900', color: '#fff'},
  skip: {paddingVertical: 10},
  skipTxt: {fontSize: FontSize.sm, color: Pastel.inkDim, fontWeight: '600'},
});
