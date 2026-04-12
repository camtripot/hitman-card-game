import React from 'react';
import { GameProvider } from './src/context/GameContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <GameProvider>
      <RootNavigator />
    </GameProvider>
  );
}
