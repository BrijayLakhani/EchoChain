import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useEconomyStore, LIVES_MAX} from '../store/economyStore';
import AnimatedNumber from '../anim/AnimatedNumber';

// Game-style HUD counters (Royal Match pattern): dark translucent framed pills
// with leading icon, bold white value and a green "+" affordance on coins.
function fmt(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

type Props = {
  onPressLives?: () => void;
  onPressCoins?: () => void;
  onPressGems?: () => void;
  showGems?: boolean;
};

export default function Hud({onPressLives, onPressCoins, onPressGems, showGems = true}: Props) {
  const lives = useEconomyStore(s => s.lives);
  const coins = useEconomyStore(s => s.coins);
  const gems  = useEconomyStore(s => s.gems);
  const nextLifeIn = useEconomyStore(s => s.nextLifeIn);
  const [, tick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => tick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = lives < LIVES_MAX ? nextLifeIn() : 0;

  return (
    <View style={s.row}>
      <TouchableOpacity style={s.pill} activeOpacity={0.85} onPress={onPressLives}>
        <Text style={s.icon}>❤️</Text>
        <Text style={s.val}>{lives}</Text>
        {lives < LIVES_MAX && <Text style={s.timer}>{fmt(remaining)}</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={s.pill} activeOpacity={0.85} onPress={onPressCoins}>
        <Text style={s.icon}>🪙</Text>
        <AnimatedNumber value={coins} style={s.val} />
        <View style={s.plus}><Text style={s.plusTxt}>＋</Text></View>
      </TouchableOpacity>

      {showGems && (
        <TouchableOpacity style={s.pill} activeOpacity={0.85} onPress={onPressGems}>
          <Text style={s.icon}>💎</Text>
          <AnimatedNumber value={gems} style={s.val} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  row: {flexDirection: 'row', gap: 8},
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(30,30,46,0.55)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)',
    paddingLeft: 8, paddingRight: 10, paddingVertical: 5, borderRadius: 999,
  },
  icon: {fontSize: 13},
  val: {color: '#fff', fontSize: 14, fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 1},
  timer: {color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: '700'},
  plus: {
    width: 16, height: 16, borderRadius: 8, backgroundColor: '#5CC9A7',
    alignItems: 'center', justifyContent: 'center', marginLeft: 2,
  },
  plusTxt: {color: '#fff', fontSize: 10, fontWeight: '900', lineHeight: 13},
});
