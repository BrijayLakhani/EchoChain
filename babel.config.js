module.exports = api => {
  const isProd = api.env('production');
  api.cache(true);

  const plugins = [];
  // Strip console.* from release bundles (keeps logs out of production).
  if (isProd) plugins.push('transform-remove-console');
  // react-native-worklets/plugin powers Reanimated 4 — must always be LAST.
  plugins.push('react-native-worklets/plugin');

  return {
    presets: ['module:@react-native/babel-preset'],
    plugins,
  };
};
