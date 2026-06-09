module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // react-native-worklets/plugin powers Reanimated 4 — must be the LAST plugin.
  plugins: ['react-native-worklets/plugin'],
};
