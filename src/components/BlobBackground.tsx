import React from 'react';
import {StyleSheet, Dimensions} from 'react-native';
import Svg, {Circle, Defs, RadialGradient, Stop} from 'react-native-svg';
import {Pastel} from '../theme';

const {width: W, height: H} = Dimensions.get('window');

// Soft decorative blobs behind menu content — gives the flat screen depth,
// Two-Dots-style ambient richness. Pure SVG, cheap, static.
const BLOBS = [
  {cx: W * 0.18, cy: H * 0.12, r: W * 0.34, c: Pastel.coral, o: 0.14},
  {cx: W * 0.92, cy: H * 0.18, r: W * 0.40, c: Pastel.sky,   o: 0.13},
  {cx: W * 0.85, cy: H * 0.62, r: W * 0.46, c: Pastel.sun,   o: 0.13},
  {cx: W * 0.10, cy: H * 0.72, r: W * 0.42, c: Pastel.mint,  o: 0.14},
  {cx: W * 0.55, cy: H * 0.92, r: W * 0.38, c: Pastel.grape, o: 0.12},
];

export default function BlobBackground() {
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        {BLOBS.map((b, i) => (
          <RadialGradient key={i} id={`g${i}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={b.c} stopOpacity={b.o} />
            <Stop offset="100%" stopColor={b.c} stopOpacity={0} />
          </RadialGradient>
        ))}
      </Defs>
      {BLOBS.map((b, i) => (
        <Circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill={`url(#g${i})`} />
      ))}
    </Svg>
  );
}
