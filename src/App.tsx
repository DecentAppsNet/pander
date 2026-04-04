import { useState, useEffect } from "react";

import LoginScreen from "./loginScreen/LoginScreen";
import BattleMenuScreen from "./battleMenu/BattleMenuScreen";
import BattleScreen from "./battleScreen/BattleScreen";
import AboutDialog from "./homeScreen/dialogs/AboutDialog";
import Player from "./multiplayer/types/Player";
import { CrowdComposition } from "./multiplayer/types/Challenge";
import { getStoredPlayer, handleDiscordCallback } from "./multiplayer/discordAuth";

type AppScreen = 'login' | 'menu' | 'battle';

const BATTLE_LEVEL_ID = 'Rap Battle';

function App() {
  const [screen, setScreen] = useState<AppScreen>('login');
  const [player, setPlayer] = useState<Player | null>(null);
  const [modalDialogName, setModalDialogName] = useState<string | null>(null);
  const [battleCrowd, setBattleCrowd] = useState<CrowdComposition[]>([]);
  const [battleOpponent, setBattleOpponent] = useState<string>('Player 2');

  useEffect(() => {
    async function _checkAuth() {
      let storedPlayer = await handleDiscordCallback();
      if (!storedPlayer) {
        storedPlayer = await getStoredPlayer();
      }
      if (storedPlayer) {
        setPlayer(storedPlayer);
        setScreen('menu');
      }
    }
    _checkAuth();

    function _onSkipLogin() {
      setScreen('menu');
    }
    window.addEventListener('skip-login', _onSkipLogin);
    return () => window.removeEventListener('skip-login', _onSkipLogin);
  }, []);

  function _onSoloPlay() {
    setBattleOpponent('Player 2');
    setBattleCrowd([]);
    setScreen('battle');
  }

  function _onChallenge(_defenderId: string, defenderName: string, crowd: CrowdComposition[]) {
    setBattleCrowd(crowd);
    setBattleOpponent(defenderName);
    setScreen('battle');
  }

  switch (screen) {
    case 'login':
      return (
        <>
          <LoginScreen onAboutClick={() => setModalDialogName(AboutDialog.name)} />
          <AboutDialog
            isOpen={modalDialogName === AboutDialog.name}
            onClose={() => setModalDialogName(null)}
          />
        </>
      );

    case 'menu':
      return (
        <BattleMenuScreen
          player={player}
          onSoloPlay={_onSoloPlay}
          onChallenge={_onChallenge}
          onAboutClick={() => setModalDialogName(AboutDialog.name)}
        />
      );

    case 'battle':
      return (
        <BattleScreen
          player1Name={player?.username ?? 'Player 1'}
          player2Name={battleOpponent}
          levelId={BATTLE_LEVEL_ID}
          crowdComposition={battleCrowd}
          onExit={() => setScreen('menu')}
        />
      );
  }
}

export default App;
