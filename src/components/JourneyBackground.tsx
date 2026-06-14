import React from 'react';
import Svg, {
  Defs, LinearGradient, RadialGradient, Stop, Rect, Circle, Ellipse, Path, G,
} from 'react-native-svg';

type Props = {width: number; height: number};

// One <Svg> spanning the full journey height rasterizes to a bitmap of
// width*height*4 bytes — for 100 levels that's >100 MB and Android aborts with
// "trying to draw too large bitmap". So we slice the world into vertical tiles,
// each its own small <Svg> clipped to its band via viewBox.
const TILE = 1200;

type El = {y: number; node: React.ReactNode};

// Cohesive illustrated "saga map" landscape — sky, layered rolling hills, trees,
// bushes, clouds — flowing the whole scroll (Candy-Crush style).
export default function JourneyBackground({width: W, height: H}: Props) {
  const rnd = (seed: number) => {
    const x = Math.sin(seed * 99.13) * 43758.5453;
    return x - Math.floor(x);
  };

  const els: El[] = [];

  // Rolling hill ridges down the whole height (3 parallax layers).
  const STEP = 360;
  const rows = Math.ceil(H / STEP) + 1;
  for (let i = 0; i < rows; i++) {
    const y = i * STEP + 140;
    els.push(
      {y, node: <Path key={`hb${i}`} d={hill(W, y, 120, 0.0, 1)} fill="#BFE3C4" opacity={0.7} />},
      {y, node: <Path key={`hm${i}`} d={hill(W, y + 70, 100, 1.7, 0.8)} fill="#9BD4A2" />},
      {y, node: <Path key={`hf${i}`} d={hill(W, y + 150, 90, 3.4, 1.2)} fill="#7FC98A" />},
    );
  }

  // Trees + bushes nestled along the hills.
  const frows = Math.ceil(H / 150);
  for (let i = 0; i < frows; i++) {
    const y = i * 150 + 120;
    const r = rnd(i + 1);
    const x = r < 0.5 ? W * (0.08 + r * 0.18) : W * (0.74 + (r - 0.5) * 0.36);
    if (i % 3 === 0)      els.push({y, node: <Pine key={`t${i}`} x={x} y={y} s={0.9 + rnd(i) * 0.5} />});
    else if (i % 3 === 1) els.push({y, node: <Bush key={`b${i}`} x={x} y={y} s={0.8 + rnd(i * 2) * 0.6} />});
    else                  els.push({y, node: <Flower key={`f${i}`} x={x} y={y} c={FLOWER[i % FLOWER.length]} />});
  }

  // Clouds in the upper bands of each screen-height.
  const crows = Math.ceil(H / 520);
  for (let i = 0; i < crows; i++) {
    const y = i * 520 + 70;
    els.push({y, node: <Cloud key={`c${i}`} x={W * (0.2 + rnd(i + 7) * 0.6)} y={y} s={0.8 + rnd(i) * 0.5} />});
    els.push({y: y + 180, node: <Cloud key={`c2${i}`} x={W * (0.1 + rnd(i + 3) * 0.7)} y={y + 180} s={0.6 + rnd(i + 1) * 0.4} />});
  }

  const tiles = Math.ceil(H / TILE);
  return (
    <>
      {Array.from({length: tiles}).map((_, t) => {
        const y0 = t * TILE;
        const th = Math.min(TILE, H - y0);
        // pad so elements straddling a seam still draw on both tiles
        const lo = y0 - 260, hi = y0 + th + 260;
        return (
          <Svg
            key={t}
            style={{position: 'absolute', left: 0, top: y0, width: W, height: th}}
            width={W} height={th} viewBox={`0 ${y0} ${W} ${th}`} pointerEvents="none">
            <Defs>
              {/* userSpaceOnUse + global y2=H so every tile samples the SAME
                  full-height gradient (no repeating blue band per tile) */}
              <LinearGradient id="sky" x1="0" y1="0" x2="0" y2={H} gradientUnits="userSpaceOnUse">
                <Stop offset="0%"  stopColor="#BCE6F7" />
                <Stop offset="14%" stopColor="#CFEFF0" />
                <Stop offset="28%" stopColor="#E3F4DC" />
                <Stop offset="40%" stopColor="#EAF6DD" />
                <Stop offset="100%" stopColor="#EAF6DD" />
              </LinearGradient>
              <RadialGradient id="sun" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#FFF3C4" stopOpacity={0.9} />
                <Stop offset="100%" stopColor="#FFF3C4" stopOpacity={0} />
              </RadialGradient>
            </Defs>

            <Rect x={0} y={y0} width={W} height={th} fill="url(#sky)" />

            {/* sun glow only lives in the first band */}
            {t === 0 && <Circle cx={W * 0.82} cy={90} r={150} fill="url(#sun)" />}
            {t === 0 && <Circle cx={W * 0.82} cy={90} r={36} fill="#FFE27A" />}

            {els.filter(e => e.y >= lo && e.y <= hi).map(e => e.node)}
          </Svg>
        );
      })}
    </>
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
