import React, {useMemo, useRef, useEffect} from 'react';
import {View, Text, StyleSheet, Dimensions, Animated} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {useSharedValue, runOnJS} from 'react-native-reanimated';
import {FlowLevel} from '../engine/types';
import {Paths} from '../engine/flowEngine';
import {FlowColors, Colors} from '../theme';
import {useSettingsStore} from '../store/settingsStore';

// Distinct glyph per color — used in Colorblind mode to tell pipes apart.
const CB_SYMBOL: Record<string, string> = {
  R:'✦', B:'■', G:'▲', Y:'●', O:'◆', P:'★', T:'✚', K:'⬟', N:'❖', W:'⬢',
};

interface Props {
  level:       FlowLevel;
  paths:       Paths;
  activeKey:   string | null;
  onDragStart: (r: number, c: number) => void;
  onDragMove:  (r: number, c: number) => void;
  onDragEnd:   () => void;
}

const SCREEN_W = Dimensions.get('window').width;
const PADDING  = 24;
const GAP      = 4;

function cellSize(n: number) {
  return Math.floor((SCREEN_W - PADDING * 2 - GAP * (n - 1)) / n);
}
function getColor(key: string) { return FlowColors[key] ?? '#888'; }

// ── Per-cell precomputed data ─────────────────────────────────────────────────
interface CellInfo {
  pathColor: string | null;
  endColor:  string | null;
  top: boolean; bottom: boolean; left: boolean; right: boolean;
  active: boolean;
}

// Single pass over all paths (O(total path cells)) instead of per-cell scans —
// keeps redraws cheap even while dragging fast on a 9×9 board.
function buildGrid(level: FlowLevel, paths: Paths, activeKey: string | null): CellInfo[][] {
  const N = level.gridSize;

  // endpoint lookup
  const endAt: (string | null)[][] = Array.from({length: N}, () => Array(N).fill(null));
  for (const dot of level.dots) {
    endAt[dot.from[0]][dot.from[1]] = dot.key;
    endAt[dot.to[0]][dot.to[1]]     = dot.key;
  }

  // path occupancy + neighbour links in one sweep
  const info: CellInfo[][] = Array.from({length: N}, (_, r) =>
    Array.from({length: N}, (_, c) => ({
      pathColor: null, endColor: endAt[r][c],
      top: false, bottom: false, left: false, right: false, active: false,
    })),
  );

  for (const [key, path] of Object.entries(paths)) {
    const active = key === activeKey;
    for (let i = 0; i < path.length; i++) {
      const [r, c] = path[i];
      const cell = info[r][c];
      cell.pathColor = key;
      cell.active = active;
      if (i > 0) {
        const [pr, pc] = path[i - 1];
        if (pr === r - 1) cell.top = true;
        else if (pr === r + 1) cell.bottom = true;
        else if (pc === c - 1) cell.left = true;
        else if (pc === c + 1) cell.right = true;
      }
      if (i < path.length - 1) {
        const [nr, nc] = path[i + 1];
        if (nr === r - 1) cell.top = true;
        else if (nr === r + 1) cell.bottom = true;
        else if (nc === c - 1) cell.left = true;
        else if (nc === c + 1) cell.right = true;
      }
    }
  }
  return info;
}

// ── Cell — only re-renders when its own data changes ─────────────────────────
const Cell = React.memo(
  function Cell({info, sz, cb, pulse}: {info: CellInfo; sz: number; cb: boolean; pulse: Animated.Value}) {
    const {pathColor, endColor, top, bottom, left, right, active} = info;
    const color = pathColor ? getColor(pathColor) : null;
    const PIPE  = Math.round(sz * 0.44);
    const DOT   = Math.round(sz * 0.66);
    const H     = Math.round(sz / 2);

    return (
      <View style={[s.cell, {width: sz, height: sz},
        active && color ? {backgroundColor: color + '18'} : null]}>
        {color && <>
          {top    && <View style={[s.abs, {top:0,    left:H-PIPE/2, width:PIPE, height:H+2,  backgroundColor:color}]}/>}
          {bottom && <View style={[s.abs, {bottom:0, left:H-PIPE/2, width:PIPE, height:H+2,  backgroundColor:color}]}/>}
          {left   && <View style={[s.abs, {left:0,   top:H-PIPE/2,  width:H+2,  height:PIPE, backgroundColor:color}]}/>}
          {right  && <View style={[s.abs, {right:0,  top:H-PIPE/2,  width:H+2,  height:PIPE, backgroundColor:color}]}/>}
          <View style={[s.abs,{left:H-PIPE/2,top:H-PIPE/2,width:PIPE,height:PIPE,borderRadius:PIPE/2,backgroundColor:color}]}/>
        </>}
        {endColor && (
          <Animated.View style={[s.abs, {
            left:(sz-DOT)/2, top:(sz-DOT)/2,
            width:DOT, height:DOT, borderRadius:DOT/2,
            backgroundColor:getColor(endColor), zIndex:2,
            alignItems:'center', justifyContent:'center',
            transform:[{scale: pulse}],
          }]}>
            {cb && (
              <Text style={{color:'#fff', fontSize:Math.round(DOT*0.5), fontWeight:'900'}}>
                {CB_SYMBOL[endColor] ?? ''}
              </Text>
            )}
          </Animated.View>
        )}
      </View>
    );
  },
  (prev, next) =>
    prev.sz === next.sz &&
    prev.cb === next.cb &&
    prev.pulse === next.pulse &&
    prev.info.pathColor === next.info.pathColor &&
    prev.info.endColor  === next.info.endColor  &&
    prev.info.top    === next.info.top    &&
    prev.info.bottom === next.info.bottom &&
    prev.info.left   === next.info.left   &&
    prev.info.right  === next.info.right  &&
    prev.info.active === next.info.active
);

// ── Grid ─────────────────────────────────────────────────────────────────────
export default function FlowGrid({level, paths, activeKey, onDragStart, onDragMove, onDragEnd}: Props) {
  const N  = level.gridSize;
  const sz = cellSize(N);
  const step = sz + GAP;
  const cb = useSettingsStore(s => s.colorblind);

  // Gentle endpoint-dot pulse so the board feels alive.
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {toValue: 1.12, duration: 720, useNativeDriver: true}),
        Animated.timing(pulse, {toValue: 1,    duration: 720, useNativeDriver: true}),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // ── Drag handling on the UI thread (gesture-handler worklets).
  // Touch coords are view-relative, and JS is only invoked when the finger
  // crosses into a NEW cell — not on every raw move event. This is what makes
  // the draw feel glassy instead of janky.
  const lastCell = useSharedValue(-1);

  const pan = useMemo(() => Gesture.Pan()
    .minDistance(0)
    .maxPointers(1)
    .onBegin(e => {
      'worklet';
      const col = Math.floor(e.x / step);
      const row = Math.floor(e.y / step);
      if (row >= 0 && row < N && col >= 0 && col < N) {
        lastCell.value = row * 64 + col;
        runOnJS(onDragStart)(row, col);
      } else {
        lastCell.value = -1;
      }
    })
    .onUpdate(e => {
      'worklet';
      const col = Math.floor(e.x / step);
      const row = Math.floor(e.y / step);
      if (row < 0 || row >= N || col < 0 || col >= N) return;
      const key = row * 64 + col;
      if (key === lastCell.value) return;
      lastCell.value = key;
      runOnJS(onDragMove)(row, col);
    })
    .onFinalize(() => {
      'worklet';
      lastCell.value = -1;
      runOnJS(onDragEnd)();
    }), [step, N, onDragStart, onDragMove, onDragEnd]);

  const grid = useMemo(
    () => buildGrid(level, paths, activeKey),
    [level, paths, activeKey],
  );

  const gridW = N * sz + (N - 1) * GAP;

  return (
    <GestureDetector gesture={pan}>
      <View style={[s.grid, {width: gridW}]}>
        {grid.map((row, r) => (
          <View key={r} style={s.row}>
            {row.map((info, c) => (
              <Cell key={c} info={info} sz={sz} cb={cb} pulse={pulse} />
            ))}
          </View>
        ))}
      </View>
    </GestureDetector>
  );
}

const s = StyleSheet.create({
  grid: {gap: GAP, alignSelf: 'center'},
  row:  {flexDirection: 'row', gap: GAP},
  cell: {
    backgroundColor: Colors.cellEmpty,
    borderRadius: 9,
    overflow: 'hidden',
  },
  abs: {position: 'absolute'},
});
