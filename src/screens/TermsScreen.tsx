import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {Pastel, FontSize} from '../theme';

type Props = {navigation: NativeStackNavigationProp<RootStackParamList, 'Terms'>};

// NOTE: Template text. Have a lawyer review before publishing.
export default function TermsScreen({navigation}: Props) {
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Pastel.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={14}>
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{width: 22}} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.updated}>Last updated: 5 June 2026</Text>

        <P h>1. Acceptance</P>
        <P>By installing or using FLOW (“the app”) you agree to these Terms. If you do not agree,
          please do not use the app.</P>

        <P h>2. License</P>
        <P>We grant you a personal, non-exclusive, non-transferable, revocable license to use the app
          for your own non-commercial entertainment.</P>

        <P h>3. Virtual items</P>
        <P>Lives, coins, and hints are virtual items with no monetary value. They cannot be exchanged
          for real money and may be modified or reset. Rewards from optional ads are granted only
          when an ad is watched to completion.</P>

        <P h>4. Acceptable use</P>
        <P>You agree not to reverse engineer, tamper with, or attempt to manipulate the app’s
          progression, economy, or ad systems, except as permitted by law.</P>

        <P h>5. Ads & third parties</P>
        <P>The app may show optional ads and use third-party services (e.g. Google Firebase, AdMob)
          governed by their own terms.</P>

        <P h>6. Disclaimer</P>
        <P>The app is provided “as is” without warranties of any kind. We do not guarantee it will be
          uninterrupted or error-free.</P>

        <P h>7. Limitation of liability</P>
        <P>To the maximum extent permitted by law, we are not liable for any indirect or incidental
          damages arising from your use of the app.</P>

        <P h>8. Changes</P>
        <P>We may update these Terms. Continued use after changes means you accept the updated Terms.</P>

        <P h>9. Contact</P>
        <P>yatrawithmaps@gmail.com</P>

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
