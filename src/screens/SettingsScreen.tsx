import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Switch, Alert, StatusBar, ScrollView} from 'react-native';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {RootStackParamList} from '../navigation/AppNavigator';
import {Pastel, FontSize} from '../theme';
import {useSettingsStore, haptic} from '../store/settingsStore';
import {useConsentStore} from '../store/consentStore';
import {useProfileStore} from '../store/profileStore';
import {analytics} from '../analytics';
import GameButton from '../anim/GameButton';

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
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Colored game-style header band */}
      <View style={styles.band}>
        <SafeAreaView edges={['top']}>
          <View style={styles.bandRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={14} style={styles.bandClose}>
              <Text style={styles.bandCloseTxt}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.bandTitle}>Settings</Text>
            <View style={{width: 36}} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Profile shortcut */}
        <Animated.View entering={FadeInDown.duration(180)}>
          <TouchableOpacity style={styles.profile} activeOpacity={0.85} onPress={() => navigation.navigate('Profile')}>
            <View style={styles.profileAvatar}><Text style={styles.profileFace}>{avatar}</Text></View>
            <View style={{flex: 1}}>
              <Text style={styles.profileName}>{name}</Text>
              <Text style={styles.profileSub}>View profile</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.groupTitle}>GAME</Text>
        <View style={styles.group}>
          <Row icon="🔊" label="Sound effects" value={sound} onChange={v => { setSound(v); haptic('tap'); }} />
          <View style={styles.divider} />
          <Row icon="📳" label="Haptic feedback" value={haptics} onChange={v => { setHaptics(v); if (v) haptic('tap'); }} />
          <View style={styles.divider} />
          <Row icon="👁️" label="Colorblind mode" value={colorblind} onChange={v => { setColorblind(v); haptic('tap'); }} />
          <View style={styles.divider} />
          <Row icon="⚡" label="Turbo mode" value={turbo} onChange={v => { setTurbo(v); haptic('tap'); }} />
        </View>

        <Text style={styles.groupTitle}>PRIVACY</Text>
        <View style={styles.group}>
          <Row
            icon="📈"
            label="Allow analytics"
            value={analyticsOn}
            onChange={v => { setAnalytics(v); analytics.setEnabled(v); haptic('tap'); }}
          />
          <View style={styles.divider} />
          <LinkRow icon="🔒" label="Privacy Policy" onPress={() => navigation.navigate('PrivacyPolicy')} />
          <View style={styles.divider} />
          <LinkRow icon="📄" label="Terms of Service" onPress={() => navigation.navigate('Terms')} />
        </View>

        <GameButton
          label="Reset progress"
          color={Pastel.coral}
          height={52}
          textSize={15}
          onPress={resetProgress}
        />

        <Text style={styles.about}>FLOW · Connect · Fill · Solve{'\n'}Made with care.</Text>
      </ScrollView>
    </View>
  );
}

function Row({icon, label, value, onChange}: {icon: string; label: string; value: boolean; onChange: (v: boolean) => void}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowIcon}>{icon}</Text>
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

function LinkRow({icon, label, onPress}: {icon: string; label: string; onPress: () => void}) {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={onPress}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Pastel.bg},

  band: {
    backgroundColor: Pastel.grape,
    borderBottomLeftRadius: 26, borderBottomRightRadius: 26,
    paddingBottom: 16,
    shadowColor: Pastel.grape, shadowOffset: {width: 0, height: 6}, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  bandRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8},
  bandClose: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  bandCloseTxt: {color: '#fff', fontSize: 16, fontWeight: '800'},
  bandTitle: {
    color: '#fff', fontSize: FontSize.xl, fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 2,
  },

  body: {padding: 18, gap: 12, paddingBottom: 32},

  profile: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Pastel.card, borderRadius: 20, padding: 14,
    borderWidth: 2, borderColor: Pastel.grape + '33',
    shadowColor: Pastel.shadow, shadowOffset: {width: 0, height: 3}, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  profileAvatar: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: Pastel.grape,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff',
  },
  profileFace: {fontSize: 28},
  profileName: {fontSize: FontSize.lg, fontWeight: '900', color: Pastel.ink},
  profileSub: {fontSize: FontSize.sm, color: Pastel.grape, fontWeight: '700', marginTop: 1},

  groupTitle: {fontSize: 11, fontWeight: '900', color: Pastel.inkDim, letterSpacing: 1.5, marginLeft: 6, marginTop: 6, marginBottom: -4},
  group: {
    backgroundColor: Pastel.card, borderRadius: 20, paddingHorizontal: 14,
    shadowColor: Pastel.shadow, shadowOffset: {width: 0, height: 3}, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  row: {flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14},
  rowIcon: {fontSize: 16, width: 24, textAlign: 'center'},
  rowLabel: {flex: 1, fontSize: FontSize.md, fontWeight: '700', color: Pastel.ink},
  chevron: {fontSize: 22, color: Pastel.inkDim, fontWeight: '700'},
  divider: {height: 1, backgroundColor: Pastel.bgAlt},

  about: {textAlign: 'center', color: Pastel.inkDim, fontSize: FontSize.sm, lineHeight: 20, marginTop: 8},
});
