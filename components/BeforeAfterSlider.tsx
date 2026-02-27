
import React, { useState, useRef, useEffect } from 'react';

interface BeforeAfterSliderProps {
  before: string;
  after: string;
}

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ before, after }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (isResizing) handleMove(e.clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (isResizing) handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsResizing(false);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-square md:aspect-video rounded-xl overflow-hidden cursor-ew-resize select-none bg-slate-900 border border-slate-700"
      onMouseDown={() => setIsResizing(true)}
      onTouchStart={() => setIsResizing(true)}
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
    >
      {/* After Image (Background) */}
      <img 
        src={after} 
        alt="After" 
        className="absolute top-0 left-0 w-full h-full object-contain"
        draggable={false}
      />

      {/* Before Image (Clipped Overlay) */}
      <div 
        className="absolute top-0 left-0 h-full overflow-hidden border-r-2 border-white/50 z-10"
        style={{ 
          width: `${sliderPosition}%`,
          willChange: 'width'
        }}
      >
        <div className="absolute top-0 left-0 h-full" style={{ width: containerRef.current?.offsetWidth || '100vw' }}>
          <img 
            src={before} 
            alt="Before" 
            className="w-full h-full object-contain"
            draggable={false}
          />
        </div>
        <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 text-xs rounded uppercase font-bold tracking-wider">Before</div>
      </div>

      <div className="absolute top-4 right-4 bg-indigo-600/80 text-white px-2 py-1 text-xs rounded uppercase font-bold tracking-wider z-10">After</div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center z-20"
        style={{ 
          left: `${sliderPosition}%`,
          willChange: 'left'
        }}
      >
        <div className="w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center -ml-0.5">
          <i className="fas fa-arrows-alt-h text-indigo-600 text-sm"></i>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
