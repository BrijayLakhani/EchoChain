import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Modal} from 'react-native';
import {Pastel, FontSize} from '../theme';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({visible, title, message, confirmLabel, onConfirm, onCancel}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.msg}>{message}</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.cancel} activeOpacity={0.85} onPress={onCancel}>
              <Text style={styles.cancelTxt}>✕</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirm} activeOpacity={0.88} onPress={onConfirm}>
              <Text style={styles.confirmTxt}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {flex: 1, backgroundColor: 'rgba(46,42,58,0.6)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30},
  card: {width: '100%', backgroundColor: Pastel.bg, borderRadius: 24, overflow: 'hidden', paddingTop: 26,
    shadowColor: Pastel.shadow, shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.22, shadowRadius: 20, elevation: 10},
  title: {fontSize: FontSize.xl, fontWeight: '900', color: Pastel.ink, textAlign: 'center'},
  msg: {fontSize: FontSize.md, color: Pastel.inkSoft, textAlign: 'center', marginTop: 8, marginBottom: 22, paddingHorizontal: 20},
  row: {flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Pastel.bgAlt, padding: 16},
  cancel: {width: 52, height: 52, borderRadius: 26, backgroundColor: Pastel.card, alignItems: 'center', justifyContent: 'center'},
  cancelTxt: {fontSize: 20, fontWeight: '800', color: Pastel.inkSoft},
  confirm: {flex: 1, paddingVertical: 16, borderRadius: 16, alignItems: 'center', backgroundColor: Pastel.mint},
  confirmTxt: {fontSize: FontSize.md, fontWeight: '900', color: '#fff'},
});
