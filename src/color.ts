import { createHash } from "node:crypto";

export interface PastelColorOptions {
  saturation: number;
  lightness: number;
}

export interface StatusBarTheme {
  background: string;
  foreground: string;
}

export function hashToHue(input: string): number {
  const digest = createHash("sha256").update(input).digest();
  const value = digest.readUInt16BE(0);
  return value % 360;
}

export function toHslColor(hue: number, saturation: number, lightness: number): string {
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function hslToHex(hue: number, saturation: number, lightness: number): string {
  const s = saturation / 100;
  const l = lightness / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hPrime = hue / 60;
  const x = c * (1 - Math.abs((hPrime % 2) - 1));

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (hPrime >= 0 && hPrime < 1) {
    r1 = c;
    g1 = x;
  } else if (hPrime >= 1 && hPrime < 2) {
    r1 = x;
    g1 = c;
  } else if (hPrime >= 2 && hPrime < 3) {
    g1 = c;
    b1 = x;
  } else if (hPrime >= 3 && hPrime < 4) {
    g1 = x;
    b1 = c;
  } else if (hPrime >= 4 && hPrime < 5) {
    r1 = x;
    b1 = c;
  } else {
    r1 = c;
    b1 = x;
  }

  const m = l - c / 2;
  const r = Math.round((r1 + m) * 255);
  const g = Math.round((g1 + m) * 255);
  const b = Math.round((b1 + m) * 255);

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function chooseForeground(lightness: number): string {
  return lightness >= 70 ? "#1f2937" : "#f9fafb";
}

export function buildStatusBarTheme(seed: string, options: PastelColorOptions): StatusBarTheme {
  const hue = hashToHue(seed);
  return {
    background: hslToHex(hue, options.saturation, options.lightness),
    foreground: chooseForeground(options.lightness)
  };
}

function toHex(value: number): string {
  return Math.max(0, Math.min(255, value)).toString(16).padStart(2, "0");
}
