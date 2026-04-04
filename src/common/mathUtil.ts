export function clamp(value:number, min:number, max:number):number {
  return min < max 
    ? Math.min(Math.max(value, min), max) 
    : Math.min(Math.max(value, max), min);
}

export function scaleClamped(value:number, fromMin:number, fromMax:number, toMin:number, toMax:number):number {
  const clampedValue = clamp(value, fromMin, fromMax);
  const fromRange = fromMax - fromMin;
  if (fromRange === 0) return NaN;
  const ratio = (clampedValue - fromMin) / (fromMax - fromMin);
  return toMin + ratio * (toMax - toMin);
}

export function isClose(a:number, b:number, threshold:number = .000001):boolean {
  return Math.abs(a-b)<threshold;
}