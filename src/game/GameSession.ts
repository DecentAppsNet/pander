import { isClose } from "@/common/mathUtil";
import { applyHappinessChanges, AverageHappinessChangeCallback, calcAverageHappiness, DEFAULT_HAPPINESS, EndLevelCallback, findHappinessChangesForAudience, 
    getLevelResults, SetHappinessCallback } from "./happinessUtil";
import { loadLevel } from "./levelFileUtil";
import AudienceMember from "./types/AudienceMember"
import Level, { duplicateLevel } from "./types/Level";
import WordUsageHistory from "./types/WordUsageHistory";
import { findWordCooldownFactor, updateWordUsageHistory, WordCooldownFactorCallback } from "./wordAnalysisUtil";
import { createDeckForLevel, DeckChangedCallback, findHappinessChangesForCard, getActiveCard, getNextCard, isActiveCardComplete, isEndOfDeck, preWarmLlmForCard, updateCardFromPrompt } from "./deckUtil";
import Deck, { duplicateDeck } from "./types/cards/Deck";
import GameSessionSettings from "./types/GameSettings";
import { assertNonNullable } from "decent-portal";
import LevelResults from "./types/LevelResults";
import HappinessChange from "./types/HappinessChange";

const _setHappinessNoOp:SetHappinessCallback = (_c:string, _t:string, _h:number) => { console.warn('setHappiness() not bound in game session.'); }
const _averageHappinessChangeNoOp:AverageHappinessChangeCallback = (_h:number) => { console.warn('onAverageHappinessChange() not bound in game session.'); } 
const _deckChangedNoOp:DeckChangedCallback = (_d:Deck) => { console.warn('onDeckChanged() not bound in game session.'); }
const _endLevelNoOp:EndLevelCallback = (_lr:LevelResults) => { console.warn('onEndLevel() not bound in game session.'); }

/*
 The GameSession instance handles loading levels and updating game state in response to player commands. It is strictly 
 decoupled from UI and I/O, relying on a caller to pass player input via methods, and subscribing UI components to respond
 as appropriate to published events indicating game state change. GameSession relies on no singletons and can operate headlessly.

 The lifetime of the GameSession instance is intended to be for a player's game, potentially spanning multiple levels and tracking
 cumulative stats.
*/
class GameSession {
  private _audienceMembers:AudienceMember[] = [];
  private _onSetHappiness:SetHappinessCallback = _setHappinessNoOp;
  private _onAverageHappinessChange:AverageHappinessChangeCallback = _averageHappinessChangeNoOp;
  private _onDeckChanged:DeckChangedCallback = _deckChangedNoOp;
  private _onEndLevel:EndLevelCallback = _endLevelNoOp;
  private _averageHappiness:number = DEFAULT_HAPPINESS;
  private _wordUsageHistory:WordUsageHistory = {};
  private _deck:Deck = { cards:[], activeCardNo: 0 };
  private _settings:GameSessionSettings;
  private _turnTimer:NodeJS.Timeout|null = null;
  private _cardPlayerTexts:string[] = []; // De-duped, high-quality speech associated with the active card.

  constructor(settings:GameSessionSettings, onSetHappiness:SetHappinessCallback, onAverageHappinessChange:AverageHappinessChangeCallback, 
      onDeckChanged:DeckChangedCallback, onEndLevel:EndLevelCallback = _endLevelNoOp) {
    this._onSetHappiness = onSetHappiness;
    this._onAverageHappinessChange = onAverageHappinessChange;
    this._onDeckChanged = onDeckChanged;
    this._onEndLevel = onEndLevel;
    this._settings = settings;
  }

  private _goNextCard() {
    assertNonNullable(this._deck);
    if (isEndOfDeck(this._deck)) return;

    const activeCard = getActiveCard(this._deck), nextCard = getNextCard(this._deck);
    assertNonNullable(activeCard);
    findHappinessChangesForCard(this._cardPlayerTexts, activeCard, this._audienceMembers).then((happinessChanges:HappinessChange[]) => { 
      this._averageHappiness = applyHappinessChanges(this._averageHappiness, happinessChanges, this._audienceMembers, this._onSetHappiness, this._onAverageHappinessChange);
      if (nextCard) preWarmLlmForCard(nextCard);
    });

    // Update the deck to advance to next card.
    this._cardPlayerTexts = [];
    this._deck = duplicateDeck(this._deck);
    this._deck.activeCardNo++;
    this._onDeckChanged(this._deck);

    // The previously running time for the turn is canceled because we've advanced past the card it was for.
    if (this._turnTimer) {
      clearTimeout(this._turnTimer);
      this._turnTimer = null;
    }

    if (isEndOfDeck(this._deck)) { // End the level if at end of deck.
      const levelResults = getLevelResults(this._audienceMembers);
      this._onEndLevel(levelResults);
    } else { // Set turn timer for the next card.
      this._turnTimer = setTimeout(() => this._goNextCard(), this._settings.turnDuration);
    }
  }

  // Loads a level and sets session state to begin playing in it.
  async startLevel(levelId:string):Promise<Level> {
    const level = await loadLevel(levelId);
    this._audienceMembers = level.audienceMembers;
    const prevAverageHappiness = this._averageHappiness;
    this._averageHappiness = calcAverageHappiness(this._audienceMembers);
    this._wordUsageHistory = {};
    this._cardPlayerTexts = [];
    this._deck = await createDeckForLevel(level);
    this._onDeckChanged(this._deck);
    if (!isClose(prevAverageHappiness, this._averageHappiness)) this._onAverageHappinessChange(this._averageHappiness);
    return duplicateLevel(level);
  }

  // Receive a prompt of player text, make updates to game state, and publish corresponding events that may be received by UI components.
  async prompt(playerText:string) {
    const onWordCooldownFactor:WordCooldownFactorCallback = (word:string) => findWordCooldownFactor(word, this._wordUsageHistory);
    let happinessChanges = await findHappinessChangesForAudience(playerText, this._audienceMembers, onWordCooldownFactor);
    updateWordUsageHistory(playerText, this._wordUsageHistory);
    const { didCardChange, happinessChanges: cardHappinessChanges } = updateCardFromPrompt(playerText, this._deck.cards[this._deck.activeCardNo]);
    if (didCardChange) this._onDeckChanged(duplicateDeck(this._deck));
    if (cardHappinessChanges.length > 0) happinessChanges = happinessChanges.concat(cardHappinessChanges);
    this._averageHappiness = applyHappinessChanges(this._averageHappiness, happinessChanges, this._audienceMembers, 
        this._onSetHappiness, this._onAverageHappinessChange);
  }

  // Called when player has stopped talking or used the chatbox to submit a prompt.
  async onStopTalking(playerText:string) {
    if (isEndOfDeck(this._deck)) return;
    this._cardPlayerTexts.push(playerText);
    if (isActiveCardComplete(this._deck)) this._goNextCard();
  }
}

export default GameSession;