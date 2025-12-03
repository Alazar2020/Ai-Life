import React, { useState } from 'react';
import { generatePatternWithAI } from '../services/geminiService';
import { Grid } from '../types';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';

interface AIPatternGeneratorProps {
    rows: number;
    cols: number;
    onPatternGenerated: (grid: Grid) => void;
}

const AIPatternGenerator: React.FC<AIPatternGeneratorProps> = ({ rows, cols, onPatternGenerated }) => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const result = await generatePatternWithAI(prompt, rows, cols);
            if (result) {
                onPatternGenerated(result.grid);
            } else {
                setError("Failed to generate pattern. Try again.");
            }
        } catch (err) {
            setError("An error occurred while connecting to the AI.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400 mb-2">
                <Sparkles size={20} />
                <h3 className="font-semibold text-sm uppercase tracking-wider">AI Architect</h3>
            </div>
            
            <form onSubmit={handleGenerate} className="flex flex-col space-y-3">
                <div className="relative">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g. 'A glider gun', 'Spaceship', 'Chaos'"
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        disabled={loading}
                    />
                </div>
                
                {error && (
                    <div className="flex items-center space-x-2 text-red-400 text-xs">
                        <AlertCircle size={12} />
                        <span>{error}</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || !prompt.trim()}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={16} />
                            <span>Designing...</span>
                        </>
                    ) : (
                        <span>Generate Pattern</span>
                    )}
                </button>
            </form>
            <p className="text-xs text-gray-500 leading-relaxed">
                Powered by Gemini 2.5 Flash. Describe a structure or concept, and the AI will construct it on the grid.
            </p>
        </div>
    );
};

export default AIPatternGenerator;
