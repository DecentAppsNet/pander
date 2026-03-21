import StatusCallback from "../types/StatusCallback";

export function toRawVectorArray(output:unknown):number[] {
  // The transformers.js pipeline with pooling returns either a Float32Array or number[].
  // Be defensive and support a few shapes without importing types.
  if (Array.isArray(output)) return output as number[];
  if (output instanceof Float32Array) return Array.from(output);
  if (output && typeof output === 'object' && 'data' in (output as any)) {
    const data = (output as any).data;
    if (data instanceof Float32Array) return Array.from(data);
    if (Array.isArray(data)) return data as number[];
  }
  // Fallback: try to coerce
  try { return Array.from(output as any); } catch { /* noop */ }
  throw new Error('Unexpected embedding output shape');
}

export function onLoadExtractorProgress(x:any, onStatus:StatusCallback) {
    if (x.status === 'progress' && x.total) {
        const percent = x.loaded / x.total;
        onStatus(`Loading Embedder: ${x.name || 'model'}...`, percent);
    } else if (x.status === 'initiate') {
        onStatus(`Initiating chunk: ${x.name || 'model'}...`, 0);
    }
}