
import React, { useState, useRef, useEffect, useMemo } from 'react';
import BeforeAfterSlider from './BeforeAfterSlider';
import { GradingSettings, TextLayer } from '../types';

interface SmartImageViewerProps {
  before: string;
  after: string;
  mode: 'slider' | 'hold' | 'side';
  isMagicEraser?: boolean;
  isGenerativeBrush?: boolean;
  brushSize?: number;
  brushMask?: { x: number; y: number }[];
  onBrushUpdate?: (points: { x: number; y: number }[]) => void;
  isShadowTargeting?: boolean;
  shadowTargets?: { x: number; y: number }[];
  onPixelClick?: (x: number, y: number) => void;
  grading?: GradingSettings; // Added grading prop for live preview
  textLayers?: TextLayer[];
  onUpdateTextLayer?: (id: string, updates: Partial<TextLayer>) => void;
}

const SmartImageViewer: React.FC<SmartImageViewerProps> = ({ 
  before, 
  after, 
  mode, 
  isMagicEraser, 
  isGenerativeBrush,
  brushSize = 40,
  brushMask = [],
  onBrushUpdate,
  isShadowTargeting,
  shadowTargets = [],
  onPixelClick, 
  grading,
  textLayers = [],
  onUpdateTextLayer
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isHolding, setIsHolding] = useState(false);
  const [isPainting, setIsPainting] = useState(false);
  const [activeTextId, setActiveTextId] = useState<string | null>(null);
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const curveFilterId = useMemo(() => `curve-filter-${Math.random().toString(36).substr(2, 9)}`, []);

  const curveTables = useMemo(() => {
    if (!grading?.curves) return null;

    const getTableValues = (points: { x: number; y: number }[]) => {
      const sorted = [...points].sort((a, b) => a.x - b.x);
      const values = new Array(256);
      for (let i = 0; i < 256; i++) {
        const x = i / 255;
        let j = 0;
        while (j < sorted.length - 1 && sorted[j + 1].x < x) j++;
        const p1 = sorted[j];
        const p2 = sorted[j + 1];
        const t = (p2.x - p1.x) === 0 ? 0 : (x - p1.x) / (p2.x - p1.x);
        values[i] = Math.max(0, Math.min(1, p1.y + t * (p2.y - p1.y)));
      }
      return values.join(' ');
    };

    return {
      rgb: getTableValues(grading.curves.rgb),
      red: getTableValues(grading.curves.red),
      green: getTableValues(grading.curves.green),
      blue: getTableValues(grading.curves.blue),
    };
  }, [grading?.curves]);

  // Compute CSS Filters for Live Preview
  const filters = useMemo(() => {
    if (!grading) return {};

    // 1. Standard Filters
    const brightness = 100 + grading.exposure; // 100 is base
    const contrast = 100 + grading.contrast;
    const saturate = 100 + grading.saturation;
    const sepia = grading.sepia || 0;
    
    const filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) sepia(${sepia}%)`;

    // Only add curve filter if tables are ready
    const finalFilter = curveTables ? `${filterString} url(#${curveFilterId})` : filterString;

    // 2. Warmth Overlay (Orange for heat, Blue for cool)
    let warmthColor = 'transparent';
    let warmthOpacity = 0;
    if (grading.warmth > 0) {
      warmthColor = '#ea580c'; // Orange-600
      warmthOpacity = grading.warmth / 300; // Max 0.33 opacity
    } else if (grading.warmth < 0) {
      warmthColor = '#0284c7'; // Sky-600
      warmthOpacity = Math.abs(grading.warmth) / 300;
    }

    // 3. Vignette (Radial Gradient)
    const vignetteOpacity = grading.vignette / 100;

    return {
      filter: finalFilter,
      warmth: { color: warmthColor, opacity: warmthOpacity },
      vignette: vignetteOpacity
    };
  }, [grading, curveTables, curveFilterId]);

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const delta = -e.deltaY * 0.002;
    const newScale = Math.min(Math.max(0.5, scale + delta), 5);
    setScale(newScale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Check if clicking a text layer
    const target = e.target as HTMLElement;
    const textId = target.closest('[data-text-id]')?.getAttribute('data-text-id');
    if (textId) {
      setActiveTextId(textId);
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    // If Magic Eraser, Generative Brush or Shadow Targeting is active, we don't drag, we prepare to click/paint
    if (isMagicEraser || isGenerativeBrush || isShadowTargeting) {
      if (isGenerativeBrush) setIsPainting(true);
      return;
    }

    if (e.button === 0 && (scale > 1 || mode === 'hold')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
    if (mode === 'hold') setIsHolding(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (activeTextId && onUpdateTextLayer && contentRef.current) {
      const imgElement = contentRef.current.querySelector('img');
      if (imgElement) {
        const rect = imgElement.getBoundingClientRect();
        const dx = ((e.clientX - dragStart.x) / rect.width) * 100;
        const dy = ((e.clientY - dragStart.y) / rect.height) * 100;
        
        const layer = textLayers.find(l => l.id === activeTextId);
        if (layer) {
          onUpdateTextLayer(activeTextId, {
            x: Math.max(0, Math.min(100, layer.x + dx)),
            y: Math.max(0, Math.min(100, layer.y + dy))
          });
          setDragStart({ x: e.clientX, y: e.clientY });
        }
      }
      return;
    }

    if (isPainting && isGenerativeBrush && contentRef.current && onBrushUpdate) {
      const imgElement = contentRef.current.querySelector('img');
      if (imgElement) {
        const rect = imgElement.getBoundingClientRect();
        const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
        const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
        
        if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
          const exists = brushMask.some(p => Math.abs(p.x - x) < 2 && Math.abs(p.y - y) < 2);
          if (!exists) {
            onBrushUpdate([...brushMask, { x, y }]);
          }
        }
      }
      return;
    }

    if (isDragging) {
      e.preventDefault();
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'clientX' in e ? e.clientX : (e.changedTouches?.[0]?.clientX);
    const clientY = 'clientY' in e ? e.clientY : (e.changedTouches?.[0]?.clientY);

    // Handle Magic Eraser or Shadow Targeting Click
    if ((isMagicEraser || isShadowTargeting) && !isDragging && onPixelClick && contentRef.current && clientX !== undefined && clientY !== undefined) {
      const imgElement = contentRef.current.querySelector('img');
      if (imgElement) {
        const rect = imgElement.getBoundingClientRect();
        const x = (clientX - rect.left) / rect.width;
        const y = (clientY - rect.top) / rect.height;
        
        if (x >= 0 && x <= 1) {
          onPixelClick(x * imgElement.naturalWidth, y * imgElement.naturalHeight);
        }
      }
    }

    if (isPainting && isGenerativeBrush && contentRef.current && onBrushUpdate && clientX !== undefined && clientY !== undefined) {
       const imgElement = contentRef.current.querySelector('img');
       if (imgElement) {
         const rect = imgElement.getBoundingClientRect();
         const x = Math.round(((clientX - rect.left) / rect.width) * 100);
         const y = Math.round(((clientY - rect.top) / rect.height) * 100);
         if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
            const exists = brushMask.some(p => Math.abs(p.x - x) < 2 && Math.abs(p.y - y) < 2);
            if (!exists) onBrushUpdate([...brushMask, { x, y }]);
         }
       }
    }

    setIsDragging(false);
    setIsHolding(false);
    setIsPainting(false);
    setActiveTextId(null);
  };

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    const textId = target.closest('[data-text-id]')?.getAttribute('data-text-id');

    if (textId) {
      const touch = e.touches[0];
      setActiveTextId(textId);
      setIsDragging(true);
      setDragStart({ x: touch.clientX, y: touch.clientY });
      return;
    }

    if (isGenerativeBrush) {
      setIsPainting(true);
      return;
    }

    if (isMagicEraser || isShadowTargeting) return;

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    } else if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setLastTouchDistance(distance);
    }
    if (mode === 'hold') setIsHolding(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      
      // Handle Text Dragging
      if (activeTextId && isDragging && onUpdateTextLayer) {
        const dx = (touch.clientX - dragStart.x) / (contentRef.current?.clientWidth || 1) * 100;
        const dy = (touch.clientY - dragStart.y) / (contentRef.current?.clientHeight || 1) * 100;
        const layer = textLayers.find(l => l.id === activeTextId);
        if (layer) {
          onUpdateTextLayer(activeTextId, {
            x: Math.max(0, Math.min(100, layer.x + dx)),
            y: Math.max(0, Math.min(100, layer.y + dy))
          });
          setDragStart({ x: touch.clientX, y: touch.clientY });
        }
        return;
      }

      // Handle Painting
      if (isPainting && isGenerativeBrush && contentRef.current && onBrushUpdate) {
        const imgElement = contentRef.current.querySelector('img');
        if (imgElement) {
          const rect = imgElement.getBoundingClientRect();
          const x = Math.round(((touch.clientX - rect.left) / rect.width) * 100);
          const y = Math.round(((touch.clientY - rect.top) / rect.height) * 100);
          
          if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
            const exists = brushMask.some(p => Math.abs(p.x - x) < 2 && Math.abs(p.y - y) < 2);
            if (!exists) {
              onBrushUpdate([...brushMask, { x, y }]);
            }
          }
        }
        return;
      }

      // Handle Pan
      if (isDragging) {
        setPosition({
          x: touch.clientX - dragStart.x,
          y: touch.clientY - dragStart.y
        });
      }
    } else if (e.touches.length === 2 && lastTouchDistance !== null) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = (distance - lastTouchDistance) * 0.01;
      const newScale = Math.min(Math.max(0.5, scale + delta), 5);
      setScale(newScale);
      setLastTouchDistance(distance);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) setLastTouchDistance(null);
    handleMouseUp(e);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const preventDefault = (e: Event) => e.preventDefault();
    container.addEventListener('wheel', preventDefault, { passive: false });
    return () => container.removeEventListener('wheel', preventDefault);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#050505] flex items-center justify-center rounded-3xl border border-white/5 select-none group">
      {/* Controls Overlay */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 md:px-4 md:py-2 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity pointer-events-auto max-md:opacity-100">
        <button onClick={() => setScale(s => Math.max(0.5, s - 0.5))} className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center hover:bg-white/10 rounded-full text-white"><i className="fas fa-minus"></i></button>
        <span className="text-xs font-mono font-bold w-14 md:w-12 text-center">{Math.round(scale * 100)}%</span>
        <button onClick={() => setScale(s => Math.min(5, s + 0.5))} className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center hover:bg-white/10 rounded-full text-white"><i className="fas fa-plus"></i></button>
        <div className="w-[1px] h-6 md:h-4 bg-white/20 mx-2"></div>
        <button onClick={resetView} className="text-[10px] md:text-xs font-bold uppercase hover:text-indigo-400 px-3 md:px-2">Reset</button>
      </div>

      {isMagicEraser && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 bg-rose-600 text-white px-4 py-2 rounded-full shadow-lg animate-pulse flex items-center gap-2 pointer-events-none">
          <i className="fas fa-eraser"></i>
          <span className="text-xs font-black uppercase tracking-wider">Modalità Gomma Magica Attiva</span>
        </div>
      )}

      {isShadowTargeting && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg animate-pulse flex items-center gap-2 pointer-events-none">
          <i className="fas fa-crosshairs"></i>
          <span className="text-xs font-black uppercase tracking-wider">Seleziona Zone d'Ombra</span>
        </div>
      )}

      <div 
        ref={containerRef}
        className={`relative transition-transform duration-75 ease-out ${isMagicEraser || isShadowTargeting ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}`}
        style={{ 
          transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
          transformOrigin: 'center center',
          maxWidth: '100%',
          maxHeight: '100%',
          willChange: 'transform'
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* SVG Filter for Curves */}
        {curveTables && (
          <div style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', opacity: 0, pointerEvents: 'none' }} aria-hidden="true">
            <svg width="1" height="1">
              <filter id={curveFilterId} colorInterpolationFilters="sRGB">
                <feComponentTransfer>
                  <feFuncR type="table" tableValues={curveTables.red} />
                  <feFuncG type="table" tableValues={curveTables.green} />
                  <feFuncB type="table" tableValues={curveTables.blue} />
                </feComponentTransfer>
                <feComponentTransfer>
                  <feFuncR type="table" tableValues={curveTables.rgb} />
                  <feFuncG type="table" tableValues={curveTables.rgb} />
                  <feFuncB type="table" tableValues={curveTables.rgb} />
                </feComponentTransfer>
              </filter>
            </svg>
          </div>
        )}

        <div 
          ref={contentRef} 
          className={mode === 'slider' ? 'shadow-2xl w-[90vw] md:w-[70vw] lg:w-[60vw] aspect-video max-h-[85vh]' : 'relative shadow-2xl'}
        >
          {mode === 'slider' ? (
             <div className="w-full h-full" style={{ filter: filters?.filter }}>
                {/* Vignette & Warmth Overlay for Slider Mode (Applies to whole slider area) */}
                {grading && (
                  <>
                     <div className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay" style={{ backgroundColor: filters?.warmth.color, opacity: filters?.warmth.opacity }}></div>
                     <div className="absolute inset-0 z-20 pointer-events-none" style={{ background: `radial-gradient(circle, transparent 50%, black 150%)`, opacity: filters?.vignette }}></div>
                  </>
                )}
                <BeforeAfterSlider before={before} after={after} />
             </div>
          ) : mode === 'side' ? (
            <div className="flex gap-4 p-4 h-full max-h-[85vh] w-[90vw]">
              <div className="relative flex-1 bg-black/20 rounded-2xl overflow-hidden border border-white/5 h-full">
                <img 
                  key={before}
                  src={before} 
                  alt="Before" 
                  className="w-full h-full object-contain" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-white border border-white/10">Originale</div>
              </div>
              <div className="relative flex-1 bg-black/20 rounded-2xl overflow-hidden border border-white/5 h-full">
                <div style={{ filter: filters?.filter }} className="w-full h-full">
                   <img 
                     key={after}
                     src={after} 
                     alt="After" 
                     className="w-full h-full object-contain" 
                     referrerPolicy="no-referrer"
                   />
                   {grading && (
                      <>
                        <div className="absolute inset-0 pointer-events-none mix-blend-overlay" style={{ backgroundColor: filters?.warmth.color, opacity: filters?.warmth.opacity }}></div>
                        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle, transparent 50%, black 150%)`, opacity: filters?.vignette }}></div>
                      </>
                   )}
                </div>
                <div className="absolute top-4 left-4 bg-indigo-600/80 backdrop-blur px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-white border border-white/10">Ritoccata</div>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Brush Overlay */}
              {isGenerativeBrush && brushMask.length > 0 && (
                <div className="absolute inset-0 z-20 pointer-events-none">
                  <svg className="w-full h-full">
                    {brushMask.map((p, i) => (
                      <circle 
                        key={i} 
                        cx={`${p.x}%`} 
                        cy={`${p.y}%`} 
                        r={brushSize / 4} 
                        fill="rgba(79, 70, 229, 0.4)" 
                        className="animate-pulse"
                      />
                    ))}
                  </svg>
                </div>
              )}

              {/* Image Container with Filters */}
              <div className="relative" style={{ filter: isHolding ? 'none' : filters?.filter }}>
                  <img 
                    key={isHolding ? before : after}
                    src={isHolding ? before : after} 
                    alt="View" 
                    className="max-h-[85vh] w-auto object-contain pointer-events-none" 
                    referrerPolicy="no-referrer"
                  />
                  {/* Warmth Overlay (Only on After) */}
                  {!isHolding && grading && (
                     <div className="absolute inset-0 pointer-events-none mix-blend-overlay" style={{ backgroundColor: filters?.warmth.color, opacity: filters?.warmth.opacity }}></div>
                  )}
                  {/* Vignette Overlay (Only on After) */}
                  {!isHolding && grading && (
                     <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle, transparent 50%, black 150%)`, opacity: filters?.vignette }}></div>
                  )}

                  {/* Shadow Target Markers */}
                  {shadowTargets.length > 0 && (
                    <div className="absolute inset-0 pointer-events-none z-40">
                      {shadowTargets.map((target, i) => {
                        const imgElement = contentRef.current?.querySelector('img');
                        if (!imgElement) return null;
                        
                        // We need to map back from natural to displayed
                        const scaleX = imgElement.clientWidth / imgElement.naturalWidth;
                        const scaleY = imgElement.clientHeight / imgElement.naturalHeight;
                        
                        return (
                          <div 
                            key={i}
                            className="absolute w-6 h-6 -ml-3 -mt-3 border-2 border-indigo-500 rounded-full flex items-center justify-center bg-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.5)] animate-in zoom-in duration-300"
                            style={{ left: target.x * scaleX, top: target.y * scaleY }}
                          >
                            <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
                            <div className="absolute inset-0 border border-white/30 rounded-full animate-ping"></div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Text Layers */}
                  {!isHolding && textLayers.map(layer => (
                    <div 
                      key={layer.id}
                      data-text-id={layer.id}
                      className="absolute cursor-move select-none whitespace-nowrap group/text"
                      style={{ 
                        left: `${layer.x}%`, 
                        top: `${layer.y}%`, 
                        transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
                        fontSize: `${layer.fontSize}px`,
                        color: layer.color,
                        fontFamily: layer.fontFamily,
                        fontWeight: layer.fontWeight,
                        opacity: layer.opacity,
                        zIndex: 50,
                        textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                      }}
                    >
                      {layer.text}
                      <div className="absolute -inset-2 border-2 border-indigo-500/0 group-hover/text:border-indigo-500/50 rounded-lg transition-all pointer-events-none"></div>
                    </div>
                  ))}
              </div>
              
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-white border border-white/10 z-30">
                {isHolding ? 'Originale' : 'Ritoccata + Preview'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartImageViewer;
