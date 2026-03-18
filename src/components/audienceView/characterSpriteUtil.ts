import { assert } from "decent-portal";

import CharacterSpriteset from "./types/CharacterSpriteset";
import { baseUrl } from "@/common/urlUtil";
import CharacterSprite from "./types/CharacterSprite";
import Rect, { UNSPECIFIED_RECT } from "../../drawing/types/Rect";
import { createImageBitmapFromImageData, createImageDataFromImageBitmap } from "../../drawing/drawUtil";
import CharacterDrawState from "./types/CharacterDrawState";
import { loadCharacterDrawSettings } from "@/game/characterFileUtil";
import { clamp } from "@/common/mathUtil";

const UNSPECIFIED_TIME = -1;
const FLASH_DURATION = 1000;
const MOOD_ICON_DISPLAY_DURATION = 1000;

// Marker pixel RGB for detecting marker pixels in spritemap image that define face area.
const MARKER_R = 0;
const MARKER_G = 255;
const MARKER_B = 0;
// It's intuitive to use 3 marker dots for position of eyes and mouth in paint program, but the actual size of the face image
// used is larger. These margins are used to create a large rect within the body area for overlaying the full face sprite. Otherwise,
// it will be too small.
const CX_EYE_MARGIN = 5; // From centerpoint of eye to leftmost non-transparent face pixel, largest case for face frames.
const CY_EYE_MARGIN = 11; // From centerpoint of eye to topmost non-transparent face pixel, largest case.
const CY_MOUTH_MARGIN = 8; // From top of mouth to bottommost non-transparent face pixel, largest case.

const CX_FACE = 64, CY_FACE = 64;
const FACE_COUNT = 5;
const FACE_SOURCE_RECTS:Rect[] = [
  {x:0+CX_FACE, y:0, w:CX_FACE, h:CY_FACE}, // Angry
  {x:0, y:256-CY_FACE, w:CX_FACE, h:CY_FACE},
  {x:0, y:256-(CY_FACE*2), w:CX_FACE, h:CY_FACE},
  {x:0, y:256-(CY_FACE*3), w:CX_FACE, h:CY_FACE},
  {x:0, y:0, w:CX_FACE, h:CY_FACE}, // Happy
];

function _calcCellRect(cellNo:number, colCount:number, bodyWidth:number, bodyHeight:number):Rect {
  const y = Math.floor(cellNo / colCount) * bodyHeight;
  const x = (cellNo % colCount) * bodyWidth;
  return { x, y, w: bodyWidth, h: bodyHeight };
}

// Find all marker pixels (RGB=0xf0) inside the bodyRect area of the spriteMap image.
// Return a bounding rect that contains all of them.
function _findFaceRect(bodyRect:Rect, spriteMap:ImageBitmap):Rect {
  const w = Math.max(1, Math.floor(bodyRect.w));
  const h = Math.max(1, Math.floor(bodyRect.h));

  const imgData = createImageDataFromImageBitmap(spriteMap, Math.floor(bodyRect.x), Math.floor(bodyRect.y), w, h);
  const data = imgData.data;

  let minX = w, minY = h, maxX = -1, maxY = -1;

  // look for marker pixels.
  for (let yy = 0; yy < h; ++yy) {
    for (let xx = 0; xx < w; ++xx) {
      const i = (yy * w + xx) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a === 0) continue;
      if (r === MARKER_R && g === MARKER_G && b === MARKER_B) {
        if (xx < minX) minX = xx;
        if (yy < minY) minY = yy;
        if (xx > maxX) maxX = xx;
        if (yy > maxY) maxY = yy;
      }
    }
  }

  if (maxX === -1) {
    // no marker found — return a reasonable default (small area near upper-center)
    const defW = Math.max(1, Math.floor(bodyRect.w / 4));
    const defH = Math.max(1, Math.floor(bodyRect.h / 6));
    const defX = Math.max(0, Math.floor(bodyRect.w / 2 - defW / 2));
    const defY = Math.max(0, Math.floor(bodyRect.h / 4));
    return { x: defX, y: defY, w: defW, h: defH };
  }

  const rect = { x: minX, y: minY, w: (maxX - minX + 1), h: (maxY - minY + 1) };
  rect.x -= CX_EYE_MARGIN;
  rect.w += (CX_EYE_MARGIN * 2);
  rect.y -= CY_EYE_MARGIN;
  rect.h += (CY_EYE_MARGIN + CY_MOUTH_MARGIN);
  return rect;
}

function _createCharacterSprite(characterId:string, bodyStartCellNo:number, bodyCellCount:number, bodyWidth:number, bodyHeight:number, 
    spriteMap:ImageBitmap):CharacterSprite {
  const sprite:CharacterSprite = { id:characterId, bodyRects:[], faceRects:[] };
  const colCount = Math.floor(spriteMap.width / bodyWidth);
  for(let bodyI = 0; bodyI < bodyCellCount; ++bodyI) {
    sprite.bodyRects[bodyI] = _calcCellRect(bodyStartCellNo + bodyI, colCount, bodyWidth, bodyHeight);
    sprite.faceRects[bodyI] = _findFaceRect(sprite.bodyRects[bodyI], spriteMap);
  }
  return sprite;
}

// For every marker pixel found inside replaceRect of the sprite map image data, change the marker pixel to the average of its orthogonally
// adjacent pixels that are not also marker pixels. If a pixel is fully surrounded by marker pixels, don't change it, and log a warning to console.
function _replaceMarkerPixelsInRect(spriteMapData:ImageData, replaceRect:Rect) {
  const data = spriteMapData.data;
  const w = spriteMapData.width;
  const h = spriteMapData.height;

  const startX = Math.max(0, Math.floor(replaceRect.x));
  const startY = Math.max(0, Math.floor(replaceRect.y));
  const endX = Math.min(w, Math.floor(replaceRect.x + replaceRect.w));
  const endY = Math.min(h, Math.floor(replaceRect.y + replaceRect.h));

  let isolatedCount = 0;
  for (let y = startY; y < endY; ++y) {
    for (let x = startX; x < endX; ++x) {
      const i = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (!(r === MARKER_R && g === MARKER_G && b === MARKER_B)) continue;

      // examine orthogonal neighbors (up, down, left, right)
      let sumR = 0, sumG = 0, sumB = 0, count = 0;
      const tryNeighbor = (nx:number, ny:number) => {
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) return;
        const ni = (ny * w + nx) * 4;
        const nr = data[ni], ng = data[ni + 1], nb = data[ni + 2];
        if (nr === MARKER_R && ng === MARKER_G && nb === MARKER_B) return;
        sumR += nr; sumG += ng; sumB += nb; count += 1;
      };

      tryNeighbor(x - 1, y);
      tryNeighbor(x + 1, y);
      tryNeighbor(x, y - 1);
      tryNeighbor(x, y + 1);

      if (count === 0) {
        isolatedCount += 1;
        continue;
      }

      data[i] = Math.round(sumR / count);
      data[i + 1] = Math.round(sumG / count);
      data[i + 2] = Math.round(sumB / count);
      data[i + 3] = 255;
    }
  }

  if (isolatedCount > 0) console.warn(`_replaceMarkerPixelsInRect: ${isolatedCount} marker pixels had no non-marker neighbors`);
}

function _calcFaceSourceRect(bodyRect:Rect, faceOffsetRect:Rect):Rect {
  return { x:bodyRect.x + faceOffsetRect.x, y:bodyRect.y + faceOffsetRect.y, w:faceOffsetRect.w, h:faceOffsetRect.h };
}

async function _replaceMarkerPixels(spriteMap:ImageBitmap, sprites:{[id:string]:CharacterSprite}):Promise<ImageBitmap> {
  // get the full image data for the entire spriteMap
  const spriteMapData = createImageDataFromImageBitmap(spriteMap, 0, 0, spriteMap.width, spriteMap.height);

  // iterate over sprites (object map) and their faceRects and replace marker pixels inside each face rect
  for (const k of Object.keys(sprites)) {
    const s = sprites[k];
    for (let i = 0; i < s.bodyRects.length; ++i) {
      const faceRect = _calcFaceSourceRect(s.bodyRects[i], s.faceRects[i]);
      _replaceMarkerPixelsInRect(spriteMapData, faceRect);
    }
  }

  return createImageBitmapFromImageData(spriteMapData);
}

export async function loadCharacterSpriteset():Promise<CharacterSpriteset> {
  const drawSettings = await loadCharacterDrawSettings();

  const { bodyWidth, bodyHeight, spriteMapUrl } = drawSettings;

  const spriteMapResponse = await fetch(baseUrl(spriteMapUrl));
  const blob = await spriteMapResponse.blob();
  const spriteMap = await createImageBitmap(blob);
  const spriteSet:CharacterSpriteset = { spriteMap, sprites:{} };
  if (spriteMap.width % bodyWidth !== 0) throw Error(`Characters image is not evenly divisible by bodyWidth of ${bodyWidth}`);
  if (spriteMap.height % bodyHeight !== 0) throw Error(`Characters image is not evenly divisible by bodyHeight of ${bodyHeight}`);

  const characterIds = Object.keys(drawSettings.characters);
  for(let i = 0; i < characterIds.length; ++i) {
    const characterId = characterIds[i];
    const {startCellNo:bodyStartCellNo, cellCount:bodyCellCount} = drawSettings.characters[characterId];
    const characterSprite = _createCharacterSprite(characterId, bodyStartCellNo, bodyCellCount, bodyWidth, bodyHeight, spriteMap);
    spriteSet.sprites[characterId] = characterSprite;
  }

  spriteSet.spriteMap = await _replaceMarkerPixels(spriteMap, spriteSet.sprites);
  
  return spriteSet;
}

export function _happinessToHappyI(happiness:number) {
  assert(happiness >= 0 && happiness <= 1);
  return Math.round(happiness * (HAPPINESS_TO_FRAME_CHANGE_INTERVAL.length - 1));
}

const HAPPINESS_TO_FRAME_CHANGE_INTERVAL = [50, 200, 750, 1500, 3000]; 
export function getNextBodyFrameChangeInterval(happiness:number) {
  const happyI = _happinessToHappyI(happiness);
  return HAPPINESS_TO_FRAME_CHANGE_INTERVAL[happyI];
}

const HAPPINESS_TO_MOOD_ICON_CHANGE_INTERVAL = [1000, 2000, 5000, 5000, 5000];
export function getNextMoodIconDisplayInterval(happiness:number) {
  const happyI = _happinessToHappyI(happiness);
  return HAPPINESS_TO_MOOD_ICON_CHANGE_INTERVAL[happyI];
}

export function createCharacterDrawState(spriteset:CharacterSpriteset, characterId:string, destRect:Rect, bodyFrameNo:number = 0, happiness:number = .5):CharacterDrawState {
  const sprite = spriteset.sprites[characterId];
  if (!sprite) throw Error(`No sprite matching "${characterId}" found in spriteset.`);
  const staggerAnimationTime = Math.floor(Math.random() * 1000); // stagger animation so not everyone is in sync.
  const now = performance.now();
  return {
    spriteMap:spriteset.spriteMap,
    sprite,
    bodyFrameNo,
    happiness,
    destRect,
    nextBodyFrameChangeTime:now + getNextBodyFrameChangeInterval(happiness) + staggerAnimationTime,
    nextMoodIconDisplayTime:now + getNextMoodIconDisplayInterval(happiness) + staggerAnimationTime,
    nextFlashTime:UNSPECIFIED_TIME
  }
}

function _calcScaledRect(source:Rect, horizontalScale:number, verticalScale:number):Rect {
  return {
    x:Math.round(source.x * horizontalScale), 
    y:Math.round(source.y * verticalScale), 
    w:Math.round(source.w * horizontalScale), 
    h:Math.round(source.h * verticalScale)
  };
}

function _scaleToRange(value:number, min:number, max:number) {
  let scaledValue = Math.round(min + (value * (max-min)));
  if (scaledValue < min) scaledValue = min;
  if (scaledValue > max) scaledValue = max;
  return scaledValue;
}

const CX_MOOD_ICON = 32, CY_MOOD_ICON = 32;
const X_MOOD_ICONS = 64, Y_MOOD_ICONS = 64;
const HAPPY_TO_MOOD_ICON_SOURCE_RECT:Rect[] = [
  {x:X_MOOD_ICONS, y:Y_MOOD_ICONS+CY_MOOD_ICON, w:CX_MOOD_ICON, h:CY_MOOD_ICON},
  {x:X_MOOD_ICONS+CX_MOOD_ICON, y:Y_MOOD_ICONS+CY_MOOD_ICON, w:CX_MOOD_ICON, h:CY_MOOD_ICON},
  UNSPECIFIED_RECT,
  {x:X_MOOD_ICONS+CX_MOOD_ICON, y:Y_MOOD_ICONS, w:CX_MOOD_ICON, h:CY_MOOD_ICON},
  {x:X_MOOD_ICONS, y:Y_MOOD_ICONS, w:CX_MOOD_ICON, h:CY_MOOD_ICON}
];
const Y_DRIFT_PERCENT_OF_FACE_HEIGHT = 1;
function _drawMoodIcon(spriteMap:ImageBitmap, faceDestRect:Rect, moodCompletion:number, happiness:number, destHorizontalScale:number, 
      destVerticalScale:number, context:CanvasRenderingContext2D) {
  const happyI = _happinessToHappyI(happiness);
  const sourceRect = HAPPY_TO_MOOD_ICON_SOURCE_RECT[happyI];
  if (sourceRect === UNSPECIFIED_RECT) return; // No icon to display for this hapiness level.
  const destRect = _calcScaledRect(sourceRect, destHorizontalScale, destVerticalScale);
  const driftHeight = faceDestRect.h * Y_DRIFT_PERCENT_OF_FACE_HEIGHT;
  destRect.x = faceDestRect.x + ((faceDestRect.w - destRect.w) / 2);
  destRect.y = faceDestRect.y - faceDestRect.h - (driftHeight * moodCompletion);
  context.drawImage(spriteMap, sourceRect.x, sourceRect.y, sourceRect.w, sourceRect.h, 
      destRect.x, destRect.y, destRect.w, destRect.h);
}

function _drawBody(drawState:CharacterDrawState, context:CanvasRenderingContext2D) {
  const bodySourceRect = drawState.sprite.bodyRects[drawState.bodyFrameNo];
  const bodyDestRect = drawState.destRect;
  context.drawImage(drawState.spriteMap, bodySourceRect.x, bodySourceRect.y, bodySourceRect.w, bodySourceRect.h,
    bodyDestRect.x, bodyDestRect.y, bodyDestRect.w, bodyDestRect.h);
}

function _getFaceDestRect(drawState:CharacterDrawState):Rect {
  const bodyDestRect = drawState.destRect;
  const faceOffsetRect = drawState.sprite.faceRects[drawState.bodyFrameNo];
  const destHorizontalScale = bodyDestRect.w / drawState.sprite.bodyRects[drawState.bodyFrameNo].w;
  const destVerticalScale = bodyDestRect.h / drawState.sprite.bodyRects[drawState.bodyFrameNo].h;
  const faceDestRect = _calcScaledRect(faceOffsetRect, destHorizontalScale, destVerticalScale);
  faceDestRect.x += bodyDestRect.x;
  faceDestRect.y += bodyDestRect.y;
  return faceDestRect;
}

function _drawFace(drawState:CharacterDrawState, context:CanvasRenderingContext2D) {
  const faceNo = _scaleToRange(drawState.happiness, 0, FACE_COUNT-1);
  const faceDestRect = _getFaceDestRect(drawState);
  const faceSourceRect = FACE_SOURCE_RECTS[faceNo];
  context.drawImage(drawState.spriteMap, faceSourceRect.x, faceSourceRect.y, faceSourceRect.w, faceSourceRect.h, 
    faceDestRect.x, faceDestRect.y, faceDestRect.w, faceDestRect.h);
}

function _drawMoodIconIfActive(drawState:CharacterDrawState, context:CanvasRenderingContext2D, now:number) {
  assert(now <= drawState.nextMoodIconDisplayTime + MOOD_ICON_DISPLAY_DURATION);
  if (now > drawState.nextMoodIconDisplayTime) {
    const moodCompletion = (now - drawState.nextMoodIconDisplayTime) / MOOD_ICON_DISPLAY_DURATION;
    const faceDestRect = _getFaceDestRect(drawState);
    const destHorizontalScale = drawState.destRect.w / drawState.sprite.bodyRects[drawState.bodyFrameNo].w;
    const destVerticalScale = drawState.destRect.h / drawState.sprite.bodyRects[drawState.bodyFrameNo].h;
    _drawMoodIcon(drawState.spriteMap, faceDestRect, moodCompletion, drawState.happiness, destHorizontalScale, destVerticalScale, context);
  }
}

function _updateCharacterAnimationTimings(drawState:CharacterDrawState, now:number) {
  if (drawState.nextFlashTime !== UNSPECIFIED_TIME && now > drawState.nextFlashTime + FLASH_DURATION) {
    drawState.nextFlashTime = UNSPECIFIED_TIME;
  }
  if (now > drawState.nextMoodIconDisplayTime + MOOD_ICON_DISPLAY_DURATION) {
    drawState.nextMoodIconDisplayTime = now + getNextMoodIconDisplayInterval(drawState.happiness);
  }
}

function _endFlashState(context:CanvasRenderingContext2D) {
  context.restore();
}

function _startFlashStateIfActive(drawState:CharacterDrawState, context:CanvasRenderingContext2D, now:number):boolean {
  assert(drawState.nextFlashTime === UNSPECIFIED_TIME || now <= drawState.nextFlashTime + FLASH_DURATION);
  if (drawState.nextFlashTime === UNSPECIFIED_TIME || now < drawState.nextFlashTime) return false;

  const progress = clamp((now - drawState.nextFlashTime) / FLASH_DURATION, 0, 1);
  const flashAmount = (1 - Math.cos(2 * Math.PI * progress)) / 2;
  context.save();
  context.filter = `brightness(${1 + flashAmount * 10}) saturate(${1 - flashAmount})`;

  return true;
}

export function drawCharacter(drawState:CharacterDrawState, context:CanvasRenderingContext2D) {
  const now = performance.now();
  _updateCharacterAnimationTimings(drawState, now);
  const isFlashing = _startFlashStateIfActive(drawState, context, now);
  _drawBody(drawState, context);
  _drawFace(drawState, context);
  if (isFlashing) _endFlashState(context);
  _drawMoodIconIfActive(drawState, context, now);
}