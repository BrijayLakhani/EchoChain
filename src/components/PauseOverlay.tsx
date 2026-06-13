import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Modal, Switch, Linking} from 'react-native';
import {Pastel, FontSize} from '../theme';
import {useSettingsStore, haptic} from '../store/settingsStore';

type Props = {
  visible: boolean;
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
};

// In-game pause menu — OPTIONS / LEARN tabs, mirrors Two Dots.
export default function PauseOverlay({visible, onResume, onRestart, onExit}: Props) {
  const [tab, setTab] = useState<'options' | 'learn'>('options');

  const sound        = useSettingsStore(s => s.sound);
  const haptics      = useSettingsStore(s => s.haptics);
  const colorblind   = useSettingsStore(s => s.colorblind);
  const turbo        = useSettingsStore(s => s.turbo);
  const setSound     = useSettingsStore(s => s.setSound);
  const setHaptics   = useSettingsStore(s => s.setHaptics);
  const setColorblind= useSettingsStore(s => s.setColorblind);
  const setTurbo     = useSettingsStore(s => s.setTurbo);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onResume}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Tabs */}
          <View style={styles.tabs}>
            <Tab label="OPTIONS" active={tab === 'options'} onPress={() => setTab('options')} />
            <Tab label="LEARN"   active={tab === 'learn'}   onPress={() => setTab('learn')} />
            <TouchableOpacity onPress={onResume} hitSlop={14} style={styles.close}>
              <Text style={styles.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          {tab === 'options' ? (
            <View style={styles.body}>
              <TouchableOpacity
                style={[styles.btn, {backgroundColor: Pastel.mint}]}
                activeOpacity={0.88}
                onPress={() => { haptic('tap'); onRestart(); }}>
                <Text style={styles.btnTxt}>Restart</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnGhost]}
                activeOpacity={0.88}
                onPress={() => { haptic('tap'); onExit(); }}>
                <Text style={[styles.btnTxt, {color: Pastel.ink}]}>Exit to Map</Text>
              </TouchableOpacity>

              <View style={styles.grid}>
                <Toggle label="Sound"      value={sound}      onChange={v => { setSound(v); haptic('tap'); }} />
                <Toggle label="Haptics"    value={haptics}    onChange={v => { setHaptics(v); if (v) haptic('tap'); }} />
                <Toggle label="Colorblind" value={colorblind} onChange={v => { setColorblind(v); haptic('tap'); }} />
                <Toggle label="Turbo"      value={turbo}      onChange={v => { setTurbo(v); haptic('tap'); }} />
              </View>
            </View>
          ) : (
            <View style={styles.body}>
              <Text style={styles.learnTitle}>How to play</Text>
              <Text style={styles.learnTxt}>
                Drag from a colored dot to its twin. Fill every cell with pipes and
                connect all pairs without crossing. Fewer moves = more stars.
              </Text>
              <TouchableOpacity
                style={[styles.btn, styles.btnGhost]}
                activeOpacity={0.88}
                onPress={() => Linking.openURL('mailto:yatrawithmaps@gmail.com?subject=Dotwise%20Support')}>
                <Text style={[styles.btnTxt, {color: Pastel.ink}]}>Contact Support</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

function Tab({label, active, onPress}: {label: string; active: boolean; onPress: () => void}) {
  return (
    <TouchableOpacity style={[styles.tab, active && styles.tabActive]} activeOpacity={0.8} onPress={onPress}>
      <Text style={[styles.tabTxt, active && styles.tabTxtActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Toggle({label, value, onChange}: {label: string; value: boolean; onChange: (v: boolean) => void}) {
  return (
    <View style={styles.toggle}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{false: Pastel.bgAlt, true: Pastel.mint}}
        thumbColor="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {flex: 1, backgroundColor: 'rgba(46,42,58,0.6)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 26},
  card: {width: '100%', backgroundColor: Pastel.bg, borderRadius: 26, overflow: 'hidden',
    shadowColor: Pastel.shadow, shadowOffset: {width: 0, height: 10}, shadowOpacity: 0.25, shadowRadius: 24, elevation: 12},

  tabs: {flexDirection: 'row', backgroundColor: Pastel.bgAlt, padding: 6, gap: 6, alignItems: 'center'},
  tab: {flex: 1, paddingVertical: 12, borderRadius: 999, alignItems: 'center'},
  tabActive: {backgroundColor: Pastel.card,
    shadowColor: Pastel.shadow, shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2},
  tabTxt: {fontSize: FontSize.sm, fontWeight: '900', color: Pastel.inkDim, letterSpacing: 1},
  tabTxtActive: {color: Pastel.ink},
  close: {width: 36, alignItems: 'center'},
  closeTxt: {fontSize: 18, fontWeight: '800', color: Pastel.inkSoft},

  body: {padding: 22, gap: 14},
  btn: {paddingVertical: 15, borderRadius: 16, alignItems: 'center'},
  btnGhost: {backgroundColor: Pastel.card, borderWidth: 1.5, borderColor: Pastel.bgAlt},
  btnTxt: {fontSize: FontSize.md, fontWeight: '900', color: '#fff'},

  grid: {flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4},
  toggle: {width: '46%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Pastel.card, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10},
  toggleLabel: {fontSize: FontSize.sm, fontWeight: '700', color: Pastel.ink},

  learnTitle: {fontSize: FontSize.lg, fontWeight: '900', color: Pastel.ink},
  learnTxt: {fontSize: FontSize.sm, color: Pastel.inkSoft, lineHeight: 21},
});
