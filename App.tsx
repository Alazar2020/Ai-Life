import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Trash2, Zap, Grid as GridIcon } from 'lucide-react';
import GridCanvas from './components/GridCanvas';
import AIPatternGenerator from './components/AIPatternGenerator';
import { computeNextGeneration, generateRandomGrid } from './services/gameLogic';
import { GRID_ROWS, GRID_COLS, EMPTY_GRID, DEFAULT_SPEED_MS } from './constants';
import { Grid, GameStatus } from './types';

const App: React.FC = () => {
  const [grid, setGrid] = useState<Grid>(EMPTY_GRID);
  const [status, setStatus] = useState<GameStatus>(GameStatus.STOPPED);
  const [generation, setGeneration] = useState(0);
  const [speed, setSpeed] = useState(DEFAULT_SPEED_MS);
  const [population, setPopulation] = useState(0);

  // Use refs for values accessed inside the interval to avoid closure staleness
  const statusRef = useRef(status);
  const speedRef = useRef(speed);
  
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  // Calculate population whenever grid changes
  useEffect(() => {
    let count = 0;
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (grid[r][c]) count++;
      }
    }
    setPopulation(count);
  }, [grid]);

  // Game Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = 0;

    const loop = (time: number) => {
      if (statusRef.current !== GameStatus.RUNNING) return;

      if (time - lastTime >= speedRef.current) {
        setGrid(prev => computeNextGeneration(prev));
        setGeneration(prev => prev + 1);
        lastTime = time;
      }
      animationFrameId = requestAnimationFrame(loop);
    };

    if (status === GameStatus.RUNNING) {
      animationFrameId = requestAnimationFrame(loop);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [status]);

  const toggleCell = useCallback((r: number, c: number) => {
    // Clone grid to ensure immutability
    setGrid(prevGrid => {
        const newGrid = prevGrid.map(row => [...row]);
        newGrid[r][c] = newGrid[r][c] ? 0 : 1;
        return newGrid;
    });
  }, []);

  const handleStartStop = () => {
    setStatus(prev => prev === GameStatus.RUNNING ? GameStatus.PAUSED : GameStatus.RUNNING);
  };

  const handleClear = () => {
    setStatus(GameStatus.STOPPED);
    setGrid(Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(0)));
    setGeneration(0);
  };

  const handleRandomize = () => {
    setStatus(GameStatus.STOPPED);
    setGrid(generateRandomGrid(GRID_ROWS, GRID_COLS, 0.25));
    setGeneration(0);
  };

  const handleAIPattern = (newGrid: Grid) => {
      setStatus(GameStatus.STOPPED);
      setGrid(newGrid);
      setGeneration(0);
  };

  return (
    <div className="flex h-screen w-full bg-gray-950 text-white font-sans overflow-hidden">
      
      {/* Sidebar Controls */}
      <aside className="w-80 flex-shrink-0 border-r border-gray-800 bg-gray-900 flex flex-col z-20 shadow-xl">
        <div className="p-6 border-b border-gray-800">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                Conway's AI Life
            </h1>
            <p className="text-gray-400 text-xs mt-1">Evolutionary Simulation</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                    <span className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Generation</span>
                    <span className="text-xl font-mono text-white">{generation}</span>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                    <span className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Population</span>
                    <span className="text-xl font-mono text-emerald-400">{population}</span>
                </div>
            </div>

            {/* Playback Controls */}
            <div className="space-y-4">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Simulation Control</label>
                <div className="flex gap-2">
                    <button 
                        onClick={handleStartStop}
                        className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg font-medium transition-all ${
                            status === GameStatus.RUNNING 
                            ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/50' 
                            : 'bg-emerald-600 text-white hover:bg-emerald-500 border border-transparent shadow-lg shadow-emerald-900/50'
                        }`}
                    >
                        {status === GameStatus.RUNNING ? <Pause size={18} /> : <Play size={18} />}
                        <span>{status === GameStatus.RUNNING ? 'Pause' : 'Start'}</span>
                    </button>
                    
                    <button 
                        onClick={() => {
                            setGrid(prev => computeNextGeneration(prev));
                            setGeneration(g => g + 1);
                        }}
                        disabled={status === GameStatus.RUNNING}
                        className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 border border-gray-700 disabled:opacity-50 transition-colors"
                        title="Step Forward"
                    >
                        <Zap size={18} />
                    </button>
                </div>

                <div className="flex gap-2">
                     <button 
                        onClick={handleRandomize}
                        className="flex-1 flex items-center justify-center space-x-2 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg border border-gray-700 transition-colors"
                    >
                        <RotateCcw size={14} />
                        <span>Randomize</span>
                    </button>
                     <button 
                        onClick={handleClear}
                        className="flex-1 flex items-center justify-center space-x-2 py-2 bg-gray-800 hover:bg-red-900/30 text-gray-300 hover:text-red-400 text-sm rounded-lg border border-gray-700 transition-colors"
                    >
                        <Trash2 size={14} />
                        <span>Clear</span>
                    </button>
                </div>
            </div>

            {/* Speed Control */}
            <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-gray-400 uppercase tracking-wider">
                    <label>Speed</label>
                    <span>{Math.round(1000 / speed)} gen/s</span>
                </div>
                <input 
                    type="range" 
                    min="10" 
                    max="1000" 
                    step="10"
                    // Reverse value because lower ms = faster
                    value={1010 - speed} 
                    onChange={(e) => setSpeed(1010 - parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
            </div>

             <div className="border-t border-gray-800 pt-6">
                <AIPatternGenerator rows={GRID_ROWS} cols={GRID_COLS} onPatternGenerated={handleAIPattern} />
            </div>

        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className="flex-1 flex flex-col relative bg-gray-950 p-4">
        {/* Helper overlay */}
        <div className="absolute top-6 left-6 z-10 pointer-events-none opacity-50">
             <div className="flex items-center space-x-2 text-gray-500 text-xs bg-gray-900/80 px-3 py-1.5 rounded-full border border-gray-800 backdrop-blur-sm">
                <GridIcon size={12} />
                <span>{GRID_ROWS}x{GRID_COLS} Grid</span>
             </div>
        </div>

        <div className="flex-1 rounded-xl overflow-hidden shadow-2xl ring-1 ring-gray-800/50 relative">
            <GridCanvas 
                grid={grid} 
                onCellClick={toggleCell} 
                interactive={true}
            />
        </div>
      </main>
    </div>
  );
};

export default App;
