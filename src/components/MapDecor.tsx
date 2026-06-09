import React from 'react';
import {StyleSheet} from 'react-native';
import Svg, {Circle, Path, Rect, G} from 'react-native-svg';

type Props = {width: number; height: number; tint: string};

// Decorative SVG scattered down the journey map — leaves, sparkles, pebbles.
// Cheap vector ornaments that give the map a hand-illustrated feel.
export default function MapDecor({width, height, tint}: Props) {
  // Seeded-ish scatter based on height so it fills the scroll.
  const items: React.ReactNode[] = [];
  const rows = Math.ceil(height / 220);
  for (let i = 0; i < rows; i++) {
    const y = 120 + i * 220;
    const leftSide = i % 2 === 0;
    const x = leftSide ? width * 0.12 : width * 0.86;
    const kind = i % 3;
    if (kind === 0) {
      // sparkle (4-point star)
      items.push(
        <Path key={`s${i}`} d={`M ${x} ${y-14} L ${x+4} ${y-4} L ${x+14} ${y} L ${x+4} ${y+4} L ${x} ${y+14} L ${x-4} ${y+4} L ${x-14} ${y} L ${x-4} ${y-4} Z`}
          fill={tint} opacity={0.18} />,
      );
    } else if (kind === 1) {
      // leaf
      items.push(
        <Path key={`l${i}`} d={`M ${x} ${y} Q ${x+18} ${y-18} ${x+30} ${y} Q ${x+18} ${y+18} ${x} ${y} Z`}
          fill={tint} opacity={0.16} />,
      );
    } else {
      // pebbles
      items.push(
        <G key={`p${i}`} opacity={0.15}>
          <Circle cx={x} cy={y} r={9} fill={tint} />
          <Circle cx={x + 16} cy={y + 6} r={6} fill={tint} />
        </G>,
      );
    }
    // small accent square on the opposite side
    items.push(
      <Rect key={`r${i}`} x={leftSide ? width * 0.84 : width * 0.08} y={y + 60}
        width={12} height={12} rx={3} fill={tint} opacity={0.12}
        transform={`rotate(${i * 25} ${leftSide ? width * 0.84 + 6 : width * 0.08 + 6} ${y + 66})`} />,
    );
  }

  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none" width={width} height={height}>
      {items}
    </Svg>
  );
}
