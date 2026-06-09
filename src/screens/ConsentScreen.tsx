import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Switch, StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {Pastel, FontSize} from '../theme';
import {useConsentStore} from '../store/consentStore';
import {analytics} from '../analytics';

type Props = {navigation: NativeStackNavigationProp<RootStackParamList, 'Consent'>};

const LOGO = [Pastel.coral, Pastel.sky, Pastel.mint, Pastel.sun];

export default function ConsentScreen({navigation}: Props) {
  const accept = useConsentStore(s => s.accept);
  const [analyticsOn, setAnalyticsOn] = useState(true);

  const onAgree = () => {
    accept(analyticsOn);
    analytics.setEnabled(analyticsOn);
    analytics.track('consent_set', {analytics: analyticsOn});
    navigation.reset({index: 0, routes: [{name: 'Home'}]});
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Pastel.bg} />
      <View style={styles.body}>
        <View style={styles.logoRow}>
          {LOGO.map((c, i) => <View key={i} style={[styles.dot, {backgroundColor: c}]} />)}
        </View>
        <Text style={styles.title}>Welcome to FLOW</Text>
        <Text style={styles.sub}>Before you play, a quick note on your privacy.</Text>

        <View style={styles.card}>
          <Bullet>FLOW works offline. No account, no name or email needed.</Bullet>
          <Bullet>Your progress is stored only on this device.</Bullet>
          <Bullet>Optional ads can be watched for hints or coins.</Bullet>
        </View>

        <View style={styles.toggleRow}>
          <View style={{flex: 1}}>
            <Text style={styles.toggleLabel}>Allow anonymous analytics</Text>
            <Text style={styles.toggleSub}>Helps us improve the game. You can change this anytime in Settings.</Text>
          </View>
          <Switch
            value={analyticsOn}
            onValueChange={setAnalyticsOn}
            trackColor={{false: Pastel.bgAlt, true: Pastel.mint}}
            thumbColor="#fff"
          />
        </View>

        <View style={{flex: 1}} />

        <Text style={styles.legalLine}>
          By continuing you agree to our{' '}
          <Text style={styles.link} onPress={() => navigation.navigate('Terms')}>Terms</Text>
          {' '}and{' '}
          <Text style={styles.link} onPress={() => navigation.navigate('PrivacyPolicy')}>Privacy Policy</Text>.
        </Text>

        <TouchableOpacity style={styles.btn} activeOpacity={0.88} onPress={onAgree}>
          <Text style={styles.btnTxt}>Agree & Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Bullet({children}: {children: React.ReactNode}) {
  return (
    <View style={styles.bullet}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.bulletTxt}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Pastel.bg},
  body: {flex: 1, paddingHorizontal: 26, paddingTop: 30, paddingBottom: 24},
  logoRow: {flexDirection: 'row', flexWrap: 'wrap', width: 86, gap: 8, marginBottom: 22},
  dot: {width: 39, height: 39, borderRadius: 20},
  title: {fontSize: 30, fontWeight: '900', color: Pastel.ink, marginBottom: 6},
  sub: {fontSize: FontSize.md, color: Pastel.inkSoft, marginBottom: 22},
  card: {backgroundColor: Pastel.card, borderRadius: 20, padding: 18, gap: 12, marginBottom: 20,
    shadowColor: Pastel.shadow, shadowOffset: {width: 0, height: 3}, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2},
  bullet: {flexDirection: 'row', gap: 8},
  bulletDot: {color: Pastel.mint, fontSize: 16, fontWeight: '900', lineHeight: 21},
  bulletTxt: {flex: 1, fontSize: FontSize.sm, color: Pastel.inkSoft, lineHeight: 21},
  toggleRow: {flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Pastel.card, borderRadius: 18, padding: 16},
  toggleLabel: {fontSize: FontSize.md, fontWeight: '700', color: Pastel.ink},
  toggleSub: {fontSize: 12, color: Pastel.inkDim, marginTop: 3, lineHeight: 17},
  legalLine: {fontSize: 12, color: Pastel.inkDim, textAlign: 'center', marginBottom: 14, lineHeight: 18},
  link: {color: Pastel.grape, fontWeight: '700'},
  btn: {backgroundColor: Pastel.mint, paddingVertical: 17, borderRadius: 16, alignItems: 'center',
    shadowColor: Pastel.mint, shadowOffset: {width: 0, height: 6}, shadowOpacity: 0.38, shadowRadius: 14, elevation: 6},
  btnTxt: {fontSize: 17, fontWeight: '900', color: '#fff'},
});
