import { useState, useEffect, useRef, useCallback } from "react";

import styles from './BattleScreen.module.css';
import AudienceView from "@/components/audienceView/AudienceView";
import AudienceMember from "@/game/types/AudienceMember";
import CharacterSpriteset from "@/components/audienceView/types/CharacterSpriteset";
import { loadCharacterSpriteset } from "@/components/audienceView/characterSpriteUtil";
import CardHandBox from "@/components/cardHandBox/CardHandBox";
import Deck from "@/game/types/cards/Deck";
import BattleSession, { BattleEndCallback, BattlePlayer, TurnEndCallback, TurnChangedCallback, TURN_DURATION_MS } from "@/game/BattleSession";
import { setHappiness } from "@/components/audienceView/audienceEventUtil";
import Card from "@/game/types/cards/Card";
import { TurnScore } from "@/game/battleScoringUtil";
import { DEFAULT_HAPPINESS } from "@/game/happinessUtil";
import { initSpeech, enableSpeech } from "@/speech/speechUtil";
import { getSpeechPreference } from "@/common/speechPreference";
import ToastPane from "@/components/toasts/ToastPane";
import { CrowdComposition } from "@/multiplayer/types/Challenge";
import { submitScore } from "@/multiplayer/gameClient";

type Props = {
  player1Name: string;
  player2Name: string;
  levelId: string;
  crowdComposition?: CrowdComposition[];
  gameId?: string | null;
  playerId?: string | null;
  isChallenger?: boolean;
  opponentScore?: number | null;
  onExit: () => void;
};

function LocalVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasStream, setHasStream] = useState(false);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { width: 160, height: 120, frameRate: 15 }, audio: false })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasStream(true);
        }
      })
      .catch(() => setHasStream(false));

    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className={styles.localVideo}
      autoPlay
      muted
      playsInline
      style={{ display: hasStream ? 'block' : 'none' }}
    />
  );
}

function BattleScreen({ player1Name, player2Name, levelId, gameId, playerId, isChallenger, opponentScore, onExit }: Props) {
  const isMultiplayer = !!(gameId && playerId);
  const [characterSpriteset, setCharacterSpriteset] = useState<CharacterSpriteset | null>(null);
  const [audienceMembers, setAudienceMembers] = useState<AudienceMember[]>([]);
  const [deck, setDeck] = useState<Deck | null>(null);
  const [_averageHappiness, setAverageHappiness] = useState<number>(DEFAULT_HAPPINESS);
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [turnNumber, setTurnNumber] = useState<number>(0);
  const [totalTurns, setTotalTurns] = useState<number>(6);
  const [scores, setScores] = useState<number[]>([0, 0]);
  const [_activeCard, setActiveCard] = useState<Card | null>(null);
  const [_isSpeechEnabled, setIsSpeechEnabled] = useState<boolean>(getSpeechPreference());
  const [battleOver, setBattleOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<BattlePlayer[] | null>(null);
  const [winnerIndex, setWinnerIndex] = useState<number>(0);
  const [turnTimeLeft, setTurnTimeLeft] = useState<number>(TURN_DURATION_MS / 1000);
  const [lastTurnScore, setLastTurnScore] = useState<TurnScore | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  const sessionRef = useRef<BattleSession | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playerNames = [player1Name, player2Name];

  const onTurnEnd: TurnEndCallback = useCallback((playerIndex: number, turnScore: TurnScore) => {
    setLastTurnScore(turnScore);
    setScores(prev => {
      const next = [...prev];
      next[playerIndex] += turnScore.totalScore;
      return next;
    });
  }, []);

  const [scoreSubmitted, setScoreSubmitted] = useState<boolean>(false);

  const onBattleEnd: BattleEndCallback = useCallback((players: BattlePlayer[], winIdx: number) => {
    setBattleOver(true);
    setWinner(players);
    setWinnerIndex(winIdx);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // In async multiplayer, submit our score to the server
    if (isMultiplayer && gameId && playerId) {
      const myPlayerIndex = isChallenger ? 0 : 1;
      const myScore = players[myPlayerIndex].score;
      submitScore(gameId, playerId, myScore)
        .then(() => setScoreSubmitted(true))
        .catch(err => console.error('Failed to submit score:', err));
    }
  }, [isMultiplayer, gameId, playerId, isChallenger]);

  const onTurnChanged: TurnChangedCallback = useCallback(
    (playerIdx: number, card: Card | null, turnNum: number, totalT: number) => {
      setActivePlayerIndex(playerIdx);
      setActiveCard(card);
      setTurnNumber(turnNum);
      setTotalTurns(totalT);
      setTurnTimeLeft(TURN_DURATION_MS / 1000);
      setLastTurnScore(null);
    }, []
  );

  // Initialize battle
  useEffect(() => {
    async function _init() {
      const spriteset = await loadCharacterSpriteset();
      setCharacterSpriteset(spriteset);

      function _setHappiness(characterId: string, triggerWord: string, happiness: number) {
        setHappiness(characterId, triggerWord, happiness);
      }

      const session = new BattleSession(
        _setHappiness,
        setAverageHappiness,
        setDeck,
        onTurnEnd,
        onBattleEnd,
        onTurnChanged,
      );
      sessionRef.current = session;

      // In async multiplayer, each player only plays 1 turn
      if (isMultiplayer) {
        session.setSingleTurnMode();
      }

      const level = await session.startBattle(levelId, player1Name, player2Name);
      setAudienceMembers(level.audienceMembers);
      setIsReady(true);

      // Auto-enable speech if preference is set (default on mobile)
      if (getSpeechPreference()) {
        await initSpeech(
          (text: string) => {
            session.prompt(text);
          },
          (_text: string) => { /* onStopTalking */ }
        );
        enableSpeech();
        setIsSpeechEnabled(true);
      }
    }
    _init();

    return () => {
      if (sessionRef.current) sessionRef.current.destroy();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [levelId, player1Name, player2Name]);

  // Turn countdown timer
  useEffect(() => {
    if (!isReady || battleOver) return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTurnTimeLeft(prev => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isReady, battleOver, turnNumber]);

  function _onEndTurn() {
    if (!sessionRef.current || battleOver) return;
    sessionRef.current.endTurn();
  }

  if (!isReady) {
    return <div className={styles.loading}>Loading battle...</div>;
  }

  if (battleOver && winner) {
    const myScore = isMultiplayer
      ? (isChallenger ? winner[0].score : winner[1].score)
      : null;
    const theirScore = isMultiplayer ? opponentScore : null;
    const isAsyncWaiting = isMultiplayer && isChallenger && theirScore === null;
    const isAsyncComplete = isMultiplayer && !isChallenger && theirScore !== null;

    if (isAsyncWaiting) {
      // Challenger finished — opponent hasn't played yet
      return (
        <div className={styles.gameOver}>
          <h2 className={styles.gameOverTitle}>Turn Complete!</h2>
          <div className={styles.finalScores}>
            <div className={styles.winnerScore}>
              <span className={styles.playerLabel}>{player1Name}</span>
              <span className={styles.scoreValue}>{myScore}</span>
            </div>
          </div>
          <p style={{ color: '#ccc', fontSize: '2vh', textAlign: 'center', marginTop: '2vh' }}>
            {scoreSubmitted
              ? `Score submitted! Waiting for ${player2Name} to take their turn.`
              : 'Submitting score...'}
          </p>
          <button className={styles.exitButton} onClick={onExit}>Back to Menu</button>
        </div>
      );
    }

    if (isAsyncComplete) {
      // Defender finished — show both scores
      const defenderScore = myScore!;
      const challengerScore = theirScore!;
      const defenderWins = defenderScore >= challengerScore;
      return (
        <div className={styles.gameOver}>
          <h2 className={styles.gameOverTitle}>Battle Over!</h2>
          <div className={styles.finalScores}>
            <div className={defenderWins ? styles.loserScore : styles.winnerScore}>
              <span className={styles.playerLabel}>{player2Name}</span>
              <span className={styles.scoreValue}>{challengerScore}</span>
            </div>
            <span className={styles.vs}>vs</span>
            <div className={defenderWins ? styles.winnerScore : styles.loserScore}>
              <span className={styles.playerLabel}>{player1Name}</span>
              <span className={styles.scoreValue}>{defenderScore}</span>
            </div>
          </div>
          <h3 className={styles.winnerName}>
            {defenderWins ? player1Name : player2Name} wins!
          </h3>
          <button className={styles.exitButton} onClick={onExit}>Back to Menu</button>
        </div>
      );
    }

    // Local/solo battle — original behavior
    return (
      <div className={styles.gameOver}>
        <h2 className={styles.gameOverTitle}>Battle Over!</h2>
        <div className={styles.finalScores}>
          <div className={winnerIndex === 0 ? styles.winnerScore : styles.loserScore}>
            <span className={styles.playerLabel}>{playerNames[0]}</span>
            <span className={styles.scoreValue}>{winner[0].score}</span>
          </div>
          <span className={styles.vs}>vs</span>
          <div className={winnerIndex === 1 ? styles.winnerScore : styles.loserScore}>
            <span className={styles.playerLabel}>{playerNames[1]}</span>
            <span className={styles.scoreValue}>{winner[1].score}</span>
          </div>
        </div>
        <h3 className={styles.winnerName}>{playerNames[winnerIndex]} wins!</h3>
        <button className={styles.exitButton} onClick={onExit}>Back to Menu</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Turn info bar */}
      <div className={styles.turnBar}>
        <div className={styles.turnInfo}>
          <span className={styles.turnLabel}>
            {playerNames[activePlayerIndex]}'s turn
          </span>
          <span className={styles.turnCount}>
            Round {Math.floor(turnNumber / 2) + 1}/{Math.floor(totalTurns / 2)}
          </span>
        </div>
        <div className={styles.timer}>
          {turnTimeLeft}s
        </div>
      </div>

      {/* Scoreboard */}
      <div className={styles.scoreboard}>
        <div className={activePlayerIndex === 0 ? styles.activePlayerScore : styles.playerScore}>
          <span className={styles.playerName}>{playerNames[0]}</span>
          <span className={styles.score}>{scores[0]}</span>
        </div>
        <div className={activePlayerIndex === 1 ? styles.activePlayerScore : styles.playerScore}>
          <span className={styles.playerName}>{playerNames[1]}</span>
          <span className={styles.score}>{scores[1]}</span>
        </div>
      </div>

      {/* Camera — opponent view (top right, above audience) */}
      <div className={styles.cameraBar}>
        <LocalVideo />
      </div>

      {/* Audience */}
      <div className={styles.audienceArea}>
        <AudienceView characterSpriteset={characterSpriteset} audienceMembers={audienceMembers} />
      </div>

      {/* Card */}
      <div className={styles.cardArea}>
        <CardHandBox deck={deck} />
      </div>

      {/* Last turn score */}
      {lastTurnScore && (
        <div className={styles.turnScorePopup}>
          +{lastTurnScore.totalScore} pts (x{lastTurnScore.crowdMultiplier.toFixed(1)} crowd)
        </div>
      )}

      {/* Controls */}
      <div className={styles.inputArea}>
        <button className={styles.endTurnButton} onClick={_onEndTurn}>
          End Turn
        </button>
      </div>

      <ToastPane />
    </div>
  );
}

export default BattleScreen;
