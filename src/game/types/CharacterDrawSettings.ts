import CellRange from "./CellRange"

type CharacterDrawSettings = {
  spriteMapUrl:string, 
  bodyWidth:number, 
  bodyHeight:number,
  characters:{[characterId:string]:CellRange}
}

export default CharacterDrawSettings;