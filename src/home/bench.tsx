// The live bench of the home hero: four glass cards that can be picked up and moved. Depth and glare follow the
// pointer (hoverParallax with `hold`: leaving the bench changes nothing, the cards keep the pose they were left in);
// each card holds real March components. The theme card restyles the whole showcase: color theme, accent, dark mode
// and the corner radius (the theme wave spreads from the pressed control). On a phone the cards stack and stay put.
import { effect, onCleanup } from "hadi-march";
import { reveal, animate, inView, hoverParallax } from "hadi-march/motion";
import { draggable } from "hadi-march/behaviors/drag";
import { Button, Swatch, ThemeSwatch, Toggle, Slider, Rating, SectionLabel, ChatBubble, TypingIndicator, LikeButton, heartBurst,
  colorThemes, colorTheme, setColorTheme, accent, setAccent, resolvedTheme, setTheme } from "hadi-march/ui";
import { BarChart } from "hadi-march/charts";
import { tokenColor, BRAND_COLORS, type ColorToken } from "hadi-march/theme/colors.ts";
import { sparkles } from "hadi-march/icons";

const ACCENT_NAMES: Record<string, string> = { "brand-orange": "Turuncu", "brand-blue": "Mavi", "brand-green": "Yeşil", "brand-purple": "Mor" };

// ── corner radius: one override on the page root, dropped whenever the color theme changes ─────────────────────

const RADIUS = "--m-r";
const root = (): HTMLElement => document.documentElement;
/** The corner radius in use, px (the theme's, or the one set here). */
const radiusNow = (): number => Math.round(parseFloat(getComputedStyle(root()).getPropertyValue(RADIUS)) || 0);
// a theme brings its own radius: a radius picked here belongs to the theme it was picked on
let themeSeen = "";
effect(() => { const id = colorTheme(); if (themeSeen && themeSeen !== id) root().style.removeProperty(RADIUS); themeSeen = id; });

// ── a card ──────────────────────────────────────────────────────────────────────────────────────────────────────

let top = 1;
const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

/** A glass card of the bench: `depth` is how far it sits from the pointer's plane; it can be dragged anywhere. */
function Tile(props: { class: string; depth: number; title: string; order: number; children?: unknown }) {
  let $x = 0
  let $y = 0
  let $held = false
  let $lean = 0
  let $z = 0
  let fromX = 0, fromY = 0
  const grab = (el: Element): (() => void) => draggable(el, {
    // stacked (phone): the cards are part of the page, a finger scrolls
    disabled: () => getComputedStyle(el).position !== "absolute",
    onStart: () => { fromX = $x; fromY = $y; $held = true; $z = ++top },
    onMove: (p) => { $x = fromX + p.dx; $y = fromY + p.dy; $lean = clamp((p.event?.movementX ?? 0) * 0.6, -6, 6) },
    onEnd: (_p, cancelled) => { if (cancelled) { $x = fromX; $y = fromY } $held = false; $lean = 0 },
  })
  /** The card bobs slowly while it is on screen (still with reduced motion). */
  const bob = (el: Element): (() => void) => {
    let run: { cancel(): void } | null = null
    const off = inView(el, { once: false, rootMargin: "0px",
      enter: () => { run ??= animate(el, [{ translate: "0px 0px" }, { translate: "0px -9px" }], { duration: 3500, delay: props.order * 600, iterations: Infinity, direction: "alternate", easing: "easeInOutSine" }) },
      leave: () => { run?.cancel(); run = null } })
    return () => { off(); run?.cancel() }
  }
  return <div class={`sc-btile ${props.class}`} class:is-held={$held} data-depth={props.depth} use:grab
    style={{ translate: `${$x}px ${$y}px`, rotate: `${$lean}deg`, "z-index": $z ? String($z) : null }}>
    <div class="sc-btile-in" use:bob use:reveal={{ delay: 250 + props.order * 150, duration: 1100, frames: [
      { opacity: 0, transform: "translateY(60px) translateZ(-500px) rotateX(28deg) rotateY(-18deg)", filter: "blur(12px)" },
      { opacity: 1, transform: "none", filter: "blur(0px)" }] }}>
      <SectionLabel class="sc-btile-title">{props.title}</SectionLabel>
      {props.children}
    </div>
  </div>
}

// ── the four cards ──────────────────────────────────────────────────────────────────────────────────────────────

function ThemeTile() {
  let $radius = radiusNow()
  // the slider shows the theme's own radius once another theme is on the page (its stylesheet loads first, then the root changes)
  const watch = new MutationObserver(() => { $radius = radiusNow() })
  watch.observe(root(), { attributes: true, attributeFilter: ["data-m-theme"] })
  onCleanup(() => watch.disconnect())
  const setRadius = (v: number): void => { $radius = v; root().style.setProperty(RADIUS, `${v}px`) }
  return <Tile class="sc-btile-theme" depth={0.3} order={0} title="Tema · dokun, sayfa değişsin">
    <div class="sc-btile-row" role="radiogroup" aria-label="Tema">
      {colorThemes().map((th) => <Swatch class="sc-btile-themesw" size="sm" shape="circle" checker={false} role="radio" label={th.name} selected={() => colorTheme() === th.id}
        onClick={() => setColorTheme(th.id)}><ThemeSwatch id={th.id} /></Swatch>)}
    </div>
    <div class="sc-btile-row" role="group" aria-label="Vurgu rengi">
      {BRAND_COLORS.map((c: ColorToken) => <Swatch color={c} size="md" shape="circle" checker={false} label={ACCENT_NAMES[c] ?? c} selected={() => accent() === c}
        onClick={() => setAccent(accent() === c ? "primary" : c)} />)}
    </div>
    <Toggle class="sc-btile-toggle" value={resolvedTheme() === "dark"} onChange={(on: boolean) => setTheme(on ? "dark" : "light")}>Koyu kip</Toggle>
    <label class="sc-btile-range">
      <span class="sc-btile-range-l">Köşe yarıçapı</span>
      <Slider value={$radius} onChange={setRadius} min={0} max={26} track format={(v: number) => `${v} px`} aria-label="Köşe yarıçapı" />
    </label>
  </Tile>
}

function ChatTile() {
  return <Tile class="sc-btile-chat" depth={0.6} order={1} title="Sohbet">
    <ChatBubble text="Cumartesi konsere geliyor musun?" swipe={false} tools={false} />
    <ChatBubble mine color="primary" text="Biletimi aldım bile, kapıda buluşalım" swipe={false} tools={false} />
    <TypingIndicator names={["Deniz"]} />
  </Tile>
}

const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const WEEK = [38, 62, 48, 80, 66, 92, 74];
/** One series per HADİ color: each day's bar takes the next color (the other series are empty for that day). */
const SERIES = BRAND_COLORS.map((c) => c.replace("brand-", ""));
const weekRows = (values: readonly number[]) => values.map((v, i) => ({ day: DAYS[i]!, ...Object.fromEntries(SERIES.map((s, k) => [s, k === i % SERIES.length ? v : 0])) }));

function ChartTile(props: { values: () => readonly number[] }) {
  return <Tile class="sc-btile-chart" depth={0.45} order={2} title="Haftalık katılım">
    <BarChart data={() => weekRows(props.values())} x="day" y={SERIES} stacked legend={false} grid={false} height={112} title="Haftalık katılım"
      colors={BRAND_COLORS.map(tokenColor)} />
  </Tile>
}

function ControlsTile(props: { onJoin: () => void }) {
  let $liked = false
  let $likes = WEEK.reduce((a, b) => a + b, 0)
  let $stars = 4
  return <Tile class="sc-btile-ctl" depth={0.8} order={3} title="Gerçek bileşenler">
    <div class="sc-btile-ctl-row">
      <Button variant="primary" icon={sparkles} on:click={(e: Event) => { heartBurst(e.currentTarget as HTMLElement, { radius: 46 }); props.onJoin() }}>Katıl</Button>
      <LikeButton liked={$liked} count={$likes} countFormat="full" label="Beğen" onToggle={(on: boolean) => { $liked = on; $likes += on ? 1 : -1 }} />
      <Rating bind:value={$stars} color="brand-gold" label="Puan" />
    </div>
  </Tile>
}

export default function Bench() {
  let $week: readonly number[] = WEEK
  // "Katıl" stirs the chart: the bars glide to new heights
  const stir = (): void => { $week = WEEK.map(() => Math.round(30 + Math.random() * 65)) }
  return <div class="sc-bench" role="group" aria-label="Canlı tezgâh: denetimler bu sayfayı değiştirir"
    use:hoverParallax={{ depth: -26, layerTilt: 6, hold: true, glare: true, selector: ".sc-btile:not(.is-held)" }}>
    <ThemeTile />
    <ChatTile />
    <ChartTile values={() => $week} />
    <ControlsTile onJoin={stir} />
  </div>
}
