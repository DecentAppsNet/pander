import UnitVector from '../embeddings/types/UnitVector';
import { createUnitVector } from '../embeddings/vectorUtil';
import Extractor from './types/Extractor';
import { getRuntime } from '@/common/runtimeUtil';
import { getEmbedding, setEmbedding } from '@/persistence/embeddings';
import StatusCallback from './types/StatusCallback';

// Comment/uncomment to pick one model.
// import { loadModel, extract } from './embedders/mxbai-embed-large-v1';
import { loadModel, extract } from './embedders/all-MiniLM-L6-v2';

/* v8 ignore start */

let extractor:Extractor | null = null;
let initialized = false;

const vectorCache:Map<string, UnitVector> = new Map();

export async function initEmbedder(onStatusUpdate:StatusCallback): Promise<void> {
  if (initialized && extractor) return; // already ready
  onStatusUpdate('Loading embedding model', 0);
  extractor = await loadModel(onStatusUpdate);
  onStatusUpdate('Completed loading embedding model', 1);
  initialized = extractor !== null;
}

export function isEmbedderInitialized(): boolean {
  return initialized;
}

export function clearEmbeddingCache(): void {
  vectorCache.clear();
}

async function _getCachedVector(key:string):Promise<UnitVector|null> {
  let cached:UnitVector|null = vectorCache.get(key) ?? null;
  if (cached === null && getRuntime() === 'browser') {
    cached = await getEmbedding(key);
    if (cached) vectorCache.set(key, cached);
  }
  return cached;
}

async function _setCachedVector(key:string, vector:UnitVector):Promise<void> {
  vectorCache.set(key, vector);
  if (getRuntime() === 'browser') await setEmbedding(key, vector);
}

export async function embedSentence(sentence:string):Promise<UnitVector> {
  if (!initialized) throw Error('Call initEmbedder() first!');
  const key = sentence.trim().toLowerCase();
  const cached = await _getCachedVector(key);
  if (cached) return cached;
  const rawVector = await extract(extractor!, key);
  const vec = createUnitVector(rawVector);
  _setCachedVector(key, vec);
  return vec;
}

/* v8 ignore end */