// "Yeni" / "New": a page (a component's, or any page that says when it came) is new for NEW_DAYS days after it first
// appeared. A component's day comes from March (data/components.json `added`: the first commit of its folder, written
// to catalog/added.gen.ts by tools/gen-catalog.mjs); any other page can carry `added` by hand (nav-meta.ts PAGE_META,
// a topic in src/topics/). The age counts from the viewer's today, so the badges move on without a new build.
// The colour tells the age: today and yesterday the accent's full colour with a soft glow, then the full colour, then
// the accent's tint, and a quiet neutral in the second week (March Badge tones: readable in every theme, light and dark).
import "./new-badge.css";
import { locale } from "march";
import { Badge } from "march/ui";
import { ADDED } from "./catalog/added.gen.ts";

export const NEW_DAYS = 14;

/** March component name → the day it first appeared. */
const dayOf = new Map<string, string>();
for (const [day, names] of Object.entries(ADDED)) for (const n of names.split(" ")) dayOf.set(n, day);

/** The newest day of a page: its own `added` or the newest of its March components ("LineChart · AreaChart"). */
export const addedOf = (p: { added?: string | undefined; name?: string | undefined }): string | undefined => {
  let best = p.added;
  for (const n of p.name?.split(/[^\w$]+/) ?? []) { const d = dayOf.get(n); if (d && (!best || d > best)) best = d; }
  return best;
};

/** Whole days since `added` (YYYY-MM-DD), or null when it is not new (or unknown). */
export const ageOf = (added: string | undefined): number | null => {
  if (!added) return null;
  const at = Date.parse(added), now = new Date();
  if (Number.isNaN(at)) return null;
  const days = Math.round((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - at) / 864e5);
  // a viewer a time zone behind the commit sees it as today
  return days < NEW_DAYS ? Math.max(0, days) : null;
};

/** The badge's words: "Yeni" and "2 gün önce" (English: "New", "2 days ago"). */
export const newWords = (age: number): { word: string; ago: string } => {
  const loc = locale() || "en";
  let ago: string;
  try { ago = new Intl.RelativeTimeFormat(loc, { numeric: "auto" }).format(-age, "day"); } catch { ago = `${age}d`; }
  return { word: loc.startsWith("tr") ? "Yeni" : "New", ago };
};

/** The "Yeni" badge of a page `age` days old: its colour fades with the age, the age is in its title and read after it. */
export function NewBadge(props: { age: number }) {
  const { age } = props;
  const level = age <= 1 ? 0 : age <= 4 ? 1 : age <= 8 ? 2 : 3;
  const { word, ago } = newWords(age);
  return <Badge class={`sc-new sc-new-${level}`} tone={level < 3 ? "primary" : "neutral"} variant={level < 2 ? "solid" : undefined}>
    <span title={`${word} · ${ago}`}>{word}</span><span class="m-sr-only">{` · ${ago}`}</span>
  </Badge>;
}
