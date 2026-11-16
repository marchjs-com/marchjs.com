// The live bench of the home hero: four glass cards that can be picked up and moved. Depth and glare follow the
// pointer (hoverParallax with `hold`: leaving the bench changes nothing, the cards keep the pose they were left in);
// each card holds real March components. The theme card restyles the whole showcase: color theme, accent, dark mode
// and the corner radius (the theme wave spreads from the pressed control). On a phone the cards stack and stay put.
import { effect, onCleanup, For } from "march";
import { lazy } from "march/lazy";
import { reveal, animate, animateValue, inView, hoverParallax, reducedMotion } from "march/motion";
import { draggable } from "march/behaviors/drag";
import { Avatar, Button, Swatch, ThemeSwatch, Toggle, Slider, Rating, SectionLabel, ChatBubble, TypingIndicator, LikeButton, heartBurst,
  colorThemes, colorTheme, setColorTheme, accent, setAccent, resolvedTheme, setTheme } from "march/ui";
import { tokenColor, BRAND_COLORS, type ColorToken } from "march/theme/colors.ts";
import { sparkles } from "march/icons";
import { celebrate } from "./celebrate.ts";

// the chart is a part of its own (the charts page loads the same one): the cards do not wait for it
const BarChart = lazy(() => import("march/charts/bar.ts"), { pick: "BarChart", placeholder: "chart", height: "7rem" });

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

/** The people of the chat card (each with a HADİ colour for the name and the avatar) and their conversation: one
 * message after another, each typed first ("… yazıyor" with the name). */
interface Person { name: string; color: ColorToken; tone: number; mine?: boolean }
const PEOPLE: readonly Person[] = [
  { name: "Tolgahan", color: "brand-orange", tone: 0 }, { name: "Öykü", color: "brand-blue", tone: 1 },
  { name: "Bulut", color: "brand-green", tone: 2 }, { name: "Rüzgar", color: "brand-purple", tone: 3 },
  // the one reading: their messages on the end side, in the accent colour
  { name: "Ben", color: "primary", tone: 0, mine: true },
]
const person = (name: string): Person => PEOPLE.find((p) => p.name === name) ?? PEOPLE[0]!
const TALK: readonly { who: string; text: string }[] = [
  { who: "Öykü", text: "MarchJS'i duydunuz mu? 🧡" },
  { who: "Bulut", text: "Sinyallerle çalışan çatı mı?" },
  { who: "Tolgahan", text: "Evet! Bileşen bir kez çalışıyor, yalnız değişen yer güncelleniyor" },
  { who: "Rüzgar", text: "Sanal DOM yok mu yani?" },
  { who: "Tolgahan", text: "Yok, bağımlılık da yok 😎" },
  { who: "Öykü", text: "Tarayıcıda yazıp tek tıkla dışa aktarıyorum, kurulum bile yok" },
  { who: "Bulut", text: "Temaları da çok güzel, koyu kipte bile" },
  { who: "Rüzgar", text: "Tamam, bu akşam deniyorum 🚀" },
  { who: "Ben", text: "Çok iyiymiş cidden! Ben de hemen deniyorum!" },
]
/** Typing time grows with the message (ms); the pause after a message; when the card's own entrance is over. */
const typingMs = (text: string): number => Math.min(2200, 700 + text.length * 25)
const CHAT_GAP = 650, CHAT_ENTERED = 250 + 1 * 150 + 1100

function ChatTile() {
  // the messages arrive one by one once the card is in view: "… yazıyor" with the name, then the message with its
  // sender's avatar and name; the list is pinned to the bottom of a fixed box, so each new message pushes the older
  // ones up (no scroll bar)
  let $count = 0
  let $typing: string | null = null
  const play = (box: Element) => onCleanup(inView(box, { once: true, threshold: 1, rootMargin: "0px", enter: () => {
    if (reducedMotion()) { $count = TALK.length; return }
    const timers: ReturnType<typeof setTimeout>[] = []
    let at = CHAT_ENTERED
    TALK.forEach((m, i) => {
      timers.push(setTimeout(() => { $typing = m.who }, at))
      at += typingMs(m.text)
      timers.push(setTimeout(() => { $typing = null; $count = i + 1 }, at))
      at += CHAT_GAP
    })
    onCleanup(() => timers.forEach(clearTimeout))
  } }))
  return <Tile class="sc-btile-chat" depth={0.6} order={1} title="Sohbet">
    <div class="sc-chat" ref={play}>
      <For each={() => TALK.slice(0, $count)}>{(m: () => (typeof TALK)[number]) =>
        <div class={`sc-chat-msg${person(m().who).mine ? " is-mine" : ""}`}>
          <Avatar name={m().who} color={person(m().who).color} size="xs" decorative />
          <ChatBubble mine={person(m().who).mine} m:color={person(m().who).mine ? "primary" : undefined} sender={m().who} senderColor={person(m().who).tone}
            text={m().text} swipe={false} tools={false} />
        </div>}</For>
      {() => ($typing ? <div class={`sc-chat-msg${person($typing).mine ? " is-mine" : ""}`}><Avatar name={$typing} color={person($typing).color} size="xs" decorative />
        <TypingIndicator names={[$typing]} text label={(n: readonly string[]) => (person(n[0]!).mine ? "Yazıyorsun…" : `${n[0]} yazıyor…`)} /></div> : null)}
    </div>
  </Tile>
}

const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const WEEK = [38, 62, 48, 80, 66, 92, 74];
/** One series per HADİ color: each day's bar takes the next color (the other series are empty for that day). */
const SERIES = BRAND_COLORS.map((c) => c.replace("brand-", ""));
const weekRows = (values: readonly number[]) => values.map((v, i) => ({ day: DAYS[i]!, ...Object.fromEntries(SERIES.map((s, k) => [s, k === i % SERIES.length ? v : 0])) }));

function ChartTile(props: { values: () => readonly number[] }) {
  return <Tile class="sc-btile-chart" depth={0.45} order={2} title="Haftalık katılım">
    <BarChart data={() => weekRows(props.values())} x="day" y={SERIES} stacked legend={false} grid={false} height={112} title="Haftalık katılım" animate="spring-wobbly"
      colors={BRAND_COLORS.map(tokenColor)} />
  </Tile>
}

/** The likes the tile counts up to (the minutes since 1 November 2026, read when the count starts), its stars, and how
 * long (ms): once the whole tile is in view and its own entrance is over (ENTERED ms: the tile's reveal delay and
 * duration), ease in-out, then a firework. */
const SINCE = new Date(2026, 10, 1).getTime()
const likesNow = (): number => Math.max(0, Math.floor((Date.now() - SINCE) / 60000))
const STARS = 5, LIKES_MS = 1500, ENTERED = 250 + 3 * 150 + 1100

function ControlsTile(props: { onJoin: () => void }) {
  let $liked = false
  let $likes = 0
  let $stars = 0
  const count = (tile: Element) => onCleanup(inView(tile, { once: true, threshold: 1, rootMargin: "0px", enter: () => {
    const LIKES = likesNow()
    if (reducedMotion()) { $likes = LIKES; $stars = STARS; return }
    // the stars fill from empty to five in the same time, each one smoothly (Rating fills the fraction of a star)
    const fill = animateValue(0, STARS, { duration: LIKES_MS, delay: ENTERED, easing: "in-out", onUpdate: (v: number) => { $stars = v } })
    const run = animateValue(0, LIKES, { duration: LIKES_MS, delay: ENTERED, easing: "in-out", onUpdate: (v: number) => { $likes = Math.round(v) + ($liked ? 1 : 0) } })
    const t = setTimeout(() => {
      const like = tile.querySelector<HTMLElement>(".m-like-count")?.closest<HTMLElement>("button")
      if (like) celebrate(like, like.querySelector<HTMLElement>(".m-like-count"))
    }, ENTERED + LIKES_MS)
    onCleanup(() => { run.cancel(); fill.cancel(); clearTimeout(t) })
  } }))
  return <Tile class="sc-btile-ctl" depth={0.8} order={3} title="Gerçek bileşenler">
    <div class="sc-btile-ctl-row" ref={count}>
      <Button variant="primary" icon={sparkles} on:click={(e: Event) => { heartBurst(e.currentTarget as HTMLElement, { radius: 46 }); props.onJoin() }}>Katıl</Button>
      <LikeButton liked={$liked} count={$likes} countFormat="full" label="Beğen" onToggle={(on: boolean) => { $liked = on; $likes += on ? 1 : -1 }} />
      <Rating bind:value={$stars} m:color="brand-gold" label="Puan" />
    </div>
  </Tile>
}

export default function Bench() {
  let $week: readonly number[] = WEEK
  // "Katıl" stirs the chart: the bars spring to their new heights (BarChart animate), the axis takes the new scale at once
  const stir = (): void => { $week = WEEK.map(() => Math.round(30 + Math.random() * 65)) }
  return <div class="sc-bench" role="group" aria-label="Canlı tezgâh: denetimler bu sayfayı değiştirir"
    use:hoverParallax={{ depth: -26, layerTilt: 6, hold: true, glare: true, selector: ".sc-btile:not(.is-held)" }}>
    <ThemeTile />
    <ChatTile />
    <ChartTile values={() => $week} />
    <ControlsTile onJoin={stir} />
  </div>
}
