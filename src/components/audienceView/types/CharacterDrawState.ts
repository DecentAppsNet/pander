import CharacterSprite from "./CharacterSprite";
import Rect from "@/drawing/types/Rect";

type CharacterDrawState = {
  spriteMap:ImageBitmap,
  sprite:CharacterSprite,
  happiness:number,
  bodyFrameNo:number,
  destRect:Rect,
  nextBodyFrameChangeTime:number,
  nextMoodIconDisplayTime:number
}

export default CharacterDrawState;