import { useEffect, useRef } from 'react';

import CharacterSpriteset from '@/components/audienceView/types/CharacterSpriteset';
import Canvas from '../canvas/Canvas';
import styles from './AudienceView.module.css';
import AudienceMember from '@/game/types/AudienceMember';
import CrowdDrawState from './types/CrowdDrawState';
import { createCrowdDrawState, drawCrowd, updateCharacterHappiness } from './crowdUtil';
import { getNextBodyFrameChangeInterval } from './characterSpriteUtil';
import { subscribeSetHappiness } from './audienceEventUtil';

const CROWD_IDLE_UPDATE_INTERVAL = 50; // msecs
const BACKGROUND_COLOR = 'lightgrey';

type Props = {
  characterSpriteset:CharacterSpriteset|null,
  audienceMembers:AudienceMember[]
}

let lastCrowdUpdate = 0;

function _getRandomInt(min:number, max:number):number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function _updateCrowdForIdleMovement(crowdDrawState:CrowdDrawState, now:number) {
  for(let i = 0; i < crowdDrawState.characterDrawStates.length; ++i) {
    const drawState = crowdDrawState.characterDrawStates[i];
    if (drawState.nextBodyFrameChangeTime > now) continue;
    drawState.bodyFrameNo = _getRandomInt(0, drawState.sprite.bodyRects.length);
    drawState.nextBodyFrameChangeTime = now + getNextBodyFrameChangeInterval(drawState.happiness);
  }
}

function _onDraw(crowdDrawState:CrowdDrawState, context:CanvasRenderingContext2D) {
  const now = performance.now();
  if (!lastCrowdUpdate || (now - lastCrowdUpdate) > CROWD_IDLE_UPDATE_INTERVAL) {
    _updateCrowdForIdleMovement(crowdDrawState, now);
    lastCrowdUpdate = now;
  }
  context.fillStyle = BACKGROUND_COLOR;
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  drawCrowd(crowdDrawState, context);
}

function _onDrawLoading(context:CanvasRenderingContext2D) {
  context.fillStyle = BACKGROUND_COLOR;
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);
}

function AudienceView({characterSpriteset, audienceMembers}:Props) {
  const crowdDrawStateRef = useRef<CrowdDrawState|null>(null);
  const containerRef = useRef<HTMLDivElement|null>(null);

  useEffect(() => {
    if (!characterSpriteset || audienceMembers.length === 0) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const canvasWidth = Math.floor(rect.width);
    const canvasHeight = Math.floor(rect.height);
    if (canvasWidth === 0 || canvasHeight === 0) return;
    crowdDrawStateRef.current = createCrowdDrawState(characterSpriteset, audienceMembers, canvasWidth, canvasHeight);
    subscribeSetHappiness((event:SetHappinessEvent) => updateCharacterHappiness(event.characterId, event.happiness, crowdDrawStateRef.current));
  }, [characterSpriteset, audienceMembers]);

  return (<div ref={containerRef} className={styles.container}>
    <Canvas onDraw={(context) => {
      const crowdDrawState = crowdDrawStateRef.current;
      if (!crowdDrawState) {
        _onDrawLoading(context);
        return;
      }
      _onDraw(crowdDrawState, context)
    }} isAnimated/>
  </div>);
}

export default AudienceView;