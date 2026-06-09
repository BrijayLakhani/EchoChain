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

// Find the actual drawable path for one color by walking a Hamiltonian path
// through that color's cells in the solution grid, from `from` to `to`.
// Region sizes are small (≤ ~14 cells) so DFS is plenty fast.
export function solvePipePath(level: FlowLevel, key: string): Path | null {
  const n = level.gridSize;
  const cells = new Set<number>();
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      if (level.solution[r][c] === key) cells.add(r * n + c);

  const dot = level.dots.find(d => d.key === key);
  if (!dot) return null;
  const start = dot.from, goal = dot.to;
  const total = cells.size;
  const visited = new Set<number>();
  const path: Path = [];

  const dfs = (r: number, c: number): boolean => {
    const id = r * n + c;
    visited.add(id);
    path.push([r, c]);
    if (r === goal[0] && c === goal[1]) {
      if (path.length === total) return true;
    } else {
      for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]] as const) {
        const nr = r + dr, nc = c + dc, nid = nr * n + nc;
        if (cells.has(nid) && !visited.has(nid)) {
          if (dfs(nr, nc)) return true;
        }
      }
    }
    visited.delete(id);
    path.pop();
    return false;
  };

  return dfs(start[0], start[1]) ? path : null;
}

export function calcStars(moves: number, gridSize: number): number {
  const cells = gridSize * gridSize;
  if (moves <= Math.ceil(cells * 1.2)) return 3;
  if (moves <= Math.ceil(cells * 2.2)) return 2;
  return 1;
}
