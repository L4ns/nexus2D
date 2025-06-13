import React from 'react';
import Game from './components/Game';
import { PlatformProvider } from './contexts/PlatformContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { SaveGameProvider } from './contexts/SaveGameContext';

function App() {
  return (
    <PlatformProvider>
      <SettingsProvider>
        <SaveGameProvider>
          <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-2 sm:p-4">
            <Game />
          </div>
        </SaveGameProvider>
      </SettingsProvider>
    </PlatformProvider>
  );
}

export default App;