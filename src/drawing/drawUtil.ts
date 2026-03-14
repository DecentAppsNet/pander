let theOffscreenCanvas:OffscreenCanvas|HTMLCanvasElement|null = null;

type Canvas = OffscreenCanvas|HTMLCanvasElement;

// Don't export this function as it is coupled to expectations of code in this module:
// * the returned canvas will be discarded for a larger one as needed.
// * pixel data in the canvas may not be retained between calls to exported functions of this module.
function _getOffscreenCanvas(width:number, height:number):Canvas {
  const w = Math.max(1, Math.floor(width));
  const h = Math.max(1, Math.floor(height));
  if (!theOffscreenCanvas || theOffscreenCanvas.width < w || theOffscreenCanvas.height < h) {
    if (typeof OffscreenCanvas !== 'undefined') {
      theOffscreenCanvas = new OffscreenCanvas(w, h);
    } else {
      const el = document.createElement('canvas');
      el.width = Math.max(w, theOffscreenCanvas?.width ?? 0);
      el.height = Math.max(h, theOffscreenCanvas?.height ?? 0);
      theOffscreenCanvas = el;
    }
  }
  return theOffscreenCanvas;
}

function _getRenderingContext(canvas:Canvas):CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | null;
  if (!ctx) throw Error('Could not get 2D context from offscreen canvas.');
  return ctx;
}

export function createImageDataFromImageBitmap(bitmap:ImageBitmap, sx:number, sy:number, sw:number, sh:number):ImageData {
  const w = Math.max(1, Math.floor(sw));
  const h = Math.max(1, Math.floor(sh));
  const canvas = _getOffscreenCanvas(w, h);
  const ctx = _getRenderingContext(canvas);
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(bitmap as any, Math.floor(sx), Math.floor(sy), w, h, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}

export async function createImageBitmapFromImageData(imgData:ImageData): Promise<ImageBitmap> {
  const canvas = _getOffscreenCanvas(imgData.width, imgData.height);
  const ctx = _getRenderingContext(canvas);
  ctx.putImageData(imgData, 0, 0);
  if ('transferToImageBitmap' in canvas) return (canvas as OffscreenCanvas).transferToImageBitmap();
  return await createImageBitmap(canvas);
}