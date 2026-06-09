import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useDailyStore} from '../store/dailyStore';
import {STREAK_REWARDS, streakRung} from '../store/dailyStore';
import {Pastel, FontSize} from '../theme';

// 7-day streak reward ladder, Two-Dots style daily-reward track.
export default function StreakLadder() {
  const streak = useDailyStore(s => s.streak);
  const done   = useDailyStore(s => s.isDoneToday());
  const rung   = streakRung(streak);

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.title}>🔥 Daily Streak</Text>
        <Text style={styles.count}>{streak} day{streak === 1 ? '' : 's'}</Text>
      </View>
      <View style={styles.row}>
        {STREAK_REWARDS.map((rw, i) => {
          // a rung is "claimed" if it's before the current rung (and streak active today),
          // "current" if it's today's rung.
          const claimed = done ? i <= rung : i < rung;
          const isToday = done ? i === rung : i === rung && streak > 0;
          const big = i === STREAK_REWARDS.length - 1;
          return (
            <View key={i} style={styles.dayWrap}>
              <View style={[
                styles.day,
                big && styles.dayBig,
                claimed && {backgroundColor: Pastel.mint, borderColor: Pastel.mint},
                isToday && !claimed && {borderColor: Pastel.sun, borderWidth: 2},
              ]}>
                <Text style={[styles.coin, claimed && {color: '#fff'}]}>●</Text>
                <Text style={[styles.amt, claimed && {color: '#fff'}]}>{rw}</Text>
              </View>
              <Text style={styles.dayNum}>D{i + 1}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Pastel.card, borderRadius: 20, padding: 14, gap: 10,
    shadowColor: Pastel.shadow, shadowOffset: {width: 0, height: 3}, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  head: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  title: {fontSize: FontSize.md, fontWeight: '900', color: Pastel.ink},
  count: {fontSize: FontSize.sm, fontWeight: '800', color: Pastel.coral},
  row: {flexDirection: 'row', justifyContent: 'space-between'},
  dayWrap: {alignItems: 'center', gap: 3},
  day: {
    width: 38, height: 44, borderRadius: 11, borderWidth: 1.5, borderColor: Pastel.bgAlt,
    backgroundColor: Pastel.bgAlt, alignItems: 'center', justifyContent: 'center',
  },
  dayBig: {width: 42, borderColor: Pastel.sun},
  coin: {color: Pastel.coin, fontSize: 10},
  amt: {fontSize: 11, fontWeight: '900', color: Pastel.ink},
  dayNum: {fontSize: 9, fontWeight: '700', color: Pastel.inkDim},
});
