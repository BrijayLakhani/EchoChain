import {create} from 'zustand';
import {FlowLevel} from '../engine/types';
import {
  Paths, Path,
  isEndpoint, getPathColor, isAdjacent, isComplete, pathContains,
} from '../engine/flowEngine';

interface GameState {
  level: FlowLevel | null;
  paths: Paths;
  activeKey: string | null;
  moves: number;
  isWon: boolean;

  startLevel: (level: FlowLevel) => void;
  // Drag gesture handlers
  startDraw: (row: number, col: number) => void;
  continueDraw: (row: number, col: number) => void;
  endDraw: () => void;
  resetLevel: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  level: null,
  paths: {},
  activeKey: null,
  moves: 0,
  isWon: false,

  startLevel: (level) => set({
    level,
    paths: {},
    activeKey: null,
    moves: 0,
    isWon: false,
  }),

  resetLevel: () => {
    const {level} = get();
    if (level) set({paths: {}, activeKey: null, moves: 0, isWon: false});
  },

  // Called when finger touches down
  startDraw: (row, col) => {
    const {level, paths} = get();
    if (!level) return;

    const tapKey    = isEndpoint(level, row, col);
    const occupyKey = getPathColor(paths, row, col);

    if (tapKey !== null) {
      // Touch started on an endpoint → begin drawing that color from scratch
      const newPaths = {...paths};
      delete newPaths[tapKey];
      newPaths[tapKey] = [[row, col]];
      set({paths: newPaths, activeKey: tapKey, moves: get().moves + 1});
    } else if (occupyKey !== null) {
      // Touch started on an existing path cell → resume from that cell
      const path = paths[occupyKey] || [];
      const idx  = pathContains(path, row, col);
      if (idx >= 0) {
        set({
          paths: {...paths, [occupyKey]: path.slice(0, idx + 1)},
          activeKey: occupyKey,
        });
      }
    }
  },

  // Called continuously as finger moves across cells
  continueDraw: (row, col) => {
    const {level, paths, activeKey} = get();
    if (!level || activeKey === null || get().isWon) return;

    const activePath = paths[activeKey] || [];
    const tail = activePath[activePath.length - 1];
    if (!tail) return;

    // Same cell as tail → nothing to do
    if (tail[0] === row && tail[1] === col) return;

    // Must be adjacent to continue drawing
    if (!isAdjacent(tail, [row, col])) return;

    // Block: cannot draw through a different color's endpoint dot
    const cellEndKey = isEndpoint(level, row, col);
    if (cellEndKey !== null && cellEndKey !== activeKey) return;

    // Retracing — finger moved back onto an existing path cell
    const existingIdx = pathContains(activePath, row, col);
    if (existingIdx >= 0) {
      set({paths: {...paths, [activeKey]: activePath.slice(0, existingIdx + 1)}});
      return;
    }

    // Dragged onto another color's path → clear that path
    const newPaths    = {...paths};
    const occupyKey   = getPathColor(paths, row, col);
    if (occupyKey !== null && occupyKey !== activeKey) {
      delete newPaths[occupyKey];
    }

    const newPath: Path = [...activePath, [row, col]];
    newPaths[activeKey]  = newPath;

    // Check if we reached the destination endpoint
    const dot       = level.dots.find(d => d.key === activeKey)!;
    const pathStart = activePath[0];
    const otherEnd  = (pathStart[0] === dot.from[0] && pathStart[1] === dot.from[1])
                      ? dot.to
                      : dot.from;
    const reachedEnd = row === otherEnd[0] && col === otherEnd[1];

    set({
      paths: newPaths,
      activeKey: reachedEnd ? null : activeKey,
      moves: get().moves + 1,
    });

    if (reachedEnd && isComplete(level, newPaths)) {
      setTimeout(() => set({isWon: true}), 150);
    }
  },

  // Called when finger lifts
  endDraw: () => {
    set({activeKey: null});
  },
}));
