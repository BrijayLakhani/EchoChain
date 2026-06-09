import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useEconomyStore, LIVES_MAX} from '../store/economyStore';
import {Pastel} from '../theme';
import AnimatedNumber from '../anim/AnimatedNumber';

function fmt(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

type Props = {
  onPressLives?: () => void;
  onPressCoins?: () => void;
};

export default function ResourceBar({onPressLives, onPressCoins}: Props) {
  const lives = useEconomyStore(s => s.lives);
  const coins = useEconomyStore(s => s.coins);
  const nextLifeIn = useEconomyStore(s => s.nextLifeIn);
  const [, tick] = useState(0);

  // Re-render every second so the regen countdown stays live.
  useEffect(() => {
    const id = setInterval(() => tick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = lives < LIVES_MAX ? nextLifeIn() : 0;

  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.pill} activeOpacity={0.8} onPress={onPressLives}>
        <Text style={styles.heart}>♥</Text>
        <Text style={styles.val}>{lives}</Text>
        {lives < LIVES_MAX && <Text style={styles.timer}>{fmt(remaining)}</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.pill} activeOpacity={0.8} onPress={onPressCoins}>
        <Text style={styles.coin}>●</Text>
        <AnimatedNumber value={coins} style={styles.val} />
        <Text style={styles.plus}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {flexDirection: 'row', gap: 10},
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Pastel.card,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    shadowColor: Pastel.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  heart: {color: Pastel.heart, fontSize: 16},
  coin:  {color: Pastel.coin, fontSize: 15},
  val:   {color: Pastel.ink, fontSize: 15, fontWeight: '800'},
  timer: {color: Pastel.inkDim, fontSize: 11, fontWeight: '700', marginLeft: 2},
  plus:  {color: Pastel.inkDim, fontSize: 13, fontWeight: '800', marginLeft: 1},
});
