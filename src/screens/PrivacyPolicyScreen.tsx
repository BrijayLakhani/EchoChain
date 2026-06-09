import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {Pastel, FontSize} from '../theme';

type Props = {navigation: NativeStackNavigationProp<RootStackParamList, 'PrivacyPolicy'>};

// NOTE: Template text. Have a lawyer review before publishing on Google Play.
export default function PrivacyPolicyScreen({navigation}: Props) {
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Pastel.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={14}>
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{width: 22}} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.updated}>Last updated: 5 June 2026</Text>

        <P h>1. Overview</P>
        <P>FLOW (“the app”, “we”) is an offline puzzle game. We designed it to collect as little
          data as possible. The app does not require an account and does not ask for your name,
          email, phone number, or location.</P>

        <P h>2. Data stored on your device</P>
        <P>Your game progress, lives, coins, hints, daily streak, and settings are stored only on
          your device using local storage. We cannot read this data. Clearing the app data or
          using “Reset progress” in Settings deletes it.</P>

        <P h>3. Analytics (optional, opt-in)</P>
        <P>If you allow analytics, we use Google Firebase Analytics to collect anonymous, aggregated
          usage data (for example: which screens are opened, levels started/completed, hints used).
          This data is pseudonymous (tied to an app-instance identifier, not to you personally) and
          helps us improve the game. You can turn analytics off at any time in Settings → Privacy
          choices.</P>

        <P h>4. Advertising</P>
        <P>The app may show optional “rewarded” ads that you choose to watch in exchange for hints or
          coins. When real ads are enabled, our ad partner (Google AdMob) may use an advertising
          identifier to serve and measure ads. Where required (e.g. in the EEA/UK) we will ask for
          your consent first.</P>

        <P h>5. Data sharing</P>
        <P>We do not sell your data. Data is processed only by the service providers named above
          (Google Firebase, Google AdMob) acting on our behalf.</P>

        <P h>6. Children</P>
        <P>The app is not directed at children under 13. If the app is published for a child audience,
          analytics and personalized ads will be restricted accordingly.</P>

        <P h>7. Your choices</P>
        <P>• Turn analytics on/off in Settings.{'\n'}• Reset all local data in Settings.{'\n'}
          • Uninstalling the app removes all on-device data.</P>

        <P h>8. Contact</P>
        <P>Questions about this policy: yatrawithmaps@gmail.com</P>

        <View style={{height: 30}} />
      </ScrollView>
    </SafeAreaView>
  );
}

function P({children, h}: {children: React.ReactNode; h?: boolean}) {
  return <Text style={h ? styles.h : styles.p}>{children}</Text>;
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Pastel.bg},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 12},
  close: {fontSize: 20, color: Pastel.inkSoft, fontWeight: '700'},
  headerTitle: {fontSize: FontSize.xl, fontWeight: '900', color: Pastel.ink},
  scroll: {paddingHorizontal: 20, paddingTop: 6},
  updated: {fontSize: FontSize.sm, color: Pastel.inkDim, marginBottom: 14},
  h: {fontSize: FontSize.md, fontWeight: '800', color: Pastel.ink, marginTop: 18, marginBottom: 6},
  p: {fontSize: FontSize.sm, color: Pastel.inkSoft, lineHeight: 21},
});
