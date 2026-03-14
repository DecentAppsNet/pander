import CharacterSprite from "./CharacterSprite";

type CharacterSpriteset = {
  spriteMap:ImageBitmap,
  sprites:{[id:string]:CharacterSprite}
}

export default CharacterSpriteset;