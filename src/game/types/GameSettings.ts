// These are player-specified settings that influence GameSession. A/V and animation settings (audio volume, 
// screen resolution) don't belong here.
type GameSessionSettings = {
  turnDuration:number, // Time to wait in msecs before advancing to the next card.
}

export default GameSessionSettings;