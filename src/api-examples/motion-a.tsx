// API examples of hadi-march/motion, part A (COMPOSITOR … magnet). Every animation here runs on the motion engine, so the
// global speed, "Stop all" and reduced motion reach it. Layout and rules: tools/api-examples.js.
import { signal, effect, onCleanup, untrack, For, If } from "hadi-march";
import { Button, Segmented } from "hadi-march/ui";
import {
  COMPOSITOR, DRIVER, Effect, MORPH_ICONS, MOTION_DEFAULTS, PAGE_VARIANTS, PRESETS, Playback, Track,
  animate, animateEl, animateValue, blinds, bounceEase, canvas2d, circle, clipAt, clipFrames, clipReveal, cssAnimations, cssVars,
  cube, curtain, defineDriver, defineEasing, defineMotion, definePageTransition, defineTransition, displace, drag, drawPath, driverFor,
  ease, easingNames, filterBlur, flatten, flip, flipPage, followPath, frame, frameLoop, frameMonitor, getKeyframes, goo, hoverParallax,
  installFlip, installPresets, installTransitions, interpolatePath, inView, keyframeNames, keyframes, keyframesCss, magnet, morphIcon,
  normalize, stagger, timeline, transitionFrames,
} from "hadi-march/motion";
import type { PageVariant } from "hadi-march/motion";
import { examples } from "./types.ts";
import { Out, Log, Row } from "./_kit.tsx";
import "./motion-a.css";
export { default as SIG } from "./motion-a.sig.gen.ts";

const el = (x: unknown): HTMLElement => x as HTMLElement
const rtlOf = (e: Element): boolean => globalThis.getComputedStyle?.(e).direction === "rtl"
const stopAll = (p: unknown): void => {
  if (Array.isArray(p)) p.forEach(stopAll)
  else if (typeof p === "function") p()
  else (p as { cancel?: () => void } | null | undefined)?.cancel?.()
}
/** Targets that are not elements (canvas, objects, custom drivers) play through a timeline. */
const playTarget = (target: unknown, frames: object, o: Record<string, unknown>) => timeline({ defaults: o }).add(target as never, frames as never, { at: 0 }).play()
const FADE_UP = [{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }]

/** A stage for one animation: `start()` runs when the example opens, on "Yeniden oynat" and whenever a signal it reads
 *  (a Playground value) changes; what it returns (a Playback, a cleanup function, or a list of them) is stopped first. */
function Stage(props: { start: () => unknown; children?: unknown; class?: string; replay?: boolean; extra?: unknown }) {
  const tick = signal(0), ready = signal(false)
  let prev: unknown = null
  const stop = () => { const p = prev; prev = null; stopAll(p) }
  queueMicrotask(() => ready.set(true))
  effect(() => { tick(); if (!ready()) return; stop(); prev = props.start() })
  onCleanup(stop)
  return <div class="sc-ex-motion-a">
    <div class={`sc-ex-motion-a-stage ${props.class ?? ""}`}>{props.children}</div>
    <Row>
      {props.replay === false ? null : <Button size="sm" variant="secondary" onClick={() => tick.update((n) => n + 1)}>Yeniden oynat</Button>}
      {props.extra}
    </Row>
  </div>
}

/** A lane with a ball and the frames that carry it from one end to the other (mirrored in RTL). */
function lane() {
  const track = el(<div class="sc-ex-motion-a-lane"><i class="sc-ex-motion-a-ball" /></div>)
  const ball = track.firstElementChild as HTMLElement
  const frames = () => {
    const w = Math.round((track.clientWidth - ball.offsetWidth) * (rtlOf(track) ? -1 : 1))
    return [{ transform: "translateX(0px)" }, { transform: `translateX(${w}px)` }]
  }
  return { track, ball, frames }
}

function Range(props: { value: () => number; onChange: (v: number) => void; label: string; min?: number; max?: number; step?: number }) {
  const inp = el(<input type="range" class="sc-ex-motion-a-range" min={props.min ?? 0} max={props.max ?? 100} step={props.step ?? 1} aria-label={props.label}
    onInput={(e: Event) => props.onChange(Number((e.target as HTMLInputElement).value))} />) as HTMLInputElement
  effect(() => { inp.value = String(props.value()) })
  return inp
}

/** Two pages in a box that swap with a page transition variant (its keyframes for both sides). */
function PageStage(props: { variant: () => PageVariant; pick?: unknown }) {
  const dir = signal<"forward" | "back">("forward")
  const a = el(<div class="sc-ex-motion-a-page"><span>A sayfası</span></div>)
  const b = el(<div class="sc-ex-motion-a-page sc-ex-motion-a-page-b" hidden><span>B sayfası</span></div>)
  const box = el(<div class="sc-ex-motion-a-pages">{a}{b}</div>)
  let cur = a, nxt = b
  let live: Playback[] = []
  const go = () => {
    if (live.length) return
    const v = props.variant(), d = dir(), rtl = rtlOf(box)
    nxt.hidden = false
    const o = { duration: 800, easing: "in-out", fill: "none" as const }
    live = [animate(nxt, v.frames("in", d, rtl, 32), o), animate(cur, v.frames("out", d, rtl, 32), o)]
    void Promise.all(live.map((p) => p.finished)).then(() => { cur.hidden = true; [cur, nxt] = [nxt, cur]; live = [] })
  }
  onCleanup(() => stopAll(live))
  return <div class="sc-ex-motion-a">
    {box}
    <Row>
      <Button size="sm" variant="secondary" onClick={go}>Sayfayı değiştir</Button>
      <Segmented value={dir} onChange={(v: "forward" | "back") => dir.set(v)} options={[{ value: "forward", label: "İleri" }, { value: "back", label: "Geri" }]} aria-label="Yön" />
      <Out label="geçiş" value={() => props.variant().name} />
    </Row>
    {props.pick}
  </div>
}

// definitions that are registered once for the whole page (the engine registries are global)
let gaugeReady = false
class Gauge { level = 0; constructor(readonly el: HTMLElement, readonly label: HTMLElement) {} }
const ensureGauge = () => {
  if (gaugeReady) return
  gaugeReady = true
  defineDriver<Gauge>("gauge", {
    supports: (t) => t instanceof Gauge,
    apply: (g, tr) => { g.level = tr.out[0]!; g.el.style.setProperty("--level", g.level.toFixed(1)); g.label.textContent = `${Math.round(g.level)} %` },
    read: (g) => g.level,
    element: (g) => g.el,
  })
}
const ensureAcme = () => {
  keyframes("acme-drop", [{ transform: "translateY(-40px)", opacity: 0 }, { transform: "translateY(0px)", opacity: 1 }], { duration: 600, easing: "bounce" })
  keyframes("acme-rise", { opacity: [0, 1], transform: ["translateY(24px)", "translateY(0px)"] }, { duration: 420, easing: "expo" })
}
let motionReady = false
const ensureMotion = () => {
  if (motionReady) return
  motionReady = true
  defineMotion({
    keyframes: { "acme-wiggle": { frames: [{ transform: "rotate(0deg)" }, { transform: "rotate(-10deg)" }, { transform: "rotate(8deg)" }, { transform: "rotate(-4deg)" }, { transform: "rotate(0deg)" }], defaults: { duration: 500 } } },
    easings: { "acme-punch": "cubic-bezier(.3, 1.6, .5, 1)" },
    presets: { "acme-wiggle-slow": { use: "acme-wiggle", duration: 1100, easing: "in-out" } },
  })
}

export default examples({
  "hadi-march/motion": {
    animate: {
      code: `animate(card, [{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }],
  { duration: 500, easing: "out" })`,
      play: { options: [{ key: "easing", label: "Eğri", default: "out", options: ["out", "spring", "bounce", "back"] }, { key: "gap", label: "Gecikme", default: 80, options: [{ value: 0, label: "yok" }, { value: 80, label: "80 ms" }, { value: 160, label: "160 ms" }] }] },
      run: (p: { values: { easing: string; gap: number } }) => {
        const cards = [1, 2, 3].map((n) => el(<div class="sc-ex-motion-a-card">Acme {n}</div>))
        return <Stage start={() => { const d = stagger(p.values.gap); return cards.map((c, i) => animate(c, FADE_UP, { duration: 500, easing: p.values.easing, delay: d(i, cards.length) })) }}>{cards}</Stage>
      },
    },
    animateEl: {
      code: `const spin = animateEl(el, [{ transform: "rotate(0)" }, { transform: "rotate(1turn)" }],
  { duration: 1200, iterations: Infinity })
spin?.cancel()   // follows global speed and "Stop all" until then`,
      run: () => {
        const box = el(<div class="sc-ex-motion-a-box" />)
        const state = signal("durdu")
        let a: Animation | null = null
        const start = () => { a?.cancel(); a = animateEl(box, [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }], { duration: 1200, iterations: Infinity }); state.set(a ? "dönüyor" : "WAAPI yok") }
        const end = () => { a?.cancel(); a = null; state.set("durdu") }
        onCleanup(end)
        return <div class="sc-ex-motion-a"><div class="sc-ex-motion-a-stage">{box}</div>
          <Row><Button size="sm" onClick={start}>Başlat</Button><Button size="sm" variant="ghost" onClick={end}>Durdur</Button><Out label="durum" value={state} /></Row></div>
      },
    },
    animateValue: {
      code: `animateValue(0, 1000, { duration: 900, easing: "out", onUpdate: (v) => (label.textContent = v.toFixed(0)) })`,
      play: { options: [{ key: "to", label: "Hedef", default: 1000, options: [250, 1000, 5000] }] },
      run: (p: { values: { to: number } }) => {
        const v = signal(0)
        const bar = el(<i />)
        const meter = el(<div class="sc-ex-motion-a-meter">{bar}</div>)
        return <Stage start={() => { const to = p.values.to; return animateValue(0, to, { duration: 900, easing: "out", onUpdate: (x) => { v.set(x); bar.style.setProperty("inline-size", `${(x / to) * 100}%`) } }) }}
          extra={<Out label="değer" value={() => v().toFixed(0)} />}>{meter}</Stage>
      },
    },
    blinds: {
      code: `usePageTransitions(blinds)    // { path: "/photos", meta: { transition: "blinds" } }
animate(page, blinds.frames("in", "forward", false, 32), { duration: 700 })`,
      run: () => <PageStage variant={() => blinds} />,
    },
    bounceEase: {
      code: `animate(ball, [{ transform: "translateY(0)" }, { transform: "translateY(96px)" }],
  { duration: 1200, easing: bounceEase(3, 0.35) })`,
      play: { options: [{ key: "bounces", label: "Sıçrama", default: 3, options: [1, 3, 5] }, { key: "decay", label: "Sönüm", default: 0.35, options: [{ value: 0.2, label: "güçlü" }, { value: 0.35, label: "orta" }, { value: 0.6, label: "hafif" }] }] },
      run: (p: { values: { bounces: number; decay: number } }) => {
        const ball = el(<i class="sc-ex-motion-a-ball" />)
        const col = el(<div class="sc-ex-motion-a-drop">{ball}</div>)
        return <Stage start={() => animate(ball, [{ transform: "translateY(0px)" }, { transform: `translateY(${col.clientHeight - ball.offsetHeight}px)` }], { duration: 1200, easing: bounceEase(p.values.bounces, p.values.decay) as never })}
          extra={<Out label="ease(0.5)" value={() => bounceEase(p.values.bounces, p.values.decay)(0.5).toFixed(3)} />}>{col}</Stage>
      },
    },
    canvas2d: {
      code: `const wave = canvas2d(canvas, (s, ctx) => { ctx.clearRect(0, 0, 320, 90); ctx.beginPath(); ctx.arc(s.x, 45 + s.amp * Math.sin(s.x / 20), 10, 0, 7); ctx.fill() }, { x: 16, amp: 0 })
timeline().add(wave, { x: [16, 304], amp: [0, 24] }, { duration: 1600, iterations: Infinity, direction: "alternate" }).play()`,
      run: () => {
        const cv = el(<canvas class="sc-ex-motion-a-canvas" width="320" height="90" role="img" aria-label="Dalga çizen nokta" />) as HTMLCanvasElement
        return <Stage start={() => {
          const wave = canvas2d(cv, (s: { x: number; amp: number }, ctx) => {
            ctx.clearRect(0, 0, 320, 90); ctx.fillStyle = "currentColor"
            ctx.beginPath(); ctx.arc(s.x, 45 + s.amp * Math.sin(s.x / 20), 10, 0, 7); ctx.fill()
          }, { x: 16, amp: 0 })
          wave.draw()
          return playTarget(wave, { x: [16, 304], amp: [0, 24] }, { duration: 1600, iterations: Infinity, direction: "alternate", easing: "in-out" })
        }}>{cv}</Stage>
      },
    },
    circle: {
      code: `usePageTransitions(circle)    // the new page opens as a circle from the last pressed point
animate(page, circle.frames("in", "forward", false, 32), { duration: 700 })`,
      run: () => <PageStage variant={() => circle} />,
    },
    clipAt: {
      code: `clipAt(0.5, { shape: "circle" })    // "circle(…% at 50% 50%)"
box.style.clipPath = clipAt(progress, { shape: "diamond" })`,
      play: { options: [{ key: "shape", label: "Biçim", default: "circle", options: ["circle", "wipe", "diamond", "curtain", "blinds", "inset"] }] },
      run: (p: { values: { shape: string } }) => {
        const t = signal(60)
        const box = el(<div class="sc-ex-motion-a-card">Acme</div>)
        effect(() => { box.style.clipPath = clipAt(t() / 100, { shape: p.values.shape as never }) })
        let run: Playback | null = null
        onCleanup(() => run?.cancel())
        const play = () => { run?.cancel(); run = animateValue(0, 100, { duration: 1200, easing: "in-out", onUpdate: (v) => t.set(v) }) }
        return <div class="sc-ex-motion-a"><div class="sc-ex-motion-a-stage">{box}</div>
          <Row><Range value={t} onChange={(v) => t.set(v)} label="İlerleme" /><Button size="sm" variant="secondary" onClick={play}>Oynat</Button></Row>
          <Out label="clipAt" value={() => clipAt(t() / 100, { shape: p.values.shape as never })} /></div>
      },
    },
    clipFrames: {
      code: `animate(box, clipFrames({ shape: "diamond" }), { duration: 800, easing: "in-out" })
clipFrames({ shape: "wipe", hide: true })   // the same, reversed`,
      play: { options: [{ key: "shape", label: "Biçim", default: "diamond", options: ["circle", "wipe", "diamond", "curtain", "blinds", "inset"] }, { key: "hide", label: "Gizle", default: false }] },
      run: (p: { values: { shape: string; hide: boolean } }) => {
        const box = el(<div class="sc-ex-motion-a-card">Acme</div>)
        const frames = () => clipFrames({ shape: p.values.shape as never, hide: p.values.hide })
        return <Stage start={() => animate(box, frames(), { duration: 800, easing: "in-out" })} extra={<Out label="ilk kare" value={() => String(frames()[0]!.clipPath)} />}>{box}</Stage>
      },
    },
    clipReveal: {
      code: `clipReveal(card, { shape: "circle", origin: { x: 20, y: 80 } })
clipReveal(panel, { shape: "blinds", count: 8, hide: true })`,
      play: { options: [{ key: "shape", label: "Biçim", default: "circle", options: ["circle", "wipe", "diamond", "curtain", "blinds", "inset"] }, { key: "hide", label: "Gizle", default: false }] },
      run: (p: { values: { shape: string; hide: boolean } }) => {
        const box = el(<div class="sc-ex-motion-a-card">Acme</div>)
        return <Stage start={() => clipReveal(box, { shape: p.values.shape as never, hide: p.values.hide, duration: 900, origin: { x: 20, y: 80 } })}>{box}</Stage>
      },
    },
    COMPOSITOR: {
      code: `COMPOSITOR.has("transform")   // true: runs off the main thread
COMPOSITOR.has("width")       // false: the engine warns in development`,
      play: { options: [{ key: "prop", label: "Özellik", default: "transform", options: ["transform", "opacity", "filter", "width", "backgroundColor"] }] },
      run: (p: { values: { prop: string } }) => {
        const box = el(<div class="sc-ex-motion-a-box" />)
        const FROM: Record<string, [string, string]> = { transform: ["translateX(0px)", "translateX(64px)"], opacity: ["0.2", "1"], filter: ["blur(6px)", "blur(0px)"], width: ["2.5rem", "6rem"], backgroundColor: ["transparent", "transparent"] }
        return <Stage start={() => { const [a, b] = FROM[p.values.prop]!; return p.values.prop === "backgroundColor" ? null : animate(box, [{ [p.values.prop]: a }, { [p.values.prop]: b }], { duration: 800, easing: "in-out", direction: "alternate", iterations: 2 }) }}
          extra={<><Out label="COMPOSITOR.has(özellik)" value={() => String(COMPOSITOR.has(p.values.prop))} /><Out label="özellik sayısı" value={String(COMPOSITOR.size)} /></>}>{box}</Stage>
      },
    },
    cssAnimations: {
      code: `const css = cssAnimations(panel)   // the CSS animations under panel
css.pause(); css.play(); css.rate(0.5)   // multiplied by the global speed`,
      run: () => {
        const root = el(<div class="sc-ex-motion-a-stage"><i class="sc-ex-motion-a-spin" /><i class="sc-ex-motion-a-spin" /><i class="sc-ex-motion-a-spin" /></div>)
        const found = signal(0)
        const css = () => { const c = cssAnimations(root); found.set(c.animations.length); return c }
        onCleanup(() => { const c = cssAnimations(root); c.rate(1); c.play() })
        return <div class="sc-ex-motion-a">{root}
          <Row><Button size="sm" onClick={() => css().pause()}>Duraklat</Button><Button size="sm" onClick={() => css().play()}>Sürdür</Button>
            <Button size="sm" variant="ghost" onClick={() => css().rate(0.4)}>Yavaş</Button><Button size="sm" variant="ghost" onClick={() => css().rate(1)}>Normal</Button>
            <Out label="bulunan" value={found} /></Row></div>
      },
    },
    cssVars: {
      code: `const t = cssVars(host, { "--p": "<percentage>", "--turn": "<number>" })
timeline().add(t, { "--p": ["0%", "100%"], "--turn": [0, 360] }, { duration: 1400 }).play()`,
      run: () => {
        const fill = el(<i />)
        const dial = el(<div class="sc-ex-motion-a-dial" />)
        const host = el(<div class="sc-ex-motion-a-hostcol"><div class="sc-ex-motion-a-meter">{fill}</div>{dial}</div>)
        return <Stage start={() => playTarget(cssVars(host, { "--p": "<percentage>", "--turn": "<number>" }), { "--p": ["0%", "100%"], "--turn": [0, 360] }, { duration: 1400, easing: "in-out" })}>{host}</Stage>
      },
    },
    cube: {
      code: `usePageTransitions(cube)    // two faces of a cube turn; RTL mirrors it
animate(page, cube.frames("in", "forward", false, 32), { duration: 800 })`,
      run: () => <PageStage variant={() => cube} />,
    },
    curtain: {
      code: `usePageTransitions(curtain)    // the new page opens from the middle out
animate(page, curtain.frames("in", "forward", false, 32), { duration: 700 })`,
      run: () => <PageStage variant={() => curtain} />,
    },
    defineDriver: {
      code: `defineDriver("gauge", {
  supports: (t) => t instanceof Gauge,
  apply: (g, tr) => g.show(tr.out[0]),    // write one sampled value
})
timeline().add(gauge, { level: [0, 100] }, { duration: 1200 }).play()`,
      run: () => {
        ensureGauge()
        const label = el(<b>0 %</b>)
        const box = el(<div class="sc-ex-motion-a-gauge"><i />{label}</div>)
        const g = new Gauge(box, label)
        return <Stage start={() => playTarget(g, { level: [0, 100] }, { duration: 1200, easing: "in-out" })} extra={<Out label="sürücü" value={() => driverFor(g).name} />}>{box}</Stage>
      },
    },
    defineEasing: {
      code: `defineEasing("acme-snap", (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2))
defineEasing("acme-soft", "cubic-bezier(.4, 0, .2, 1)")
animate(ball, frames, { easing: "acme-snap" })`,
      play: { options: [{ key: "name", label: "Eğri", default: "acme-snap", options: ["acme-snap", "acme-soft"] }] },
      run: (p: { values: { name: string } }) => {
        defineEasing("acme-snap", (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2))
        defineEasing("acme-soft", "cubic-bezier(.4, 0, .2, 1)")
        const l = lane()
        return <Stage start={() => animate(l.ball, l.frames(), { duration: 1000, easing: p.values.name })}
          extra={<><Out label="kayıtlı" value={() => String(easingNames().includes(p.values.name))} /><Out label="CSS" value={() => ease(p.values.name).css ?? "yalnız JS"} /></>}>{l.track}</Stage>
      },
    },
    defineMotion: {
      code: `defineMotion({
  keyframes: { "acme-wiggle": { frames: [...], defaults: { duration: 500 } } },
  easings: { "acme-punch": "cubic-bezier(.3, 1.6, .5, 1)" },
  presets: { "acme-wiggle-slow": { use: "acme-wiggle", duration: 1100 } },
})
animate(card, "acme-wiggle-slow")`,
      play: { options: [{ key: "name", label: "Ad", default: "acme-wiggle", options: ["acme-wiggle", "acme-wiggle-slow"] }, { key: "easing", label: "Eğri", default: "", options: [{ value: "", label: "kendi" }, { value: "acme-punch", label: "acme-punch" }] }] },
      run: (p: { values: { name: string; easing: string } }) => {
        ensureMotion()
        const box = el(<div class="sc-ex-motion-a-card">Acme</div>)
        return <Stage start={() => animate(box, p.values.name, p.values.easing ? { easing: p.values.easing } : {})}
          extra={<Out label="kayıtlı" value={() => keyframeNames().filter((n) => n.startsWith("acme-")).join(", ")} />}>{box}</Stage>
      },
    },
    definePageTransition: {
      code: `definePageTransition("acme-tilt", (side, dir) => side === "in"
  ? [{ opacity: 0, transform: "rotate(6deg) translateY(24px)" }, { opacity: 1, transform: "none" }]
  : [{ opacity: 1 }, { opacity: 0 }])
// { path: "/photos", meta: { transition: "acme-tilt" } }`,
      run: () => {
        definePageTransition("acme-tilt", (side, dir) => {
          const k = dir === "back" ? -1 : 1
          return side === "in" ? [{ opacity: 0, transform: `rotate(${6 * k}deg) translateY(${24 * k}px)` }, { opacity: 1, transform: "none" }] : [{ opacity: 1 }, { opacity: 0 }]
        })
        const v: PageVariant = { name: "acme-tilt", frames: (...a) => transitionFrames("acme-tilt", ...a) }
        return <PageStage variant={() => v} />
      },
    },
    defineTransition: {
      code: `defineTransition("acmePop", (o) => [{ opacity: 0, transform: "scale(.6)" }, { opacity: 1, transform: "none" }])
<If when={$open}><div transition:acmePop={{ duration: 300 }}>Acme</div></If>`,
      run: () => {
        defineTransition("acmePop", () => [{ opacity: 0, transform: "scale(.6)" }, { opacity: 1, transform: "none" }])
        const open = signal(true)
        return <div class="sc-ex-motion-a"><div class="sc-ex-motion-a-stage"><If when={open}><div class="sc-ex-motion-a-card" transition:acmePop={{ duration: 320 }}>Acme</div></If></div>
          <Row><Button size="sm" variant="secondary" onClick={() => open.update((x) => !x)}>{() => (open() ? "Kaldır" : "Göster")}</Button></Row></div>
      },
    },
    displace: {
      code: `displace(card, { from: 60, to: 0, frequency: 0.03, duration: 1200 })   // ripples that calm down`,
      play: { options: [{ key: "frequency", label: "Dalga sıklığı", default: 0.03, options: [0.01, 0.03, 0.08] }, { key: "from", label: "Güç", default: 60, options: [30, 60, 120] }] },
      run: (p: { values: { frequency: number; from: number } }) => {
        const card = el(<div class="sc-ex-motion-a-card">Acme</div>)
        const host = el(<div>{card}</div>)
        return <Stage start={() => {
          card.style.filter = ""; host.querySelectorAll("svg").forEach((s) => s.remove())
          return displace(card, { from: p.values.from, to: 0, frequency: p.values.frequency, duration: 1200 })
        }}>{host}</Stage>
      },
    },
    drag: {
      code: `<div use:drag={{ axis: "x", bounds: { left: -80, right: 80 }, snapBack: true, onMove: ({ x }) => ($x = x) }}>Sürükle</div>`,
      play: { options: [{ key: "axis", label: "Eksen", default: "both", options: ["x", "y", "both"] }, { key: "snapBack", label: "Geri dön", default: true }] },
      run: (p: { values: { axis: string; snapBack: boolean } }) => {
        const pos = signal("0, 0")
        return <div class="sc-ex-motion-a"><div class="sc-ex-motion-a-stage sc-ex-motion-a-stage-free">
          {() => <div class="sc-ex-motion-a-drag" tabindex="0" role="button" aria-label="Sürüklenebilir kutu"
            use:drag={{ axis: p.values.axis, bounds: { left: -80, right: 80, top: -24, bottom: 24 }, snapBack: p.values.snapBack, onMove: (m: { x: number; y: number }) => pos.set(`${Math.round(m.x)}, ${Math.round(m.y)}`) }}>Acme</div>}
          <p class="sc-ex-motion-a-hint">Kutuyu sürükle ya da odaktayken ok tuşlarına bas.</p></div>
          <Row><Out label="konum" value={pos} /></Row></div>
      },
    },
    drawPath: {
      code: `drawPath(svg.querySelectorAll("path"), { duration: 1200, stagger: 150 })
drawPath(path, { from: 1, to: 0 })   // erase`,
      play: { options: [{ key: "erase", label: "Sil", default: false }, { key: "gap", label: "Gecikme", default: 150, options: [0, 150, 400] }] },
      run: (p: { values: { erase: boolean; gap: number } }) => {
        const svg = el(<svg class="sc-ex-motion-a-svg" viewBox="0 0 120 60" aria-hidden="true"><path d="M10 32 L28 48 L58 12" /><circle cx="86" cy="30" r="22" /></svg>)
        return <Stage start={() => drawPath(svg.querySelectorAll("path, circle"), { from: p.values.erase ? 1 : 0, to: p.values.erase ? 0 : 1, duration: 1200, stagger: p.values.gap })}>{svg}</Stage>
      },
    },
    DRIVER: {
      code: `const meter = { el: progress, [DRIVER]: { name: "meter", supports: () => true, apply: (t, tr) => (t.el.value = tr.out[0]) } }
timeline().add(meter, { value: [0, 100] }, { duration: 1000 }).play()   // the target brings its own driver`,
      run: () => {
        const bar = el(<progress max="100" value="0" aria-label="İlerleme" />) as HTMLProgressElement
        const meter = { el: bar, [DRIVER]: { name: "meter", supports: () => true, apply: (t: { el: HTMLProgressElement }, tr: { out: Float64Array }) => { t.el.value = tr.out[0]! } } }
        return <Stage start={() => playTarget(meter, { value: [0, 100] }, { duration: 1000, easing: "in-out" })}
          extra={<><Out label="sürücü" value={() => driverFor(meter).name} /><Out label="öğe" value={() => driverFor(bar).name} /></>}>{bar}</Stage>
      },
    },
    driverFor: {
      code: `driverFor(element).name       // "dom": WAAPI first
driverFor({ x: 0 }).name      // "object": numbers written in place
driverFor(cssVars(el, {})).name   // "cssVar"`,
      play: { options: [{ key: "kind", label: "Hedef", default: "element", options: [{ value: "element", label: "Öğe" }, { value: "object", label: "Nesne" }, { value: "vars", label: "CSS değişkeni" }] }] },
      run: (p: { values: { kind: string } }) => {
        const box = el(<div class="sc-ex-motion-a-box" />)
        const x = signal(0)
        const target = (): unknown => (p.values.kind === "element" ? box : p.values.kind === "vars" ? cssVars(box, {}) : { x: 0 })
        return <Stage start={() => {
          const o = { x: 0 }
          return p.values.kind === "object" ? playTarget(o, { x: [0, 100] }, { duration: 900, onUpdate: () => x.set(Math.round(o.x)) }) : animate(box, [{ transform: "translateX(0px)" }, { transform: "translateX(48px)" }], { duration: 900 })
        }} extra={<><Out label="sürücü" value={() => driverFor(target()).name} /><Out label="yol" value={() => (driverFor(target()).native ? "WAAPI + saat" : "saat")} />{p.values.kind === "object" ? <Out label="x" value={x} /> : null}</>}>{box}</Stage>
      },
    },
    ease: {
      code: `const e = ease("spring")
e(0.5)         // eased progress at t = 0.5
e.css          // "linear(…)" for WAAPI, e.duration: the spring's own length`,
      play: { options: [{ key: "name", label: "Eğri", default: "spring", options: ["out", "in-out", "back", "spring", "bounce", "elastic"] }] },
      run: (p: { values: { name: string } }) => {
        const t = signal(0.5)
        const e = () => ease(p.values.name)
        const pts = () => Array.from({ length: 41 }, (_, i) => `${(i / 40) * 100},${(70 - e()(i / 40) * 50).toFixed(1)}`).join(" ")
        let run: Playback | null = null
        onCleanup(() => run?.cancel())
        const go = () => { run?.cancel(); run = animateValue(0, 1, { duration: 1400, easing: "linear", onUpdate: (v) => t.set(v) }) }
        const dot = el(<circle r="3.5" class="sc-ex-motion-a-fill" />)
        effect(() => { dot.setAttribute("cx", String(t() * 100)); dot.setAttribute("cy", String(70 - e()(t()) * 50)) })
        return <div class="sc-ex-motion-a"><div class="sc-ex-motion-a-stage">
          <svg class="sc-ex-motion-a-svg" viewBox="-4 0 108 80" role="img" aria-label="Eğri grafiği"><polyline class="sc-ex-motion-a-ghost" points="0,70 100,20" /><polyline points={pts} />{dot}</svg></div>
          <Row><Range value={() => t() * 100} onChange={(v) => t.set(v / 100)} label="Zaman" /><Button size="sm" variant="secondary" onClick={go}>Oynat</Button></Row>
          <Row><Out label="ease(t)" value={() => e()(t()).toFixed(3)} /><Out label="css" value={() => (e().css ?? "yalnız JS").slice(0, 48)} /><Out label="süre" value={() => (e().duration ? `${e().duration} ms` : "—")} /></Row></div>
      },
    },
    easingNames: {
      code: `easingNames()            // ["in", "out", "in-out", "back", "spring", …]
defineEasing("acme-snap", "cubic-bezier(.7, 0, .2, 1)")   // joins the list`,
      run: () => {
        const names = signal(easingNames())
        const add = () => { defineEasing("acme-snap", "cubic-bezier(.7, 0, .2, 1)"); names.set(easingNames()) }
        return <div class="sc-ex-motion-a"><div class="sc-ex-motion-a-chips">{() => names().map((n) => <code class="sc-ex-val">{n}</code>)}</div>
          <Row><Button size="sm" variant="secondary" onClick={add}>acme-snap ekle</Button><Out label="sayı" value={() => names().length} /></Row></div>
      },
    },
    Effect: {
      code: `const fx = new Effect(el, { opacity: [0, 1] }, { duration: 800, easing: "out" }, false)
fx.useNative      // true: a WAAPI animation on the compositor
fx.progressAt(400)   // eased progress at 400 ms`,
      run: () => {
        const ms = signal(400)
        const onEl = new Effect(document.createElement("div"), { opacity: [0, 1] }, { duration: 800, easing: "out" }, false)
        const onObj = new Effect({ x: 0 }, { x: [0, 100] }, { easing: "spring" }, false)
        const pr = (f: Effect) => { const v = f.progressAt(ms()); return v == null ? "—" : v.toFixed(3) }
        return <div class="sc-ex-motion-a"><Row><Range value={ms} onChange={(v) => ms.set(v)} min={0} max={1200} step={10} label="Zaman (ms)" /><Out label="zaman" value={() => `${ms()} ms`} /></Row>
          <Row><Out label="öğe: yol" value={onEl.useNative ? "WAAPI" : "saat"} /><Out label="süre" value={`${onEl.duration} ms`} /><Out label="ilerleme" value={() => pr(onEl)} /></Row>
          <Row><Out label="nesne: yol" value={onObj.useNative ? "WAAPI" : "saat"} /><Out label="süre" value={`${onObj.duration} ms`} /><Out label="ilerleme" value={() => pr(onObj)} /></Row></div>
      },
    },
    filterBlur: {
      code: `filterBlur(title, { from: 16, axis: "x", duration: 800 })   // a motion blur settling to sharp`,
      play: { options: [{ key: "axis", label: "Eksen", default: "x", options: ["both", "x", "y"] }, { key: "from", label: "Bulanıklık", default: 16, options: [8, 16, 32] }] },
      run: (p: { values: { axis: string; from: number } }) => {
        const title = el(<h3>Acme</h3>)
        const host = el(<div>{title}</div>)
        return <Stage start={() => { title.style.filter = ""; host.querySelectorAll("svg").forEach((s) => s.remove()); return filterBlur(title, { from: p.values.from, axis: p.values.axis as "x", duration: 900 }) }}>{host}</Stage>
      },
    },
    flatten: {
      code: `const polys = flatten("M0 40 C 30 -10 70 90 100 40", 12)
polys[0].pts    // [x0, y0, x1, y1, …] curves as 12 straight steps`,
      play: { options: [{ key: "steps", label: "Adım", default: 8, options: [2, 8, 24] }] },
      run: (p: { values: { steps: number } }) => {
        const d = "M4 40 C 30 -10 70 90 96 40"
        const polys = () => flatten(d, p.values.steps)
        const pts = () => polys().map((q) => q.pts.reduce((s, v, i) => s + (i % 2 ? `,${v.toFixed(1)} ` : v.toFixed(1)), "")).join(" ")
        return <div class="sc-ex-motion-a"><div class="sc-ex-motion-a-stage"><svg class="sc-ex-motion-a-svg" viewBox="0 -10 100 70" aria-hidden="true"><path class="sc-ex-motion-a-ghost" d={d} /><polyline points={pts} /></svg></div>
          <Row><Out label="alt yol" value={() => polys().length} /><Out label="nokta" value={() => polys()[0]!.pts.length / 2} /></Row></div>
      },
    },
    flip: {
      code: `flip(Array.from(list.children), () => list.append(...shuffled))   // First, mutate, Last, Invert, Play`,
      run: () => {
        const list = el(<ul class="sc-ex-motion-a-flip">{["Acme", "Ada", "Bora", "Cem", "Defne", "Ece"].map((n) => <li>{n}</li>)}</ul>)
        const items = () => Array.from(list.children)
        queueMicrotask(() => flip(items(), () => undefined))
        const shuffle = () => { const a = items(); a.sort(() => Math.random() - 0.5); flip(a, () => list.append(...a), { duration: 420 }) }
        return <div class="sc-ex-motion-a"><div class="sc-ex-motion-a-stage">{list}</div><Row><Button size="sm" variant="secondary" onClick={shuffle}>Karıştır</Button></Row></div>
      },
    },
    flipPage: {
      code: `usePageTransitions(flipPage)    // "flip": the old page turns away, the new one is its back side
animate(page, flipPage.frames("in", "forward", false, 32), { duration: 800 })`,
      run: () => <PageStage variant={() => flipPage} />,
    },
    followPath: {
      code: `followPath(arrow, "M10 50 C 40 -10 80 110 110 50", { rotate: true, duration: 2400, trail })`,
      play: { options: [{ key: "rotate", label: "Yöne dön", default: true }, { key: "trail", label: "İz", default: true }] },
      run: (p: { values: { rotate: boolean; trail: boolean } }) => {
        const d = "M12 50 C 40 -10 80 110 108 50"
        const trail = el(<path d={d} />)
        const arrow = el(<polygon class="sc-ex-motion-a-fill" points="-6,-5 8,0 -6,5" />)
        const svg = el(<svg class="sc-ex-motion-a-svg" viewBox="0 -10 120 120" aria-hidden="true"><path class="sc-ex-motion-a-ghost" d={d} />{trail}{arrow}</svg>)
        return <Stage start={() => { trail.style.display = p.values.trail ? "" : "none"; return followPath(arrow, d, { rotate: p.values.rotate, duration: 2400, trail: p.values.trail ? trail : undefined as never }) }}>{svg}</Stage>
      },
    },
    frame: {
      code: `frame((t) => console.log("next frame at", t))   // returns a cancel function`,
      run: () => {
        const lines = signal<string[]>([])
        let n = 0
        const go = () => { const from = performance.now(); frame((t) => lines.update((l) => [...l.slice(-3), `${++n}. kare: saat ${t.toFixed(0)} ms, bekleme ${(performance.now() - from).toFixed(0)} ms`])) }
        return <Row><Button size="sm" onClick={go}>Bir sonraki kareyi iste</Button><Log lines={lines} /></Row>
      },
    },
    frameLoop: {
      code: `const stop = frameLoop((dt) => { x = (x + dt * 0.1) % width; dot.style.transform = "translateX(" + x + "px)" })`,
      run: () => {
        const l = lane()
        const on = signal(true), frames = signal(0), last = signal(0)
        let stop: (() => void) | null = null, x = 0
        const run = () => {
          stop?.()
          stop = frameLoop((dt) => {
            const w = l.track.clientWidth - l.ball.offsetWidth
            x = (x + dt * 0.12) % Math.max(1, w)
            l.ball.style.transform = `translateX(${(rtlOf(l.track) ? -x : x).toFixed(1)}px)`
            frames.update((n) => n + 1); last.set(dt)
          })
        }
        queueMicrotask(run)
        onCleanup(() => stop?.())
        const toggle = () => { if (on()) { stop?.(); stop = null } else run(); on.update((v) => !v) }
        return <div class="sc-ex-motion-a"><div class="sc-ex-motion-a-stage">{l.track}</div>
          <Row><Button size="sm" variant="secondary" onClick={toggle}>{() => (on() ? "Durdur" : "Başlat")}</Button><Out label="kare" value={frames} /><Out label="dt" value={() => `${last().toFixed(1)} ms`} /></Row></div>
      },
    },
    frameMonitor: {
      code: `const m = frameMonitor()
m.fps(); m.frames(); m.drops(); m.longTasks()   // reactive readouts
m.stop()`,
      run: () => {
        const m = frameMonitor()
        onCleanup(() => m.stop())
        const load = () => { const t = performance.now(); while (performance.now() - t < 120) { /* a long task on purpose */ } }
        return <div class="sc-ex-motion-a"><Row><Out label="fps" value={() => m.fps()} /><Out label="kare" value={() => m.frames()} /><Out label="düşen" value={() => m.drops()} /><Out label="uzun görev" value={() => m.longTasks()} /><Out label="en uzun" value={() => `${m.longest()} ms`} /></Row>
          <Row><Button size="sm" variant="secondary" onClick={load}>120 ms yük bindir</Button><Button size="sm" variant="ghost" onClick={() => m.reset()}>Sıfırla</Button></Row></div>
      },
    },
    getKeyframes: {
      code: `keyframes("acme-rise", { opacity: [0, 1], transform: ["translateY(24px)", "none"] }, { duration: 420 })
getKeyframes("acme-rise")?.defaults   // { duration: 420, easing: "expo" }
getKeyframes("missing")               // null`,
      play: { options: [{ key: "name", label: "Ad", default: "acme-rise", options: ["acme-rise", "acme-drop", "yok-boyle-bir-ad"] }] },
      run: (p: { values: { name: string } }) => {
        ensureAcme()
        const box = el(<div class="sc-ex-motion-a-card">Acme</div>)
        const def = () => getKeyframes(p.values.name)
        return <Stage start={() => (def() ? animate(box, p.values.name) : null)} extra={<><Out label="bulundu" value={() => String(!!def())} /><Out label="varsayılan" value={() => (def() ? JSON.stringify(def()!.defaults) : "null")} /></>}>{box}</Stage>
      },
    },
    goo: {
      code: `const off = goo(host, { blur: 10 })   // the children melt together where they meet
off()                                  // remove the filter`,
      play: { options: [{ key: "blur", label: "Erime", default: 10, options: [5, 10, 16] }] },
      run: (p: { values: { blur: number } }) => {
        const a = el(<i />), b = el(<i />)
        const host = el(<div class="sc-ex-motion-a-goo">{a}{b}</div>)
        return <Stage start={() => {
          const off = goo(host, { blur: p.values.blur })
          const run = animate(b, [{ transform: "translateX(80px)" }, { transform: "translateX(-46px)" }], { duration: 1400, easing: "in-out", direction: "alternate", iterations: Infinity })
          return () => { run.cancel(); off() }
        }}>{host}</Stage>
      },
    },
    hoverParallax: {
      code: `<div use:hoverParallax={{ depth: 16, tilt: 6 }}>
  <i data-depth="0.4" /><i data-depth="1" />
</div>`,
      play: { options: [{ key: "depth", label: "Derinlik", default: 16, options: [8, 16, 28] }, { key: "tilt", label: "Eğim", default: 6, options: [0, 6, 12] }] },
      run: (p: { values: { depth: number; tilt: number } }) => <div class="sc-ex-motion-a"><div class="sc-ex-motion-a-stage">
        {() => <div class="sc-ex-motion-a-parallax" use:hoverParallax={{ depth: p.values.depth, tilt: p.values.tilt }}><i data-depth="0.4" /><i data-depth="1" /><i data-depth="0.7" /></div>}
        <p class="sc-ex-motion-a-hint">İmleci kartın üzerinde gezdir; katmanlar derinliğine göre kayar, bırakınca yayla yerine döner.</p></div></div>,
    },
    inView: {
      code: `<div use:inView={{ once: false, enter: (el) => animate(el, frames), leave: (el) => … }}>Satır</div>`,
      play: { options: [{ key: "once", label: "Bir kez", default: false }] },
      run: (p: { values: { once: boolean } }) => {
        const seen = signal(0)
        return <div class="sc-ex-motion-a"><div class="sc-ex-motion-a-stage">
          {() => <div class="sc-ex-motion-a-scroll" tabindex="0" aria-label="Kaydırılabilir liste">{Array.from({ length: 8 }, (_, i) =>
            <div use:inView={{ once: p.values.once, rootMargin: "0px", enter: (e: Element) => { seen.update((n) => n + 1); animate(e, [{ opacity: 0.2, transform: "translateX(-12px)" }, { opacity: 1, transform: "none" }], { duration: 350, easing: "out" }) } }}>Satır {i + 1}</div>)}</div>}
        </div><Row><Out label="görünme sayısı" value={seen} /></Row></div>
      },
    },
    installFlip: {
      code: `installFlip()    // <For animate> now glides rows to their new place
<For each={$items} key="id" animate>{(it) => <li>{it().name}</li>}</For>`,
      run: () => {
        installFlip()
        const items = signal([{ id: 1, name: "Acme" }, { id: 2, name: "Ada" }, { id: 3, name: "Bora" }, { id: 4, name: "Cem" }])
        const shuffle = () => items.update((l) => [...l].sort(() => Math.random() - 0.5))
        const add = () => items.update((l) => [...l, { id: Date.now(), name: `Yeni ${l.length + 1}` }])
        return <div class="sc-ex-motion-a"><div class="sc-ex-motion-a-stage"><ul class="sc-ex-motion-a-flip"><For each={items} key="id" animate>{(it: () => { name: string }) => <li>{it().name}</li>}</For></ul></div>
          <Row><Button size="sm" variant="secondary" onClick={shuffle}>Karıştır</Button><Button size="sm" variant="ghost" onClick={add}>Ekle</Button></Row></div>
      },
    },
    installPresets: {
      code: `const presets = installPresets()    // fadeUp, pop, shake, spin, …
animate(card, "pop")                // by name, anywhere`,
      play: { options: [{ key: "name", label: "Ad", default: "pop", options: ["fadeUp", "pop", "shake", "wobble", "bounceIn", "flipIn", "blurIn", "zoomIn"] }] },
      run: (p: { values: { name: string } }) => {
        const names = Object.keys(installPresets())
        const box = el(<div class="sc-ex-motion-a-card">Acme</div>)
        return <Stage start={() => animate(box, p.values.name)} extra={<Out label="kayıtlı hazır" value={names.length} />}>{box}</Stage>
      },
    },
    installTransitions: {
      code: `installTransitions()    // fade, slide, scale, blur and fly as WAAPI transitions
<If when={$open}><div transition:blur={{ amount: 10 }}>Acme</div></If>`,
      play: { options: [{ key: "kind", label: "Geçiş", default: "blur", options: ["blur", "fly"] }] },
      run: (p: { values: { kind: string } }) => {
        installTransitions()
        const open = signal(true)
        return <div class="sc-ex-motion-a"><div class="sc-ex-motion-a-stage">{() => p.values.kind === "blur"
          ? <If when={open}><div class="sc-ex-motion-a-card" transition:blur={{ amount: 10, duration: 400 }}>Acme</div></If>
          : <If when={open}><div class="sc-ex-motion-a-card" transition:fly={{ y: 32, duration: 400 }}>Acme</div></If>}</div>
          <Row><Button size="sm" variant="secondary" onClick={() => open.update((x) => !x)}>{() => (open() ? "Kaldır" : "Göster")}</Button></Row></div>
      },
    },
    interpolatePath: {
      code: `const mix = interpolatePath(starD, circleD, { points: 72 })
path.setAttribute("d", mix(0.5))    // halfway, even with different command lists`,
      play: { options: [{ key: "points", label: "Nokta", default: 72, options: [12, 72, 160] }] },
      run: (p: { values: { points: number } }) => {
        const star = "M50 6 L61 38 L95 38 L67 58 L78 92 L50 71 L22 92 L33 58 L5 38 L39 38 Z"
        const circle0 = "M50 8 A42 42 0 1 1 49.9 8 Z"
        const t = signal(40)
        const path = el(<path />)
        effect(() => { path.setAttribute("d", interpolatePath(star, circle0, { points: p.values.points })(t() / 100)) })
        let run: Playback | null = null
        onCleanup(() => run?.cancel())
        const go = () => { run?.cancel(); run = animateValue(0, 100, { duration: 1200, easing: "in-out", onUpdate: (v) => t.set(v) }) }
        return <div class="sc-ex-motion-a"><div class="sc-ex-motion-a-stage"><svg class="sc-ex-motion-a-svg" viewBox="0 0 100 100" aria-hidden="true">{path}</svg></div>
          <Row><Range value={t} onChange={(v) => t.set(v)} label="Yıldızdan daireye" /><Button size="sm" variant="secondary" onClick={go}>Oynat</Button><Out label="t" value={() => (t() / 100).toFixed(2)} /></Row></div>
      },
    },
    keyframeNames: {
      code: `keyframeNames()    // ["acme-rise", "acme-drop", …]: every registered keyframe and preset
keyframes("acme-extra", { opacity: [0, 1] })`,
      run: () => {
        ensureAcme()
        const names = signal(keyframeNames())
        const add = () => { keyframes("acme-extra", { opacity: [0, 1] }); names.set(keyframeNames()) }
        return <div class="sc-ex-motion-a"><div class="sc-ex-motion-a-chips">{() => names().map((n) => <code class="sc-ex-val">{n}</code>)}</div>
          <Row><Button size="sm" variant="secondary" onClick={add}>acme-extra ekle</Button><Out label="sayı" value={() => names().length} /></Row></div>
      },
    },
    keyframes: {
      code: `keyframes("acme-drop", [{ transform: "translateY(-40px)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 600, easing: "bounce" })
animate(card, "acme-drop")`,
      play: { options: [{ key: "easing", label: "Eğri", default: "", options: [{ value: "", label: "kayıtlı" }, { value: "spring", label: "spring" }, { value: "out", label: "out" }] }] },
      run: (p: { values: { easing: string } }) => {
        ensureAcme()
        const box = el(<div class="sc-ex-motion-a-card">Acme</div>)
        return <Stage start={() => animate(box, "acme-drop", p.values.easing ? { easing: p.values.easing } : {})}>{box}</Stage>
      },
    },
    keyframesCss: {
      code: `keyframesCss({ names: ["acme-rise"] })    // @keyframes hm-acme-rise { … } .hm-anim-acme-rise { … }
// node tools/gen-motion-css.js <module> out.css --presets`,
      play: { options: [{ key: "name", label: "Ad", default: "acme-rise", options: ["acme-rise", "acme-drop"] }, { key: "prefix", label: "Önek", default: "hm-", options: ["hm-", "acme-"] }] },
      run: (p: { values: { name: string; prefix: string } }) => {
        ensureAcme()
        return <pre class="sc-ex-motion-a-pre">{() => keyframesCss({ names: [p.values.name], prefix: p.values.prefix })}</pre>
      },
    },
    magnet: {
      code: `<button use:magnet={{ strength: 0.3 }}>Yaklaş</button>`,
      play: { options: [{ key: "strength", label: "Çekim", default: 0.3, options: [0.15, 0.3, 0.6] }] },
      run: (p: { values: { strength: number } }) => <div class="sc-ex-motion-a"><div class="sc-ex-motion-a-stage sc-ex-motion-a-stage-free">
        {() => <Button variant="primary" use:magnet={{ strength: p.values.strength }}>Yaklaş</Button>}
        <p class="sc-ex-motion-a-hint">İmleci düğmeye yaklaştır: düğme imlece doğru çekilir, ayrılınca yaylanarak yerine döner.</p></div></div>,
    },
    MORPH_ICONS: {
      code: `Object.keys(MORPH_ICONS)    // play, pause, menu, close, plus, check, minus
morphIcon(path, "pause")      // any icon tweens into any other`,
      run: () => {
        const path = el(<path d={MORPH_ICONS.play} />)
        const big = el(<span class="sc-ex-motion-a-icon sc-ex-motion-a-icon-big"><svg viewBox="0 0 24 24" aria-hidden="true">{path}</svg></span>)
        const name = signal("play")
        let run: Playback | null = null
        onCleanup(() => run?.cancel())
        const pick = (n: keyof typeof MORPH_ICONS) => { name.set(n); run?.cancel(); run = morphIcon(path, n) }
        return <div class="sc-ex-motion-a"><div class="sc-ex-motion-a-stage">{big}
          <div class="sc-ex-motion-a-icons">{Object.entries(MORPH_ICONS).map(([n, d]) => <Button size="sm" variant="ghost" aria-label={n} onClick={() => pick(n as keyof typeof MORPH_ICONS)}><span class="sc-ex-motion-a-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d={d} /></svg></span></Button>)}</div></div>
          <Row><Out label="şimdiki" value={name} /></Row></div>
      },
    },
    MOTION_DEFAULTS: {
      code: `MOTION_DEFAULTS    // { speed: 1, reduce: "system", duration: 240, easing: "out", slowMo: 1, character: "default" }
animate(card, frames, { duration: MOTION_DEFAULTS.duration })`,
      run: () => {
        const l = lane()
        return <Stage start={() => animate(l.ball, l.frames(), { duration: MOTION_DEFAULTS.duration * 4, easing: MOTION_DEFAULTS.easing })}
          extra={<>{Object.entries(MOTION_DEFAULTS).map(([k, v]) => <Out label={k} value={String(v)} />)}</>}>{l.track}</Stage>
      },
    },
    PAGE_VARIANTS: {
      code: `PAGE_VARIANTS.map((v) => v.name)    // circle, wipe, stack, cube, flip, zoom-through, curtain, blinds, pixel, morph
usePageTransitions(...PAGE_VARIANTS)`,
      run: () => {
        const sel = signal(PAGE_VARIANTS[0]!.name)
        return <PageStage variant={() => PAGE_VARIANTS.find((v) => v.name === sel())!}
          pick={<Segmented value={sel} onChange={(v: string) => sel.set(v)} options={PAGE_VARIANTS.map((v) => v.name)} aria-label="Geçiş türü" />} />
      },
    },
    Playback: {
      code: `const pb = animate(box, { transform: ["translateX(0px)", "translateX(160px)"] }, { duration: 2400, autoplay: false })
pb.play(); pb.pause(); pb.reverse(); pb.seek(1200); pb.playbackRate = 2
await pb.finished`,
      run: () => {
        const l = lane()
        const pb = animate(l.ball, l.frames(), { duration: 2400, easing: "linear", autoplay: false })
        onCleanup(() => pb.cancel())
        const rate = signal(1)
        const play = () => { if (pb.progress() >= 1) pb.seek(0); pb.play() }
        return <div class="sc-ex-motion-a"><div class="sc-ex-motion-a-stage">{l.track}</div>
          <Row><Button size="sm" onClick={play}>Oynat</Button><Button size="sm" variant="secondary" onClick={() => pb.pause()}>Duraklat</Button><Button size="sm" variant="secondary" onClick={() => pb.reverse()}>Ters</Button>
            <Button size="sm" variant="ghost" onClick={() => pb.seek(0)}>Başa</Button><Button size="sm" variant="ghost" onClick={() => { rate.update((r) => (r === 1 ? 2 : 1)); pb.playbackRate = rate() }}>{() => `Hız ×${rate()}`}</Button></Row>
          <Row><Out label="ilerleme" value={() => `${Math.round(pb.progress() * 100)} %`} /><Out label="süre" value={`${pb.duration} ms`} /><Out label="Playback" value={String(pb instanceof Playback)} /></Row></div>
      },
    },
    PRESETS: {
      code: `const [frames, timing] = PRESETS.shake    // [{ transform: […] }, { duration: 480, easing: "linear" }]
animate(card, frames, timing)`,
      play: { options: [{ key: "name", label: "Hazır", default: "shake", options: ["fadeUp", "pop", "shake", "wobble", "bounceIn", "flipIn", "blurIn", "pulse"] }] },
      run: (p: { values: { name: keyof typeof PRESETS } }) => {
        const box = el(<div class="sc-ex-motion-a-card">Acme</div>)
        return <Stage start={() => { const [frames, timing] = PRESETS[p.values.name] as unknown as [never, Record<string, unknown>]; return animate(box, frames, { ...timing, iterations: timing.iterations === Infinity ? 3 : 1 }) }}
          extra={<Out label="süre" value={() => `${(PRESETS[p.values.name][1] as { duration?: number }).duration ?? "yayın"} ms`} />}>{box}</Stage>
      },
    },
    Track: {
      code: `const [raw] = normalize({ opacity: [0, 1] })
const track = new Track(raw, () => 0)
track.sample(0.5); track.out[0]    // 0.5`,
      play: { options: [{ key: "prop", label: "Özellik", default: "opacity", options: [{ value: "opacity", label: "opacity" }, { value: "transform", label: "transform" }] }] },
      run: (p: { values: { prop: string } }) => {
        const t = signal(50)
        const box = el(<div class="sc-ex-motion-a-box" />)
        const track = () => new Track(normalize(p.values.prop === "opacity" ? { opacity: [0.1, 1] } : { transform: ["translateX(0px) rotate(0deg)", "translateX(96px) rotate(90deg)"] })[0]!, () => 0)
        const text = signal("")
        effect(() => { const tr = track(); tr.sample(t() / 100); const v = tr.text(); text.set(v); box.style.opacity = ""; box.style.transform = ""; box.style.setProperty(tr.prop, v) })
        return <div class="sc-ex-motion-a"><div class="sc-ex-motion-a-stage">{box}</div>
          <Row><Range value={t} onChange={(v) => t.set(v)} label="İlerleme" /><Out label="text()" value={text} /></Row></div>
      },
    },
  },
})
