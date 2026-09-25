const DB_NAME = 'lang-tutor-dictionaries';
const DB_VERSION = 1;
const AFF_STORE = 'aff';
const DIC_STORE = 'dic';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open dictionary cache database'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(AFF_STORE)) {
        db.createObjectStore(AFF_STORE);
      }
      
      if (!db.objectStoreNames.contains(DIC_STORE)) {
        db.createObjectStore(DIC_STORE);
      }
    };
  });

  return dbPromise;
}

export interface CachedDictionary {
  aff: string;
  dic: string;
}

export async function getCachedDictionary(language: string): Promise<CachedDictionary | null> {
  try {
    const db = await openDB();
    
    const affPromise = new Promise<string | null>((resolve, reject) => {
      const transaction = db.transaction([AFF_STORE], 'readonly');
      const store = transaction.objectStore(AFF_STORE);
      const request = store.get(language);
      
      request.onerror = () => reject(new Error('Failed to read aff from cache'));
      request.onsuccess = () => resolve(request.result || null);
    });

    const dicPromise = new Promise<string | null>((resolve, reject) => {
      const transaction = db.transaction([DIC_STORE], 'readonly');
      const store = transaction.objectStore(DIC_STORE);
      const request = store.get(language);
      
      request.onerror = () => reject(new Error('Failed to read dic from cache'));
      request.onsuccess = () => resolve(request.result || null);
    });

    const [aff, dic] = await Promise.all([affPromise, dicPromise]);

    if (aff && dic) {
      return { aff, dic };
    }

    return null;
  } catch (error) {
    console.warn('Failed to read dictionary cache:', error);
    return null;
  }
}

export async function setCachedDictionary(language: string, aff: string, dic: string): Promise<void> {
  try {
    const db = await openDB();
    
    const affPromise = new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([AFF_STORE], 'readwrite');
      const store = transaction.objectStore(AFF_STORE);
      const request = store.put(aff, language);
      
      request.onerror = () => reject(new Error('Failed to write aff to cache'));
      request.onsuccess = () => resolve();
    });

    const dicPromise = new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([DIC_STORE], 'readwrite');
      const store = transaction.objectStore(DIC_STORE);
      const request = store.put(dic, language);
      
      request.onerror = () => reject(new Error('Failed to write dic to cache'));
      request.onsuccess = () => resolve();
    });

    await Promise.all([affPromise, dicPromise]);
  } catch (error) {
    console.warn('Failed to write dictionary cache:', error);
  }
}
