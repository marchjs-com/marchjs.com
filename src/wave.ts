// The showcase's theme transition: the shape every theme, colour theme, accent or light / dark change comes in with
// (themeWave of march/motion). Chosen on Motion › Page transitions (Tema geçişleri), remembered in the browser.
// The spray draws with the paint worklet the build copies next to the page (spray-worklet.js).
import { signal } from "march";
import { appUrl } from "march/base";
import { installThemeWave, type ThemeWaveShape } from "march/motion";

const KEY = "sc.wave";
/** The shapes, in the order the chooser shows them. */
export const WAVE_SHAPES: readonly { value: ThemeWaveShape; label: string }[] = [
  { value: "drip", label: "Boya dökme" }, { value: "spray", label: "Sprey" }, { value: "circle", label: "Daire" },
  { value: "sweep", label: "Süpürme" }, { value: "splat", label: "Lekeler" },
];
const stored = (): string | null => { try { return globalThis.localStorage?.getItem(KEY) ?? null; } catch { return null; } };
const first = stored();
/** The shape in use. */
export const waveShape = signal<ThemeWaveShape>(WAVE_SHAPES.some((s) => s.value === first) ? (first as ThemeWaveShape) : "drip");
/** Its length, ms (undefined: the shape's own). */
export const waveDuration = signal<number | undefined>(undefined);

let off: () => void = () => undefined;
/** (Re)installs the transition with the shape and length in use. */
export function installWave(): void {
  off();
  off = installThemeWave({ shape: waveShape.peek(), duration: waveDuration.peek(), worklet: appUrl("spray-worklet.js") });
}
/** Picks the shape (and length) of every theme change from now on. */
export function setWave(shape: ThemeWaveShape, duration?: number): void {
  waveShape.set(shape);
  waveDuration.set(duration);
  try { globalThis.localStorage?.setItem(KEY, shape); } catch { /* storage blocked */ }
  installWave();
}
