import React, {useEffect, useRef} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Animated, Modal} from 'react-native';
import {Colors, Spacing, Radii, FontSize} from '../theme';

interface Props {
  visible: boolean;
  levelTitle: string;
  moves: number;
  onNext: (() => void) | null;
  onReplay: () => void;
  onMenu: () => void;
}

export default function WinOverlay({visible, levelTitle, moves, onNext, onReplay, onMenu}: Props) {
  const scale = useRef(new Animated.Value(0.7)).current;
  const fade  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    scale.setValue(0.7);
    fade.setValue(0);
    Animated.parallel([
      Animated.spring(scale, {toValue: 1, useNativeDriver: true, speed: 16, bounciness: 10}),
      Animated.timing(fade,  {toValue: 1, duration: 220,  useNativeDriver: true}),
    ]).start();
  }, [visible]);

  const comment = moves <= 15 ? 'Efficient! ✦' : moves <= 30 ? 'Well done! ✧' : 'Solved! ✓';

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.backdrop, {opacity: fade}]}>
        <Animated.View style={[styles.card, {transform: [{scale}]}]}>
          <Text style={styles.check}>✓</Text>
          <Text style={styles.title}>Solved!</Text>
          <Text style={styles.levelName}>{levelTitle}</Text>
          <Text style={styles.moves}>{moves} moves · {comment}</Text>

          <View style={styles.buttons}>
            {onNext && (
              <TouchableOpacity style={styles.btnPrimary} onPress={onNext} activeOpacity={0.82}>
                <Text style={styles.btnPrimaryText}>Next Puzzle →</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.btnOutline} onPress={onReplay} activeOpacity={0.82}>
              <Text style={styles.btnOutlineText}>Play Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnGhost} onPress={onMenu} activeOpacity={0.82}>
              <Text style={styles.btnGhostText}>All Puzzles</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.bg,
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
  },
  check: {
    fontSize: 48,
    color: '#4CAF7D',
    marginBottom: Spacing.sm,
    fontWeight: '300',
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  levelName: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  moves: {
    fontSize: FontSize.sm,
    color: Colors.textDim,
    marginBottom: Spacing.xl,
  },
  buttons: {width: '100%', gap: Spacing.sm},
  btnPrimary: {
    backgroundColor: Colors.textPrimary,
    paddingVertical: 16,
    borderRadius: Radii.lg,
    alignItems: 'center',
  },
  btnPrimaryText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.bg,
    letterSpacing: 0.3,
  },
  btnOutline: {
    borderWidth: 1.5,
    borderColor: Colors.borderDark,
    paddingVertical: 14,
    borderRadius: Radii.lg,
    alignItems: 'center',
  },
  btnOutlineText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  btnGhost: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnGhostText: {
    fontSize: FontSize.sm,
    color: Colors.textDim,
  },
});
