import { describe, it, expect } from 'vitest';

import Color from "../types/Color";
import ColorGradient from "../types/ColorGradient";
import { calcGradientColor, hexColorToColor, colorToHexColor, createColorGradient } from "../colorUtil";

describe('colorUtil', () => {
  describe('calcGradientColor', () => {
    it('returns 0,0,0,0 for any value in an empty gradient', () => {
      const gradient:ColorGradient = { stops:[], colors:[] };
      const expected:Color = {r:0, g:0, b:0, a:0};
      expect(calcGradientColor(0, gradient)).toEqual(expected);
      expect(calcGradientColor(.5, gradient)).toEqual(expected);
      expect(calcGradientColor(1, gradient)).toEqual(expected);
    });

    it('returns stop RGBA for single stop at 0 and a value of 0', () => {
      const c:Color = { r: 0.1, g: 0.2, b: 0.3, a: 0.4 };
      const gradient:ColorGradient = { stops:[0], colors:[c] };
      expect(calcGradientColor(0, gradient)).toEqual(c);
    });

    it('returns stop RGBA for single stop at 0 and a value of 1', () => {
      const c:Color = { r: 0.1, g: 0.2, b: 0.3, a: 0.4 };
      const gradient:ColorGradient = { stops:[0], colors:[c] };
      expect(calcGradientColor(1, gradient)).toEqual(c);
    });

    it('returns stop RGBA for single stop at 1 and a value of 0', () => {
      const c:Color = { r: 0.25, g: 0.5, b: 0.75, a: 0.6 };
      const gradient:ColorGradient = { stops:[1], colors:[c] };
      expect(calcGradientColor(0, gradient)).toEqual(c);
    });

    it('returns stop RGBA for single stop at 1 and a value of 1', () => {
      const c:Color = { r: 0.25, g: 0.5, b: 0.75, a: 0.6 };
      const gradient:ColorGradient = { stops:[1], colors:[c] };
      expect(calcGradientColor(1, gradient)).toEqual(c);
    });

    it('returns stop RGBA for single stop at .5 and a value of 0', () => {
      const c:Color = { r: 0.33, g: 0.44, b: 0.55, a: 0.66 };
      const gradient:ColorGradient = { stops:[0.5], colors:[c] };
      expect(calcGradientColor(0, gradient)).toEqual(c);
    });

    it('returns stop RGBA for single stop at .5 and a value of 1', () => {
      const c:Color = { r: 0.33, g: 0.44, b: 0.55, a: 0.66 };
      const gradient:ColorGradient = { stops:[0.5], colors:[c] };
      expect(calcGradientColor(1, gradient)).toEqual(c);
    });

    it('returns stop RGBA for single stop at .5 and a value of .5', () => {
      const c:Color = { r: 0.33, g: 0.44, b: 0.55, a: 0.66 };
      const gradient:ColorGradient = { stops:[0.5], colors:[c] };
      expect(calcGradientColor(0.5, gradient)).toEqual(c);
    });

    it('returns first stop RGBA for two stops at .25 and .75 and a value of 0', () => {
      const c0:Color = { r: 0, g: 0, b: 0, a: 1 };
      const c1:Color = { r: 1, g: 1, b: 1, a: 1 };
      const gradient:ColorGradient = { stops:[0.25, 0.75], colors:[c0, c1] };
      expect(calcGradientColor(0, gradient)).toEqual(c0);
    });

    it('returns second stop RGBA for two stops at .25 and .75 and a value of 1', () => {
      const c0:Color = { r: 0, g: 0, b: 0, a: 1 };
      const c1:Color = { r: 1, g: 1, b: 1, a: 1 };
      const gradient:ColorGradient = { stops:[0.25, 0.75], colors:[c0, c1] };
      expect(calcGradientColor(1, gradient)).toEqual(c1);
    });

    it('returns interpolated value RGBA between two stops at .25 and .75 and a value of .5', () => {
      const c0:Color = { r: 0, g: 0, b: 0, a: 1 };
      const c1:Color = { r: 1, g: 1, b: 1, a: 1 };
      const gradient:ColorGradient = { stops:[0.25, 0.75], colors:[c0, c1] };
      const expected:Color = { r: 0.5, g: 0.5, b: 0.5, a: 1 };
      expect(calcGradientColor(0.5, gradient)).toEqual(expected);
    });
    
  });

  describe('hexColorToColor', () => {
    it('parses #fff as white with alpha 1', () => {
      const c = hexColorToColor('#fff');
      expect(c).toEqual({ r: 1, g: 1, b: 1, a: 1 });
    });

    it('parses #000 as black with alpha 1', () => {
      const c = hexColorToColor('#000');
      expect(c).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    });

    it('parses #ff0000 as red with alpha 1', () => {
      const c = hexColorToColor('#ff0000');
      expect(c).toEqual({ r: 1, g: 0, b: 0, a: 1 });
    });

    it('parses #7f7f7f approximately', () => {
      const c = hexColorToColor('#7f7f7f');
      expect(c.r).toBeCloseTo(0x7f / 255, 6);
      expect(c.g).toBeCloseTo(0x7f / 255, 6);
      expect(c.b).toBeCloseTo(0x7f / 255, 6);
      expect(c.a).toBe(1);
    });

    it('parses short rgba #1234 correctly', () => {
      const c = hexColorToColor('#1234');
      // #1234 -> #11223344
      expect(c.r).toBeCloseTo(0x11 / 255, 6);
      expect(c.g).toBeCloseTo(0x22 / 255, 6);
      expect(c.b).toBeCloseTo(0x33 / 255, 6);
      expect(c.a).toBeCloseTo(0x44 / 255, 6);
    });

    it('parses long rgba #11223344 correctly', () => {
      const c = hexColorToColor('#11223344');
      expect(c.r).toBeCloseTo(0x11 / 255, 6);
      expect(c.g).toBeCloseTo(0x22 / 255, 6);
      expect(c.b).toBeCloseTo(0x33 / 255, 6);
      expect(c.a).toBeCloseTo(0x44 / 255, 6);
    });
  });

  describe('colorToHexColor', () => {
    it('converts white to #ffffff (opaque omitted)', () => {
      const s = colorToHexColor({ r: 1, g: 1, b: 1, a: 1 });
      expect(s).toBe('#ffffff');
    });

    it('converts black to #000000 (opaque omitted)', () => {
      const s = colorToHexColor({ r: 0, g: 0, b: 0, a: 1 });
      expect(s).toBe('#000000');
    });

    it('converts exact bytes to matching hex (includes alpha when not opaque)', () => {
      const s = colorToHexColor({ r: 0x11 / 255, g: 0x22 / 255, b: 0x33 / 255, a: 0x44 / 255 });
      expect(s).toBe('#11223344');
    });

    it('rounds fractional values correctly for alpha and channels', () => {
      const s = colorToHexColor({ r: 1, g: 0.5, b: 0, a: 0.5 });
      // r -> ff, g -> 0.5*255 = 127.5 -> 128 -> 80, b -> 00, a -> 80
      expect(s).toBe('#ff800080');
    });
  });

  describe('createColorGradient', () => {
    it('creates empty gradient for empty array', () => {
      const g = createColorGradient([]);
      expect(g.colors).toEqual([]);
      expect(g.stops).toEqual([]);
    });

    it('creates 1-stop gradient with stop 0', () => {
      const g = createColorGradient(['#112233']);
      expect(g.stops).toEqual([0]);
      expect(g.colors).toEqual([hexColorToColor('#112233')]);
    });

    it('creates 2-stop gradient with stops [0,1]', () => {
      const g = createColorGradient(['#000000', '#ffffff']);
      expect(g.stops).toEqual([0, 1]);
      expect(g.colors).toEqual([hexColorToColor('#000000'), hexColorToColor('#ffffff')]);
    });

    it('creates 3-stop gradient with evenly spaced stops [0,0.5,1]', () => {
      const g = createColorGradient(['#000000', '#7f7f7f', '#ffffff']);
      expect(g.stops).toEqual([0, 0.5, 1]);
      expect(g.colors).toEqual([
        hexColorToColor('#000000'),
        hexColorToColor('#7f7f7f'),
        hexColorToColor('#ffffff'),
      ]);
    });
  });
});