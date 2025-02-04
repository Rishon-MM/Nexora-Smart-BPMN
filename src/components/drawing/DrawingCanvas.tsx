import React, { useRef, useEffect, useState } from 'react';
import { X, Undo, Redo, Eraser, Trash2, Save, PenTool, Sparkles, SparkleIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import Draggable from 'react-draggable';
import { analyzeBPMNImage } from '../../services/ai/imageAnalysis';

interface DrawingCanvasProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete: (result: string) => void;
}

interface DrawingState {
  lines: Line[];
  redoStack: Line[][];
}

interface Line {
  points: Point[];
  color: string;
  width: number;
}

interface Point {
  x: number;
  y: number;
}

export function DrawingCanvas({ isOpen, onClose, onAnalysisComplete }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [drawingState, setDrawingState] = useState<DrawingState>({
    lines: [],
    redoStack: []
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Draw all lines
  const redrawCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Redraw all lines
    drawingState.lines.forEach(line => {
      if (line.points.length < 2) return;
      
      ctx.beginPath();
      ctx.moveTo(line.points[0].x, line.points[0].y);
      
      for (let i = 1; i < line.points.length; i++) {
        ctx.lineTo(line.points[i].x, line.points[i].y);
      }
      
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    });
  };

  useEffect(() => {
    redrawCanvas();
  }, [drawingState]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const point = getEventPoint(e);
    if (!point) return;

    setDrawingState(prev => ({
      lines: [...prev.lines, {
        points: [point],
        color: tool === 'pen' ? '#000000' : '#ffffff',
        width: tool === 'pen' ? 2 : 20
      }],
      redoStack: []
    }));
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const point = getEventPoint(e);
    if (!point) return;

    setDrawingState(prev => ({
      ...prev,
      lines: prev.lines.map((line, i) => {
        if (i === prev.lines.length - 1) {
          return { ...line, points: [...line.points, point] };
        }
        return line;
      })
    }));
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getEventPoint = (e: React.MouseEvent | React.TouchEvent): Point | null => {
    if (!canvasRef.current) return null;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const undo = () => {
    setDrawingState(prev => {
      if (prev.lines.length === 0) return prev;
      const newLines = [...prev.lines];
      const undoneLine = newLines.pop();
      return {
        lines: newLines,
        redoStack: undoneLine ? [...prev.redoStack, [undoneLine]] : prev.redoStack
      };
    });
  };

  const redo = () => {
    setDrawingState(prev => {
      if (prev.redoStack.length === 0) return prev;
      const newRedoStack = [...prev.redoStack];
      const redoneLines = newRedoStack.pop() || [];
      return {
        lines: [...prev.lines, ...redoneLines],
        redoStack: newRedoStack
      };
    });
  };

  const clear = () => {
    if (confirm('Are you sure you want to clear the canvas?')) {
      setDrawingState({ lines: [], redoStack: [] });
    }
  };

  const save = async () => {
    if (!canvasRef.current) return;
    
    try {
      setIsAnalyzing(true);
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvasRef.current?.toBlob(blob => {
          if (blob) resolve(blob);
        }, 'image/png');
      });

      // Create File object
      const file = new File([blob], 'drawing.png', { type: 'image/png' });

      // Analyze the image
      const result = await analyzeBPMNImage(file);
      onAnalysisComplete(result.explanation);
      onClose();
    } catch (error) {
      console.error('Error saving and analyzing drawing:', error);
      alert('Failed to analyze the drawing. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Draggable handle=".handle">
        <div className="bg-white rounded-lg shadow-xl min-w-[800px] flex flex-col">
          {/* Header */}
          <div className="handle p-4 border-b flex items-center justify-between cursor-move">
            <h2 className="text-lg font-semibold">BPMN Drawing Canvas</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Toolbar */}
          <div className="p-2 border-b flex items-center gap-2">
            <button
              onClick={() => setTool('pen')}
              className={cn(
                "p-2 rounded-lg transition-colors",
                tool === 'pen' ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
              )}
              title="Pen tool"
            >
              <PenTool className="w-5 h-5" />
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={cn(
                "p-2 rounded-lg transition-colors",
                tool === 'eraser' ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
              )}
              title="Eraser"
            >
              <Eraser className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-gray-200" />
            <button
              onClick={undo}
              disabled={drawingState.lines.length === 0}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Undo"
            >
              <Undo className="w-5 h-5" />
            </button>
            <button
              onClick={redo}
              disabled={drawingState.redoStack.length === 0}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Redo"
            >
              <Redo className="w-5 h-5" />
            </button>
            <button
              onClick={clear}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-red-500"
              title="Clear canvas"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <div className="flex-1" />
            <button
              onClick={save}
              disabled={drawingState.lines.length === 0 || isAnalyzing}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyze
                </>
              )}
            </button>
          </div>

          {/* Canvas */}
          <div className="p-4 bg-gray-50">
            <canvas
              ref={canvasRef}
              width={1200}
              height={600}
              className="bg-white rounded-lg shadow-inner cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
        </div>
      </Draggable>
    </div>
  );
}