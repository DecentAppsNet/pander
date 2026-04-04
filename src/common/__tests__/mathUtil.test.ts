import { describe, it, expect } from 'vitest';
import { clamp, scaleClamped, isClose } from '../mathUtil';

describe('mathUtil', () => {
  describe('clamp()', () => {
    it('value inside range -> same value', () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    it('value below min -> min', () => {
      expect(clamp(-1, 0, 10)).toBe(0);
    });

    it('value above max -> max', () => {
      expect(clamp(11, 0, 10)).toBe(10);
    });
  });

  describe('scaleClamped()', () => {
    it('fromMin maps to toMin', () => {
      expect(scaleClamped(0, 0, 10, 0, 100)).toBe(0);
    });

    it('fromMax maps to toMax', () => {
      expect(scaleClamped(10, 0, 10, 0, 100)).toBe(100);
    });

    it('mid value maps proportionally', () => {
      expect(scaleClamped(5, 0, 10, 0, 100)).toBe(50);
    });

    it('value below fromMin clamps to toMin', () => {
      expect(scaleClamped(-5, 0, 10, 0, 100)).toBe(0);
    });

    it('value above fromMax clamps to toMax', () => {
      expect(scaleClamped(15, 0, 10, 0, 100)).toBe(100);
    });

    it('non-unity target range maps correctly', () => {
      expect(scaleClamped(0.5, 0, 1, 10, 20)).toBe(15);
    });
  });

  describe('isClose()', () => {
    it('numbers within default threshold -> true', () => {
      expect(isClose(1.0000001, 1.0000002)).toBe(true);
    });

    it('numbers far apart -> false', () => {
      expect(isClose(0, 1)).toBe(false);
    });

    it('custom threshold used when provided', () => {
      expect(isClose(0, 1, 2)).toBe(true);
    });
  });
});
