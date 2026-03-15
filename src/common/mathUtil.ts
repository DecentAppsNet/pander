export function clamp(value:number, min:number, max:number):number {
  return Math.min(Math.max(value, min), max);
}

export function isClose(a:number, b:number, threshold:number = .000001):boolean {
  return Math.abs(a-b)<threshold;
}