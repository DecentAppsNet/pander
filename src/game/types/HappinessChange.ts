type HappinessChange = {
  characterId:string,     // All audience members with this character ID will be updated.
  happinessDelta:number   // Value from -1 to 1 that will be applied to character happiness with clamping.
}

export default HappinessChange;