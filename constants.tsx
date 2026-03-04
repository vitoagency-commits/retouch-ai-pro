
import React from 'react';
import { RetouchAction } from './types';

export interface ActionDetail {
  id: RetouchAction | 'SMART_WORKFLOW';
  label: string;
  icon: React.ReactNode;
  description: string;
  prompt: string;
  category?: 'Skin' | 'Details' | 'Texture' | 'Enhance' | 'Global';
}

export interface LUTPreset {
  id: string;
  name: string;
  description: string;
}

export const LUT_PRESETS: LUTPreset[] = [
  { id: 'none', name: 'None', description: 'Natural camera colors' },
  { id: 'cinema', name: 'Cinema Noir', description: 'High contrast, moody greens and shadows' },
  { id: 'teal-orange', name: 'Teal & Orange', description: 'Classic Hollywood look with warm skin tones' },
  { id: 'vintage', name: 'Vintage Film', description: 'Soft highlights, faded blacks, and warm tint' },
  { id: 'ethereal', name: 'Ethereal', description: 'High-key, soft glow, and pastel palettes' },
  { id: 'fuji', name: 'Fuji Astia', description: 'Professional portrait film simulation' }
];

export const RETOUCH_ACTIONS: ActionDetail[] = [
  {
    id: RetouchAction.HEAL,
    label: 'Heal & Blemishes',
    icon: <i className="fas fa-band-aid"></i>,
    category: 'Skin',
    description: 'Rimuove acne, macchie e pori dilatati preservando la texture.',
    prompt: 'Professional Healing: Identify and remove all skin blemishes, acne, and temporary spots. Maintain natural skin pores and texture. Do not blur.'
  },
  {
    id: RetouchAction.DODGE_BURN,
    label: 'Dodge & Burn',
    icon: <i className="fas fa-magic"></i>,
    category: 'Skin',
    description: 'Leviga la pelle uniformando luci e ombre (Micro-contrast).',
    prompt: 'Professional Dodge and Burn: Sculpt the skin by leveling out micro-contrast variations. Focus on creating smooth transitions that enhance the 3D feel of the skin texture without losing high-frequency detail.'
  },
  {
    id: RetouchAction.SKIN_TONE,
    label: 'Skin Tone',
    icon: <i className="fas fa-palette"></i>,
    category: 'Skin',
    description: 'Uniforma il colore della pelle eliminando rossori e dominanti.',
    prompt: 'Skin Tone Correction: Neutralize redness and uneven skin pigmentation. Ensure a healthy, uniform, and natural skin color across the entire body.'
  },
  {
    id: RetouchAction.PORTRAIT_VOLUMES,
    label: 'Portrait Volumes',
    icon: <i className="fas fa-user-circle"></i>,
    category: 'Skin',
    description: 'Scolpisce i tratti del viso per una profondità 3D cinematografica.',
    prompt: 'Portrait Volumes / 3D Sculpting: Enhance the three-dimensionality of the face. Strengthen the natural highlights on the cheekbones, bridge of the nose, and forehead. Deepen shadows on the face contours to create a professional 3D studio lighting effect.'
  },
  {
    id: RetouchAction.SHARPEN,
    label: 'Sharpen & Detail',
    icon: <i className="fas fa-highlighter"></i>,
    category: 'Enhance',
    description: 'Corregge la sfuocatura e aumenta la nitidezza dei dettagli.',
    prompt: 'AI Super-Sharpening: Analyze the image for focus issues and motion blur. Recover lost details and sharpen edges intelligently. Increase clarity and perceived resolution while ensuring results look natural and organic, not over-sharpened.'
  },
  {
    id: RetouchAction.SHADOW_RECOVERY,
    label: 'Shadow Recovery',
    icon: <i className="fas fa-sun"></i>,
    category: 'Enhance',
    description: 'Schiarisce le ombre dure e laterali, uniformando l\'illuminazione sul volto.',
    prompt: 'Advanced Shadow Recovery & Lateral Light Balancing: Specifically identify and neutralize harsh lateral shadows (side shadows) on the face and body. Balance the lighting between the lit side and the shadowed side of the subject. Lift deep shadows and soften high-contrast edges caused by side lighting. Ensure the skin texture is preserved and the facial structure remains natural while achieving a more frontal, balanced lighting effect.'
  },
  {
    id: RetouchAction.GENERATIVE_REMOVE,
    label: 'Generative Remove',
    icon: <i className="fas fa-wand-sparkles"></i>,
    category: 'Global',
    description: 'Rimuove oggetti o ombre spennellando sull\'area interessata.',
    prompt: 'Generative Removal: Identify the highlighted area and remove the object, text, watermark, logo, or shadow within it. Reconstruct the background texture (skin, grass, wall, fabric, etc.) to perfectly match the surrounding environment without leaving any artifacts or blurriness.'
  },
  {
    id: RetouchAction.NOISE_REDUCTION,
    label: 'Noise Reduction',
    icon: <i className="fas fa-braille"></i>,
    category: 'Enhance',
    description: 'Rimuove il rumore digitale e la grana senza piallare i dettagli.',
    prompt: 'Intelligent Noise Reduction: Remove digital noise and luminance grain from the image. Smooth out grainy areas while preserving sharp edges and fine details like skin pores or hair texture.'
  },
  {
    id: RetouchAction.EYE_BRILLIANCE,
    label: 'Eyes & Teeth',
    icon: <i className="fas fa-eye"></i>,
    category: 'Details',
    description: 'Sbianca i denti e rende gli occhi più espressivi e brillanti.',
    prompt: 'Eyes and Teeth Enhancement: Subtle whitening of teeth and sclera. Increase iris clarity and add brilliance to the gaze.'
  },
  {
    id: RetouchAction.TEXTURE_SMOOTHING,
    label: 'Fabric & Wrinkles',
    icon: <i className="fas fa-shirt"></i>,
    category: 'Texture',
    description: 'Stira virtualmente i tessuti eliminando pieghe antiestetiche.',
    prompt: 'Fabric Smoothing: Detect clothing in the image and remove unsightly wrinkles and folds while preserving the fabric texture and shape.'
  },
  {
    id: 'MATTIFIER' as any,
    label: 'Mattifier',
    icon: <i className="fas fa-droplet-slash"></i>,
    category: 'Skin',
    description: 'Rimuove l\'effetto lucido e oleoso dalla pelle.',
    prompt: 'Mattifying: Detect oily or shiny areas on the skin caused by flash or sweat. Reduce highlights in those specific areas to create a matte, professional finish.'
  },
  {
    id: 'HAIR' as any,
    label: 'Hair Fly-away',
    icon: <i className="fas fa-wind"></i>,
    category: 'Details',
    description: 'Elimina i capelli vaganti per un\'acconciatura perfetta.',
    prompt: 'Hair Cleanup: Identify and remove fly-away hairs and messy strands around the head while keeping the main hairstyle natural and sharp.'
  },
  {
    id: 'BACKDROP' as any,
    label: 'Clean Backdrop',
    icon: <i className="fas fa-square"></i>,
    category: 'Global',
    description: 'Pulisce lo sfondo da polvere, macchie e pieghe.',
    prompt: 'Clean Backdrop: Identify the background (studio backdrop) and remove dirt, sensor dust, folds, and imperfections while keeping the subject perfectly masked and untouched.'
  },
  {
    id: RetouchAction.COLOR_GRADE,
    label: 'Color Grade',
    icon: <i className="fas fa-film"></i>,
    category: 'Global',
    description: 'Applica look cinematografici avanzati.',
    prompt: 'Creative Grading: Apply professional cinematic color schemes while ensuring skin tones remain accurate.'
  },
  {
    id: RetouchAction.ADD_TEXT,
    label: 'Add Text',
    icon: <i className="fas fa-font"></i>,
    category: 'Global',
    description: 'Aggiungi testo personalizzato sull\'immagine.',
    prompt: 'Add Text: Overlay text onto the image. The user will manage the content and position.'
  },
  {
    id: RetouchAction.RED_EYE_REMOVAL,
    label: 'Red Eye Removal',
    icon: <i className="fas fa-eye-dropper"></i>,
    category: 'Details',
    description: 'Rimuove l\'effetto occhi rossi causato dal flash.',
    prompt: 'Red Eye Removal: Detect and fix red-eye effect caused by camera flash. Neutralize the red glow in the pupils while maintaining natural eye color and catchlights.'
  },
  {
    id: RetouchAction.REMOVE_REFLECTION,
    label: 'Remove Reflection',
    icon: <i className="fas fa-glasses"></i>,
    category: 'Details',
    description: 'Elimina riflessi fastidiosi da occhiali o superfici lucide.',
    prompt: 'Reflection Removal: Identify and eliminate distracting reflections on surfaces like eyeglasses, windows, or polished objects. Reconstruct the underlying detail (like eyes behind glasses) to look natural and clear while maintaining appropriate lighting and depth.'
  },
  {
    id: RetouchAction.ADD_WATERMARK,
    label: 'Watermark / ©',
    icon: <i className="fas fa-copyright"></i>,
    category: 'Global',
    description: 'Aggiungi un copyright o una filigrana personalizzata.',
    prompt: 'Add Watermark: Add a professional copyright notice or watermark to the image. The user will define the text and position.'
  }
];

export const PRO_PRESETS = [
  {
    id: 'VOGUE_COVER',
    name: 'Vogue Cover',
    description: 'High-end fashion look with smooth skin and high contrast.',
    actions: [RetouchAction.HEAL, RetouchAction.DODGE_BURN, RetouchAction.SHARPEN],
    grading: { exposure: 5, contrast: 15, saturation: -10, warmth: 5, vignette: 20 }
  },
  {
    id: 'CINEMATIC_DRAMA',
    name: 'Cinematic Drama',
    description: 'Moody, teal & orange grading with deep shadows.',
    actions: [RetouchAction.PORTRAIT_VOLUMES, RetouchAction.SHADOW_RECOVERY],
    grading: { exposure: -10, contrast: 25, saturation: 5, warmth: -15, vignette: 40 }
  },
  {
    id: 'NATURAL_BEAUTY',
    name: 'Natural Beauty',
    description: 'Subtle enhancement keeping texture and natural tones.',
    actions: [RetouchAction.SKIN_TONE, RetouchAction.EYE_BRILLIANCE],
    grading: { exposure: 10, contrast: 5, saturation: 0, warmth: 10, vignette: 5 }
  }
];
