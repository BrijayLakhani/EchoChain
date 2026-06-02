export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface FlowDot {
  key: string;          // color key, e.g. 'R', 'B'
  from: [number, number]; // [row, col]
  to:   [number, number];
}

export interface FlowLevel {
  id: number;
  title: string;
  difficulty: Difficulty;
  gridSize: number;
  dots: FlowDot[];
  // solution[row][col] = colorKey — used for hint system
  solution: string[][];
}
