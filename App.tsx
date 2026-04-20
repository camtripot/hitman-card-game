import React, { useState } from 'react';
import { GameProvider } from './src/context/GameContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { LocalSetupScreen } from './src/screens/LocalSetupScreen';
import { GameScreen } from './src/screens/GameScreen';
import { LobbyScreen } from './src/screens/LobbyScreen';
import { OnlineGameScreen } from './src/screens/OnlineGameScreen';
import { RulesScreen } from './src/screens/RulesScreen';

type Screen =
  | { name: 'Home' }
  | { name: 'LocalSetup' }
  | { name: 'Game'; params: { playerNames: string[]; mode: string } }
  | { name: 'Lobby'; params?: { settings?: any } }
  | { name: 'OnlineGame'; params: { manager: any } }
  | { name: 'Rules' };

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
      {screen.name === 'LocalSetup' && (
        <LocalSetupScreen navigation={navigation} />
      )}
      {screen.name === 'Game' && (
        <GameScreen
          route={{ params: (screen as any).params }}
          navigation={navigation}
        />
      )}
      {screen.name === 'Lobby' && (
        <LobbyScreen
          route={{ params: (screen as any).params }}
          navigation={navigation}
        />
      )}
      {screen.name === 'OnlineGame' && (
        <OnlineGameScreen
          route={{ params: (screen as any).params }}
          navigation={navigation}
        />
      )}
      {screen.name === 'Rules' && (
        <RulesScreen navigation={navigation} />
      )}
    </GameProvider>
  );
}
