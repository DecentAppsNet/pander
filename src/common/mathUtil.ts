import { assert } from "decent-portal";

export function clamp(value:number, min:number, max:number):number {
  return Math.min(Math.max(value, min), max);
}

export function scaleClamped(value:number, fromMin:number, fromMax:number, toMin:number, toMax:number):number {
  assert(fromMax > fromMin);
  assert(toMax > toMin);
  const clampedValue = clamp(value, fromMin, fromMax);
  const ratio = (clampedValue - fromMin) / (fromMax - fromMin);
  return toMin + ratio * (toMax - toMin);
}

export function isClose(a:number, b:number, threshold:number = .000001):boolean {
  return Math.abs(a-b)<threshold;
}