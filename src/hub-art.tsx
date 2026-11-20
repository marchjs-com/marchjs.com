// Draws the small schematic of a category card (hub-art/<section>.ts: data, a list of shapes on a 150 × 80 canvas) as
// an SVG in the theme's colours: the accent is currentColor, a brand colour is a theme token, a box is filled with the
// surface. A shape with `mv` moves to that pose while its card is hovered or focused (CSS transition, hub.css), from
// its own centre. Each section's drawings are their own lazy module: they load when the section's page opens.
import type { ArtColor, ArtOpts, ArtSet, Shape } from "./hub-art/types.ts";

/** The drawings of each section (topics.ts HUBS key → loader). */
const SETS: Record<string, () => Promise<{ art: ArtSet }>> = {
  "/animation": () => import("./hub-art/animation.ts"), "/big-data": () => import("./hub-art/big-data.ts"),
  "/buttons": () => import("./hub-art/buttons.ts"), "/text": () => import("./hub-art/text.ts"), "/charts": () => import("./hub-art/charts.ts"),
  "/data": () => import("./hub-art/data.ts"), "/editors": () => import("./hub-art/editors.ts"),
  "/feedback": () => import("./hub-art/feedback.ts"), "/forms": () => import("./hub-art/forms.ts"),
  "/ide-shell": () => import("./hub-art/ide.ts"), "/language": () => import("./hub-art/language.ts"),
  "/layout": () => import("./hub-art/layout.ts"), "/managers": () => import("./hub-art/managers.ts"),
  "/managers-a11y": () => import("./hub-art/managers-a11y.ts"), "/managers-data": () => import("./hub-art/managers-data.ts"),
  "/managers-env": () => import("./hub-art/managers-env.ts"), "/managers-ops": () => import("./hub-art/managers-ops.ts"),
  "/motion": () => import("./hub-art/motion.ts"), "/navigation": () => import("./hub-art/navigation.ts"),
  "/network": () => import("./hub-art/network.ts"), "/overlay": () => import("./hub-art/overlay.ts"),
  "/overlays": () => import("./hub-art/overlays.ts"), "/seo": () => import("./hub-art/seo.ts"),
  "/sites": () => import("./hub-art/sites.ts"), "/social": () => import("./hub-art/social.ts"),
  "/speed": () => import("./hub-art/speed.ts"), "/themes": () => import("./hub-art/themes.ts"),
  "/web": () => import("./hub-art/web.ts"),
}

/** The drawings of a section, or an empty set when it has none. */
export const loadArt = (section: string): Promise<ArtSet> => (SETS[section]?.().then((m) => m.art) ?? Promise.resolve({})).catch(() => ({}))

const BRAND: Record<ArtColor, string> = {
  orange: "var(--m-brand-orange, var(--m-cat-1))", blue: "var(--m-brand-blue, var(--m-cat-2))", green: "var(--m-brand-green, var(--m-cat-3))",
  purple: "var(--m-brand-purple, var(--m-cat-4))", pink: "var(--m-brand-pink, var(--m-cat-5))", gold: "var(--m-brand-gold, var(--m-cat-6))",
}

/** The attributes every shape shares: its colour, opacity, dash and the hover pose (CSS variables read by hub.css). */
function common(o: ArtOpts | undefined, stroked: boolean, baseOpacity?: number) {
  const color = o?.color ? BRAND[o.color] : "currentColor"
  const mv = o?.mv
  const style: Record<string, string> = {}
  if (mv) {
    if (mv.x || mv.y) style["--sc-art-t"] = `translate(${mv.x ?? 0}px, ${mv.y ?? 0}px)`
    if (mv.scale !== undefined) style["--sc-art-s"] = `scale(${mv.scale})`
    if (mv.rotate) style["--sc-art-r"] = `rotate(${mv.rotate}deg)`
    if (mv.opacity !== undefined) style["--sc-art-o"] = String(mv.opacity)
  }
  const opacity = o?.o ?? baseOpacity
  return {
    ...(stroked ? { stroke: color, "stroke-width": String(o?.w ?? 1.6), "stroke-linecap": "round", "stroke-linejoin": "round", ...(o?.dash ? { "stroke-dasharray": "4 3" } : {}) } : { fill: color }),
    ...(opacity !== undefined ? { opacity: String(opacity) } : {}),
    ...(mv ? { class: mv.opacity !== undefined ? "sc-art-mv sc-art-mvo" : "sc-art-mv", style } : {}),
  }
}

function shape(s: Shape): unknown {
  switch (s[0]) {
    case "box": { const [, x, y, w, h, r = 6, o] = s; return <rect x={x} y={y} width={w} height={h} rx={r} {...common(o, true)} fill="var(--m-surface)" /> }
    case "fill": { const [, x, y, w, h, r = 4, o] = s; return <rect x={x} y={y} width={w} height={h} rx={r} {...common(o, false)} /> }
    case "ln": { const [, x, y, w, o] = s; return <rect x={x} y={y} width={w} height={5} rx={2.5} {...common(o, false, 0.35)} /> }
    case "dot": { const [, cx, cy, r = 5, o] = s; return <circle cx={cx} cy={cy} r={r} {...common(o, false)} /> }
    case "ring": { const [, cx, cy, r, o] = s; return <circle cx={cx} cy={cy} r={r} fill="none" {...common(o, true)} /> }
    case "path": { const [, d, o] = s; return <path d={d} fill="none" {...common(o, true)} /> }
    case "shape": { const [, d, o] = s; return <path d={d} {...common(o, false)} /> }
  }
}

/** One drawing: an SVG of the 150 × 80 canvas (decorative: the card's title says what it is). */
export function HubArt(props: { shapes: readonly Shape[] }) {
  return <svg class="sc-art" viewBox="0 0 150 80" aria-hidden="true" focusable="false">{props.shapes.map(shape)}</svg>
}
