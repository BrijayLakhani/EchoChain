import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Modal} from 'react-native';
import {Pastel, FontSize} from '../theme';

const TIPS = [
  'Tip: fill every cell — leftover empties block the win.',
  'Tip: fewer moves earn more stars.',
  'Tip: drag back over a pipe to erase it.',
  'Tip: stuck? a Hint reveals one full pipe.',
  'Tip: plan corners first, they have fewer options.',
  'Tip: turn on Colorblind mode in pause for symbols.',
];

type Props = {
  visible: boolean;
  daily: boolean;
  levelId: number;
  title: string;
  pipes: number;
  gridSize: number;
  par3: number;          // moves for 3 stars
  par2: number;          // moves for 2 stars
  bestStars: number;     // 0-3 previously earned
  hints: number;
  accent: string;
  onPlay: () => void;
  onClose: () => void;
};

// Pre-level briefing — objectives + boosters + Play, inspired by Two Dots.
export default function PreLevelModal({
  visible, daily, levelId, title, pipes, gridSize,
  par3, par2, bestStars, hints, accent, onPlay, onClose,
}: Props) {
  const tip = React.useMemo(() => TIPS[Math.floor(Math.random() * TIPS.length)], [levelId, visible]);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Accent header band */}
          <View style={[styles.band, {backgroundColor: accent}]}>
            <Text style={styles.bandLabel}>{daily ? 'DAILY CHALLENGE' : `LEVEL ${levelId}`}</Text>
            <Text style={styles.bandTitle}>{title}</Text>
            <View style={styles.bestStars}>
              {[0, 1, 2].map(i => (
                <Text key={i} style={[styles.star, {opacity: i < bestStars ? 1 : 0.28}]}>★</Text>
              ))}
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={14} style={styles.close}>
              <Text style={styles.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <Text style={styles.section}>OBJECTIVES</Text>
            <View style={styles.objRow}>
              <Objective icon="🔗" label={`Connect ${pipes} pipes`} />
              <Objective icon="▦" label={`Fill ${gridSize}×${gridSize} grid`} />
            </View>

            <View style={styles.parPill}>
              <Text style={styles.parTxt}>
                ★★★ in ≤{par3} moves   ·   ★★ in ≤{par2}
              </Text>
            </View>

            <Text style={styles.section}>BOOSTERS</Text>
            <View style={styles.boosterRow}>
              <Booster icon="💡" label="Hint" count={hints} accent={Pastel.sun} />
              <Booster icon="🔒" label="Soon" locked />
              <Booster icon="🔒" label="Soon" locked />
            </View>

            <TouchableOpacity
              style={[styles.play, {backgroundColor: accent}]}
              activeOpacity={0.88}
              onPress={onPlay}>
              <Text style={styles.playTxt}>Play</Text>
            </TouchableOpacity>

            <Text style={styles.tip}>{tip}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Objective({icon, label}: {icon: string; label: string}) {
  return (
    <View style={styles.obj}>
      <Text style={styles.objIcon}>{icon}</Text>
      <Text style={styles.objLabel}>{label}</Text>
    </View>
  );
}

function Booster({icon, label, count, accent, locked}:
  {icon: string; label: string; count?: number; accent?: string; locked?: boolean}) {
  return (
    <View style={[styles.booster, locked && {opacity: 0.45}]}>
      <View style={[styles.boosterIcon, {backgroundColor: (accent ?? Pastel.inkDim) + '22'}]}>
        <Text style={styles.boosterEmoji}>{icon}</Text>
        {typeof count === 'number' && (
          <View style={[styles.badge, {backgroundColor: accent ?? Pastel.inkDim}]}>
            <Text style={styles.badgeTxt}>{count}</Text>
          </View>
        )}
      </View>
      <Text style={styles.boosterLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {flex: 1, backgroundColor: 'rgba(46,42,58,0.6)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 26},
  card: {width: '100%', backgroundColor: Pastel.bg, borderRadius: 28, overflow: 'hidden',
    shadowColor: Pastel.shadow, shadowOffset: {width: 0, height: 10}, shadowOpacity: 0.25, shadowRadius: 24, elevation: 12},

  band: {paddingTop: 22, paddingBottom: 20, paddingHorizontal: 22, alignItems: 'center'},
  bandLabel: {color: 'rgba(255,255,255,0.85)', fontSize: FontSize.xs, fontWeight: '900', letterSpacing: 2},
  bandTitle: {color: '#fff', fontSize: FontSize.xxl, fontWeight: '900', marginTop: 4},
  bestStars: {flexDirection: 'row', gap: 6, marginTop: 10},
  star: {color: '#fff', fontSize: 22},
  close: {position: 'absolute', top: 14, right: 16},
  closeTxt: {color: 'rgba(255,255,255,0.9)', fontSize: 18, fontWeight: '800'},

  body: {padding: 22, gap: 12},
  section: {fontSize: 11, fontWeight: '900', color: Pastel.inkDim, letterSpacing: 1.5},

  objRow: {flexDirection: 'row', gap: 12},
  obj: {flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Pastel.card, borderRadius: 16, padding: 12,
    shadowColor: Pastel.shadow, shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.06, shadowRadius: 5, elevation: 1},
  objIcon: {fontSize: 18},
  objLabel: {flex: 1, fontSize: FontSize.sm, fontWeight: '700', color: Pastel.ink},

  parPill: {alignSelf: 'flex-start', backgroundColor: Pastel.bgAlt, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8},
  parTxt: {fontSize: FontSize.sm, fontWeight: '700', color: Pastel.inkSoft},

  boosterRow: {flexDirection: 'row', gap: 14, marginTop: 2},
  booster: {alignItems: 'center', gap: 6},
  boosterIcon: {width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center'},
  boosterEmoji: {fontSize: 26},
  badge: {position: 'absolute', top: -4, right: -4, minWidth: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, borderWidth: 2, borderColor: Pastel.bg},
  badgeTxt: {color: '#fff', fontSize: 11, fontWeight: '900'},
  boosterLabel: {fontSize: 11, fontWeight: '700', color: Pastel.inkSoft},

  play: {marginTop: 8, paddingVertical: 17, borderRadius: 18, alignItems: 'center',
    shadowColor: Pastel.shadow, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.18, shadowRadius: 8, elevation: 4},
  playTxt: {color: '#fff', fontSize: FontSize.lg, fontWeight: '900', letterSpacing: 0.5},
  tip: {fontSize: FontSize.xs, color: Pastel.inkDim, textAlign: 'center', marginTop: 4, fontWeight: '600'},
});
