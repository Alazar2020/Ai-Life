import { Grid } from './types';

export const GRID_ROWS = 50;
export const GRID_COLS = 50;
export const CELL_SIZE = 12; // Base cell size in pixels for calculation, canvas scales dynamically
export const DEFAULT_SPEED_MS = 100;

export const EMPTY_GRID: Grid = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(0));

// A simple glider
const GLIDER_GRID = JSON.parse(JSON.stringify(EMPTY_GRID));
GLIDER_GRID[1][2] = 1;
GLIDER_GRID[2][3] = 1;
GLIDER_GRID[3][1] = 1;
GLIDER_GRID[3][2] = 1;
GLIDER_GRID[3][3] = 1;

export const PRESETS = [
    {
        name: "Glider",
        grid: GLIDER_GRID
    }
];
