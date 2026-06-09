import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {activeEvent, timeLeftStr} from '../store/eventsStore';
import {Pastel, FontSize} from '../theme';

// Live event banner with countdown — mirrors Two Dots' timed-event card.
export default function EventCard() {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick(t => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const ev = activeEvent();
  if (!ev) return null;

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}><Text style={styles.emoji}>{ev.emoji}</Text></View>
      <View style={{flex: 1}}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{ev.name}</Text>
          <View style={styles.mult}><Text style={styles.multTxt}>{ev.multiplier}× coins</Text></View>
        </View>
        <Text style={styles.desc}>{ev.desc}</Text>
      </View>
      <View style={styles.timer}>
        <Text style={styles.timerLabel}>ENDS IN</Text>
        <Text style={styles.timerVal}>{timeLeftStr(ev.endsAt)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Pastel.grape, borderRadius: 20, padding: 14,
    shadowColor: Pastel.grape, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 10, elevation: 4,
  },
  iconWrap: {width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center'},
  emoji: {fontSize: 24},
  titleRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  title: {fontSize: FontSize.md, fontWeight: '900', color: '#fff'},
  mult: {backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2},
  multTxt: {fontSize: 10, fontWeight: '900', color: '#fff'},
  desc: {fontSize: FontSize.sm, color: 'rgba(255,255,255,0.92)', marginTop: 2},
  timer: {alignItems: 'center'},
  timerLabel: {fontSize: 8, fontWeight: '900', color: 'rgba(255,255,255,0.8)', letterSpacing: 1},
  timerVal: {fontSize: FontSize.md, fontWeight: '900', color: '#fff'},
});
