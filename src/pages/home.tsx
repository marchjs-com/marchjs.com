// Home: the first screen is a stage to play with. Behind it four wide bands of silk in the HADİ colors fold slowly and
// lean toward the pointer; the middle line of the title turns through phrases, each played by another of March's own
// text effects; beside it glass cards (home/bench.tsx) hold real controls that restyle the whole showcase; under them
// six answers to "why March". Below the fold the sections assemble as they scroll into view (home/sections.tsx).
// The page is its own lazy route chunk. No number here is typed by hand: they come from home-stats.gen.ts
// (tools/gen-home-stats.js) and march-report.json.
import "./home.css";
import { onFrame, inView, reducedMotion } from "hadi-march/motion";
import { cascade, elastic, blurIn, typewriter, flip, scramble, fade, type TextAnimation } from "hadi-march/motion/text";
import { Button, Badge, CopyButton, LinkCard, SectionLabel, Overlay, resolvedTheme, type DrawContext } from "hadi-march/ui";
import { Link } from "hadi-march/router";
import type { ColorToken } from "hadi-march/theme";
import { arrowRight, zap, grid, globe, gauge, palette, shieldCheck } from "hadi-march/icons";
import { HOME_STATS as S } from "../home-stats.gen.ts";
import Bench from "../home/bench.tsx";
import Sections from "../home/sections.tsx";

// ── silk ────────────────────────────────────────────────────────────────────────────────────────────────────────

/** The four HADİ colors of the silk, as theme tokens (read from the page, so a theme that redefines them is followed). */
const SILK = ["--m-brand-orange", "--m-brand-blue", "--m-brand-green", "--m-brand-purple"];
/** Points along a band's edge. */
const SEGMENTS = 48;

/**
 * Draws the silk: four soft bands that fold over each other; near the pointer they swell and lean toward it. Leaving
 * the hero changes nothing (the fold stays where the pointer left it) and wherever the pointer comes back in, the fold
 * travels there from where it is: no reset, no jump. Runs on the Overlay's canvas (the motion clock; one still frame
 * with reduced motion).
 */
function silk(): (ctx: CanvasRenderingContext2D, info: DrawContext) => void {
  let colors: string[] = [], read = 0
  // where the fold is (eased) and how strongly it pulls; the target is the last place the pointer was seen
  let tx = 0, ty = 0, fx = 0, fy = 0, pull = 0, seen = false
  const tint = (c: string, a: number): string => `color-mix(in srgb, ${c} ${Math.round(a * 100)}%, transparent)`
  return (ctx, { width: W, height: H, time, pointer }) => {
    if (!colors.length || time - read > 1500) { const cs = getComputedStyle(ctx.canvas); colors = SILK.map((v) => cs.getPropertyValue(v).trim() || "gray"); read = time }
    if (pointer) { tx = pointer.x; ty = pointer.y; if (!seen) { seen = true; fx = tx; fy = ty } }
    if (seen) { fx += (tx - fx) * 0.06; fy += (ty - fy) * 0.06; pull += (1 - pull) * 0.04 }
    const dark = resolvedTheme() === "dark"
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

// ── the turning line of the title ───────────────────────────────────────────────────────────────────────────────

type Play = (el: HTMLElement) => TextAnimation
/** The phrases of the middle line; each enters with another text effect of hadi-march/motion/text (its export name is shown). */
const PHRASES: readonly { text: string; fx: string; play: Play }[] = [
  { text: "her parçası", fx: "cascade", play: (el) => cascade(el, { by: "char" }) },
  { text: "her hareketi", fx: "elastic", play: (el) => elastic(el, { by: "char" }) },
  { text: "her teması", fx: "blurIn", play: (el) => blurIn(el, { by: "char", stagger: 45 }) },
  { text: "her formu", fx: "typewriter", play: (el) => typewriter(el, { caret: false }) },
  { text: "her ekranı", fx: "flip", play: (el) => flip(el, { by: "char" }) },
  { text: "her ayrıntısı", fx: "scramble", play: (el) => scramble(el, { chars: "abcçdefgğhıijklmnoöprsştuüvyz", duration: 1100 }) },
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

// the package name is spliced in: the build rewrites `from "hadi-march…"` even inside strings
const PKG = "hadi-march"
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
  return <div class="sc-home">
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
          <p class="sc-hero-lead">Sinyallerle çalışan, sıfır bağımlılıklı TypeScript arayüz çatısı. Sağdaki kartları tut, sürükle; bir renge dokun: hepsi gerçek.</p>
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
            {WHY.map((w) => <LinkCard class="sc-why-card" href={w.href} icon={w.icon} color={w.color} title={w.title} description={w.text()} arrow={false} />)}
          </div>
        </div>
      </div>
    </section>
    <Sections />
  </div>
}
