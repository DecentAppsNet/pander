import { applyHappinessChanges, FindHappinessChangeCallback, findHappinessChangeDefault, findHappinessChangesForAudience, nameToHappinessFunction, SetHappinessCallback } from "./happinessUtil";
import { loadLevel } from "./levelFileUtil";
import AudienceMember from "./types/AudienceMember"
import Level, { duplicateLevel } from "./types/Level";

const _setHappinessNoOp:SetHappinessCallback = (_c:string, _h:number) => { console.warn('setHappiness() not bound in game session.'); }

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
  private _onFindHappinessChange:FindHappinessChangeCallback = findHappinessChangeDefault;
  private _findHappinessFunctions:FindHappinessChangeCallback[] = [];

  constructor(onSetHappiness:SetHappinessCallback) {
    this._onSetHappiness = onSetHappiness;
  }

  // Loads a level and sets session state to begin playing in it.
  async startLevel(levelId:string):Promise<Level> {
    const level = await loadLevel(levelId);
    this._audienceMembers = level.audienceMembers;
    this._onFindHappinessChange = nameToHappinessFunction(level.happinessFunctionName, this._findHappinessFunctions);
    return duplicateLevel(level);
  }

  // Receive a prompt of player text, make updates to game state, and publish corresponding events that may be received by UI components.
  async prompt(playerText:string) {
    const happinessChanges = await findHappinessChangesForAudience(playerText, this._audienceMembers, this._onFindHappinessChange);
    applyHappinessChanges(happinessChanges, this._audienceMembers, this._onSetHappiness);
  }

  /* Can be used to make custom happiness functions available for individual levels that override the default happiness function
     via a `* happinessFunction=` line in `levels.md`. Use to extend the engine to try out different ways of evaluating happiness, e.g.
     compare player text against a vector database. */
  bindFindHappinessFunctions(funcs:FindHappinessChangeCallback[]) {
    this._findHappinessFunctions = funcs;
  }
}

export default GameSession;