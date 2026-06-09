import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import LottieView from 'lottie-react-native';
import {Pastel} from '../theme';

// Branded loading splash shown while stores hydrate on boot.
export default function LoadingScreen() {
  return (
    <View style={styles.root}>
      <View style={styles.logo}>
        {[Pastel.coral, Pastel.sky, Pastel.mint, Pastel.sun].map((c, i) => (
          <View key={i} style={[styles.dot, {backgroundColor: c}]} />
        ))}
      </View>
      <Text style={styles.title}>FLOW</Text>
      <LottieView
        source={require('../assets/loading.json')}
        autoPlay
        loop
        style={styles.lottie}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Pastel.bg, alignItems: 'center', justifyContent: 'center'},
  logo: {flexDirection: 'row', flexWrap: 'wrap', width: 84, gap: 8, justifyContent: 'center', marginBottom: 18},
  dot: {width: 38, height: 38, borderRadius: 19},
  title: {fontSize: 48, fontWeight: '900', color: Pastel.ink, letterSpacing: -2, marginBottom: 6},
  lottie: {width: 120, height: 90},
});
