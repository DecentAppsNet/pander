import { clamp } from "@/common/mathUtil";
import Color from "./types/Color";
import ColorGradient from "./types/ColorGradient";

// Accepts hexColor following one of these formats:
//  #fff, #ffffff. Alpha will be set to 1.
//  #fffa, #ffffffaa. Alpha will come from string.
export function hexColorToColor(hexColor:string):Color {
	if (!hexColor || typeof hexColor !== 'string') return { r: 0, g: 0, b: 0, a: 1 };

	let s = hexColor.trim().toLowerCase();
	if (s.startsWith('#')) s = s.slice(1);

	// short forms: rgb, rgba -> expand to rrggbb, rrggbbaa
	if (s.length === 3 || s.length === 4) {
		s = s.split('').map(c => c + c).join('');
	}

	// Now expect either 6 (rrggbb) or 8 (rrggbbaa)
	if (s.length !== 6 && s.length !== 8) {
		return { r: 0, g: 0, b: 0, a: 1 };
	}

	const parseByte = (hexPair:string) => parseInt(hexPair, 16) / 255;

	const r = parseByte(s.slice(0, 2));
	const g = parseByte(s.slice(2, 4));
	const b = parseByte(s.slice(4, 6));
	const a = s.length === 8 ? parseByte(s.slice(6, 8)) : 1;

	return { r, g, b, a };
}

// Outputs color in #ffffff (opaque alpha) or #ffffffaa format.
export function colorToHexColor(color:Color):string {
	const toByteHex = (v:number) => {
		const n = Math.round(clamp(v, 0, 1) * 255);
		const s = n.toString(16).padStart(2, '0');
		return s;
	};

	const r = toByteHex(color.r);
	const g = toByteHex(color.g);
	const b = toByteHex(color.b);
	const a = toByteHex(color.a);

  return a === 'ff' ? `#${r}${g}${b}` : `#${r}${g}${b}${a}`;
}

// Calculate an interpolated color for a value.
export function calcGradientColor(value:number, colorGradient:ColorGradient):Color {
	const { stops, colors } = colorGradient as ColorGradient;
	if (!stops || !colors || colors.length === 0) {
		return { r: 0, g: 0, b: 0, a: 0 };
	}

	const v = isNaN(value) ? 0 : Math.max(0, Math.min(1, value));

	if (colors.length === 1 || !stops || stops.length === 0) {
		const c = colors[0];
		return { r: c.r, g: c.g, b: c.b, a: c.a };
	}

	let i = 0;
	while (i < stops.length - 1 && v > stops[i + 1]) i++;

	if (v <= stops[0]) {
		const c = colors[0];
		return { r: c.r, g: c.g, b: c.b, a: c.a };
	}

	const last = stops.length - 1;
	if (v >= stops[last]) {
		const c = colors[colors.length - 1];
		return { r: c.r, g: c.g, b: c.b, a: c.a };
	}

	const c0 = colors[Math.min(i, colors.length - 1)];
	const c1 = colors[Math.min(i + 1, colors.length - 1)];
	const t0 = stops[i];
	const t1 = stops[i + 1];
	const t = t1 === t0 ? 0 : (v - t0) / (t1 - t0);

	const lerp = (a:number, b:number, t:number) => a + (b - a) * t;

	return {
		r: lerp(c0.r, c1.r, t),
		g: lerp(c0.g, c1.g, t),
		b: lerp(c0.b, c1.b, t),
		a: lerp(c0.a, c1.a, t),
	};
}

function _calcEquidistantStops(stopCount:number):number[] {
  if (stopCount === 0) return [];
  if (stopCount === 1) return [0];
  const stopInterval = 1 / (stopCount - 1);
  const stops:number[] = [];
  for(let i = 0; i < stopCount; ++i) {
    const stop = clamp(i * stopInterval, 0, 1);
    stops.push(stop);
  }
  return stops;
}

// Return a color gradient where stops are equidistant.
export function createColorGradient(hexColors:string[]):ColorGradient {
  const colors:Color[] = hexColors.map(hexColorToColor);
  const stops:number[] = _calcEquidistantStops(colors.length);
  return { colors, stops };
}