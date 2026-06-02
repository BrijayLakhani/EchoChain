import {FlowLevel, FlowDot} from './types';

export type Path = [number, number][];
export type Paths = Record<string, Path>;

export function isEndpoint(level: FlowLevel, row: number, col: number): string | null {
  for (const dot of level.dots) {
    if ((dot.from[0] === row && dot.from[1] === col) ||
        (dot.to[0]   === row && dot.to[1]   === col)) {
      return dot.key;
    }
  }
  return null;
}

export function getPathColor(paths: Paths, row: number, col: number): string | null {
  for (const [key, path] of Object.entries(paths)) {
    if (path.some(([r, c]) => r === row && c === col)) return key;
  }
  return null;
}

export function isAdjacent(a: [number,number], b: [number,number]): boolean {
  return Math.abs(a[0]-b[0]) + Math.abs(a[1]-b[1]) === 1;
}

export function isComplete(level: FlowLevel, paths: Paths): boolean {
  const size = level.gridSize;
  let covered = 0;
  for (const path of Object.values(paths)) covered += path.length;
  if (covered !== size * size) return false;

  for (const dot of level.dots) {
    const path = paths[dot.key];
    if (!path || path.length < 2) return false;
    const first = path[0];
    const last  = path[path.length - 1];
    const a = dot.from, b = dot.to;
    const ok = (first[0]===a[0]&&first[1]===a[1]&&last[0]===b[0]&&last[1]===b[1]) ||
               (first[0]===b[0]&&first[1]===b[1]&&last[0]===a[0]&&last[1]===a[1]);
    if (!ok) return false;
  }
  return true;
}

export function pathContains(path: Path, row: number, col: number): number {
  return path.findIndex(([r, c]) => r === row && c === col);
}
