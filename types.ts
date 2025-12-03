export type Grid = number[][];

export interface Pattern {
  name: string;
  description: string;
  grid: Grid;
}

export enum GameStatus {
  STOPPED = 'STOPPED',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED' // Logically similar to stopped but visual distinction if needed
}

export interface Preset {
    name: string;
    icon: string;
    grid: Grid;
}