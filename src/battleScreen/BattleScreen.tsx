import { useState, useEffect, useRef, useCallback } from "react";

import styles from './BattleScreen.module.css';
import AudienceView from "@/components/audienceView/AudienceView";
import AudienceMember from "@/game/types/AudienceMember";
import CharacterSpriteset from "@/components/audienceView/types/CharacterSpriteset";
import { loadCharacterSpriteset } from "@/components/audienceView/characterSpriteUtil";
import ChatInputBox from "@/components/chat/ChatInputBox";
import CardHandBox from "@/components/cardHandBox/CardHandBox";
import HappinessMeter from "@/components/happinessMeter/HappinessMeter";
import Deck from "@/game/types/cards/Deck";
import BattleSession, { BattleEndCallback, BattlePlayer, TurnEndCallback, TurnChangedCallback, TURN_DURATION_MS } from "@/game/BattleSession";
import { setHappiness } from "@/components/audienceView/audienceEventUtil";
import Card from "@/game/types/cards/Card";
import { TurnScore } from "@/game/battleScoringUtil";
import { DEFAULT_HAPPINESS } from "@/game/happinessUtil";
import { appendRecentPrompt } from "@/persistence/recentPrompts";
import { isSpeechAvailable, toggleSpeech } from "@/speech/speechUtil";
import ToastPane from "@/components/toasts/ToastPane";
import { CrowdComposition } from "@/multiplayer/types/Challenge";

type Props = {
  player1Name: string;
  player2Name: string;
  levelId: string;
  crowdComposition?: CrowdComposition[];
  onExit: () => void;
};

function BattleScreen({ player1Name, player2Name, levelId, onExit }: Props) {
  const [characterSpriteset, setCharacterSpriteset] = useState<CharacterSpriteset | null>(null);
  const [audienceMembers, setAudienceMembers] = useState<AudienceMember[]>([]);
  const [deck, setDeck] = useState<Deck | null>(null);
  const [averageHappiness, setAverageHappiness] = useState<number>(DEFAULT_HAPPINESS);
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [turnNumber, setTurnNumber] = useState<number>(0);
  const [totalTurns, setTotalTurns] = useState<number>(6);
  const [scores, setScores] = useState<number[]>([0, 0]);
  const [_activeCard, setActiveCard] = useState<Card | null>(null);
  const [recentPrompts, setRecentPrompts] = useState<string[]>([]);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState<boolean>(false);
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

  const onBattleEnd: BattleEndCallback = useCallback((players: BattlePlayer[], winIdx: number) => {
    setBattleOver(true);
    setWinner(players);
    setWinnerIndex(winIdx);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

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

      const level = await session.startBattle(levelId, player1Name, player2Name);
      setAudienceMembers(level.audienceMembers);
      setIsReady(true);
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

  async function _onSubmit(text: string) {
    if (!sessionRef.current || battleOver) return;
    const prompts = await appendRecentPrompt(text);
    setRecentPrompts(prompts);
    await sessionRef.current.prompt(text);
  }

  function _onEndTurn() {
    if (!sessionRef.current || battleOver) return;
    sessionRef.current.endTurn();
  }

  if (!isReady) {
    return <div className={styles.loading}>Loading battle...</div>;
  }

  if (battleOver && winner) {
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

      {/* Audience */}
      <div className={styles.audienceArea}>
        <AudienceView characterSpriteset={characterSpriteset} audienceMembers={audienceMembers} />
      </div>

      {/* Card + Happiness */}
      <div className={styles.cardArea}>
        <div className={styles.cardSection}>
          <CardHandBox deck={deck} />
        </div>
        <div className={styles.happinessSection}>
          <HappinessMeter happiness={averageHappiness} />
        </div>
      </div>

      {/* Last turn score */}
      {lastTurnScore && (
        <div className={styles.turnScorePopup}>
          +{lastTurnScore.totalScore} pts (x{lastTurnScore.crowdMultiplier.toFixed(1)} crowd)
        </div>
      )}

      {/* Input area */}
      <div className={styles.inputArea}>
        <ChatInputBox
          recentPrompts={recentPrompts}
          onSubmit={_onSubmit}
          isSpeechEnabled={isSpeechEnabled}
          onToggleSpeech={() => {
            if (!isSpeechAvailable()) return;
            setIsSpeechEnabled(toggleSpeech());
          }}
        />
        <button className={styles.endTurnButton} onClick={_onEndTurn}>
          End Turn
        </button>
      </div>

      <ToastPane />
    </div>
  );
}

export default BattleScreen;
