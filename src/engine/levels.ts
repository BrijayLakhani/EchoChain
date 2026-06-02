import {FlowLevel} from './types';

export const LEVELS: FlowLevel[] = [

  // ── EASY — 4×4 ──────────────────────────────────────────────────────────────

  {
    id: 1, title: 'First Flow', difficulty: 'easy', gridSize: 4,
    dots: [
      {key:'B', from:[0,0], to:[3,2]},
      {key:'R', from:[0,2], to:[1,1]},
      {key:'Y', from:[0,3], to:[1,2]},
      {key:'G', from:[2,1], to:[3,3]},
    ],
    solution: [
      ['B','R','R','Y'],
      ['B','R','Y','Y'],
      ['B','G','G','G'],
      ['B','B','B','G'],
    ],
  },

  {
    id: 2, title: 'Corner Turn', difficulty: 'easy', gridSize: 4,
    dots: [
      {key:'R', from:[0,0], to:[1,2]},
      {key:'B', from:[0,3], to:[3,3]},
      {key:'G', from:[1,0], to:[3,1]},
      {key:'Y', from:[1,1], to:[3,2]},
    ],
    solution: [
      ['R','R','R','B'],
      ['G','Y','R','B'],
      ['G','Y','Y','B'],
      ['G','G','Y','B'],
    ],
  },

  {
    id: 3, title: 'L-Shape', difficulty: 'easy', gridSize: 4,
    dots: [
      {key:'R', from:[0,0], to:[2,1]},
      {key:'B', from:[0,1], to:[1,3]},
      {key:'G', from:[1,2], to:[3,3]},
      {key:'Y', from:[2,0], to:[3,2]},
    ],
    solution: [
      ['R','B','B','B'],
      ['R','R','G','B'],
      ['Y','R','G','G'],
      ['Y','Y','Y','G'],
    ],
  },

  {
    id: 4, title: 'Five Colors', difficulty: 'easy', gridSize: 4,
    dots: [
      {key:'R', from:[0,0], to:[1,1]},
      {key:'B', from:[0,2], to:[2,2]},
      {key:'G', from:[0,3], to:[3,3]},
      {key:'O', from:[1,0], to:[3,0]},
      {key:'P', from:[2,1], to:[3,2]},
    ],
    solution: [
      ['R','R','B','G'],
      ['O','R','B','G'],
      ['O','P','B','G'],
      ['O','P','P','G'],
    ],
  },

  {
    id: 5, title: 'Zigzag', difficulty: 'easy', gridSize: 4,
    dots: [
      {key:'R', from:[0,0], to:[1,2]},
      {key:'B', from:[0,2], to:[2,3]},
      {key:'G', from:[1,0], to:[3,1]},
      {key:'Y', from:[2,1], to:[3,3]},
    ],
    solution: [
      ['R','R','B','B'],
      ['G','R','R','B'],
      ['G','Y','Y','B'],
      ['G','G','Y','Y'],
    ],
  },

  // ── MEDIUM — 5×5 ────────────────────────────────────────────────────────────

  {
    id: 6, title: 'Block Slide', difficulty: 'medium', gridSize: 5,
    dots: [
      {key:'R', from:[0,0], to:[2,2]},
      {key:'B', from:[0,3], to:[1,3]},
      {key:'G', from:[2,3], to:[4,1]},
      {key:'Y', from:[4,2], to:[4,4]},
    ],
    solution: [
      ['R','R','R','B','B'],
      ['R','R','R','B','B'],
      ['R','R','R','G','G'],
      ['G','G','G','G','G'],
      ['G','G','Y','Y','Y'],
    ],
  },

  {
    id: 7, title: 'Column Run', difficulty: 'medium', gridSize: 5,
    dots: [
      {key:'R', from:[0,0], to:[4,1]},
      {key:'B', from:[0,1], to:[1,1]},
      {key:'G', from:[2,1], to:[3,1]},
      {key:'Y', from:[4,2], to:[4,4]},
    ],
    solution: [
      ['R','B','B','B','B'],
      ['R','B','B','B','B'],
      ['R','G','G','G','G'],
      ['R','G','G','G','G'],
      ['R','R','Y','Y','Y'],
    ],
  },

  {
    id: 8, title: 'Row Runner', difficulty: 'medium', gridSize: 5,
    dots: [
      {key:'R', from:[0,0], to:[1,2]},
      {key:'B', from:[1,0], to:[3,4]},
      {key:'G', from:[2,0], to:[4,4]},
      {key:'Y', from:[4,0], to:[4,2]},
    ],
    solution: [
      ['R','R','R','R','R'],
      ['B','B','R','R','R'],
      ['G','B','B','B','B'],
      ['G','G','G','G','B'],
      ['Y','Y','Y','G','G'],
    ],
  },

  {
    id: 9, title: 'Spiral In', difficulty: 'medium', gridSize: 5,
    dots: [
      {key:'R', from:[0,0], to:[0,3]},
      {key:'B', from:[0,4], to:[2,3]},
      {key:'G', from:[2,4], to:[4,4]},
      {key:'Y', from:[3,0], to:[4,0]},
    ],
    solution: [
      ['R','R','R','R','B'],
      ['R','R','B','B','B'],
      ['R','R','B','B','G'],
      ['Y','Y','G','G','G'],
      ['Y','Y','G','G','G'],
    ],
  },

  {
    id: 10, title: 'Cross Path', difficulty: 'medium', gridSize: 5,
    dots: [
      {key:'R', from:[0,0], to:[1,0]},
      {key:'B', from:[0,3], to:[2,4]},
      {key:'G', from:[2,0], to:[4,0]},
      {key:'Y', from:[3,3], to:[4,1]},
    ],
    solution: [
      ['R','R','R','B','B'],
      ['R','R','R','B','B'],
      ['G','G','G','B','B'],
      ['G','G','G','Y','Y'],
      ['G','Y','Y','Y','Y'],
    ],
  },

  // ── HARD — 5×5 ──────────────────────────────────────────────────────────────

  {
    id: 11, title: 'Bridge', difficulty: 'hard', gridSize: 5,
    dots: [
      {key:'R', from:[0,0], to:[1,3]},
      {key:'B', from:[1,0], to:[3,2]},
      {key:'G', from:[2,3], to:[4,4]},
      {key:'Y', from:[4,0], to:[4,2]},
    ],
    solution: [
      ['R','R','R','R','R'],
      ['B','B','B','R','R'],
      ['B','B','B','G','G'],
      ['B','B','B','G','G'],
      ['Y','Y','Y','G','G'],
    ],
  },

  {
    id: 12, title: 'Split Road', difficulty: 'hard', gridSize: 5,
    dots: [
      {key:'R', from:[0,0], to:[0,2]},
      {key:'B', from:[0,3], to:[2,1]},
      {key:'G', from:[2,2], to:[4,1]},
      {key:'Y', from:[4,2], to:[4,4]},
    ],
    solution: [
      ['R','R','R','B','B'],
      ['B','B','B','B','B'],
      ['B','B','G','G','G'],
      ['G','G','G','G','G'],
      ['G','G','Y','Y','Y'],
    ],
  },

  {
    id: 13, title: 'Winding Road', difficulty: 'hard', gridSize: 5,
    dots: [
      {key:'R', from:[0,0], to:[2,1]},
      {key:'B', from:[0,3], to:[2,2]},
      {key:'G', from:[2,4], to:[3,2]},
      {key:'Y', from:[4,2], to:[4,4]},
    ],
    solution: [
      ['R','R','R','B','B'],
      ['R','R','R','B','B'],
      ['R','R','B','B','G'],
      ['R','R','G','G','G'],
      ['R','R','Y','Y','Y'],
    ],
  },

  {
    id: 14, title: 'Long Snake', difficulty: 'hard', gridSize: 5,
    dots: [
      {key:'R', from:[0,0], to:[2,0]},
      {key:'B', from:[2,1], to:[4,1]},
      {key:'G', from:[4,2], to:[4,4]},
    ],
    solution: [
      ['R','R','R','R','R'],
      ['R','R','R','R','R'],
      ['R','B','B','B','B'],
      ['B','B','B','B','B'],
      ['B','B','G','G','G'],
    ],
  },

  {
    id: 15, title: 'Wrap Around', difficulty: 'hard', gridSize: 5,
    dots: [
      {key:'R', from:[0,0], to:[0,4]},
      {key:'B', from:[1,0], to:[2,0]},
      {key:'G', from:[1,4], to:[2,4]},
      {key:'Y', from:[3,0], to:[3,4]},
    ],
    solution: [
      ['R','R','R','R','R'],
      ['B','B','B','B','G'],
      ['B','B','B','B','G'],
      ['Y','Y','Y','Y','Y'],
      ['Y','Y','Y','Y','Y'],
    ],
  },

  // ── EXPERT — 6×6 ────────────────────────────────────────────────────────────

  {
    id: 16, title: 'Five Pipes', difficulty: 'expert', gridSize: 6,
    dots: [
      {key:'R', from:[0,0], to:[1,1]},
      {key:'B', from:[0,4], to:[3,5]},
      {key:'G', from:[1,0], to:[3,4]},
      {key:'Y', from:[3,0], to:[5,0]},
      {key:'O', from:[4,3], to:[5,1]},
    ],
    solution: [
      ['R','R','R','R','B','B'],
      ['G','R','R','R','B','B'],
      ['G','G','G','G','B','B'],
      ['Y','Y','Y','G','G','B'],
      ['Y','Y','Y','O','O','O'],
      ['Y','O','O','O','O','O'],
    ],
  },

  {
    id: 17, title: 'Deep Grid', difficulty: 'expert', gridSize: 6,
    dots: [
      {key:'R', from:[0,0], to:[1,4]},
      {key:'B', from:[1,0], to:[2,3]},
      {key:'G', from:[2,4], to:[3,0]},
      {key:'Y', from:[3,1], to:[3,4]},
    ],
    solution: [
      ['R','R','R','R','R','R'],
      ['B','B','B','B','R','R'],
      ['B','B','B','B','G','G'],
      ['G','Y','Y','Y','Y','G'],
      ['G','G','G','G','G','G'],
      ['G','G','G','G','G','G'],
    ],
  },

  {
    id: 18, title: 'Six Rows', difficulty: 'expert', gridSize: 6,
    dots: [
      {key:'R', from:[0,0], to:[0,3]},
      {key:'B', from:[0,4], to:[1,0]},
      {key:'G', from:[2,0], to:[3,4]},
      {key:'Y', from:[3,0], to:[4,3]},
      {key:'O', from:[4,4], to:[5,0]},
    ],
    solution: [
      ['R','R','R','R','B','B'],
      ['B','B','B','B','B','B'],
      ['G','G','G','G','G','G'],
      ['Y','Y','Y','Y','G','G'],
      ['Y','Y','Y','Y','O','O'],
      ['O','O','O','O','O','O'],
    ],
  },

  {
    id: 19, title: 'Maze Runner', difficulty: 'expert', gridSize: 6,
    dots: [
      {key:'R', from:[0,0], to:[2,0]},
      {key:'B', from:[0,3], to:[3,5]},
      {key:'G', from:[3,0], to:[5,2]},
      {key:'Y', from:[4,3], to:[5,5]},
    ],
    solution: [
      ['R','R','R','B','B','B'],
      ['R','R','R','B','B','B'],
      ['R','R','R','B','B','B'],
      ['G','G','G','G','G','B'],
      ['G','G','G','Y','Y','Y'],
      ['G','G','Y','Y','Y','Y'],
    ],
  },

  {
    id: 20, title: 'Grand Flow', difficulty: 'expert', gridSize: 6,
    dots: [
      {key:'R', from:[0,0], to:[1,0]},
      {key:'B', from:[0,3], to:[1,3]},
      {key:'G', from:[2,0], to:[3,0]},
      {key:'Y', from:[2,5], to:[3,5]},
      {key:'O', from:[4,0], to:[5,0]},
      {key:'P', from:[4,5], to:[5,5]},
    ],
    solution: [
      ['R','R','R','B','B','B'],
      ['R','R','R','B','B','B'],
      ['G','G','G','G','G','Y'],
      ['G','G','G','G','Y','Y'],
      ['O','O','O','O','O','P'],
      ['O','O','O','O','P','P'],
    ],
  },
];
