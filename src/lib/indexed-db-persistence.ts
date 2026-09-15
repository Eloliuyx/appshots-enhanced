import type { PersistedEditorState } from "./useLocalStorage";

const DATABASE_NAME = "appshots-editor";
const DATABASE_VERSION = 1;
const STORE_NAME = "workspace";
const STATE_KEY = "latest";

const openDatabase = (): Promise<IDBDatabase | null> => {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const loadIndexedDbState = async (): Promise<PersistedEditorState | null> => {
  const database = await openDatabase();
  if (!database) return null;

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(STATE_KEY);

    request.onsuccess = () => {
      database.close();
      const state = request.result as PersistedEditorState | undefined;
      resolve(state?.projects && Array.isArray(state.projects) ? state : null);
    };
    request.onerror = () => {
      database.close();
      reject(request.error);
    };
  });
};

export const saveIndexedDbState = async (
  state: PersistedEditorState,
): Promise<void> => {
  const database = await openDatabase();
  if (!database) return;

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(state, STATE_KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
  database.close();
};
