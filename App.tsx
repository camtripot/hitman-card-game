import React, { useState } from 'react';
import { GameProvider } from './src/context/GameContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { GameScreen } from './src/screens/GameScreen';
import { LobbyScreen } from './src/screens/LobbyScreen';
import { OnlineGameScreen } from './src/screens/OnlineGameScreen';

type Screen =
  | { name: 'Home' }
  | { name: 'Game'; params: { playerNames: string[]; mode: string } }
  | { name: 'Lobby' }
  | { name: 'OnlineGame'; params: { manager: any } };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'Home' });

  const navigation = {
    navigate: (name: string, params?: any) => {
      setScreen({ name, params } as Screen);
    },
  };

  return (
    <GameProvider>
      {screen.name === 'Home' && (
        <HomeScreen navigation={navigation} />
      )}
      {screen.name === 'Game' && (
        <GameScreen
          route={{ params: (screen as any).params }}
          navigation={navigation}
        />
      )}
      {screen.name === 'Lobby' && (
        <LobbyScreen navigation={navigation} />
      )}
      {screen.name === 'OnlineGame' && (
        <OnlineGameScreen
          route={{ params: (screen as any).params }}
          navigation={navigation}
        />
      )}
    </GameProvider>
  );
}
