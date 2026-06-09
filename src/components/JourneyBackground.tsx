import React from 'react';
import {StyleSheet} from 'react-native';
import Svg, {
  Defs, LinearGradient, RadialGradient, Stop, Rect, Circle, Ellipse, Path, G,
} from 'react-native-svg';

type Props = {width: number; height: number};

// Cohesive illustrated "saga map" landscape — one lush valley world flowing the
// whole scroll: sky → layered rolling hills → meadow with trees, bushes, clouds,
// a pond and flowers. Flat-design, hand-illustrated feel (Candy-Crush style).
export default function JourneyBackground({width: W, height: H}: Props) {
  // Deterministic scatter helpers (index-seeded, stable across renders).
  const rnd = (seed: number) => {
    const x = Math.sin(seed * 99.13) * 43758.5453;
    return x - Math.floor(x);
  };

  // Rolling hill ridges down the whole height (3 parallax layers).
  const ridges: React.ReactNode[] = [];
  const STEP = 360;
  const rows = Math.ceil(H / STEP) + 1;
  for (let i = 0; i < rows; i++) {
    const y = i * STEP + 140;
    ridges.push(
      <Path key={`hb${i}`} d={hill(W, y, 120, 0.0, 1)} fill="#BFE3C4" opacity={0.7} />,
      <Path key={`hm${i}`} d={hill(W, y + 70, 100, 1.7, 0.8)} fill="#9BD4A2" />,
      <Path key={`hf${i}`} d={hill(W, y + 150, 90, 3.4, 1.2)} fill="#7FC98A" />,
    );
  }

  // Trees + bushes nestled along the hills.
  const flora: React.ReactNode[] = [];
  const frows = Math.ceil(H / 150);
  for (let i = 0; i < frows; i++) {
    const y = i * 150 + 120;
    const r = rnd(i + 1);
    const x = r < 0.5 ? W * (0.08 + r * 0.18) : W * (0.74 + (r - 0.5) * 0.36);
    if (i % 3 === 0)      flora.push(<Pine key={`t${i}`} x={x} y={y} s={0.9 + rnd(i) * 0.5} />);
    else if (i % 3 === 1) flora.push(<Bush key={`b${i}`} x={x} y={y} s={0.8 + rnd(i * 2) * 0.6} />);
    else                  flora.push(<Flower key={`f${i}`} x={x} y={y} c={FLOWER[i % FLOWER.length]} />);
  }

  // Clouds drifting in the upper bands of each screen-height.
  const clouds: React.ReactNode[] = [];
  const crows = Math.ceil(H / 520);
  for (let i = 0; i < crows; i++) {
    const y = i * 520 + 70;
    clouds.push(<Cloud key={`c${i}`} x={W * (0.2 + rnd(i + 7) * 0.6)} y={y} s={0.8 + rnd(i) * 0.5} />);
    clouds.push(<Cloud key={`c2${i}`} x={W * (0.1 + rnd(i + 3) * 0.7)} y={y + 180} s={0.6 + rnd(i + 1) * 0.4} />);
  }

  return (
    <Svg style={StyleSheet.absoluteFill} width={W} height={H} pointerEvents="none">
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%"  stopColor="#BCE6F7" />
          <Stop offset="35%" stopColor="#CFEFF0" />
          <Stop offset="70%" stopColor="#E3F4DC" />
          <Stop offset="100%" stopColor="#EAF6DD" />
        </LinearGradient>
        <RadialGradient id="sun" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFF3C4" stopOpacity={0.9} />
          <Stop offset="100%" stopColor="#FFF3C4" stopOpacity={0} />
        </RadialGradient>
      </Defs>

      <Rect x={0} y={0} width={W} height={H} fill="url(#sky)" />

      {/* soft sun glow top-right */}
      <Circle cx={W * 0.82} cy={90} r={150} fill="url(#sun)" />
      <Circle cx={W * 0.82} cy={90} r={36} fill="#FFE27A" />

      {ridges}
      {flora}
      {clouds}
    </Svg>
  );
}

// A smooth rolling hill band spanning the width at baseline y.
function hill(W: number, y: number, amp: number, phase: number, freq: number) {
  const seg = 4;
  let d = `M 0 ${y}`;
  for (let s = 1; s <= seg; s++) {
    const x = (W / seg) * s;
    const cx = x - W / seg / 2;
    const cy = y + Math.sin(s * freq + phase) * amp - amp * 0.4;
    d += ` Q ${cx} ${cy}, ${x} ${y + Math.sin(s * freq + phase) * amp * 0.3}`;
  }
  d += ` L ${W} ${y + 600} L 0 ${y + 600} Z`;
  return d;
}

const FLOWER = ['#FF7B9C', '#FFC24B', '#FF8FC8', '#9B7BE8', '#FF6B6B'];

function Pine({x, y, s}: {x: number; y: number; s: number}) {
  const h = 38 * s, w = 24 * s;
  return (
    <G>
      <Rect x={x - 3 * s} y={y} width={6 * s} height={10 * s} fill="#9A6B3F" rx={2} />
      <Path d={`M ${x} ${y - h} L ${x + w} ${y + 4} L ${x - w} ${y + 4} Z`} fill="#4E9E5E" />
      <Path d={`M ${x} ${y - h * 0.55} L ${x + w * 0.8} ${y - 2} L ${x - w * 0.8} ${y - 2} Z`} fill="#5DB06C" />
    </G>
  );
}

function Bush({x, y, s}: {x: number; y: number; s: number}) {
  return (
    <G>
      <Ellipse cx={x} cy={y} rx={26 * s} ry={18 * s} fill="#6FBF7C" />
      <Ellipse cx={x - 16 * s} cy={y + 4 * s} rx={16 * s} ry={13 * s} fill="#7FC98A" />
      <Ellipse cx={x + 16 * s} cy={y + 4 * s} rx={16 * s} ry={13 * s} fill="#7FC98A" />
    </G>
  );
}

function Flower({x, y, c}: {x: number; y: number; c: string}) {
  const petals = [0, 1, 2, 3, 4];
  return (
    <G>
      {petals.map(p => {
        const a = (p / 5) * Math.PI * 2;
        return <Circle key={p} cx={x + Math.cos(a) * 7} cy={y + Math.sin(a) * 7} r={5} fill={c} />;
      })}
      <Circle cx={x} cy={y} r={4} fill="#FFE27A" />
    </G>
  );
}

function Cloud({x, y, s}: {x: number; y: number; s: number}) {
  return (
    <G opacity={0.92}>
      <Ellipse cx={x} cy={y} rx={34 * s} ry={20 * s} fill="#FFFFFF" />
      <Ellipse cx={x + 26 * s} cy={y + 5 * s} rx={24 * s} ry={16 * s} fill="#FFFFFF" />
      <Ellipse cx={x - 26 * s} cy={y + 5 * s} rx={22 * s} ry={15 * s} fill="#FFFFFF" />
      <Ellipse cx={x} cy={y + 9 * s} rx={40 * s} ry={14 * s} fill="#FFFFFF" />
    </G>
  );
}
