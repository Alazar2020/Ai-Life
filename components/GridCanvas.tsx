import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Grid } from '../types';

interface GridCanvasProps {
  grid: Grid;
  onCellClick: (row: number, col: number) => void;
  interactive: boolean;
}

const GridCanvas: React.FC<GridCanvasProps> = ({ grid, onCellClick, interactive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle resizing
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({ width: clientWidth, height: clientHeight });
      }
    };

    window.addEventListener('resize', updateSize);
    updateSize();

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rows = grid.length;
    const cols = grid[0].length;
    
    // Calculate cell size to fit the container while maintaining aspect ratio or filling
    // Here we fill nicely
    const cellWidth = dimensions.width / cols;
    const cellHeight = dimensions.height / rows;
    
    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    
    // Background
    ctx.fillStyle = '#111827'; // gray-900
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    // Draw grid lines (faint)
    ctx.strokeStyle = '#1f2937'; // gray-800
    ctx.lineWidth = 0.5;
    
    ctx.beginPath();
    for (let i = 0; i <= cols; i++) {
        ctx.moveTo(i * cellWidth, 0);
        ctx.lineTo(i * cellWidth, dimensions.height);
    }
    for (let i = 0; i <= rows; i++) {
        ctx.moveTo(0, i * cellHeight);
        ctx.lineTo(dimensions.width, i * cellHeight);
    }
    ctx.stroke();

    // Draw live cells
    ctx.fillStyle = '#10b981'; // Primary Emerald
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#34d399'; // Glow

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === 1) {
            // Draw slightly smaller than full cell for grid effect
            ctx.fillRect(
                c * cellWidth + 1, 
                r * cellHeight + 1, 
                cellWidth - 2, 
                cellHeight - 2
            );
        }
      }
    }
    
    // Reset shadow for next frame performance
    ctx.shadowBlur = 0;

  }, [grid, dimensions]);

  // Handle interactions
  const handleInteraction = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rows = grid.length;
    const cols = grid[0].length;
    
    const cellWidth = dimensions.width / cols;
    const cellHeight = dimensions.height / rows;

    const c = Math.floor(x / cellWidth);
    const r = Math.floor(y / cellHeight);

    if (r >= 0 && r < rows && c >= 0 && c < cols) {
        onCellClick(r, c);
    }
  }, [dimensions, grid, interactive, onCellClick]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[400px] relative rounded-lg overflow-hidden border border-gray-700 shadow-2xl">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="block cursor-crosshair touch-none"
        onClick={handleInteraction}
      />
    </div>
  );
};

export default GridCanvas;
