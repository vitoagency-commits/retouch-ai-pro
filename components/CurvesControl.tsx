
import React, { useRef, useEffect, useState } from 'react';
import { CurvePoint } from '../types';

interface CurvesControlProps {
  points: CurvePoint[];
  onChange: (points: CurvePoint[]) => void;
  color: string;
  label: string;
}

const CurvesControl: React.FC<CurvesControlProps> = ({ points, onChange, color, label }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

  const sortedPoints = [...points].sort((a, b) => a.x - b.x);

  const getSvgPoint = (e: React.MouseEvent | React.TouchEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height))
    };
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, idx: number) => {
    e.stopPropagation();
    setDraggingIdx(idx);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (draggingIdx === null) return;
    const p = getSvgPoint(e);
    
    // Don't allow moving first/last points horizontally
    if (draggingIdx === 0) p.x = 0;
    if (draggingIdx === points.length - 1) p.x = 1;

    const newPoints = [...points];
    newPoints[draggingIdx] = p;
    onChange(newPoints);
  };

  const handleMouseUp = () => {
    setDraggingIdx(null);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const p = getSvgPoint(e);
    // Add point if not near existing
    const exists = points.some(pt => Math.abs(pt.x - p.x) < 0.05);
    if (!exists) {
      onChange([...points, p].sort((a, b) => a.x - b.x));
    }
  };

  const removePoint = (idx: number) => {
    if (points.length <= 2 || idx === 0 || idx === points.length - 1) return;
    const newPoints = [...points];
    newPoints.splice(idx, 1);
    onChange(newPoints);
  };

  const pathData = sortedPoints.map((p, i) => {
    return `${i === 0 ? 'M' : 'L'} ${p.x * 200} ${(1 - p.y) * 200}`;
  }).join(' ');

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        <button 
          onClick={() => onChange([{ x: 0, y: 0 }, { x: 1, y: 1 }])}
          className="text-[7px] font-bold text-indigo-400 uppercase hover:text-indigo-300"
        >
          Reset
        </button>
      </div>
      <div className="relative aspect-square w-full bg-black/40 rounded-xl border border-white/10 overflow-hidden">
        {/* Grid */}
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="border-[0.5px] border-white/5"></div>
          ))}
        </div>
        
        <svg 
          ref={svgRef}
          viewBox="0 0 200 200" 
          className="absolute inset-0 w-full h-full cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          onDoubleClick={handleDoubleClick}
        >
          <path 
            d={pathData} 
            fill="none" 
            stroke={color} 
            strokeWidth="2" 
            className="transition-all duration-75"
          />
          {sortedPoints.map((p, i) => (
            <circle 
              key={i}
              cx={p.x * 200}
              cy={(1 - p.y) * 200}
              r="5"
              fill={draggingIdx === i ? '#fff' : color}
              className="cursor-pointer hover:r-6 transition-all"
              onMouseDown={(e) => handleMouseDown(e, i)}
              onTouchStart={(e) => handleMouseDown(e, i)}
              onContextMenu={(e) => {
                e.preventDefault();
                removePoint(i);
              }}
            />
          ))}
        </svg>
      </div>
      <p className="text-[7px] text-slate-600 italic">Doppio click per aggiungere, click destro per rimuovere.</p>
    </div>
  );
};

export default CurvesControl;
