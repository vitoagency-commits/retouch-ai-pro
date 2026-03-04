
import React, { useState, useCallback, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { RETOUCH_ACTIONS, LUT_PRESETS, PRO_PRESETS, ActionDetail, LUTPreset } from './constants';
import { RetouchAction, ProcessingState, RetouchResult, GradingSettings, FaceDetection, Point, BatchImage, TextLayer } from './types';
import { geminiService } from './services/geminiService';
import SmartImageViewer from './components/SmartImageViewer';
import ManualModal from './components/ManualModal';
import Histogram from './components/Histogram';
import CurvesControl from './components/CurvesControl';
import { persistenceService } from './services/persistenceService';

// Placeholder URL that represents the "Mystical & Enigmatic" concept.
const WELCOME_IMAGE_URL = "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=1920&h=1080";

const DEFAULT_GRADING: GradingSettings = {
  lut: 'none',
  intensity: 100,
  saturation: 0,
  warmth: 0,
  tint: 0,
  splitToning: {
    highlights: { hue: 0, saturation: 0 },
    shadows: { hue: 0, saturation: 0 },
    balance: 0
  },
  hsl: {
    reds: { hue: 0, saturation: 0, luminance: 0 },
    yellows: { hue: 0, saturation: 0, luminance: 0 },
    greens: { hue: 0, saturation: 0, luminance: 0 },
    cyans: { hue: 0, saturation: 0, luminance: 0 },
    blues: { hue: 0, saturation: 0, luminance: 0 },
    magentas: { hue: 0, saturation: 0, luminance: 0 },
  },
  exposure: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  vignette: 0,
  grain: 0,
  sepia: 0,
  sharpness: 0,
  curves: {
    rgb: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
    red: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
    green: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
    blue: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
  }
};

const getAspectRatioLabel = (width: number, height: number): string => {
  const ratio = width / height;
  const tolerance = 0.05;

  if (Math.abs(ratio - 1) < tolerance) return "1:1";
  if (Math.abs(ratio - (9/16)) < tolerance) return "9:16";
  if (Math.abs(ratio - (4/5)) < tolerance) return "4:5";
  if (Math.abs(ratio - (16/9)) < tolerance) return "16:9";
  if (Math.abs(ratio - (3/2)) < tolerance) return "3:2";
  if (Math.abs(ratio - (2/3)) < tolerance) return "2:3";
  if (Math.abs(ratio - (4/3)) < tolerance) return "4:3";
  if (Math.abs(ratio - (3/4)) < tolerance) return "3:4";
  if (Math.abs(ratio - 1.91) < tolerance) return "1.91:1";
  
  return `${width}:${height}`;
};

const WelcomeScreen: React.FC<{ onEnter: () => void }> = ({ onEnter }) => {
  return (
    <div 
      onClick={onEnter} 
      className="fixed inset-0 z-[9999] bg-[#020202] flex flex-col items-center justify-center cursor-pointer animate-fade-in group"
    >
      <div className="relative max-w-4xl w-full p-8 flex flex-col items-center">
        {/* Glow Effect behind image */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-purple-600/20 blur-[140px] rounded-full animate-pulse"></div>
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-fuchsia-500/20 blur-[60px] rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-indigo-500/20 blur-[80px] rounded-full"></div>
        
        {/* Main Image Container */}
        <div className="relative z-10 w-full aspect-video md:aspect-[16/9] max-h-[75vh] rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(168,85,247,0.2)] border border-white/10 group-hover:border-fuchsia-500/50 transition-all duration-1000 group-hover:scale-[1.01]">
            <img 
              src={WELCOME_IMAGE_URL} 
              alt="RetouchAI Pro Welcome" 
              className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-all duration-1000 scale-105 group-hover:scale-100" 
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1920&h=1080";
              }}
            />
            
            {/* Mystical Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-purple-900/20 mix-blend-overlay"></div>
            
            {/* Overlay Text */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/20 flex flex-col items-center justify-end pb-16">
               <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400 uppercase tracking-tighter mb-2 drop-shadow-[0_0_40px_rgba(217,70,239,0.4)]">
                 RetouchAI <span className="text-white">PRO</span>
               </h1>
               <p className="text-fuchsia-300/60 text-sm md:text-xl font-light tracking-[0.4em] uppercase mb-10">
                 The Art of Mystical Perfection
               </p>
               
               <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-white/50 group-hover:text-white transition-colors uppercase tracking-widest animate-pulse">
                  <span className="w-8 h-[1px] bg-white/50"></span>
                  Click anywhere to start
                  <span className="w-8 h-[1px] bg-white/50"></span>
               </div>
            </div>
        </div>
      </div>
      
      {/* Credits */}
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center justify-center text-[10px] md:text-xs font-bold tracking-[0.2em] text-white/20 uppercase pointer-events-none">
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 px-4 text-center">
          <span>CREATED by COSMOPOLITANAGENCY</span>
          <span className="hidden md:inline opacity-30">|</span>
          <span>www.cosmopolitanagency.it</span>
          <span className="hidden md:inline opacity-30">|</span>
          <span>+39 333 59 64 357</span>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [hasEntered, setHasEntered] = useState(false);
  const [batch, setBatch] = useState<BatchImage[]>([]);
  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [activeAction, setActiveAction] = useState<RetouchAction>(RetouchAction.DODGE_BURN);
  const [sidebarTab, setSidebarTab] = useState<'retouch' | 'grade' | 'presets' | 'history'>('retouch');
  const [grading, setGrading] = useState<GradingSettings>(DEFAULT_GRADING);
  const [processing, setProcessing] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    status: ''
  });
  const [useHighQuality, setUseHighQuality] = useState(false);
  const [showKeySelection, setShowKeySelection] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [autoMask, setAutoMask] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportConfig, setExportConfig] = useState({ 
    format: 'image/jpeg', 
    quality: 0.92, 
    preserveMetadata: true,
    prefix: '',
    suffix: '-retouched',
    resizeWidth: 0, // 0 means no resize
    isBatch: false
  });
  
  // Sampling & Magic Eraser States
  const [isSamplingColor, setIsSamplingColor] = useState(false);
  const [sampledColor, setSampledColor] = useState<string | null>(null);
  const [isMagicEraser, setIsMagicEraser] = useState(false);
  const [isGenerativeBrush, setIsGenerativeBrush] = useState(false);
  const [brushSize, setBrushSize] = useState(40);
  const [brushMask, setBrushMask] = useState<Point[]>([]);
  const [actionIntensity, setActionIntensity] = useState<number>(50);

  const [viewMode, setViewMode] = useState<'slider' | 'hold' | 'side'>('slider');

  const [lang, setLang] = useState<'IT' | 'EN'>('IT');
  const [showMetadata, setShowMetadata] = useState(false);
  const [showHSL, setShowHSL] = useState(false);
  const [showBasic, setShowBasic] = useState(false);
  const [showCurves, setShowCurves] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const currentImage = activeIdx >= 0 ? batch[activeIdx] : null;

  useEffect(() => {
    const checkApiKey = async () => {
      if (useHighQuality) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) setShowKeySelection(true);
      }
    };
    if (hasEntered) checkApiKey();
  }, [useHighQuality, hasEntered]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && e.key === 'z') {
        if (e.shiftKey) handleRedo(); else handleUndo();
      } else if (isCmdOrCtrl && e.key === 'y') handleRedo();
      
      if (e.key === 'Escape') {
        if (isSamplingColor) setIsSamplingColor(false);
        if (isMagicEraser) setIsMagicEraser(false);
        if (showManual) setShowManual(false);
      }

      if (e.key === '\\') {
        setViewMode(v => v === 'hold' ? 'slider' : 'hold');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [batch, activeIdx, isSamplingColor, isMagicEraser, showManual]);

  const handleSelectKey = async () => {
    await (window as any).aistudio.openSelectKey();
    setShowKeySelection(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    const newImages: BatchImage[] = files.map((file) => {
      const isRawFile = file.name.match(/\.(arw|cr2|cr3|nef|dng|orf|rw2|raf)$/i);
      const url = URL.createObjectURL(file);
      
      // Update dimensions asynchronously
      const img = new Image();
      img.onload = () => {
        const label = getAspectRatioLabel(img.naturalWidth, img.naturalHeight);
        setBatch(prev => prev.map(b => b.name === file.name ? { 
          ...b, 
          dimensions: { width: img.naturalWidth, height: img.naturalHeight },
          aspectRatio: label
        } : b));
      };
      img.src = url;

      return {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        originalUrl: url,
        currentUrl: url,
        status: 'idle',
        history: [],
        historyIndex: -1,
        faces: [],
        isRaw: !!isRawFile,
        textLayers: []
      };
    });

    setBatch(prev => {
      const updated = [...prev, ...newImages];
      if (activeIdx === -1) setActiveIdx(prev.length);
      return updated;
    });

    // Detect faces for each new image
    newImages.forEach(async (img) => {
      try {
        const response = await fetch(img.originalUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          geminiService.detectFaces(base64).then(faces => {
            setBatch(prev => prev.map((b) => b.id === img.id ? { ...b, faces } : b));
          });
        };
        reader.readAsDataURL(blob);
      } catch (e) {
        console.error("Face detection failed for", img.name, e);
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleApplyPreset = async (preset: any) => {
    if (activeIdx < 0 || !currentImage) return;
    
    setProcessing({ isProcessing: true, progress: 0, status: `Applicazione Preset: ${preset.name}...` });
    
    try {
      // 1. Apply Grading
      setGrading(prev => ({ ...prev, ...preset.grading }));
      
      // 2. Run Actions in sequence
      let lastUrl = currentImage.currentUrl;
      for (let i = 0; i < preset.actions.length; i++) {
        const actionId = preset.actions[i];
        const action = RETOUCH_ACTIONS.find(a => a.id === actionId)!;
        setProcessing(p => ({ ...p, progress: Math.round(((i + 1) / preset.actions.length) * 100), status: `Esecuzione: ${action.label}...` }));
        lastUrl = await performRetouch(lastUrl, action.prompt, actionId, true);
      }
      
      setSidebarTab('history');
    } catch (e) {
      console.error("Preset failed", e);
    } finally {
      setProcessing({ isProcessing: false, progress: 0, status: '' });
    }
  };

  const handleSyncSettings = () => {
    if (activeIdx < 0 || batch.length < 2) return;
    const source = batch[activeIdx];
    
    setBatch(prev => prev.map((img, idx) => {
      if (idx === activeIdx) return img;
      return {
        ...img,
        // In a real pro app, we might want to re-run the AI with the same prompts
        // but for this demo, we'll sync the grading settings at least
        // and mark them for batch processing if needed.
      };
    }));
    
    setProcessing({ isProcessing: false, progress: 100, status: 'Impostazioni sincronizzate su tutto il batch!' });
    setTimeout(() => setProcessing(p => ({ ...p, status: '' })), 3000);
  };

  const drawTextLayers = (ctx: CanvasRenderingContext2D, layers: TextLayer[], width: number, height: number) => {
    layers.forEach(layer => {
      ctx.save();
      const x = (layer.x / 100) * width;
      const y = (layer.y / 100) * height;
      
      ctx.translate(x, y);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      
      ctx.font = `${layer.fontWeight} ${layer.fontSize * (width / 1000)}px ${layer.fontFamily}`;
      ctx.fillStyle = layer.color;
      ctx.globalAlpha = layer.opacity;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Add a subtle shadow for better readability
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;
      
      ctx.fillText(layer.text, 0, 0);
      ctx.restore();
    });
  };

  const handleExport = async () => {
    if (exportConfig.isBatch) {
      await handleBatchExport();
      return;
    }
    if (!currentImage) return;
    
    setProcessing({ isProcessing: true, progress: 50, status: 'Preparazione File...' });
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let targetWidth = img.naturalWidth;
      let targetHeight = img.naturalHeight;

      if (exportConfig.resizeWidth > 0) {
        const ratio = img.naturalHeight / img.naturalWidth;
        targetWidth = exportConfig.resizeWidth;
        targetHeight = Math.round(targetWidth * ratio);
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        
        // Draw Text Layers
        drawTextLayers(ctx, currentImage.textLayers, targetWidth, targetHeight);
        
        const dataUrl = canvas.toDataURL(exportConfig.format, exportConfig.quality);
        const fileName = `${exportConfig.prefix}${currentImage.name.split('.')[0]}${exportConfig.suffix}.${exportConfig.format.split('/')[1]}`;
        saveAs(dataUrl, fileName);
      }
      setShowExportModal(false);
      setProcessing({ isProcessing: false, progress: 0, status: '' });
    };
    img.src = currentImage.currentUrl;
  };

  const handleBatchExport = async () => {
    if (batch.length === 0) return;
    setProcessing({ isProcessing: true, progress: 0, status: 'Preparazione Batch ZIP...' });
    
    const zip = new JSZip();
    const folder = zip.folder("retouched_images");

    for (let i = 0; i < batch.length; i++) {
      const item = batch[i];
      setProcessing(p => ({ ...p, progress: Math.round((i / batch.length) * 100), status: `Rendering & Compressione: ${item.name}...` }));
      
      // Render image with text layers to canvas
      const blob = await new Promise<Blob>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            drawTextLayers(ctx, item.textLayers, canvas.width, canvas.height);
            canvas.toBlob((b) => resolve(b!), exportConfig.format, exportConfig.quality);
          }
        };
        img.src = item.currentUrl;
      });

      const fileName = `${exportConfig.prefix}${item.name.split('.')[0]}${exportConfig.suffix}.${exportConfig.format.split('/')[1]}`;
      folder?.file(fileName, blob);
    }

    setProcessing({ isProcessing: true, progress: 95, status: 'Generazione Archivio...' });
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "apex_studio_batch.zip");
    
    setShowExportModal(false);
    setProcessing({ isProcessing: false, progress: 0, status: '' });
  };

  // Persistence Logic
  const saveProject = useCallback(async () => {
    if (batch.length === 0) return;
    try {
      await persistenceService.saveProject(batch, 'Progetto Corrente');
    } catch (e) {
      console.error("Save project failed", e);
    }
  }, [batch]);

  const loadProject = useCallback(async () => {
    try {
      const batchData = await persistenceService.loadProject();
      if (batchData && batchData.length > 0) {
        setBatch(batchData);
        setActiveIdx(0);
      }
    } catch (e) {
      console.error("Load project failed", e);
    }
  }, []);

  const clearProject = useCallback(async () => {
    if (window.confirm("Sei sicuro di voler eliminare definitivamente il progetto salvato? Questa operazione libererà spazio sul disco.")) {
      try {
        await persistenceService.clearProject();
        alert("Sessione eliminata con successo.");
      } catch (e) {
        console.error("Clear project failed", e);
      }
    }
  }, []);

  const exportSession = async () => {
    if (batch.length === 0) return;
    setProcessing({ isProcessing: true, progress: 0, status: 'Preparazione Sessione...' });
    try {
      const zip = new JSZip();
      
      const projectData = await Promise.all(batch.map(async (item) => {
        const originalBlob = await fetch(item.originalUrl).then(r => r.blob());
        const currentBlob = await fetch(item.currentUrl).then(r => r.blob());
        
        const originalPath = `images/${item.id}_orig.jpg`;
        const currentPath = `images/${item.id}_curr.jpg`;
        
        zip.file(originalPath, originalBlob);
        zip.file(currentPath, currentBlob);

        const history = await Promise.all(item.history.map(async (h, hIdx) => {
          const hOrigBlob = await fetch(h.originalImage).then(r => r.blob());
          const hRetBlob = await fetch(h.retouchedImage).then(r => r.blob());
          const hOrigPath = `history/${item.id}_${hIdx}_orig.jpg`;
          const hRetPath = `history/${item.id}_${hIdx}_ret.jpg`;
          zip.file(hOrigPath, hOrigBlob);
          zip.file(hRetPath, hRetBlob);
          return { ...h, originalImage: hOrigPath, retouchedImage: hRetPath };
        }));

        return { ...item, originalUrl: originalPath, currentUrl: currentPath, history };
      }));

      zip.file("project.json", JSON.stringify(projectData));
      
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Apex_Session_${new Date().toISOString().split('T')[0]}.apex`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export session failed", e);
      alert("Errore durante l'esportazione della sessione.");
    } finally {
      setProcessing({ isProcessing: false, progress: 0, status: '' });
    }
  };

  const importSession = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessing({ isProcessing: true, progress: 0, status: 'Caricamento Sessione...' });
    try {
      const zip = await JSZip.loadAsync(file);
      const projectJson = await zip.file("project.json")?.async("string");
      if (!projectJson) throw new Error("Invalid session file");
      
      const projectData = JSON.parse(projectJson) as BatchImage[];
      
      const restoredBatch = await Promise.all(projectData.map(async (item) => {
        const originalBlob = await zip.file(item.originalUrl)?.async("blob");
        const currentBlob = await zip.file(item.currentUrl)?.async("blob");
        
        const originalUrl = URL.createObjectURL(originalBlob!);
        const currentUrl = URL.createObjectURL(currentBlob!);
        
        const history = await Promise.all(item.history.map(async (h) => {
          const hOrigBlob = await zip.file(h.originalImage)?.async("blob");
          const hRetBlob = await zip.file(h.retouchedImage)?.async("blob");
          return {
            ...h,
            originalImage: URL.createObjectURL(hOrigBlob!),
            retouchedImage: URL.createObjectURL(hRetBlob!)
          };
        }));

        return { ...item, originalUrl, currentUrl, history };
      }));

      setBatch(restoredBatch);
      setActiveIdx(0);
      alert("Sessione ripristinata con successo.");
    } catch (e) {
      console.error("Import session failed", e);
      alert("Errore durante l'importazione della sessione. Assicurati che il file sia un archivio .apex valido.");
    } finally {
      setProcessing({ isProcessing: false, progress: 0, status: '' });
      e.target.value = '';
    }
  };

  // Auto-save every 30 seconds if changes occur
  useEffect(() => {
    const timer = setTimeout(() => {
      if (batch.length > 0) saveProject();
    }, 30000);
    return () => clearTimeout(timer);
  }, [batch, saveProject]);

  const batchRef = useRef(batch);
  useEffect(() => {
    batchRef.current = batch;
  }, [batch]);

  // Cleanup Object URLs on unmount
  useEffect(() => {
    return () => {
      batchRef.current.forEach(img => {
        if (img.originalUrl.startsWith('blob:')) URL.revokeObjectURL(img.originalUrl);
        img.history.forEach(step => {
          if (step.retouchedImage.startsWith('blob:')) URL.revokeObjectURL(step.retouchedImage);
        });
      });
    };
  }, []);

  const addWatermark = () => {
    if (activeIdx < 0) return;
    const year = new Date().getFullYear();
    const newLayer: TextLayer = {
      id: Math.random().toString(36).substr(2, 9),
      text: `© ${year} Apex Studio`,
      x: 90,
      y: 95,
      fontSize: 24,
      color: '#ffffff',
      fontFamily: 'Inter',
      fontWeight: '600',
      opacity: 0.6,
      rotation: 0
    };
    setBatch(prev => prev.map((img, i) => i === activeIdx ? { ...img, textLayers: [...img.textLayers, newLayer] } : img));
  };

  const addTextLayer = (initialText?: string) => {
    if (activeIdx < 0) return;
    const newLayer: TextLayer = {
      id: Math.random().toString(36).substr(2, 9),
      text: initialText || 'Nuovo Testo',
      x: 50,
      y: 50,
      fontSize: 40,
      color: '#ffffff',
      fontFamily: 'Inter',
      fontWeight: '900',
      opacity: 1,
      rotation: 0
    };
    setBatch(prev => prev.map((img, i) => i === activeIdx ? { ...img, textLayers: [...img.textLayers, newLayer] } : img));
  };

  const updateTextLayer = (layerId: string, updates: Partial<TextLayer>) => {
    setBatch(prev => prev.map((img, i) => i === activeIdx ? {
      ...img,
      textLayers: img.textLayers.map(l => l.id === layerId ? { ...l, ...updates } : l)
    } : img));
  };

  const removeTextLayer = (layerId: string) => {
    setBatch(prev => prev.map((img, i) => i === activeIdx ? {
      ...img,
      textLayers: img.textLayers.filter(l => l.id !== layerId)
    } : img));
  };

  const removeFromBatch = (idx: number) => {
    setBatch(prev => {
      const updated = prev.filter((_, i) => i !== idx);
      if (activeIdx === idx) {
        setActiveIdx(updated.length > 0 ? Math.max(0, idx - 1) : -1);
      } else if (activeIdx > idx) {
        setActiveIdx(activeIdx - 1);
      }
      return updated;
    });
  };

  const handleUndo = () => {
    if (activeIdx < 0) return;
    setBatch(prev => prev.map((img, i) => {
      if (i === activeIdx && img.historyIndex >= 0) {
        const newIdx = img.historyIndex - 1;
        return {
          ...img,
          historyIndex: newIdx,
          currentUrl: newIdx >= 0 ? img.history[newIdx].retouchedImage : img.originalUrl,
          textLayers: newIdx >= 0 ? (img.history[newIdx].textLayers || []) : []
        };
      }
      return img;
    }));
  };

  const handleRedo = () => {
    if (activeIdx < 0) return;
    setBatch(prev => prev.map((img, i) => {
      if (i === activeIdx && img.historyIndex < img.history.length - 1) {
        const newIdx = img.historyIndex + 1;
        return {
          ...img,
          historyIndex: newIdx,
          currentUrl: img.history[newIdx].retouchedImage,
          textLayers: img.history[newIdx].textLayers || []
        };
      }
      return img;
    }));
  };

  const jumpToHistory = (historyIndex: number) => {
    if (activeIdx < 0) return;
    setBatch(prev => prev.map((img, i) => {
      if (i === activeIdx) {
        return {
          ...img,
          historyIndex: historyIndex,
          currentUrl: historyIndex === -1 ? img.originalUrl : img.history[historyIndex].retouchedImage,
          textLayers: historyIndex === -1 ? [] : (img.history[historyIndex].textLayers || [])
        };
      }
      return img;
    }));
  };

  const buildGradingPrompt = (settings: GradingSettings) => {
    let p = "";
    if (settings.lut !== 'none') {
      const lut = LUT_PRESETS.find(l => l.id === settings.lut);
      p += `Apply a ${lut?.name} color grading look with ${settings.intensity}% intensity. `;
    } else {
        p += `Apply professional color grading. `;
    }
    const adjustments = [];
    if (settings.exposure !== 0) adjustments.push(`Exposure: ${settings.exposure > 0 ? '+' : ''}${settings.exposure}%`);
    if (settings.contrast !== 0) adjustments.push(`Contrast: ${settings.contrast > 0 ? '+' : ''}${settings.contrast}%`);
    if (settings.saturation !== 0) adjustments.push(`Saturation: ${settings.saturation > 0 ? '+' : ''}${settings.saturation}%`);
    if (settings.warmth !== 0) adjustments.push(`Temperature: ${settings.warmth > 0 ? '+' : ''}${settings.warmth}%`);
    if (settings.tint !== 0) adjustments.push(`Tint (Green/Magenta): ${settings.tint > 0 ? '+' : ''}${settings.tint}%`);
    if (settings.highlights !== 0) adjustments.push(`Highlights: ${settings.highlights > 0 ? '+' : ''}${settings.highlights}%`);
    if (settings.shadows !== 0) adjustments.push(`Shadows: ${settings.shadows > 0 ? '+' : ''}${settings.shadows}%`);
    if (settings.whites !== 0) adjustments.push(`Whites: ${settings.whites > 0 ? '+' : ''}${settings.whites}%`);
    if (settings.blacks !== 0) adjustments.push(`Blacks: ${settings.blacks > 0 ? '+' : ''}${settings.blacks}%`);
    if (settings.vignette > 0) adjustments.push(`Vignette: ${settings.vignette}% dark edges to focus on center`);
    if (settings.grain > 0) adjustments.push(`Film Grain: Add ${settings.grain}% organic film grain texture`);
    
    if (adjustments.length > 0) {
        p += `Apply global adjustments: ${adjustments.join(', ')}. `;
    }

    // HSL
    const hslAdjustments: string[] = [];
    Object.entries(settings.hsl).forEach(([color, vals]) => {
      if (vals.hue !== 0 || vals.saturation !== 0 || vals.luminance !== 0) {
        hslAdjustments.push(`${color} (H:${vals.hue}, S:${vals.saturation}, L:${vals.luminance})`);
      }
    });
    if (hslAdjustments.length > 0) {
      p += `Apply HSL selective color adjustments: ${hslAdjustments.join('; ')}. `;
    }

    // Split Toning
    if (settings.splitToning.highlights.saturation > 0 || settings.splitToning.shadows.saturation > 0) {
      p += `Apply Split Toning: Tint highlights with hue ${settings.splitToning.highlights.hue} (sat ${settings.splitToning.highlights.saturation}%) and shadows with hue ${settings.splitToning.shadows.hue} (sat ${settings.splitToning.shadows.saturation}%). Balance: ${settings.splitToning.balance}. `;
    }

    p += "Maintain natural skin tones and focus on creating professional depth and cinematic color harmony.";
    return p;
  };

  const toBase64 = (url: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      } catch (e) {
        reject(e);
      }
    });
  };

  const performRetouch = async (sourceImage: string, prompt: string, actionId: any, isSilent: boolean = false, intensity: number = 50) => {
    if (activeIdx < 0) return "";
    
    if (!isSilent) setProcessing({ isProcessing: true, progress: 40, status: `Elaborazione neurale (${useHighQuality ? 'Ultra HD' : 'Fast'})...` });
    
    try {
      // Convert blob URL to base64 if needed
      let base64Image = sourceImage;
      if (sourceImage.startsWith('blob:')) {
        base64Image = await toBase64(sourceImage);
      }

      const model = useHighQuality ? 'gemini-3.1-flash-image-preview' : 'gemini-2.5-flash-image';
      
      // Add intensity context to the prompt
      const intensityContext = `Apply this effect with an intensity of ${intensity}/100. ${
        intensity < 30 ? 'Keep the effect very subtle and natural.' : 
        intensity > 75 ? 'Make the effect strong and clearly visible.' : 
        'Apply the effect with a balanced, professional intensity.'
      }`;
      
      const basePrompt = `${prompt} ${intensityContext}`;
      let finalPrompt = autoMask ? `${basePrompt} Use Smart Auto-Masking to protect the subject and only affect the targeted areas.` : basePrompt;
      
      if ((actionId === RetouchAction.GENERATIVE_REMOVE || actionId === RetouchAction.REMOVE_REFLECTION) && brushMask.length > 0) {
        finalPrompt += ` The area to be processed is defined by these normalized coordinates (0-100 scale): ${JSON.stringify(brushMask)}. Focus specifically on this area to remove the target element (object, text, or reflection) and reconstruct the background perfectly.`;
      }

      if (actionId === RetouchAction.RED_EYE_REMOVAL && batch[activeIdx].faces.length > 0) {
        const faceCoords = batch[activeIdx].faces.map(f => f.landmarks);
        finalPrompt += ` Detected face landmarks for reference: ${JSON.stringify(faceCoords)}. Focus on the pupils of these detected eyes to remove the red-eye effect.`;
      }

      const resultUrl = await geminiService.retouchImage(base64Image, finalPrompt, model);

      const newResult: RetouchResult = {
        id: Date.now().toString() + Math.random(),
        originalImage: sourceImage,
        retouchedImage: resultUrl,
        action: actionId,
        timestamp: Date.now(),
        gradingSettings: actionId === RetouchAction.COLOR_GRADE ? { ...grading } : undefined,
        textLayers: [...(batch[activeIdx].textLayers || [])]
      };

      setBatch(prev => prev.map((b, i) => {
        if (i === activeIdx) {
          const truncatedHistory = b.history.slice(0, b.historyIndex + 1);
          const newHistory = [...truncatedHistory, newResult];
          return {
            ...b,
            currentUrl: resultUrl,
            history: newHistory,
            historyIndex: newHistory.length - 1,
            status: 'completed'
          };
        }
        return b;
      }));
      if (!isSilent) setSidebarTab('history');
      
      // If we just applied a grading, reset the sliders so they don't apply twice (visually)
      if (actionId === RetouchAction.COLOR_GRADE) {
        setGrading(DEFAULT_GRADING);
      }
      
      return resultUrl;
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes("Requested entity was not found")) setShowKeySelection(true);
      else if (!isSilent) alert(`Errore: ${error.message}`);
      throw error;
    } finally {
      if (!isSilent) setProcessing({ isProcessing: false, progress: 0, status: '' });
      setIsMagicEraser(false);
      setIsGenerativeBrush(false);
      setBrushMask([]);
    }
  };

  const handleSmartWorkflow = async () => {
    if (activeIdx < 0 || !currentImage) return;
    setProcessing({ isProcessing: true, progress: 10, status: 'Avvio Sequenza Ottimale...' });
    
    try {
      const sequence = [
        RETOUCH_ACTIONS.find(a => a.id === RetouchAction.HEAL)!,
        RETOUCH_ACTIONS.find(a => a.id === RetouchAction.DODGE_BURN)!,
        RETOUCH_ACTIONS.find(a => a.id === RetouchAction.SKIN_TONE)!,
        RETOUCH_ACTIONS.find(a => a.id === RetouchAction.PORTRAIT_VOLUMES)!
      ];

      let lastImage = currentImage.currentUrl;
      for (let i = 0; i < sequence.length; i++) {
        const step = sequence[i];
        setProcessing(p => ({ ...p, progress: 20 + (i * 20), status: `Esecuzione: ${step.label}...` }));
        lastImage = await performRetouch(lastImage, step.prompt, step.id, true);
      }
      setSidebarTab('history');
    } catch (e) {
      console.error("Workflow failed", e);
    } finally {
      setProcessing({ isProcessing: false, progress: 0, status: '' });
    }
  };

  const handleMagicEraserClick = async (x: number, y: number) => {
    if (activeIdx < 0 || !currentImage) return;
    const prompt = `Magic Eraser: Remove the defect at pixel X=${x}, Y=${y}. Blend perfectly.`;
    await performRetouch(currentImage.currentUrl, prompt, RetouchAction.HEAL);
  };

  const handleActionClick = (action: ActionDetail) => {
    if (action.id === 'SMART_WORKFLOW') {
      handleSmartWorkflow();
      return;
    }

    setActiveAction(action.id as any);
    setIsSamplingColor(false);
    setIsMagicEraser(false);
    setIsGenerativeBrush(false);
    setBrushMask([]);
    // Reset intensity when switching tools
    setActionIntensity(50);
  };

  const handleApplyAction = async (action: ActionDetail) => {
    if (activeIdx === -1) return;
    
    const img = batch[activeIdx];
    let finalPrompt = action.prompt;
    if (action.id === RetouchAction.COLOR_GRADE) {
      finalPrompt += " " + buildGradingPrompt(grading);
    }
    await performRetouch(img.currentUrl, finalPrompt, action.id, false, actionIntensity);
    setBrushMask([]);
    setIsGenerativeBrush(false);
  };

  const updateGrading = (path: string, value: any) => {
    setGrading(prev => {
      const next = { ...prev };
      const keys = path.split('.');
      let current: any = next;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleResetGrading = () => {
    setGrading(DEFAULT_GRADING);
  };

  const handleAutoAdjust = () => {
    setGrading(prev => ({
      ...prev,
      exposure: 5,
      contrast: 12,
      highlights: -10,
      shadows: 15,
      whites: 8,
      blacks: -4,
      saturation: 10,
      sharpness: 25,
      warmth: 2
    }));
  };

  const runBatchProcess = async () => {
    if (batch.length === 0 || isBatchProcessing) return;
    
    const action = RETOUCH_ACTIONS.find(a => a.id === activeAction);
    if (!action) {
      alert("Seleziona un'azione prima di avviare il batch.");
      return;
    }

    setIsBatchProcessing(true);
    setProcessing({ isProcessing: true, progress: 0, status: `Inizializzazione Batch...` });

    for (let i = 0; i < batch.length; i++) {
      const progress = Math.round((i / batch.length) * 100);
      setProcessing(prev => ({ ...prev, progress, status: `Batch (${useHighQuality ? 'Ultra HD' : 'Fast'}): ${i + 1}/${batch.length}...` }));
      
      setBatch(prev => prev.map((img, idx) => idx === i ? { ...img, status: 'processing' } : img));
      
      try {
         const img = batch[i];
         
         // Convert blob URL to base64 if needed
         let base64Image = img.currentUrl;
         if (img.currentUrl.startsWith('blob:')) {
           base64Image = await toBase64(img.currentUrl);
         }

         const model = useHighQuality ? 'gemini-3.1-flash-image-preview' : 'gemini-2.5-flash-image';
         const resultUrl = await geminiService.retouchImage(base64Image, action.prompt, model);
         
         setBatch(prev => prev.map((b, idx) => {
            if (idx === i) {
               const newHistory = [...b.history, { id: Date.now().toString(), originalImage: b.currentUrl, retouchedImage: resultUrl, action: action.id as any, timestamp: Date.now() }];
               return { ...b, currentUrl: resultUrl, history: newHistory, historyIndex: newHistory.length - 1, status: 'completed' };
            }
            return b;
         }));
      } catch (err) {
        console.error("Batch error:", err);
        setBatch(prev => prev.map((img, idx) => idx === i ? { ...img, status: 'error' } : img));
      }
      
      // Small delay to allow UI to update and prevent blocking
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsBatchProcessing(false);
    setProcessing({ isProcessing: false, progress: 100, status: 'Batch completato!' });
  };

  const actionCategories = ['Skin', 'Details', 'Enhance', 'Texture', 'Global'];

  // Conditional rendering for Splash Screen
  if (!hasEntered) {
    return <WelcomeScreen onEnter={() => setHasEntered(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-slate-100 font-sans h-screen overflow-hidden animate-fade-in">
      {/* Manual Modal */}
      {showManual && <ManualModal onClose={() => setShowManual(false)} />}

      {showKeySelection && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-6">
          <div className="bg-[#111] border border-white/10 max-w-md w-full p-10 rounded-[2rem] shadow-2xl text-center">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-indigo-500/20 shadow-2xl">
              <i className="fas fa-crown text-3xl text-white"></i>
            </div>
            <h2 className="text-3xl font-bold mb-4">Modalità Ultra HD</h2>
            <p className="text-slate-400 mb-10 text-sm leading-relaxed">Seleziona una chiave API professionale per il fotoritocco in alta risoluzione.</p>
            <div className="flex flex-col gap-4">
              <button onClick={handleSelectKey} className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-bold transition-all">Seleziona Chiave API</button>
              <button onClick={() => { setUseHighQuality(false); setShowKeySelection(false); }} className="w-full bg-white/5 hover:bg-white/10 py-4 rounded-2xl font-semibold">Standard</button>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"><i className="fas fa-wand-magic-sparkles text-xl text-white"></i></div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tighter uppercase">RetouchAI <span className="text-indigo-500">PRO</span></h1>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black hidden md:block">Apex Neural Engine v4.2</p>
            </div>
            <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 bg-white/5 rounded-full border border-white/5">
               <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${process.env.GEMINI_API_KEY ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                  <span className="text-[8px] font-black uppercase text-slate-400">{process.env.GEMINI_API_KEY ? 'AI Engine Active' : 'AI Engine Offline'}</span>
               </div>
               <div className="w-[1px] h-3 bg-white/10"></div>
               <div className="flex items-center gap-2">
                  <i className="fas fa-microchip text-[10px] text-indigo-400"></i>
                  <span className="text-[8px] font-black uppercase text-slate-400">GPU Accelerated</span>
               </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => setLang(l => l === 'IT' ? 'EN' : 'IT')}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400 transition-all"
          >
            {lang}
          </button>
          <div className="bg-white/5 p-1 rounded-xl border border-white/5 flex">
            <button onClick={() => setViewMode('slider')} className={`px-2 md:px-3 py-1.5 rounded-lg text-[9px] md:text-[10px] font-bold uppercase transition-all ${viewMode === 'slider' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}>Slider</button>
            <button onClick={() => setViewMode('hold')} className={`px-2 md:px-3 py-1.5 rounded-lg text-[9px] md:text-[10px] font-bold uppercase transition-all ${viewMode === 'hold' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}>Hold</button>
            <button onClick={() => setViewMode('side')} className={`px-2 md:px-3 py-1.5 rounded-lg text-[9px] md:text-[10px] font-bold uppercase transition-all ${viewMode === 'side' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}>Side</button>
          </div>
          <button onClick={() => setShowManual(true)} className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all">
             <i className="fas fa-book"></i>
          </button>
          <button 
            onClick={() => setUseHighQuality(!useHighQuality)} 
            className={`group relative flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${useHighQuality ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'bg-white/5 text-slate-500 border border-white/10 hover:border-white/20'}`}
          >
            <i className={`fas ${useHighQuality ? 'fa-crown' : 'fa-bolt'} ${useHighQuality ? 'animate-pulse' : ''}`}></i>
            <span className="hidden sm:inline">{useHighQuality ? 'Ultra HD' : 'Fast Mode'}</span>
            
            {/* Tooltip-like label */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-[8px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10">
              {useHighQuality ? 'Usa Gemini Pro (Paid Key)' : 'Usa Gemini Flash (Free)'}
            </div>
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="bg-white text-black px-4 md:px-5 py-2 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2">
            <i className="fas fa-plus"></i> <span className="hidden sm:inline">Importa</span>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.arw,.cr2,.cr3,.nef,.dng,.orf,.rw2,.raf" multiple className="hidden" />
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative min-h-0">
        <aside className="w-full lg:w-80 bg-black/30 backdrop-blur lg:border-r border-white/5 flex flex-col overflow-hidden shrink-0 h-[45vh] lg:h-full">
          <div className="flex border-b border-white/5">
            <button onClick={() => setSidebarTab('retouch')} className={`flex-1 py-4 text-[9px] font-black uppercase tracking-widest ${sidebarTab === 'retouch' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}>Tools</button>
            <button onClick={() => setSidebarTab('grade')} className={`flex-1 py-4 text-[9px] font-black uppercase tracking-widest ${sidebarTab === 'grade' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}>Grade</button>
            <button onClick={() => setSidebarTab('presets')} className={`flex-1 py-4 text-[9px] font-black uppercase tracking-widest ${sidebarTab === 'presets' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}>Presets</button>
            <button onClick={() => setSidebarTab('history')} className={`flex-1 py-4 text-[9px] font-black uppercase tracking-widest ${sidebarTab === 'history' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}>History</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative">
            {sidebarTab === 'retouch' && (
              <div className="space-y-6">
                {/* Sync & Batch Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={handleSyncSettings}
                    disabled={batch.length < 2}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-xl flex flex-col items-center gap-1 transition-all disabled:opacity-30"
                  >
                    <i className="fas fa-sync-alt text-indigo-400"></i>
                    <span className="text-[8px] font-black uppercase tracking-widest">Sync Settings</span>
                  </button>
                  <button 
                    onClick={runBatchProcess}
                    disabled={batch.length < 2 || processing.isProcessing}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-xl flex flex-col items-center gap-1 transition-all disabled:opacity-30"
                  >
                    <i className="fas fa-layer-group text-emerald-400"></i>
                    <span className="text-[8px] font-black uppercase tracking-widest">Batch Process</span>
                  </button>
                </div>

                {/* One Click Magic Sequence */}
                <button 
                  onClick={handleSmartWorkflow}
                  disabled={batch.length === 0 || processing.isProcessing}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 p-4 rounded-2xl flex items-center justify-between group transition-all shadow-xl shadow-indigo-900/20 disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl text-white group-hover:scale-110 transition-transform"><i className="fas fa-sparkles"></i></div>
                    <div className="text-left">
                       <div className="font-black text-xs uppercase tracking-tighter text-white">Smart Workflow</div>
                       <div className="text-[9px] text-indigo-100 uppercase font-bold opacity-70 italic">Heal + D&B + Tone + Vol</div>
                    </div>
                  </div>
                  <i className="fas fa-chevron-right text-white/50"></i>
                </button>

                {/* Depth Pro Tip */}
                <div className="bg-indigo-600/10 border border-indigo-500/20 p-3 rounded-xl">
                   <div className="flex items-center gap-2 mb-1 text-indigo-400 font-black text-[9px] uppercase tracking-widest">
                      <i className="fas fa-info-circle"></i> 3D Depth Recipe
                   </div>
                   <p className="text-[10px] text-slate-400 leading-tight">Per la massima profondità: usa <b>Portrait Volumes</b> + un leggero <b>Vignette</b> nella scheda Grade.</p>
                </div>

                {/* Auto Mask Toggle */}
                <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-user-shield text-indigo-400"></i>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Auto Masking</span>
                  </div>
                  <button 
                    onClick={() => setAutoMask(!autoMask)}
                    className={`w-12 h-6 rounded-full relative transition-all ${autoMask ? 'bg-indigo-600' : 'bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${autoMask ? 'left-7' : 'left-1'}`}></div>
                  </button>
                </div>

                {actionCategories.map(cat => (
                   <section key={cat} className="space-y-3">
                      <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">{cat} Tools</h3>
                      <div className="space-y-2">
                        {RETOUCH_ACTIONS.filter(a => a.category === cat).map((action) => (
                          <div key={action.id} className="group">
                            <button 
                              onClick={() => handleActionClick(action)} 
                              disabled={batch.length === 0 || processing.isProcessing} 
                              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all border-2 text-left relative overflow-hidden ${
                                activeAction === action.id 
                                  ? 'bg-[#1e1e1e] border-indigo-500 text-white' 
                                  : 'bg-[#121212] border-white/5 text-slate-100 hover:border-white/20'
                              } disabled:opacity-40`}
                            >
                              <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-lg ${
                                activeAction === action.id ? 'bg-indigo-600 text-white' : 'bg-black text-indigo-500 border border-white/5'
                              }`}>
                                {action.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <div className="font-bold text-xs tracking-wide">{action.label}</div>
                                  {(action.id === RetouchAction.PORTRAIT_VOLUMES || action.id === RetouchAction.DODGE_BURN) && (
                                    <span className="bg-indigo-500 text-[7px] text-white px-1 rounded font-black">3D BOOST</span>
                                  )}
                                  {(action.id === RetouchAction.SHARPEN) && (
                                    <span className="bg-emerald-500 text-[7px] text-white px-1 rounded font-black">RECOVER</span>
                                  )}
                                </div>
                                <div className={`text-[9px] mt-0.5 truncate leading-tight opacity-50`}>
                                    {action.description}
                                </div>
                              </div>
                            </button>
                            {(action.id === RetouchAction.GENERATIVE_REMOVE || action.id === RetouchAction.REMOVE_REFLECTION) && activeAction === action.id && batch.length > 0 && (
                              <div className="mt-2 space-y-2">
                                <button onClick={() => setIsGenerativeBrush(!isGenerativeBrush)} className={`w-full py-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${isGenerativeBrush ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                                  <i className="fas fa-paint-brush mr-2"></i> {isGenerativeBrush ? 'Annulla Pennello' : 'Attiva Pennello'}
                                </button>
                                {isGenerativeBrush && (
                                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[8px] font-black uppercase text-slate-500">Dimensione Pennello</span>
                                      <span className="text-[9px] font-mono text-indigo-400">{brushSize}px</span>
                                    </div>
                                    <input type="range" min="5" max="100" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                                    {brushMask.length > 0 && (
                                      <button onClick={() => handleApplyAction(action)} className="w-full mt-2 bg-emerald-600 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest text-white shadow-lg">
                                        Esegui ({brushMask.length})
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {action.id === RetouchAction.HEAL && activeAction === RetouchAction.HEAL && batch.length > 0 && (
                              <button onClick={() => setIsMagicEraser(!isMagicEraser)} className={`w-full mt-2 py-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${isMagicEraser ? 'bg-rose-600 border-rose-500 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                                <i className="fas fa-eraser mr-2"></i> {isMagicEraser ? 'Annulla Gomma' : 'Gomma Magica'}
                              </button>
                            )}

                            {activeAction === action.id && action.id !== 'SMART_WORKFLOW' && batch.length > 0 && (
                              <div className="mt-2 p-3 bg-white/5 rounded-2xl border border-white/10 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Potenza Effetto</span>
                                  <span className="text-[10px] font-mono text-indigo-400 font-bold">{actionIntensity}%</span>
                                </div>
                                <input 
                                  type="range" 
                                  min="1" 
                                  max="100" 
                                  value={actionIntensity} 
                                  onChange={(e) => setActionIntensity(parseInt(e.target.value))}
                                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <button 
                                    onClick={() => handleApplyAction(action)}
                                    disabled={processing.isProcessing}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 md:py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                                  >
                                    <i className="fas fa-check"></i> Applica
                                  </button>
                                  <button 
                                    onClick={() => handleApplyAction(action)}
                                    disabled={processing.isProcessing}
                                    className="bg-white/10 hover:bg-white/20 text-white py-3.5 md:py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                  >
                                    <i className="fas fa-eye"></i> Anteprima
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Text & Watermark Management UI */}
                            {(activeAction === RetouchAction.ADD_TEXT || activeAction === RetouchAction.ADD_WATERMARK) && (action.id === RetouchAction.ADD_TEXT || action.id === RetouchAction.ADD_WATERMARK) && currentImage && (
                              <div className="mt-4 space-y-4 bg-black/40 p-4 rounded-2xl border border-white/5 animate-in slide-in-from-top duration-300">
                                <button 
                                  onClick={() => addTextLayer(activeAction === RetouchAction.ADD_WATERMARK ? `© ${new Date().getFullYear()} Copyright` : 'Nuovo Testo')}
                                  className="w-full bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                >
                                  <i className="fas fa-plus"></i> {activeAction === RetouchAction.ADD_WATERMARK ? 'Aggiungi Filigrana' : 'Aggiungi Testo'}
                                </button>

                                <div className="space-y-3">
                                  {currentImage.textLayers.map((layer, lIdx) => (
                                    <div key={layer.id} className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-black text-slate-500 uppercase">{(activeAction === RetouchAction.ADD_TEXT || activeAction === RetouchAction.ADD_WATERMARK) ? (activeAction === RetouchAction.ADD_WATERMARK ? 'Filigrana' : 'Testo') : 'Layer'} {lIdx + 1}</span>
                                        <button onClick={() => removeTextLayer(layer.id)} className="text-slate-600 hover:text-red-500 transition-colors"><i className="fas fa-trash text-[10px]"></i></button>
                                      </div>
                                      
                                      <input 
                                        type="text" 
                                        value={layer.text}
                                        onChange={(e) => updateTextLayer(layer.id, { text: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-indigo-500"
                                        placeholder="Inserisci testo..."
                                      />

                                      <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                          <span className="text-[8px] font-bold text-slate-600 uppercase">Size</span>
                                          <input 
                                            type="range" min="10" max="200" value={layer.fontSize}
                                            onChange={(e) => updateTextLayer(layer.id, { fontSize: parseInt(e.target.value) })}
                                            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <span className="text-[8px] font-bold text-slate-600 uppercase">Opacity</span>
                                          <input 
                                            type="range" min="0" max="1" step="0.1" value={layer.opacity}
                                            onChange={(e) => updateTextLayer(layer.id, { opacity: parseFloat(e.target.value) })}
                                            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                          />
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                          <span className="text-[8px] font-bold text-slate-600 uppercase">Font Family</span>
                                          <select 
                                            value={layer.fontFamily}
                                            onChange={(e) => updateTextLayer(layer.id, { fontFamily: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg p-1.5 text-[10px] text-white outline-none focus:border-indigo-500"
                                          >
                                            <option value="Inter">Inter (Sans)</option>
                                            <option value="Montserrat">Montserrat</option>
                                            <option value="Playfair Display">Playfair</option>
                                            <option value="JetBrains Mono">Mono</option>
                                            <option value="Georgia">Serif</option>
                                          </select>
                                        </div>
                                        <div className="space-y-1">
                                          <span className="text-[8px] font-bold text-slate-600 uppercase">Custom Color</span>
                                          <div className="flex items-center gap-2">
                                            <input 
                                              type="color" 
                                              value={layer.color}
                                              onChange={(e) => updateTextLayer(layer.id, { color: e.target.value })}
                                              className="w-8 h-8 bg-transparent border-none cursor-pointer"
                                            />
                                            <span className="text-[9px] font-mono text-slate-400 uppercase">{layer.color}</span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                          <span className="text-[8px] font-bold text-slate-600 uppercase">Quick Colors</span>
                                          <div className="flex gap-1">
                                            {['#ffffff', '#000000', '#4f46e1', '#e11d48', '#fbbf24'].map(c => (
                                              <button 
                                                key={c} 
                                                onClick={() => updateTextLayer(layer.id, { color: c })}
                                                className={`w-4 h-4 rounded-full border border-white/20 ${layer.color === c ? 'ring-2 ring-indigo-500' : ''}`}
                                                style={{ backgroundColor: c }}
                                              ></button>
                                            ))}
                                          </div>
                                        </div>
                                        <div className="space-y-1">
                                          <span className="text-[8px] font-bold text-slate-600 uppercase">Rotation</span>
                                          <input 
                                            type="range" min="-180" max="180" value={layer.rotation}
                                            onChange={(e) => updateTextLayer(layer.id, { rotation: parseInt(e.target.value) })}
                                            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Watermark Management UI */}
                            {activeAction === RetouchAction.ADD_WATERMARK && action.id === RetouchAction.ADD_WATERMARK && currentImage && (
                              <div className="mt-4 space-y-4 bg-black/40 p-4 rounded-2xl border border-white/5 animate-in slide-in-from-top duration-300">
                                <button 
                                  onClick={addWatermark}
                                  className="w-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                >
                                  <i className="fas fa-copyright"></i> Applica Copyright
                                </button>
                                <p className="text-[9px] text-slate-500 italic text-center">Aggiunge una filigrana predefinita che puoi poi spostare e personalizzare.</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                   </section>
                ))}
              </div>
            )}

            {sidebarTab === 'grade' && (
              <div className="space-y-8 pb-20">
                {currentImage && (
                  <Histogram 
                    imageUrl={currentImage.currentUrl} 
                    filters={`exposure(${100 + grading.exposure}%) contrast(${100 + grading.contrast}%) saturate(${100 + grading.saturation}%)`}
                  />
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={saveProject}
                    disabled={batch.length === 0}
                    className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-30"
                  >
                    <i className="fas fa-save"></i> Salva Progetto
                  </button>
                  <button 
                    onClick={loadProject}
                    className="bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-folder-open"></i> Carica Ultimo
                  </button>
                </div>

                <button 
                  onClick={clearProject}
                  className="w-full bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 border border-rose-500/20 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <i className="fas fa-trash-alt"></i> Elimina Sessione Salvata
                </button>

                <div className="pt-4 border-t border-white/5 space-y-3">
                  <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">External Storage (Pendrive/HD)</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={exportSession}
                      disabled={batch.length === 0}
                      className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-30"
                    >
                      <i className="fas fa-file-export"></i> Esporta Sessione
                    </button>
                    <label className="bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer">
                      <i className="fas fa-file-import"></i> Importa Sessione
                      <input type="file" accept=".apex" onChange={importSession} className="hidden" />
                    </label>
                  </div>
                  <p className="text-[8px] text-slate-600 italic text-center px-2">Scarica l'intero lavoro su un file esterno per non occupare spazio sul dispositivo.</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={handleAutoAdjust}
                    className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-magic"></i> Auto Adjust
                  </button>
                  <button 
                    onClick={handleResetGrading}
                    className="bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-undo"></i> Reset All
                  </button>
                </div>

                <section>
                  <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Lut Presets</h3>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {LUT_PRESETS.map(lut => (
                      <button key={lut.id} onClick={() => updateGrading('lut', lut.id)} className={`p-3 rounded-xl border text-[10px] text-left transition-all ${grading.lut === lut.id ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-[#111] border-white/5 text-slate-500'}`}>
                        <div className="font-bold truncate">{lut.name}</div>
                      </button>
                    ))}
                  </div>
                  <div className="space-y-5 bg-white/5 p-4 rounded-xl border border-white/5">
                     <div className="flex items-center justify-between"><span className="text-[9px] font-black uppercase text-slate-400">Intensity</span><span className="text-[9px] font-mono text-indigo-400">{grading.intensity}%</span></div>
                     <input type="range" min="0" max="100" value={grading.intensity} onChange={(e) => updateGrading('intensity', parseInt(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center justify-between ml-1">
                    <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Basic Corrections</h3>
                    <button 
                      onClick={() => setShowBasic(!showBasic)}
                      className="text-[8px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      {showBasic ? 'Nascondi' : 'Mostra'}
                    </button>
                  </div>

                  {showBasic && (
                    <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                      {[
                        { id: 'exposure', label: 'Exposure', min: -100, max: 100 },
                        { id: 'contrast', label: 'Contrast', min: -100, max: 100 },
                        { id: 'highlights', label: 'Highlights', min: -100, max: 100 },
                        { id: 'shadows', label: 'Shadows', min: -100, max: 100 },
                        { id: 'whites', label: 'Whites', min: -100, max: 100 },
                        { id: 'blacks', label: 'Blacks', min: -100, max: 100 },
                        { id: 'saturation', label: 'Saturation', min: -100, max: 100 },
                        { id: 'warmth', label: 'Temperature', min: -100, max: 100 },
                        { id: 'tint', label: 'Tint', min: -100, max: 100 },
                        { id: 'sepia', label: 'Sepia', min: 0, max: 100 },
                        { id: 'sharpness', label: 'Sharpness', min: 0, max: 100 },
                      ].map(field => (
                        <div key={field.id}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-bold text-slate-500 uppercase">{field.label}</span>
                            <span className="text-[9px] font-mono text-slate-300">{(grading as any)[field.id]}</span>
                          </div>
                          <input 
                            type="range" 
                            min={field.min} 
                            max={field.max} 
                            value={(grading as any)[field.id]} 
                            onChange={(e) => updateGrading(field.id, parseInt(e.target.value))} 
                            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-400" 
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="space-y-4">
                  <div className="flex items-center justify-between ml-1">
                    <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">HSL (Selective Color)</h3>
                    <button 
                      onClick={() => setShowHSL(!showHSL)}
                      className="text-[8px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      {showHSL ? 'Nascondi' : 'Mostra'}
                    </button>
                  </div>
                  
                  {showHSL && (
                    <div className="space-y-6 bg-white/5 p-4 rounded-xl border border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                      {['reds', 'yellows', 'greens', 'cyans', 'blues', 'magentas'].map(color => (
                        <div key={color} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full bg-${color === 'reds' ? 'red-500' : color === 'yellows' ? 'yellow-500' : color === 'greens' ? 'green-500' : color === 'cyans' ? 'cyan-500' : color === 'blues' ? 'blue-500' : 'fuchsia-500'}`}></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{color}</span>
                          </div>
                          {['hue', 'saturation', 'luminance'].map(prop => (
                            <div key={prop}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[8px] font-bold text-slate-600 uppercase">{prop}</span>
                                <span className="text-[8px] font-mono text-slate-400">{(grading.hsl as any)[color][prop]}</span>
                              </div>
                              <input 
                                type="range" 
                                min="-100" 
                                max="100" 
                                value={(grading.hsl as any)[color][prop]} 
                                onChange={(e) => updateGrading(`hsl.${color}.${prop}`, parseInt(e.target.value))} 
                                className="w-full h-0.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500/50" 
                              />
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="space-y-4">
                  <div className="flex items-center justify-between ml-1">
                    <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Tone Curves</h3>
                    <button 
                      onClick={() => setShowCurves(!showCurves)}
                      className="text-[8px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      {showCurves ? 'Nascondi' : 'Mostra'}
                    </button>
                  </div>
                  
                  {showCurves && (
                    <div className="space-y-6 bg-white/5 p-4 rounded-xl border border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                      <CurvesControl 
                        label="RGB Combined" 
                        color="#ffffff" 
                        points={grading.curves.rgb} 
                        onChange={(pts) => updateGrading('curves.rgb', pts)} 
                      />
                      <div className="grid grid-cols-3 gap-4">
                        <CurvesControl 
                          label="Red" 
                          color="#ef4444" 
                          points={grading.curves.red} 
                          onChange={(pts) => updateGrading('curves.red', pts)} 
                        />
                        <CurvesControl 
                          label="Green" 
                          color="#22c55e" 
                          points={grading.curves.green} 
                          onChange={(pts) => updateGrading('curves.green', pts)} 
                        />
                        <CurvesControl 
                          label="Blue" 
                          color="#3b82f6" 
                          points={grading.curves.blue} 
                          onChange={(pts) => updateGrading('curves.blue', pts)} 
                        />
                      </div>
                    </div>
                  )}
                </section>

                <section className="space-y-4">
                  <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Effects</h3>
                  <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/5">
                    {[
                      { id: 'vignette', label: 'Vignette', min: 0, max: 100 },
                      { id: 'grain', label: 'Film Grain', min: 0, max: 100 },
                    ].map(field => (
                      <div key={field.id}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-bold text-slate-500 uppercase">{field.label}</span>
                          <span className="text-[9px] font-mono text-slate-300">{(grading as any)[field.id]}</span>
                        </div>
                        <input 
                          type="range" 
                          min={field.min} 
                          max={field.max} 
                          value={(grading as any)[field.id]} 
                          onChange={(e) => updateGrading(field.id, parseInt(e.target.value))} 
                          className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-400" 
                        />
                      </div>
                    ))}
                  </div>
                </section>
                
                <div className="fixed bottom-0 left-0 w-80 p-4 bg-black/80 backdrop-blur-xl border-t border-white/5 z-30">
                  <button onClick={() => handleActionClick(RETOUCH_ACTIONS.find(a => a.id === RetouchAction.COLOR_GRADE)!)} className="w-full bg-indigo-600 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-[0_0_30px_rgba(79,70,229,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"><i className="fas fa-film mr-2"></i> Applica Grading</button>
                </div>
              </div>
            )}

            {sidebarTab === 'presets' && (
              <div className="space-y-4">
                <div className="bg-indigo-600/10 border border-indigo-500/20 p-4 rounded-2xl mb-6">
                   <div className="flex items-center gap-2 mb-2 text-indigo-400 font-black text-[10px] uppercase tracking-widest">
                      <i className="fas fa-magic"></i> Pro Workflows
                   </div>
                   <p className="text-[10px] text-slate-400 leading-relaxed">Questi preset combinano più passaggi di intelligenza artificiale e color grading per risultati editoriali istantanei.</p>
                </div>
                
                <div className="space-y-3">
                  {PRO_PRESETS.map(preset => (
                    <button 
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      disabled={batch.length === 0 || processing.isProcessing}
                      className="w-full p-4 bg-[#111] hover:bg-[#1a1a1a] border border-white/5 hover:border-indigo-500/50 rounded-2xl text-left transition-all group disabled:opacity-40"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white group-hover:text-indigo-400 transition-colors">{preset.name}</span>
                        <i className="fas fa-chevron-right text-[10px] text-slate-600 group-hover:text-indigo-400"></i>
                      </div>
                      <p className="text-[9px] text-slate-500 leading-tight mb-3">{preset.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {preset.actions.map((aId: any) => (
                          <span key={aId} className="px-1.5 py-0.5 bg-white/5 rounded text-[7px] font-black uppercase text-slate-400 tracking-tighter">
                            {RETOUCH_ACTIONS.find(a => a.id === aId)?.label || aId}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sidebarTab === 'history' && currentImage && (
              <div className="space-y-2">
                <button onClick={() => jumpToHistory(-1)} className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${currentImage.historyIndex === -1 ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-[#111] border-white/5 text-slate-500'}`}><div className="w-8 h-8 rounded bg-black flex items-center justify-center text-xs border border-white/10">0</div><div className="text-xs font-bold">Originale</div></button>
                {currentImage.history.map((step, idx) => (
                  <button key={step.id} onClick={() => jumpToHistory(idx)} className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${currentImage.historyIndex === idx ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-[#111] border-white/5 text-slate-400'}`}><div className={`w-8 h-8 rounded flex items-center justify-center text-xs border ${currentImage.historyIndex === idx ? 'bg-indigo-600' : 'bg-black'}`}>{idx + 1}</div><div className="flex-1 text-left"><div className="text-xs font-bold truncate">{RETOUCH_ACTIONS.find(a => a.id === (step.action as any))?.label || step.action}</div><div className="text-[9px] opacity-50">{new Date(step.timestamp).toLocaleTimeString()}</div></div></button>
                ))}
              </div>
            )}
          </div>
          
          {batch.length > 1 && (
            <div className="p-4 border-t border-white/5 bg-black/40">
              <button onClick={runBatchProcess} disabled={processing.isProcessing} className="w-full bg-white text-black py-4 md:py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"><i className="fas fa-layer-group"></i> Batch All ({batch.length})</button>
            </div>
          )}
        </aside>

        <section className="flex-1 bg-[#020202] flex flex-col relative min-w-0">
          <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative min-h-0">
            {processing.isProcessing && (
              <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-xl flex items-center justify-center p-12">
                <div className="max-w-md w-full text-center">
                  <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 border-[4px] border-white/5 rounded-full"></div>
                    <div className="absolute inset-0 border-[4px] border-indigo-600 rounded-full animate-spin border-t-transparent shadow-[0_0_40px_rgba(79,70,229,0.3)]"></div>
                    <div className="absolute inset-0 flex items-center justify-center font-black text-xl text-indigo-400">{processing.progress}%</div>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Apex Neural Engine</h3>
                  <p className="text-slate-500 text-xs animate-pulse tracking-wide uppercase">{processing.status}</p>
                </div>
              </div>
            )}

            {batch.length === 0 ? (
              <div onClick={() => fileInputRef.current?.click()} className="w-full max-w-3xl border-2 border-dashed border-white/5 rounded-[3rem] p-12 md:p-24 text-center cursor-pointer hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group">
                <div className="w-20 h-20 bg-[#111] rounded-[2rem] flex items-center justify-center mx-auto mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all text-slate-700 shadow-2xl"><i className="fas fa-images text-3xl"></i></div>
                <h2 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">Apex Studio Pro</h2>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto text-sm">Importa le tue foto per iniziare il ritocco professionale.</p>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col gap-6">
                <div className="flex-1 min-h-0 flex items-center justify-center relative">
                  {currentImage && (
                    <div className="w-full h-full shadow-2xl rounded-3xl overflow-hidden border border-white/5 bg-[#080808]">
                       <SmartImageViewer 
                         before={currentImage.originalUrl} 
                         after={currentImage.currentUrl} 
                         mode={viewMode} 
                         isMagicEraser={isMagicEraser} 
                         isGenerativeBrush={isGenerativeBrush}
                         brushSize={brushSize}
                         brushMask={brushMask}
                         onBrushUpdate={setBrushMask}
                         onPixelClick={handleMagicEraserClick} 
                         grading={grading} 
                         textLayers={currentImage.textLayers}
                         onUpdateTextLayer={updateTextLayer}
                       />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between p-4 bg-black/40 backdrop-blur-2xl rounded-2xl border border-white/5 shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1">
                      <button onClick={handleUndo} disabled={!currentImage || currentImage.historyIndex < 0} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#111] text-slate-500 hover:text-white disabled:opacity-10 border border-transparent hover:border-white/10"><i className="fas fa-undo"></i></button>
                      <button onClick={handleRedo} disabled={!currentImage || currentImage.historyIndex >= currentImage.history.length - 1} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#111] text-slate-500 hover:text-white disabled:opacity-10 border border-transparent hover:border-white/10"><i className="fas fa-redo"></i></button>
                    </div>
                    <div className="h-6 w-[1px] bg-white/5"></div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-slate-600 uppercase font-black tracking-widest">{currentImage?.name || 'Session'}</span>
                        {currentImage?.aspectRatio && (
                          <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[7px] font-black rounded border border-indigo-500/20">{currentImage.aspectRatio}</span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-indigo-500">{!currentImage || currentImage.historyIndex < 0 ? 'Original' : `${currentImage.history[currentImage.historyIndex].action}`}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setShowMetadata(!showMetadata)}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${showMetadata ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-500 hover:text-white'}`}
                    >
                      <i className="fas fa-info-circle"></i>
                    </button>
                    {currentImage && (
                      <button onClick={() => setShowExportModal(true)} className="bg-white text-black px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-200 transition-all flex items-center gap-2"><i className="fas fa-download"></i> Esporta</button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Metadata Panel */}
          {showMetadata && currentImage && (
            <div className="absolute top-24 right-6 w-64 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl z-40 animate-in slide-in-from-right duration-300">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4">Image Metadata</h3>
               <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                     <span className="text-[8px] text-slate-500 uppercase font-bold">Filename</span>
                     <span className="text-[10px] font-mono text-slate-200 truncate">{currentImage.name}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-[8px] text-slate-500 uppercase font-bold">Status</span>
                     <span className="text-[10px] font-mono text-emerald-400 uppercase">{currentImage.status}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-[8px] text-slate-500 uppercase font-bold">AI Processing</span>
                     <span className="text-[10px] font-mono text-slate-200">{currentImage.history.length} Layers Applied</span>
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-[8px] text-slate-500 uppercase font-bold">Format</span>
                     <span className="text-[10px] font-mono text-slate-200">{currentImage.isRaw ? 'RAW (Digital Negative)' : 'Standard Raster'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-[8px] text-slate-500 uppercase font-bold">Aspect Ratio</span>
                     <span className="text-[10px] font-mono text-indigo-400 font-bold">{currentImage.aspectRatio || 'Detecting...'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-[8px] text-slate-500 uppercase font-bold">Dimensions</span>
                     <span className="text-[10px] font-mono text-slate-200">
                        {currentImage.dimensions ? `${currentImage.dimensions.width} x ${currentImage.dimensions.height} px` : '---'}
                     </span>
                  </div>
                  <div className="h-[1px] bg-white/5 my-2"></div>
                  <div className="flex flex-col gap-1">
                     <span className="text-[8px] text-slate-500 uppercase font-bold">Neural Engine</span>
                     <span className="text-[10px] font-mono text-indigo-400">Apex v4.2 Active</span>
                  </div>
               </div>
            </div>
          )}

          {/* Export Modal */}
          {showExportModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl p-6">
              <div className="bg-[#0a0a0a] border border-white/10 max-w-xl w-full p-8 rounded-[2.5rem] shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black uppercase tracking-tighter">Export Settings</h2>
                  <button onClick={() => setShowExportModal(false)} className="text-slate-500 hover:text-white"><i className="fas fa-times"></i></button>
                </div>

                <div className="space-y-6">
                  {/* Mode Selection */}
                  <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                    <button 
                      onClick={() => setExportConfig(prev => ({ ...prev, isBatch: false }))}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!exportConfig.isBatch ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                    >
                      Single Image
                    </button>
                    <button 
                      onClick={() => setExportConfig(prev => ({ ...prev, isBatch: true }))}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${exportConfig.isBatch ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                    >
                      Batch ZIP ({batch.length})
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">File Format</label>
                      <div className="grid grid-cols-1 gap-2">
                        {['image/jpeg', 'image/png', 'image/webp'].map(fmt => (
                          <button 
                            key={fmt}
                            onClick={() => setExportConfig(prev => ({ ...prev, format: fmt }))}
                            className={`py-2.5 rounded-xl border text-[10px] font-bold uppercase transition-all ${exportConfig.format === fmt ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/5 text-slate-500'}`}
                          >
                            {fmt.split('/')[1]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Quality</label>
                        <span className="text-xs font-mono text-indigo-400 font-bold">{Math.round(exportConfig.quality * 100)}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.1" 
                        max="1" 
                        step="0.01"
                        value={exportConfig.quality} 
                        onChange={(e) => setExportConfig(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                      <div className="pt-4 space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Resize (Long Edge)</label>
                        <select 
                          value={exportConfig.resizeWidth}
                          onChange={(e) => setExportConfig(prev => ({ ...prev, resizeWidth: parseInt(e.target.value) }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-[10px] font-bold text-slate-300 outline-none focus:border-indigo-500"
                        >
                          <option value="0">Original Size</option>
                          <option value="1080">1080px (Social)</option>
                          <option value="2048">2048px (Web)</option>
                          <option value="4096">4096px (4K)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Naming Pattern</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <span className="text-[8px] font-bold text-slate-600 uppercase ml-1">Prefix</span>
                        <input 
                          type="text" 
                          placeholder="None"
                          value={exportConfig.prefix}
                          onChange={(e) => setExportConfig(prev => ({ ...prev, prefix: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[8px] font-bold text-slate-600 uppercase ml-1">Suffix</span>
                        <input 
                          type="text" 
                          placeholder="-retouched"
                          value={exportConfig.suffix}
                          onChange={(e) => setExportConfig(prev => ({ ...prev, suffix: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <i className="fas fa-info-circle text-indigo-400"></i>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Preserve EXIF Metadata</span>
                    </div>
                    <button 
                      onClick={() => setExportConfig(prev => ({ ...prev, preserveMetadata: !prev.preserveMetadata }))}
                      className={`w-12 h-6 rounded-full relative transition-all ${exportConfig.preserveMetadata ? 'bg-indigo-600' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${exportConfig.preserveMetadata ? 'left-7' : 'left-1'}`}></div>
                    </button>
                  </div>

                  <button 
                    onClick={handleExport}
                    className="w-full bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3"
                  >
                    <i className={exportConfig.isBatch ? "fas fa-file-zipper" : "fas fa-file-export"}></i> 
                    {exportConfig.isBatch ? 'Generate ZIP Archive' : 'Process & Download'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="h-28 bg-black/20 border-t border-white/5 flex items-center p-4 gap-4 overflow-x-auto custom-scrollbar shrink-0">
            {batch.map((item, idx) => (
              <div key={item.id} onClick={() => setActiveIdx(idx)} className={`relative h-20 aspect-square shrink-0 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all ${activeIdx === idx ? 'border-indigo-500 scale-105 shadow-2xl' : 'border-transparent opacity-40 hover:opacity-100 hover:scale-105'}`}>
                <img src={item.currentUrl} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <button onClick={(e) => { e.stopPropagation(); removeFromBatch(idx); }} className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-[9px]"><i className="fas fa-times"></i></button>
                {item.status === 'processing' && <div className="absolute inset-0 bg-indigo-600/40 flex items-center justify-center"><i className="fas fa-circle-notch animate-spin text-white"></i></div>}
                {item.status === 'completed' && <div className="absolute bottom-1 right-1 bg-green-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[7px]"><i className="fas fa-check"></i></div>}
                {item.isRaw && <div className="absolute top-1 left-1 bg-yellow-500 text-black px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter">RAW</div>}
              </div>
            ))}
          </div>
        </section>
      </main>

      </div>
  );
};

export default App;
