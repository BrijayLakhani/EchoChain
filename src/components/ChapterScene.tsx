import React from 'react';
import {StyleSheet} from 'react-native';
import Svg, {
  Defs, LinearGradient, RadialGradient, Stop, Rect, Circle, Ellipse, Path, G,
} from 'react-native-svg';

export type Theme = 'meadow' | 'river' | 'amber' | 'twilight' | 'peak';

type Props = {width: number; height: number; theme: Theme};

// Illustrated SVG backdrop for one chapter section — a small themed scene.
// Stylised (not photoreal) but gives the journey a rich, hand-drawn feel.
export default function ChapterScene({width, height, theme}: Props) {
  const W = width, H = height;
  return (
    <Svg style={StyleSheet.absoluteFill} width={W} height={H} pointerEvents="none">
      <Defs>
        <LinearGradient id={`sky_${theme}`} x1="0" y1="0" x2="0" y2="1">
          {SKY[theme].map((c, i) => (
            <Stop key={i} offset={`${(i / (SKY[theme].length - 1)) * 100}%`} stopColor={c} />
          ))}
        </LinearGradient>
        <RadialGradient id={`glow_${theme}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={GLOW[theme]} stopOpacity={0.55} />
          <Stop offset="100%" stopColor={GLOW[theme]} stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {/* sky */}
      <Rect x={0} y={0} width={W} height={H} fill={`url(#sky_${theme})`} />

      {theme === 'meadow' && <Meadow W={W} H={H} />}
      {theme === 'river'   && <River   W={W} H={H} />}
      {theme === 'amber'   && <Amber   W={W} H={H} />}
      {theme === 'twilight'&& <Twilight W={W} H={H} />}
      {theme === 'peak'    && <Peak    W={W} H={H} />}
    </Svg>
  );
}

const SKY: Record<Theme, string[]> = {
  meadow:  ['#CDEFFB', '#E8F7E4'],
  river:   ['#D5EEFB', '#BFE3F5'],
  amber:   ['#FCE9CF', '#FBD9A8'],
  twilight:['#4A4170', '#7E6BA8'],
  peak:    ['#3A2C3E', '#6E4A52'],
};
const GLOW: Record<Theme, string> = {
  meadow: '#FFE9A8', river: '#FFF4C2', amber: '#FFD27A', twilight: '#FFF6D8', peak: '#FF7A4D',
};

function Sun({W, x = 0.78, y = 0.16, r = 0.12, theme}: any) {
  return (
    <>
      <Circle cx={W * x} cy={W * y} r={W * r * 2.2} fill={`url(#glow_${theme})`} />
      <Circle cx={W * x} cy={W * y} r={W * r} fill="#FFE08A" />
    </>
  );
}

function Hills({W, H, base, colors}: {W: number; H: number; base: number; colors: string[]}) {
  // a few overlapping rounded hills along the bottom
  return (
    <G>
      {colors.map((c, i) => {
        const y = base + i * 12;
        return (
          <Path key={i}
            d={`M0 ${y} Q ${W * 0.25} ${y - 60 - i * 8} ${W * 0.5} ${y} T ${W} ${y} L ${W} ${H} L 0 ${H} Z`}
            fill={c} opacity={0.9} />
        );
      })}
    </G>
  );
}

function Cloud({W, x, y, s = 1, c = '#FFFFFF'}: any) {
  return (
    <G opacity={0.85}>
      <Ellipse cx={W * x} cy={W * y} rx={28 * s} ry={16 * s} fill={c} />
      <Ellipse cx={W * x + 22 * s} cy={W * y + 4 * s} rx={20 * s} ry={13 * s} fill={c} />
      <Ellipse cx={W * x - 22 * s} cy={W * y + 4 * s} rx={18 * s} ry={12 * s} fill={c} />
    </G>
  );
}

function Meadow({W, H}: any) {
  return (
    <>
      <Sun W={W} theme="meadow" />
      <Cloud W={W} x={0.22} y={0.12} s={1} />
      <Cloud W={W} x={0.55} y={0.22} s={0.7} />
      <Hills W={W} H={H} base={H - 90} colors={['#A7DCA0', '#7FC97F', '#5FB36A']} />
    </>
  );
}

function River({W, H}: any) {
  return (
    <>
      <Sun W={W} x={0.2} y={0.14} theme="river" />
      <Cloud W={W} x={0.7} y={0.12} s={0.9} />
      <Hills W={W} H={H} base={H - 120} colors={['#9FD6A4', '#7BC689']} />
      {/* water band */}
      <Rect x={0} y={H - 70} width={W} height={70} fill="#5FB8E8" opacity={0.9} />
      <Path d={`M0 ${H - 70} Q ${W * 0.5} ${H - 86} ${W} ${H - 70} L ${W} ${H - 60} Q ${W * 0.5} ${H - 76} 0 ${H - 60} Z`} fill="#8FD0F0" />
    </>
  );
}

function Amber({W, H}: any) {
  return (
    <>
      <Sun W={W} x={0.8} y={0.18} r={0.1} theme="amber" />
      <Hills W={W} H={H} base={H - 90} colors={['#F0B36B', '#E0934A', '#C9783A']} />
      {/* falling leaves */}
      {[[0.2, 0.3], [0.5, 0.18], [0.75, 0.4], [0.35, 0.5]].map(([x, y], i) => (
        <Path key={i} d={`M ${W * x} ${W * y} q 10 -10 18 0 q -8 10 -18 0 Z`} fill="#D9622E" opacity={0.7} />
      ))}
    </>
  );
}

function Twilight({W, H}: any) {
  return (
    <>
      <Circle cx={W * 0.74} cy={W * 0.16} r={W * 0.22} fill={`url(#glow_twilight)`} />
      <Circle cx={W * 0.74} cy={W * 0.16} r={W * 0.09} fill="#FBF3D0" />
      {/* stars */}
      {[[0.15, 0.1], [0.3, 0.22], [0.5, 0.12], [0.62, 0.26], [0.88, 0.3], [0.2, 0.32]].map(([x, y], i) => (
        <Circle key={i} cx={W * x} cy={W * y} r={2.4} fill="#FFFFFF" opacity={0.9} />
      ))}
      <Hills W={W} H={H} base={H - 80} colors={['#5B4E84', '#463B6B']} />
    </>
  );
}

function Peak({W, H}: any) {
  return (
    <>
      <Circle cx={W * 0.5} cy={H - 70} r={W * 0.5} fill={`url(#glow_peak)`} />
      {/* mountains */}
      <Path d={`M0 ${H} L ${W * 0.3} ${H - 150} L ${W * 0.5} ${H} Z`} fill="#5A3A44" />
      <Path d={`M ${W * 0.45} ${H} L ${W * 0.72} ${H - 180} L ${W} ${H} Z`} fill="#6E4651" />
      {/* embers */}
      {[[0.4, 0.5], [0.6, 0.4], [0.7, 0.6], [0.5, 0.62]].map(([x, y], i) => (
        <Circle key={i} cx={W * x} cy={H * y} r={2.5} fill="#FF8A4D" opacity={0.8} />
      ))}
    </>
  );
}
