import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Linking} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {useConsentStore} from '../store/consentStore';
import {analytics} from '../analytics';

type Props = {navigation: NativeStackNavigationProp<RootStackParamList, 'Consent'>};

// IAB-TCF / CMP-style privacy information gate (modelled on standard consent
// forms shown by ad-supported apps). "Accept all" grants analytics + personalised
// ads; "Manage Settings" proceeds with essential only.
//
// NOTE: For real EEA/GDPR ad compliance once AdMob is live, Google's User
// Messaging Platform (UMP) SDK should render & store the official TCF consent
// string. This screen provides the same look and a clear opt-in meanwhile.

const PURPOSES = [
  'Store and/or access information on a device',
  'Personalised advertising and content, advertising and content measurement, audience research and services development',
];
const SPECIAL_PURPOSES = [
  'Ensure security, prevent and detect fraud, and fix errors',
  'Deliver and present advertising and content',
  'Save and communicate privacy choices',
  'Personalised advertising and content, advertising and content measurement, audience research and services development',
];
const SPECIAL_FEATURES = [
  'Precise geolocation data, and identification through device scanning',
];
const NON_IAB = ['Marketing', 'Functional', 'Essential'];

export default function ConsentScreen({navigation}: Props) {
  const accept = useConsentStore(s => s.accept);

  const finish = (analyticsOn: boolean) => {
    accept(analyticsOn);
    analytics.setEnabled(analyticsOn);
    analytics.track('consent_set', {analytics: analyticsOn});
    navigation.reset({index: 0, routes: [{name: 'Home'}]});
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={{flex: 1}} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.h1}>Privacy Information</Text>

          <Text style={styles.body}>
            We and our advertising partners use technologies (e.g. device identifiers and
            cookies) to store and/or access information on your device in order to process
            personal data such as advertising identifiers or usage data. You may consent to
            the processing of your personal data for the purposes listed below. Alternatively
            you can set your preferences or refuse to consent. Your privacy choices apply only
            to this app. Some partners may process your personal data based on their legitimate
            business interest and do not ask for your consent. You can change your privacy
            settings or withdraw your consent at any time from Settings → Privacy.
          </Text>

          <View style={styles.links}>
            <Text style={styles.link} onPress={() => navigation.navigate('PrivacyPolicy')}>Privacy Policy</Text>
            <Text style={styles.link} onPress={() => navigation.navigate('Terms')}>Terms and Conditions</Text>
            <Text style={styles.link} onPress={() => Linking.openURL('https://support.google.com/admob/answer/9012903')}>Vendor list</Text>
          </View>

          <Section title="Purposes" items={PURPOSES} />
          <Section title="Special Purposes" items={SPECIAL_PURPOSES} />
          <Section title="Special Features" items={SPECIAL_FEATURES} />
          <Section title="Non-IAB Purposes" items={NON_IAB} />

          <View style={{height: 12}} />
        </ScrollView>

        {/* Fixed action bar */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.accept} activeOpacity={0.9} onPress={() => finish(true)}>
            <Text style={styles.acceptTxt}>Accept all</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.manage} activeOpacity={0.85} onPress={() => finish(false)}>
            <Text style={styles.manageTxt}>Manage Settings</Text>
          </TouchableOpacity>
          <Text style={styles.poweredBy}>Dotwise Privacy Center</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

function Section({title, items}: {title: string; items: string[]}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((it, i) => (
        <View key={i} style={styles.itemCard}>
          <Text style={styles.itemTxt}>{it}</Text>
        </View>
      ))}
    </View>
  );
}

const BORDER = '#E2E2E6';
const INK = '#1A1A22';
const MUTED = '#6B6B75';
const BLUE = '#1A47C2';

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#fff'},
  scroll: {paddingHorizontal: 24, paddingTop: 22, paddingBottom: 10},

  h1: {fontSize: 26, fontWeight: '800', color: INK, marginBottom: 16},
  body: {fontSize: 15, color: INK, lineHeight: 23},

  links: {flexDirection: 'row', flexWrap: 'wrap', gap: 18, marginTop: 18, marginBottom: 8},
  link: {fontSize: 14, color: INK, fontWeight: '700'},

  section: {marginTop: 16},
  sectionTitle: {fontSize: 19, fontWeight: '800', color: INK, marginBottom: 10, marginTop: 6},
  itemCard: {borderWidth: 1, borderColor: BORDER, borderRadius: 8, paddingVertical: 16, paddingHorizontal: 16, marginBottom: 12},
  itemTxt: {fontSize: 15, fontWeight: '700', color: INK, lineHeight: 22},

  actions: {borderTopWidth: 1, borderTopColor: BORDER, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10, gap: 10, backgroundColor: '#fff'},
  accept: {backgroundColor: BLUE, paddingVertical: 16, borderRadius: 8, alignItems: 'center'},
  acceptTxt: {color: '#fff', fontSize: 16, fontWeight: '800'},
  manage: {backgroundColor: '#F1F1F3', paddingVertical: 16, borderRadius: 8, alignItems: 'center'},
  manageTxt: {color: INK, fontSize: 16, fontWeight: '800'},
  poweredBy: {textAlign: 'center', color: MUTED, fontSize: 12, marginTop: 4},
});
