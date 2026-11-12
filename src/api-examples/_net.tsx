// Small helpers the net, mock and seo API examples share: inputs bound to a signal, a code block, a tag list and a log
// signal with push. Styles: net.css (classes sc-ex-net-…).
import { signal } from "hadi-march";
import "./net.css";

type Str = { (): string; set(v: string): void };
export const J = (v: unknown): string => JSON.stringify(v);
export const msg = (e: unknown): string => (e as Error).message;
export const now = (): string => new Date().toLocaleTimeString("tr-TR");
/** A log signal with a push helper (newest last, at most 8 lines). */
export function lines() {
  const s = signal<string[]>([]);
  return Object.assign(s, { push: (l: string) => s.update((x) => [...x, l].slice(-8)) });
}
export const Text = (p: { value: Str; label: string }) =>
  <input class="hm-input sc-ex-net-in" aria-label={p.label} value={p.value} onInput={(e: Event) => p.value.set((e.target as HTMLInputElement).value)} />;
export const Area = (p: { value: Str; label: string }) =>
  <textarea class="hm-textarea sc-ex-net-area" aria-label={p.label} value={p.value} onInput={(e: Event) => p.value.set((e.target as HTMLTextAreaElement).value)} />;
export const Pre = (p: { text: () => string }) => <pre class="sc-ex-net-pre">{p.text}</pre>;
export const Tags = (p: { items: () => string[]; label: string }) => <ul class="sc-ex-net-tags" aria-label={p.label}>{() => p.items().map((x) => <li>{x}</li>)}</ul>;
