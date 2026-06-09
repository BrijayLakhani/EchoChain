// Warm cream palette — inspired by 2048's off-white + Elementaries' rich accents.
// Nothing dark-purple, nothing "AI default navy".

export const Colors = {
  // Backgrounds
  bg:       '#F5F0E8',   // warm cream
  bgCard:   '#EDE7DC',   // slightly darker cream
  bgInput:  '#E3DDD3',   // input / cell background
  bgHeader: '#EDE7DC',   // header matches card

  // Grid
  gridLine: '#C8C0B4',   // warm tan grid borders
  cellEmpty:'#E3DDD3',   // empty cell fill

  // Text
  textPrimary:   '#3D352E',  // dark warm brown
  textSecondary: '#7A6F65',  // medium brown
  textDim:       '#A89E94',  // light brown
  textOnDark:    '#F5F0E8',  // cream on dark bg

  // Borders
  border:     '#C8C0B4',
  borderDark: '#A89E94',

  // Overlay
  overlay: 'rgba(61,53,46,0.72)',

  // Misc
  white: '#FFFFFF',
  black: '#1A1208',
};

// Dot/pipe colors — saturated, distinct, colorblind-considerate.
// Inspired by Elementaries triadic + Juicy Match saturation approach.
export const FlowColors: Record<string, string> = {
  R: '#D94F3D',   // warm red
  B: '#3D7DC8',   // medium blue
  G: '#4CAF7D',   // fresh green
  Y: '#E8B84B',   // warm amber
  O: '#E8772E',   // orange
  P: '#8B5CF6',   // purple
  T: '#2AAAB5',   // teal
  K: '#D63E8A',   // magenta-pink
  N: '#5D7A2E',   // olive green
  W: '#6B4EB8',   // indigo
};

// Playful pastel palette — soft, rounded, friendly (Two-Dots inspired).
export const Pastel = {
  bg:        '#FBF7F0',   // warm off-white
  bgAlt:     '#F3ECE0',   // panel
  card:      '#FFFFFF',
  cardAlt:   '#F7F1E8',

  ink:       '#2E2A3A',   // primary text (soft near-black plum)
  inkSoft:   '#6C6680',   // secondary
  inkDim:    '#A9A2B8',   // tertiary

  // candy accents
  mint:      '#5CC9A7',
  sky:       '#5BA9F0',
  coral:     '#FF7B6B',
  sun:       '#FFC24B',
  grape:     '#9B7BE8',
  bubble:    '#FF8FC8',
  teal:      '#2FC4C9',

  heart:     '#FF5A6E',   // lives
  coin:      '#FFC24B',   // coins
  shadow:    '#2E2A3A',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  full: 999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
};
