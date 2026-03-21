import { pipeline, env } from '@xenova/transformers';
import Extractor from '../types/Extractor';
import { CACHE_DIR } from '../constants';
import { onLoadExtractorProgress, toRawVectorArray } from './extractUtil';
import { getRuntime } from '@/common/runtimeUtil';
import StatusCallback from '../types/StatusCallback';

/* v8 ignore start */ // This module is all glue. If anything with good test value emerges, refactor it to a separate module. */
const MODEL_NAME = 'mixedbread-ai/mxbai-embed-large-v1';

export async function loadModel(onStatus:StatusCallback):Promise<Extractor> {
  const e:any = env as any; // An alias for readability. Changes below affect the "env" global var which is used by the transformers library.
  if (getRuntime() === 'browser') {
    e.useBrowserCache =true;
    e.allowLocalModels = false;
  } else {
    e.cacheDir = CACHE_DIR;
    e.useBrowserCache = false;
    e.allowLocalModels = true;
  }
  if (e.backends?.onnx?.wasm) e.backends.onnx.wasm.proxy = false;
  const extractor = (await pipeline('feature-extraction', MODEL_NAME, 
    {progress_callback:(x:any) => onLoadExtractorProgress(x, onStatus)}
  )) as unknown as Extractor;
  return extractor;
}

export async function extract(extractor:Extractor, key:string):Promise<number[]> {
  const out = await extractor(key, { pooling:'cls', normalize:true });
  return toRawVectorArray(out);
}

export async function extractMultiple(extractor:Extractor, keys:string[]):Promise<number[][]> {
  const outMultiple = await extractor(keys, { pooling:'cls', normalize:true });
  const outArray = outMultiple.tolist();
  const rawVectors = outArray.map(toRawVectorArray);
  return rawVectors;
}

/* v8 ignore end */