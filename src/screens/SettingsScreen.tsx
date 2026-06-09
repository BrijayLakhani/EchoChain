import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Switch, Alert, StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {RootStackParamList} from '../navigation/AppNavigator';
import {Pastel, FontSize} from '../theme';
import {useSettingsStore, haptic} from '../store/settingsStore';
import {useConsentStore} from '../store/consentStore';
import {useProfileStore} from '../store/profileStore';
import {analytics} from '../analytics';

type Props = {navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>};

export default function SettingsScreen({navigation}: Props) {
  const sound      = useSettingsStore(s => s.sound);
  const haptics    = useSettingsStore(s => s.haptics);
  const colorblind = useSettingsStore(s => s.colorblind);
  const turbo      = useSettingsStore(s => s.turbo);
  const setSound   = useSettingsStore(s => s.setSound);
  const setHaptics = useSettingsStore(s => s.setHaptics);
  const setColorblind = useSettingsStore(s => s.setColorblind);
  const setTurbo      = useSettingsStore(s => s.setTurbo);
  const analyticsOn  = useConsentStore(s => s.analyticsEnabled);
  const setAnalytics = useConsentStore(s => s.setAnalytics);
  const name   = useProfileStore(s => s.name);
  const avatar = useProfileStore(s => s.avatar);
  const reroll = useProfileStore(s => s.reroll);

  const resetProgress = () => {
    Alert.alert('Reset everything?', 'This clears all progress, coins, lives and streak. This cannot be undone.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Reset', style: 'destructive',
        onPress: async () => {
          await AsyncStorage.clear();
          haptic('error');
          Alert.alert('Done', 'Progress cleared. Restart the app to start fresh.');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Pastel.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={14}>
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{width: 22}} />
      </View>

      <View style={styles.body}>
        {/* Profile card */}
        <View style={styles.profile}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileFace}>{avatar}</Text>
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.profileName}>{name}</Text>
            <Text style={styles.profileSub}>Offline player</Text>
          </View>
          <TouchableOpacity
            style={styles.reroll}
            activeOpacity={0.85}
            onPress={() => { reroll(); haptic('success'); }}>
            <Text style={styles.rerollTxt}>🎲 New look</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.group}>
          <Row label="Sound effects" value={sound} onChange={v => { setSound(v); haptic('tap'); }} />
          <View style={styles.divider} />
          <Row label="Haptic feedback" value={haptics} onChange={v => { setHaptics(v); if (v) haptic('tap'); }} />
          <View style={styles.divider} />
          <Row label="Colorblind mode" value={colorblind} onChange={v => { setColorblind(v); haptic('tap'); }} />
          <View style={styles.divider} />
          <Row label="Turbo mode" value={turbo} onChange={v => { setTurbo(v); haptic('tap'); }} />
        </View>

        <Text style={styles.groupTitle}>Privacy</Text>
        <View style={styles.group}>
          <Row
            label="Allow analytics"
            value={analyticsOn}
            onChange={v => { setAnalytics(v); analytics.setEnabled(v); haptic('tap'); }}
          />
          <View style={styles.divider} />
          <LinkRow label="Privacy Policy" onPress={() => navigation.navigate('PrivacyPolicy')} />
          <View style={styles.divider} />
          <LinkRow label="Terms of Service" onPress={() => navigation.navigate('Terms')} />
        </View>

        <TouchableOpacity style={styles.dangerBtn} activeOpacity={0.85} onPress={resetProgress}>
          <Text style={styles.dangerTxt}>Reset progress</Text>
        </TouchableOpacity>

        <Text style={styles.about}>FLOW · Connect · Fill · Solve{'\n'}Made with care.</Text>
      </View>
    </SafeAreaView>
  );
}

function Row({label, value, onChange}: {label: string; value: boolean; onChange: (v: boolean) => void}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{false: Pastel.bgAlt, true: Pastel.mint}}
        thumbColor="#fff"
      />
    </View>
  );
}

function LinkRow({label, onPress}: {label: string; onPress: () => void}) {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={onPress}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Pastel.bg},
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingVertical: 12,
  },
  close: {fontSize: 20, color: Pastel.inkSoft, fontWeight: '700'},
  headerTitle: {fontSize: FontSize.xl, fontWeight: '900', color: Pastel.ink},

  body: {padding: 18, gap: 18},
  profile: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Pastel.card, borderRadius: 20, padding: 14,
    shadowColor: Pastel.shadow, shadowOffset: {width: 0, height: 3}, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  profileAvatar: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: Pastel.grape,
    alignItems: 'center', justifyContent: 'center',
  },
  profileFace: {fontSize: 30},
  profileName: {fontSize: FontSize.lg, fontWeight: '900', color: Pastel.ink},
  profileSub: {fontSize: FontSize.sm, color: Pastel.inkSoft, marginTop: 1},
  reroll: {backgroundColor: Pastel.bgAlt, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9},
  rerollTxt: {fontSize: FontSize.sm, fontWeight: '800', color: Pastel.ink},
  group: {
    backgroundColor: Pastel.card, borderRadius: 20, paddingHorizontal: 16,
    shadowColor: Pastel.shadow, shadowOffset: {width: 0, height: 3}, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  row: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16},
  rowLabel: {fontSize: FontSize.md, fontWeight: '600', color: Pastel.ink},
  chevron: {fontSize: 22, color: Pastel.inkDim, fontWeight: '700'},
  groupTitle: {fontSize: 12, fontWeight: '800', color: Pastel.inkDim, letterSpacing: 1, textTransform: 'uppercase', marginLeft: 4, marginBottom: -6},
  divider: {height: 1, backgroundColor: Pastel.bgAlt},

  dangerBtn: {
    borderWidth: 1.5, borderColor: Pastel.coral, borderRadius: 16,
    paddingVertical: 14, alignItems: 'center',
  },
  dangerTxt: {color: Pastel.coral, fontSize: FontSize.md, fontWeight: '800'},

  about: {textAlign: 'center', color: Pastel.inkDim, fontSize: FontSize.sm, lineHeight: 20, marginTop: 8},
});
