import { pipeline, env } from '@huggingface/transformers';
import Extractor from '../types/Extractor';
import { getRuntime } from '@/common/runtimeUtil';
import { CACHE_DIR } from '../constants';
import { onLoadExtractorProgress, toRawVectorArray } from './extractUtil';
import StatusCallback from '../types/StatusCallback';

const MODEL_ID = 'Xenova/all-MiniLM-L6-v2';

export async function loadModel(onStatus:StatusCallback):Promise<Extractor> {
  const e:any = env as any;
  if (getRuntime() === 'browser') {
    e.useBrowserCache =true;
    e.allowLocalModels = false;
  } else {
    e.cacheDir = CACHE_DIR;
    e.useBrowserCache = false;
    e.allowLocalModels = true;
  }
  const extractor = (await pipeline('feature-extraction', MODEL_ID, 
    {progress_callback: (x:any) => onLoadExtractorProgress(x, onStatus)}
  )) as unknown as Extractor;
  return extractor;
}

export async function extract(extractor:Extractor, key:string):Promise<number[]> {
  const out = await extractor(key, { pooling:'mean', normalize:true });
  return toRawVectorArray(out);
}

export async function extractMultiple(extractor:Extractor, keys:string[]):Promise<number[][]> {
  const outMultiple = await extractor(keys, { pooling:'mean', normalize:true });
  const outArray = outMultiple.tolist();
  const rawVectors = outArray.map(toRawVectorArray);
  return rawVectors;
}