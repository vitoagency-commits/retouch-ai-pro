
import React, { useEffect, useRef, useState } from 'react';

interface HistogramProps {
  imageUrl: string;
  filters?: string;
  warmth?: { color: string; opacity: number };
  vignette?: number;
}

const Histogram: React.FC<HistogramProps> = ({ imageUrl, filters, warmth, vignette }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<{ r: number[]; g: number[]; b: number[]; l: number[] } | null>(null);

  useEffect(() => {
    const calculateHistogram = async () => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      // Downsample for performance
      const size = 100;
      canvas.width = size;
      canvas.height = size;
      
      // Apply filters to the canvas context if possible, 
      // but CSS filters don't apply to drawImage directly.
      // We'll simulate the main ones or just show the raw histogram for now.
      // Real live histogram with CSS filters requires capturing the rendered element.
      
      ctx.drawImage(img, 0, 0, size, size);
      const imageData = ctx.getImageData(0, 0, size, size);
      const pixels = imageData.data;

      const r = new Array(256).fill(0);
      const g = new Array(256).fill(0);
      const b = new Array(256).fill(0);
      const l = new Array(256).fill(0);

      for (let i = 0; i < pixels.length; i += 4) {
        const rv = pixels[i];
        const gv = pixels[i + 1];
        const bv = pixels[i + 2];
        const lv = Math.round(0.2126 * rv + 0.7152 * gv + 0.0722 * bv);

        r[rv]++;
        g[gv]++;
        b[bv]++;
        l[lv]++;
      }

      // Normalize
      const max = Math.max(...r, ...g, ...b, ...l);
      setData({
        r: r.map(v => v / max),
        g: g.map(v => v / max),
        b: b.map(v => v / max),
        l: l.map(v => v / max),
      });
    };

    calculateHistogram();
  }, [imageUrl, filters, warmth, vignette]);

  if (!data) return <div className="h-32 w-full bg-black/20 rounded-xl animate-pulse"></div>;

  return (
    <div className="relative h-32 w-full bg-black/40 rounded-xl overflow-hidden border border-white/5 p-2">
      <div className="absolute inset-0 flex items-end px-2 pb-1 gap-[1px]">
        {data.l.map((v, i) => (
          <div 
            key={i} 
            className="flex-1 bg-white/10" 
            style={{ height: `${v * 100}%` }}
          ></div>
        ))}
      </div>
      <svg className="absolute inset-0 w-full h-full preserve-3d" viewBox="0 0 256 100" preserveAspectRatio="none">
        <path d={`M 0 100 ${data.r.map((v, i) => `L ${i} ${100 - v * 100}`).join(' ')} L 256 100 Z`} fill="rgba(239, 68, 68, 0.3)" />
        <path d={`M 0 100 ${data.g.map((v, i) => `L ${i} ${100 - v * 100}`).join(' ')} L 256 100 Z`} fill="rgba(34, 197, 94, 0.3)" />
        <path d={`M 0 100 ${data.b.map((v, i) => `L ${i} ${100 - v * 100}`).join(' ')} L 256 100 Z`} fill="rgba(59, 130, 246, 0.3)" />
      </svg>
      <div className="absolute top-2 left-2 flex gap-2">
        <span className="text-[7px] font-black text-white/40 uppercase tracking-widest">Histogram</span>
      </div>
    </div>
  );
};

export default Histogram;
