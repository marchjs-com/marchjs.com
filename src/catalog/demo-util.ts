// Small helpers the card demos use that March keeps internal (its own copies live in march/src/core, forms, ui, theme).
import { getOwner, onCleanup, type signal } from "march";
import { formatKey } from "march/ui";
import type { Option, OptionsProp } from "march/forms";
import type { ColorToken } from "march/theme";

/** A writable signal (what `signal()` returns). */
export type Signal<T> = ReturnType<typeof signal<T>>;

/** setTimeout that is cleared with the owner. */
export function later(fn: () => void, ms: number): ReturnType<typeof setTimeout> {
  const id = setTimeout(fn, ms);
  if (getOwner()) onCleanup(() => clearTimeout(id));
  return id;
}

/** localStorage JSON read/write; never throws (private mode, blocked storage, bad JSON). */
export function load<T>(key: string, fallback: T): T {
  try { const s = globalThis.localStorage?.getItem(key); return s == null ? fallback : JSON.parse(s) as T; } catch { return fallback; }
}
export function save(key: string, value: unknown): void {
  try { globalThis.localStorage?.setItem(key, JSON.stringify(value)); } catch { /* storage blocked */ }
}

/** Set several style properties (custom properties too) through the CSSOM: CSP safe, `null` removes one. */
export function setStyle(el: Element | null | undefined, props: Record<string, string | number | null | undefined>): void {
  const st = (el as HTMLElement | null | undefined)?.style;
  if (!st) return;
  for (const k in props) { const v = props[k]; if (v == null) st.removeProperty(k); else st.setProperty(k, String(v)); }
}

/** Class names joined, falsy parts left out. */
export const cx = (...parts: unknown[]): string => parts.filter((p) => typeof p === "string" && p).join(" ");

/** The first day of the week of an ISO date ("2026-03-14"), `firstDay` 0 = Sunday, 1 = Monday. */
export function startOfWeek(iso: string, firstDay: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() - firstDay + 7) % 7));
  return d.toISOString().slice(0, 10);
}

/** Normalize an options prop into [{ value, label, hint, disabled }]. */
export function normOptions(o: OptionsProp): Option[] {
  const list = typeof o === "function" ? o() : typeof o === "string" ? o.split(",").map((x) => x.trim()).filter(Boolean) : o ?? [];
  return list.map((x): Option => (x && typeof x === "object" ? { ...(x as Option), label: (x as Partial<Option>).label ?? String((x as Option).value) } : { value: x, label: String(x) }));
}

/** A label with its shortcut for a tooltip: `labelWithKey("Save", "mod+s")` → "Save (Ctrl+S)"; no shortcut → the label. */
export const labelWithKey = (label: string, combo?: string | null): string => (combo ? `${label} (${formatKey(combo)})` : label);

/** The four HADİ brand colors in their order (orange, blue, green, purple). */
export const BRAND_COLORS = ["brand-orange", "brand-blue", "brand-green", "brand-purple"] as const satisfies readonly ColorToken[];
/** The six brand colors: the four above plus pink and gold. */
export const BRAND_COLORS_ALL = ["brand-orange", "brand-blue", "brand-green", "brand-purple", "brand-pink", "brand-gold"] as const satisfies readonly ColorToken[];
/** Several colors: "single", "brand" (the four above) or a list of tokens (ProgressRing's `colors`). */
export type MultiColors = "single" | "brand" | readonly ColorToken[];

const BRAND_CAT: Record<string, number> = { orange: 1, blue: 2, green: 3, purple: 4, pink: 5, gold: 6 };
/** The CSS color expression of a token (theme variables only), e.g. "brand-blue" → var(--m-brand-blue, var(--m-cat-2)). */
export function tokenColor(token: string): string {
  if (token === "warning") return "var(--m-warn)";
  if (token === "neutral") return "var(--m-text-2)";
  if (token === "gold") return "var(--m-brand-gold, var(--m-cat-6))";
  const b = /^brand-(\w+)$/.exec(token);
  if (b) return `var(--m-brand-${b[1]}${BRAND_CAT[b[1] as string] ? `, var(--m-cat-${BRAND_CAT[b[1] as string]})` : ""})`;
  return `var(--m-${token})`;
}
