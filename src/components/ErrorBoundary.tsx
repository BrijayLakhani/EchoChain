import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Pastel, FontSize} from '../theme';

// Global crash safety net. If any screen throws during render, the user sees a
// friendly recovery card instead of a white screen. Tapping "Try again" remounts
// the tree from scratch.
type Props = {children: React.ReactNode};
type State = {hasError: boolean};

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = {hasError: false};

  static getDerivedStateFromError(): State {
    return {hasError: true};
  }

  componentDidCatch(error: unknown) {
    // Swallowed on purpose — keep the app alive. Logged only in dev.
    if (__DEV__) console.warn('[ErrorBoundary]', error);
  }

  reset = () => this.setState({hasError: false});

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={styles.root}>
        <View style={styles.dots}>
          {[Pastel.coral, Pastel.sky, Pastel.mint, Pastel.sun].map((c, i) => (
            <View key={i} style={[styles.dot, {backgroundColor: c}]} />
          ))}
        </View>
        <Text style={styles.title}>Oops!</Text>
        <Text style={styles.sub}>Something hiccuped. Your progress is safe.</Text>
        <TouchableOpacity style={styles.btn} activeOpacity={0.88} onPress={this.reset}>
          <Text style={styles.btnTxt}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Pastel.bg, alignItems: 'center', justifyContent: 'center', padding: 30},
  dots: {flexDirection: 'row', flexWrap: 'wrap', width: 76, gap: 8, justifyContent: 'center', marginBottom: 20},
  dot: {width: 34, height: 34, borderRadius: 17},
  title: {fontSize: 32, fontWeight: '900', color: Pastel.ink},
  sub: {fontSize: FontSize.md, color: Pastel.inkSoft, textAlign: 'center', marginTop: 8, marginBottom: 26},
  btn: {backgroundColor: Pastel.mint, paddingVertical: 15, paddingHorizontal: 40, borderRadius: 16},
  btnTxt: {color: '#fff', fontSize: FontSize.md, fontWeight: '900'},
});
