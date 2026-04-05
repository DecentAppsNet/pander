import { useState, useEffect } from "react";

import LoginScreen from "./loginScreen/LoginScreen";
import BattleMenuScreen from "./battleMenu/BattleMenuScreen";
import BattleScreen from "./battleScreen/BattleScreen";
import AboutDialog from "./homeScreen/dialogs/AboutDialog";
import Player from "./multiplayer/types/Player";
import { CrowdComposition } from "./multiplayer/types/Challenge";
import { getStoredPlayer, handleDiscordCallback } from "./multiplayer/discordAuth";
import { createChallenge, getGame, connectToGame, disconnectFromGame } from "./multiplayer/gameClient";

type AppScreen = 'login' | 'menu' | 'battle' | 'waiting';

const BATTLE_LEVEL_ID = 'Rap Battle';

function App() {
  const [screen, setScreen] = useState<AppScreen>('login');
  const [player, setPlayer] = useState<Player | null>(null);
  const [modalDialogName, setModalDialogName] = useState<string | null>(null);
  const [battleCrowd, setBattleCrowd] = useState<CrowdComposition[]>([]);
  const [battleOpponent, setBattleOpponent] = useState<string>('Player 2');
  const [gameId, setGameId] = useState<string | null>(null);

  useEffect(() => {
    async function _checkAuth() {
      // Handle Discord OAuth callback
      let storedPlayer = await handleDiscordCallback();
      if (!storedPlayer) {
        storedPlayer = await getStoredPlayer();
      }
      if (storedPlayer) {
        setPlayer(storedPlayer);
      }

      // Check for ?id= or ?join= parameter (opponent clicking Discord link)
      const params = new URLSearchParams(window.location.search);
      const joinGameId = params.get('id') ?? params.get('join');
      if (joinGameId) {
        window.history.replaceState({}, document.title, window.location.pathname);
        try {
          const game = await getGame(joinGameId);
          setGameId(joinGameId);
          setBattleOpponent(game.challengerName);
          setBattleCrowd(game.crowdComposition || []);
          setScreen('battle');
          return;
        } catch (e) {
          console.error('Failed to join game:', e);
        }
      }

      setScreen(storedPlayer ? 'menu' : 'login');
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
    setGameId(null);
    setScreen('battle');
  }

  async function _onChallenge(defenderId: string, defenderName: string, crowd: CrowdComposition[]) {
    setBattleCrowd(crowd);
    setBattleOpponent(defenderName);

    if (player) {
      try {
        const result = await createChallenge(
          player.discordId,
          player.username,
          defenderId,
          defenderName,
          crowd,
          BATTLE_LEVEL_ID,
        );
        setGameId(result.gameId);
        setScreen('waiting');
        return;
      } catch (e) {
        console.error('Failed to create challenge, starting local battle:', e);
      }
    }

    // Fallback: local solo battle
    setGameId(null);
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

    case 'waiting':
      return (
        <WaitingScreen
          opponentName={battleOpponent}
          gameId={gameId!}
          playerId={player?.discordId ?? ''}
          onGameStart={() => setScreen('battle')}
          onCancel={() => { setGameId(null); setScreen('menu'); }}
        />
      );

    case 'battle':
      return (
        <BattleScreen
          player1Name={player?.username ?? 'Player 1'}
          player2Name={battleOpponent}
          levelId={BATTLE_LEVEL_ID}
          crowdComposition={battleCrowd}
          gameId={gameId}
          playerId={player?.discordId ?? null}
          onExit={() => { setGameId(null); setScreen('menu'); }}
        />
      );
  }
}

// Waiting screen — shown after challenge is sent, waiting for opponent to join
function WaitingScreen({ opponentName, gameId, playerId, onGameStart, onCancel }: {
  opponentName: string;
  gameId: string;
  playerId: string;
  onGameStart: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    connectToGame(gameId, playerId, (msg: any) => {
      if (msg.type === 'GAME_START') {
        onGameStart();
      }
    });
    return () => disconnectFromGame();
  }, [gameId, playerId]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100dvh', maxWidth: 480, margin: '0 auto', background: '#1a1a2e', color: 'white', gap: '2vh', padding: '3vh',
    }}>
      <h2 style={{ fontFamily: 'hobby-of-night', fontSize: '4vh', color: '#e94560' }}>Challenge Sent!</h2>
      <p style={{ fontSize: '2vh', color: '#ccc', textAlign: 'center' }}>
        Waiting for <strong>{opponentName}</strong> to join...
      </p>
      <p style={{ fontSize: '1.5vh', color: '#888' }}>
        A link was posted in the Discord channel
      </p>
      <div style={{
        padding: '1.5vh 3vh', background: '#16213e', borderRadius: '1vh',
        border: '1px solid #333', fontSize: '1.4vh', color: '#aaa', wordBreak: 'break-all', textAlign: 'center',
      }}>
        Game ID: {gameId}
      </div>
      <button onClick={onCancel} style={{
        marginTop: '2vh', padding: '1vh 4vh', background: 'none', border: '1px solid #555',
        borderRadius: '1vh', color: '#aaa', fontSize: '1.8vh', cursor: 'pointer',
      }}>
        Cancel
      </button>
    </div>
  );
}

export default App;
