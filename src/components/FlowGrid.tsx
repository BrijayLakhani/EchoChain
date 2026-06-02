import React, {useRef, useMemo} from 'react';
import {View, StyleSheet, Dimensions, PanResponder} from 'react-native';
import {FlowLevel} from '../engine/types';
import {Paths, getPathColor, isEndpoint, pathContains} from '../engine/flowEngine';
import {FlowColors, Colors} from '../theme';

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

function buildGrid(level: FlowLevel, paths: Paths, activeKey: string | null): CellInfo[][] {
  const N = level.gridSize;
  return Array.from({length: N}, (_, r) =>
    Array.from({length: N}, (_, c) => {
      const endColor  = isEndpoint(level, r, c);
      const pathColor = getPathColor(paths, r, c);
      if (!pathColor) {
        return {pathColor: null, endColor, top:false, bottom:false, left:false, right:false, active:false};
      }
      const path = paths[pathColor] || [];
      const idx  = pathContains(path, r, c);
      const prev = idx > 0                        ? path[idx - 1] : null;
      const next = idx >= 0 && idx < path.length - 1 ? path[idx + 1] : null;
      const has  = (p: typeof prev, dr: number, dc: number) =>
        !!(p && p[0] === r + dr && p[1] === c + dc);
      return {
        pathColor,
        endColor,
        top:    has(prev,-1,0) || has(next,-1,0),
        bottom: has(prev, 1,0) || has(next, 1,0),
        left:   has(prev, 0,-1) || has(next, 0,-1),
        right:  has(prev, 0, 1) || has(next, 0, 1),
        active: pathColor === activeKey,
      };
    })
  );
}

// ── Cell — only re-renders when its own data changes ─────────────────────────
const Cell = React.memo(
  function Cell({info, sz}: {info: CellInfo; sz: number}) {
    const {pathColor, endColor, top, bottom, left, right, active} = info;
    const color = pathColor ? getColor(pathColor) : null;
    const PIPE  = Math.round(sz * 0.38);
    const DOT   = Math.round(sz * 0.58);
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
          <View style={[s.abs, {
            left:(sz-DOT)/2, top:(sz-DOT)/2,
            width:DOT, height:DOT, borderRadius:DOT/2,
            backgroundColor:getColor(endColor), zIndex:2,
          }]}/>
        )}
      </View>
    );
  },
  (prev, next) =>
    prev.sz === next.sz &&
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

  // ── Refs — the PanResponder reads these so it's always up-to-date
  //    even though the PanResponder object itself is created only once.
  const stepRef  = useRef(step);  stepRef.current  = step;
  const nRef     = useRef(N);     nRef.current     = N;
  const startRef = useRef(onDragStart); startRef.current = onDragStart;
  const moveRef  = useRef(onDragMove);  moveRef.current  = onDragMove;
  const endRef   = useRef(onDragEnd);   endRef.current   = onDragEnd;

  // Absolute screen position of this grid view, set via measure() on layout.
  const gridRef = useRef<View>(null);
  const gx      = useRef(0);
  const gy      = useRef(0);
  const lastKey = useRef('');

  // Convert absolute screen coord → "row,col" string. Returns null if outside grid.
  // Reads only from refs — safe to call from a stale closure inside PanResponder.
  function toKey(absX: number, absY: number): string | null {
    const col = Math.floor((absX - gx.current) / stepRef.current);
    const row = Math.floor((absY - gy.current) / stepRef.current);
    if (col >= 0 && col < nRef.current && row >= 0 && row < nRef.current) {
      return `${row},${col}`;
    }
    return null;
  }

  // PanResponder — created once, uses only refs internally.
  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder:  () => true,

    onPanResponderGrant: (evt) => {
      const {pageX, pageY} = evt.nativeEvent;
      lastKey.current = '';
      const key = toKey(pageX, pageY);
      if (!key) return;
      lastKey.current = key;
      const [r, c] = key.split(',').map(Number);
      startRef.current(r, c);
    },

    onPanResponderMove: (_evt, gs) => {
      // gs.moveX/Y = current absolute finger position on screen
      const key = toKey(gs.moveX, gs.moveY);
      if (!key || key === lastKey.current) return;
      lastKey.current = key;
      const [r, c] = key.split(',').map(Number);
      moveRef.current(r, c);
    },

    onPanResponderRelease:   () => { lastKey.current = ''; endRef.current(); },
    onPanResponderTerminate: () => { lastKey.current = ''; endRef.current(); },
  })).current;

  // Measure the grid's absolute screen position after it lays out.
  function onLayout() {
    gridRef.current?.measure((_x, _y, _w, _h, px, py) => {
      gx.current = px;
      gy.current = py;
    });
  }

  // Precompute display data — only recomputed when paths or activeKey change.
  // Each cell gets a simple object; Cell's custom memo comparator avoids
  // re-rendering cells whose data hasn't changed.
  const grid = useMemo(
    () => buildGrid(level, paths, activeKey),
    [level, paths, activeKey]
  );

  const gridW = N * sz + (N - 1) * GAP;

  return (
    <View
      ref={gridRef}
      onLayout={onLayout}
      {...pan.panHandlers}
      style={[s.grid, {width: gridW}]}>
      {grid.map((row, r) => (
        <View key={r} style={s.row}>
          {row.map((info, c) => (
            <Cell key={c} info={info} sz={sz} />
          ))}
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  grid: {gap: GAP, alignSelf: 'center'},
  row:  {flexDirection: 'row', gap: GAP},
  cell: {
    backgroundColor: Colors.cellEmpty,
    borderRadius: 7,
    overflow: 'hidden',
  },
  abs: {position: 'absolute'},
});
