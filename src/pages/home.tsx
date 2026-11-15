// Home: the first screen is a stage to play with. Behind it four wide bands of silk in the HADİ colors fold slowly and
// lean toward the pointer; the middle line of the title turns through phrases, each played by another of March's own
// text effects; beside it glass cards (home/bench.tsx) hold real controls that restyle the whole showcase; under them
// six answers to "why March". Below the fold the sections assemble as they scroll into view (home/sections.tsx).
// The page is its own lazy route chunk; the cards and the sections are lazy parts of it. No number here is typed by hand: they come from home-stats.gen.ts
// (tools/gen-home-stats.js) and march-report.json.
import "./home.css";
import { lazy } from "march/lazy";
import { onFrame, inView, reducedMotion, spotlight } from "march/motion";
import { onCleanup } from "march";
import { cascade, elastic, blurIn, typewriter, flip, scramble, fade, type TextAnimation } from "march/motion/text";
import { Button, Badge, CopyButton, LinkCard, SectionLabel, Overlay, type DrawContext } from "march/ui";
import { Link } from "march/router";
import type { ColorToken } from "march/theme";
import { arrowRight, zap, grid, globe, gauge, palette, shieldCheck } from "march/icons";
import { HOME_STATS as S } from "../home-stats.gen.ts";
// the glass cards and everything below the fold are parts of their own: the first screen (title, silk, why March) does not
// wait for the chart, the chat and the map. Each keeps its room while it loads, so nothing moves when it arrives.
const Bench = lazy(() => import("../home/bench.tsx"), { placeholder: () => <div class="sc-bench" aria-hidden="true" /> });
// (a part that loads when it comes near needs a reserved height: a slot without one has no box to watch)
const Sections = lazy(() => import("../home/sections.tsx"), { when: "visible", placeholder: "none", height: "100vh" });

// ── silk ────────────────────────────────────────────────────────────────────────────────────────────────────────

/** The four colors of the silk: the brand colors as home.css resolves them for the theme in use (read from the page). */
const SILK = ["--sc-c1", "--sc-c2", "--sc-c3", "--sc-c4"];
/** Points along a band's edge. */
const SEGMENTS = 48;

/**
 * Draws the silk: four soft bands that fold over each other; near the pointer they swell and lean toward it. Leaving
 * the hero changes nothing (the fold stays where the pointer left it) and wherever the pointer comes back in, the fold
 * travels there from where it is: no reset, no jump. Runs on the Overlay's canvas (the motion clock; one still frame
 * with reduced motion).
 */
function silk(): (ctx: CanvasRenderingContext2D, info: DrawContext) => void {
  // the colours and the light / dark of the canvas drawn on, read from where it sits: a theme wave draws the silk on
  // the old look's copy too, in that look's colours (each canvas keeps its own)
  const looks = new WeakMap<HTMLCanvasElement, { colors: string[]; dark: boolean; read: number }>()
  // where the fold is (eased) and how strongly it pulls; the target is the last place the pointer was seen
  let tx = 0, ty = 0, fx = 0, fy = 0, pull = 0, seen = false, stepped = -1
  const tint = (c: string, a: number): string => `color-mix(in srgb, ${c} ${Math.round(a * 100)}%, transparent)`
  return (ctx, { width: W, height: H, time, pointer }) => {
    // read every frame: a new look shows on the very next frame (a theme wave draws both looks at once)
    let look = looks.get(ctx.canvas)
    if (!look || time !== look.read) {
      const cs = getComputedStyle(ctx.canvas)
      look = { colors: SILK.map((v) => cs.getPropertyValue(v).trim() || "gray"), dark: isDark(ctx, cs.getPropertyValue("--m-bg")), read: time }
      looks.set(ctx.canvas, look)
    }
    const { colors, dark } = look
    // one step per moment: drawn twice at the same moment (the wave's copy), the fold is in the same place
    if (time !== stepped) {
      stepped = time
      if (pointer) { tx = pointer.x; ty = pointer.y; if (!seen) { seen = true; fx = tx; fy = ty } }
      if (seen) { fx += (tx - fx) * 0.06; fy += (ty - fy) * 0.06; pull += (1 - pull) * 0.04 }
    }
    ctx.globalCompositeOperation = dark ? "lighter" : "source-over"
    const T = (time + 4000) * 0.00022
    colors.forEach((c, k) => {
      const base = H * (0.34 + k * 0.13), amp = H * 0.13, ph = k * 1.7
      const mid = (x: number): number => {
        const u = x / W
        let y = base + Math.sin(u * 3.1 + T * (1 + k * 0.23) + ph) * amp + Math.sin(u * 6.3 - T * 1.7 + ph * 2) * amp * 0.35
        if (seen) { const d = (x - fx) / (W * 0.16); y += (fy - y) * 0.55 * pull * Math.exp(-d * d) }
        return y
      }
      const thick = (x: number): number => {
        const u = x / W
        let th = H * (0.07 + 0.045 * Math.sin(u * 4.4 + T * 2.1 + ph))
        if (seen) { const d = (x - fx) / (W * 0.13); th *= 1 + 0.9 * pull * Math.exp(-d * d) }
        return th
      }
      const g = ctx.createLinearGradient(0, 0, W, 0)
      g.addColorStop(0, tint(c, 0)); g.addColorStop(0.18 + k * 0.04, tint(c, 0.5)); g.addColorStop(0.62 + k * 0.05, tint(c, 0.62)); g.addColorStop(1, tint(c, 0.08))
      ctx.fillStyle = g
      ctx.beginPath()
      for (let i = 0; i <= SEGMENTS; i++) { const x = (i / SEGMENTS) * W, y = mid(x) - thick(x); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y) }
      for (let i = SEGMENTS; i >= 0; i--) { const x = (i / SEGMENTS) * W; ctx.lineTo(x, mid(x) + thick(x)) }
      ctx.closePath(); ctx.fill()
      // a bright thread along the upper edge gives the fold its shine
      ctx.strokeStyle = tint("white", dark ? 0.22 : 0.7); ctx.lineWidth = 1
      ctx.beginPath()
      for (let i = 0; i <= SEGMENTS; i++) { const x = (i / SEGMENTS) * W, y = mid(x) - thick(x) * 0.55; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y) }
      ctx.stroke()
    })
  }
}

/** Whether a background colour is dark (the canvas normalises any CSS colour to #rrggbb or rgba()). */
function isDark(ctx: CanvasRenderingContext2D, bg: string): boolean {
  const keep = ctx.fillStyle
  ctx.fillStyle = "#fff"; ctx.fillStyle = bg.trim() || "#fff"
  const v = String(ctx.fillStyle); ctx.fillStyle = keep
  const n = v.startsWith("#") ? [1, 3, 5].map((i) => parseInt(v.slice(i, i + 2), 16)) : (v.match(/[\d.]+/g) ?? ["255", "255", "255"]).slice(0, 3).map(Number)
  return 0.2126 * n[0]! + 0.7152 * n[1]! + 0.0722 * n[2]! < 128
}

// ── the turning line of the title ───────────────────────────────────────────────────────────────────────────────

type Play = (el: HTMLElement) => TextAnimation
/** The phrases of the middle line; each enters with another text effect of march/motion/text (its export name is shown).
 *  Every effect keeps its letters split when it ends (keep): the last frame is the phrase as it stays, so nothing
 *  moves or recolours when the effect is over (plain text would kern and take the ribbon differently). */
const PHRASES: readonly { text: string; fx: string; play: Play }[] = [
  { text: "her parçası", fx: "cascade", play: (el) => cascade(el, { by: "char", keep: true }) },
  { text: "her hareketi", fx: "elastic", play: (el) => elastic(el, { by: "char", keep: true }) },
  { text: "her teması", fx: "blurIn", play: (el) => blurIn(el, { by: "char", stagger: 45, keep: true }) },
  { text: "her formu", fx: "typewriter", play: (el) => typewriter(el, { caret: false, keep: true }) },
  { text: "her ekranı", fx: "flip", play: (el) => flip(el, { by: "char", keep: true }) },
  { text: "her ayrıntısı", fx: "scramble", play: (el) => scramble(el, { chars: "abcçdefgğhıijklmnoöprsştuüvyz", duration: 1100, keep: true }) },
]
/** How long a phrase stays, ms. */
const STAY = 3400

function Title() {
  let $at = 0
  let held = false
  /** Action on the turning line: every STAY ms (on the motion clock, only while on screen) the phrase leaves and the next one enters with its effect. */
  const turn = (node: Element): (() => void) => {
    const el = node as HTMLElement
    let waited = 0, busy = false, live = true, run: TextAnimation | null = null, stopClock: (() => void) | null = null
    const next = async (): Promise<void> => {
      busy = true
      run?.stop()
      const out = fade(el, { out: true, duration: 180, stagger: 12 })
      await out.finished
      if (!live) return
      out.stop()
      $at = ($at + 1) % PHRASES.length
      const p = PHRASES[$at]!
      el.textContent = p.text
      run = p.play(el)
      busy = false
    }
    const off = inView(el, {
      once: false, rootMargin: "0px",
      enter: () => { if (!stopClock && !reducedMotion()) stopClock = onFrame((_t, dt) => { if (held || busy) return; waited += Math.min(dt, 100); if (waited >= STAY) { waited = 0; void next() } }) },
      leave: () => { stopClock?.(); stopClock = null },
    })
    return () => { live = false; off(); stopClock?.(); run?.stop() }
  }
  // while the hero is pressed (a card is being dragged, a control held) the phrase waits
  const hold = (on: boolean) => () => { held = on }
  return { hold, view: <>
    <h1 id="sc-hero-title" class="sc-hero-title">
      <span class="sc-hero-word">Arayüzün</span>
      <span class="sc-hero-turn" use:turn>{PHRASES[0]!.text}</span>
      <span class="sc-hero-word">tek pakette.</span>
    </h1>
    <p class="sc-hero-fx">
      <span class="sc-hero-fx-dot" aria-hidden="true" />
      <span>metin efekti:</span>
      <code class="sc-hero-fx-name">{() => PHRASES[$at]!.fx}</code>
      <Link href="/text-motion" class="sc-hero-fx-all">{`${S.animations.text} efektin hepsi`}</Link>
    </p>
  </> }
}

// ── why March ───────────────────────────────────────────────────────────────────────────────────────────────────

// the package name is spliced in: the build rewrites `from "march…"` even inside strings
const PKG = "march"
const WHY: readonly { icon: unknown; color: ColorToken; title: string; text: () => unknown; href: string }[] = [
  { icon: zap, color: "brand-orange", title: "Öğrenmesi kolay", text: () => <><code>{"$sayi++"}</code> yaz, ekran güncellenir. Kanca yok, ezberlenecek kural yok.</>, href: "/language" },
  { icon: grid, color: "brand-blue", title: "Tek paket yeter", text: () => `${S.components} bileşen, form, veri, hareket. Başka paket kurmazsın: sıfır bağımlılık.`, href: "/buttons" },
  { icon: globe, color: "brand-green", title: "Tarayıcının gücü hazır", text: () => `Pano, izin, konum, bildirim, çevrimdışı, sekme eşitleme: ${S.managers} yönetici.`, href: "/managers" },
  { icon: gauge, color: "brand-gold", title: "Küçük ve hızlı", text: () => `Sanal DOM yok; yalnız değişen yer güncellenir. Açılış bütçesi ${S.budget.boot / 1024} KB.`, href: "/speed" },
  { icon: palette, color: "brand-purple", title: "Her şey senin", text: () => `Her metin, parça ve hareket değişir ya da kapanır. ${S.themes} tema, kendi teman.`, href: "/themes" },
  { icon: shieldCheck, color: "brand-pink", title: "Baştan doğru", text: () => "Erişilebilirlik, sağdan sola, çok dil ve sıkı CSP ilk günden içinde.", href: "/managers-a11y" },
]

export default function Home() {
  const title = Title()
  // one light follows the pointer over the cards of the home page (only here: other pages stay calm)
  return <div class="sc-home" ref={(el: Element) => onCleanup(spotlight(el, { selector: ".sc-why-card, .sc-card, .sc-home-cat, .m-link-card" }))}>
    <section class="sc-hero" aria-labelledby="sc-hero-title" m:no-select
      on:pointerdown={title.hold(true)} on:pointerup={title.hold(false)} on:pointercancel={title.hold(false)} on:pointerleave={title.hold(false)}>
      <Overlay class="sc-hero-silk" draw={silk()} animate />
      <Overlay class="sc-hero-dots" effect="dots" />
      <div class="sc-hero-in">
        <div class="sc-hero-copy">
          <span class="sc-hero-pill">
            <Badge tone="primary">Açık kaynak</Badge>
            {`MIT · ${S.dependencies} bağımlılık · TypeScript`}
          </span>
          {title.view}
          <p class="sc-hero-lead">Sinyallerle çalışan, sıfır bağımlılıklı TypeScript arayüz çatısı. <span class="sc-hero-lead-wide">Sağdaki kartları tut, sürükle; bir renge dokun: hepsi gerçek.</span>
            <span class="sc-hero-lead-mid">Aşağıdaki kartları tut, sürükle; bir renge dokun: hepsi gerçek.</span><span class="sc-hero-lead-narrow">Aşağıdaki kartlarda bir renge dokun: hepsi gerçek.</span></p>
          <div class="sc-hero-cta">
            <Button variant="primary" size="lg" href="/buttons" iconEnd={arrowRight}>Bileşenleri gez</Button>
            <Button size="lg" href="/social/post-card">Bir bileşeni parçala</Button>
            <span class="sc-hero-npm">
              <code>{`npm i ${PKG}`}</code>
              <CopyButton text={`npm i ${PKG}`} label="Kopyala" copiedLabel="Kopyalandı" />
            </span>
          </div>
        </div>
        <Bench />
        <div class="sc-why">
          <SectionLabel rule size="md" as="h2">Neden March</SectionLabel>
          <div class="sc-why-grid">
            {WHY.map((w) => <LinkCard class="sc-why-card" data-m-color={w.color} href={w.href} icon={w.icon} color={w.color} title={w.title} description={w.text()} arrow={false} />)}
          </div>
        </div>
      </div>
    </section>
    <Sections />
  </div>
}
