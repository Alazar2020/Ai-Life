import { Grid } from '../types';

/**
 * Computes the next generation of the Game of Life grid.
 * Optimized for readability and standard rules.
 */
export const computeNextGeneration = (grid: Grid): Grid => {
  const rows = grid.length;
  const cols = grid[0].length;
  
  // Create a new grid to store the next state
  const newGrid: Grid = Array.from({ length: rows }, () => Array(cols).fill(0));

  // Neighbor offsets
  const offsets = [
    [-1, -1], [-1, 0], [-1, 1],
    [ 0, -1],          [ 0, 1],
    [ 1, -1], [ 1, 0], [ 1, 1]
  ];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let neighbors = 0;

      // Count live neighbors
      for (const [dr, dc] of offsets) {
        const nr = r + dr;
        const nc = c + dc;

        // Check bounds
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          neighbors += grid[nr][nc];
        }
      }

      const isAlive = grid[r][c] === 1;

      // Apply rules
      if (isAlive && (neighbors === 2 || neighbors === 3)) {
        newGrid[r][c] = 1;
      } else if (!isAlive && neighbors === 3) {
        newGrid[r][c] = 1;
      } else {
        newGrid[r][c] = 0;
      }
    }
  }

  return newGrid;
};

/**
 * Creates a random grid
 */
export const generateRandomGrid = (rows: number, cols: number, density: number = 0.2): Grid => {
    return Array.from({ length: rows }, () => 
        Array.from({ length: cols }, () => (Math.random() < density ? 1 : 0))
    );
};
