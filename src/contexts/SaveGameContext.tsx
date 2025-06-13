import React, { createContext, useContext, useEffect, useState } from 'react';
import { openDB, IDBPDatabase } from 'idb';

export interface SaveGameData {
  playerId: string;
  currentLevel: number;
  score: number;
  highScore: number;
  lives: number;
  unlockedLevels: number[];
  achievements: string[];
  collectibles: { [levelId: string]: string[] };
  powerUps: string[];
  settings: any;
  lastPlayed: number;
  totalPlayTime: number;
}

interface SaveGameContextType {
  saveData: SaveGameData | null;
  saveGame: (data: Partial<SaveGameData>) => Promise<void>;
  loadGame: () => Promise<SaveGameData | null>;
  deleteSave: () => Promise<void>;
  syncToCloud: () => Promise<void>;
  isLoading: boolean;
}

const defaultSaveData: SaveGameData = {
  playerId: '',
  currentLevel: 1,
  score: 0,
  highScore: 0,
  lives: 3,
  unlockedLevels: [1],
  achievements: [],
  collectibles: {},
  powerUps: [],
  settings: {},
  lastPlayed: Date.now(),
  totalPlayTime: 0,
};

const SaveGameContext = createContext<SaveGameContextType | undefined>(undefined);

export const SaveGameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [saveData, setSaveData] = useState<SaveGameData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [db, setDb] = useState<IDBPDatabase | null>(null);

  useEffect(() => {
    const initDB = async () => {
      try {
        const database = await openDB('nexus-platformer-db', 1, {
          upgrade(db) {
            if (!db.objectStoreNames.contains('saves')) {
              db.createObjectStore('saves', { keyPath: 'playerId' });
            }
            if (!db.objectStoreNames.contains('achievements')) {
              db.createObjectStore('achievements', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('leaderboards')) {
              db.createObjectStore('leaderboards', { keyPath: 'id' });
            }
          },
        });
        setDb(database);
        await loadGame();
      } catch (error) {
        console.error('Failed to initialize database:', error);
        // Fallback to localStorage
        await loadGameFromLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };

    initDB();
  }, []);

  const generatePlayerId = (): string => {
    return 'player_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  };

  const saveGame = async (data: Partial<SaveGameData>): Promise<void> => {
    const currentData = saveData || { ...defaultSaveData, playerId: generatePlayerId() };
    const updatedData = {
      ...currentData,
      ...data,
      lastPlayed: Date.now(),
    };

    setSaveData(updatedData);

    try {
      if (db) {
        await db.put('saves', updatedData);
      } else {
        // Fallback to localStorage
        localStorage.setItem('nexus-platformer-save', JSON.stringify(updatedData));
      }
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  };

  const loadGame = async (): Promise<SaveGameData | null> => {
    try {
      if (db) {
        const saves = await db.getAll('saves');
        if (saves.length > 0) {
          const latestSave = saves.reduce((latest, current) => 
            current.lastPlayed > latest.lastPlayed ? current : latest
          );
          setSaveData(latestSave);
          return latestSave;
        }
      }
      return await loadGameFromLocalStorage();
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  };

  const loadGameFromLocalStorage = async (): Promise<SaveGameData | null> => {
    try {
      const saved = localStorage.getItem('nexus-platformer-save');
      if (saved) {
        const data = JSON.parse(saved);
        setSaveData(data);
        return data;
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
    return null;
  };

  const deleteSave = async (): Promise<void> => {
    try {
      if (db && saveData) {
        await db.delete('saves', saveData.playerId);
      }
      localStorage.removeItem('nexus-platformer-save');
      setSaveData(null);
    } catch (error) {
      console.error('Failed to delete save:', error);
    }
  };

  const syncToCloud = async (): Promise<void> => {
    // Placeholder for cloud sync implementation
    // This would integrate with platform-specific cloud save services
    console.log('Cloud sync not implemented yet');
  };

  return (
    <SaveGameContext.Provider value={{
      saveData,
      saveGame,
      loadGame,
      deleteSave,
      syncToCloud,
      isLoading,
    }}>
      {children}
    </SaveGameContext.Provider>
  );
};

export const useSaveGame = () => {
  const context = useContext(SaveGameContext);
  if (!context) {
    throw new Error('useSaveGame must be used within a SaveGameProvider');
  }
  return context;
};