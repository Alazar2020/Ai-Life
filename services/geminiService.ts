import { GoogleGenAI, Type } from "@google/genai";
import { Grid } from "../types";

// Helper to center a smaller pattern into a larger grid
const centerPattern = (pattern: number[][], targetRows: number, targetCols: number): Grid => {
    const pRows = pattern.length;
    const pCols = pattern[0]?.length || 0;
    
    const newGrid: Grid = Array.from({ length: targetRows }, () => Array(targetCols).fill(0));
    
    const startRow = Math.floor((targetRows - pRows) / 2);
    const startCol = Math.floor((targetCols - pCols) / 2);

    for(let r=0; r<pRows; r++) {
        for(let c=0; c<pCols; c++) {
            if (startRow + r >= 0 && startRow + r < targetRows && startCol + c >= 0 && startCol + c < targetCols) {
                newGrid[startRow + r][startCol + c] = pattern[r][c];
            }
        }
    }
    return newGrid;
};

export const generatePatternWithAI = async (
    prompt: string, 
    rows: number, 
    cols: number
): Promise<{ grid: Grid; name: string; description: string } | null> => {
    
    if (!process.env.API_KEY) {
        console.error("API Key missing");
        return null;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Schema definition for strictly typed JSON response
    const schema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "A creative name for the pattern" },
            description: { type: Type.STRING, description: "A short explanation of what this pattern does (e.g., oscillator, spaceship)" },
            grid: {
                type: Type.ARRAY,
                description: "A 2D binary array representing the pattern. Should be cropped tightly around the live cells.",
                items: {
                    type: Type.ARRAY,
                    items: { type: Type.INTEGER }
                }
            }
        },
        required: ["name", "description", "grid"]
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Create a valid Conway's Game of Life pattern based on this request: "${prompt}". 
            If the request is abstract (e.g., "chaos", "beauty"), interpret it creatively using Game of Life structures.
            Ensure the grid uses 0 for dead and 1 for alive. Keep the pattern size reasonable (max 20x20).`,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                systemInstruction: "You are an expert mathematician specializing in Cellular Automata and Conway's Game of Life.",
                temperature: 0.7
            }
        });

        const text = response.text;
        if (!text) return null;

        const data = JSON.parse(text);
        
        // Post-process to center it on our main board size
        const centeredGrid = centerPattern(data.grid, rows, cols);

        return {
            name: data.name,
            description: data.description,
            grid: centeredGrid
        };

    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};
