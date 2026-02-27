
import { openDB, IDBPDatabase } from 'idb';
import { BatchImage } from '../types';

const DB_NAME = 'RetouchAI_Pro_DB';
const STORE_NAME = 'projects';
const DB_VERSION = 1;

export interface ProjectData {
  id: string;
  name: string;
  batch: (Omit<BatchImage, 'originalUrl' | 'currentUrl'> & { 
    originalBlob: Blob; 
    currentBlob: Blob;
    history: (Omit<BatchImage['history'][number], 'originalImage' | 'retouchedImage'> & {
      originalBlob: Blob;
      retouchedBlob: Blob;
    })[];
  })[];
  lastModified: number;
}

class PersistenceService {
  private db: Promise<IDBPDatabase>;

  constructor() {
    this.db = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }

  private async urlToBlob(url: string): Promise<Blob> {
    const response = await fetch(url);
    return response.blob();
  }

  async saveProject(batch: BatchImage[], name: string = 'Progetto Senza Nome'): Promise<string> {
    const id = 'current_project';
    
    // Convert all blob URLs to actual Blobs for storage
    const serializedBatch = await Promise.all(batch.map(async (item) => {
      const originalBlob = await this.urlToBlob(item.originalUrl);
      const currentBlob = await this.urlToBlob(item.currentUrl);
      
      const serializedHistory = await Promise.all(item.history.map(async (h) => {
        const hOrigBlob = await this.urlToBlob(h.originalImage);
        const hRetBlob = await this.urlToBlob(h.retouchedImage);
        return {
          ...h,
          originalBlob: hOrigBlob,
          retouchedBlob: hRetBlob,
          originalImage: '', // Clear URLs
          retouchedImage: ''
        };
      }));

      return {
        ...item,
        originalBlob,
        currentBlob,
        originalUrl: '', // Clear temporary URLs
        currentUrl: '',
        history: serializedHistory
      };
    }));

    const project: ProjectData = {
      id,
      name,
      batch: serializedBatch as any,
      lastModified: Date.now(),
    };
    
    const db = await this.db;
    await db.put(STORE_NAME, project);
    return id;
  }

  async loadProject(): Promise<BatchImage[] | null> {
    const db = await this.db;
    const project = await db.get(STORE_NAME, 'current_project') as ProjectData | null;
    
    if (!project) return null;

    // Convert Blobs back to blob URLs
    const batch = project.batch.map((item: any) => {
      const originalUrl = URL.createObjectURL(item.originalBlob);
      const currentUrl = URL.createObjectURL(item.currentBlob);
      
      const history = item.history.map((h: any) => ({
        ...h,
        originalImage: URL.createObjectURL(h.originalBlob),
        retouchedImage: URL.createObjectURL(h.retouchedBlob)
      }));

      return {
        ...item,
        originalUrl,
        currentUrl,
        history
      };
    });

    return batch;
  }

  async clearProject(): Promise<void> {
    const db = await this.db;
    await db.delete(STORE_NAME, 'current_project');
  }
}

export const persistenceService = new PersistenceService();
