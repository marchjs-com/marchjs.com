// API examples of hadi-march/motion, part three (resample … zoomThrough): clock, colour and path maths, morphs, page transitions, gestures, springs.
// page transition variants, gestures, springs and tweens. Layout and rules: tools/api-examples.js.
// Every animation runs on the motion engine itself, so the global speed, "Stop all" and reduced motion reach it.
import { signal, effect, onCleanup } from "hadi-march";
import { Button, Segmented } from "hadi-march/ui";
import {
  animate, timeline, stagger, spring, tween, track, motion, installPresets, MORPH_ICONS, flipPage, cube, circle,
  morphPage, pixelDissolve, stack, wipe, zoomThrough,
  measure, mutate, nextFrame, onFrame, yieldToMain, mixColor, parseColor, normalize, preset, registerVar, steps, springEase,
  toLinear, supportsLinear, reducedMotion, setReducedMotion, parsePath, pathLength, pathSampler, resample, toD,
  morph, morphBack, morphIcon, morphPath, shapeMorph, shapePolygon, stateMorph, pointerDrag, scrollProgress,
  transitionFrames, resolveTransition, navDirection, usePageTransitions, viewTransition, webgl,
  type Playback, type ShapeName,
} from "hadi-march/motion";
import { examples } from "./types.ts";
import { Out, Log, Row } from "./_kit.tsx";
import { hold, tok, last, num, Pick, Swap, Replay, D, type Dir } from "./_motion-kit.tsx";
export { default as SIG } from "./motion-c.sig.gen.ts";

export default examples({
  "hadi-march/motion": {
    resample: {
      code: `const { pts, closed } = resample("M50 8A42 42 0 1 1 49.9 8Z", 12)
// pts = [x0, y0, x1, y1, …]: 12 evenly spaced points on the outline`,
      run: () => {
        const n = signal("12"), which = signal("star")
        const r = () => resample(D[which() as keyof typeof D]!, Number(n()))
        return <div class="sc-ex-motion-b-stack">
          <Pick sig={which} label="Şekil" options={[["star", "yıldız"], ["circle", "daire"], ["heart", "kalp"]]} />
          <Pick sig={n} label="Nokta sayısı" options={["8", "12", "32"]} />
          <div class="sc-ex-motion-b-stage"><svg class="sc-ex-motion-b-svg" style="max-inline-size:9rem" viewBox="0 0 100 100" aria-hidden="true">
            <path class="sc-ex-motion-b-ink sc-ex-motion-b-ink-dim" d={() => D[which() as keyof typeof D]!} />
            {() => { const p = r().pts; return Array.from({ length: p.length / 2 }, (_, i) => <circle class="sc-ex-motion-b-mark" r="2" cx={p[i * 2]} cy={p[i * 2 + 1]} />) }}
          </svg></div>
          <Out label="nokta" value={() => r().pts.length / 2} />
        </div>
      },
    },
    resolveTransition: {
      code: `resolveTransition({ type: "fade" }, { meta: { transition: "slide" } }, null, "forward")
// → { type: "slide", duration: 240, easing: "out", distance: 32 }
// going back, the route that is left decides`,
      run: () => {
        const meta = signal("slide"), dir = signal("forward")
        const pick = (): unknown => meta() === "object" ? { type: "scale", duration: 500 } : meta() === "params" ? (p: Record<string, string>) => (p.id === "7" ? "scale" : "fade") : meta() === "off" ? false : "slide"
        const res = () => resolveTransition({ type: "fade" }, { meta: { transition: pick() }, params: { id: "7" } }, { meta: { transition: "scale" } }, dir() as Dir)
        return <div class="sc-ex-motion-b-stack">
          <Pick sig={meta} label="Rota ayarı" options={[["slide", "\"slide\""], ["object", "nesne"], ["params", "işlev"], ["off", "false"]]} />
          <Pick sig={dir} label="Yön" options={[["forward", "ileri"], ["back", "geri"]]} />
          <Out label="sonuç" value={() => JSON.stringify(res())} />
        </div>
      },
    },
    reveal: {
      code: `<h2 use:reveal>Başlık</h2>
<li use:reveal={{ delay: i * 80, duration: 500 }}>…</li>   // fades and rises once, when seen`,
      run: () => {
        const n = signal(0)
        return <div class="sc-ex-motion-b-stack">
          {() => { n(); return <div class="sc-ex-motion-b-stage">{[0, 1, 2].map((i) => <div class={"sc-ex-motion-b-box " + ["", "sc-ex-motion-b-box-b", "sc-ex-motion-b-box-g"][i]} use:reveal={{ delay: i * 120, duration: 600 }} />)}</div> }}
          <Row><Button variant="primary" onClick={() => n.update((v) => v + 1)}>Yeniden oynat</Button></Row>
        </div>
      },
    },
    ripple: {
      code: `<button use:ripple>Kaydet</button>
<div use:ripple={{ center: true, duration: 800 }} tabindex="0">…</div>`,
      run: () => {
        const mode = signal("press")
        return <div class="sc-ex-motion-b-stack">
          <Pick sig={mode} label="Başlangıç" options={[["press", "basılan nokta"], ["center", "ortadan"]]} />
          {() => { const o = { center: mode() === "center", duration: 700 }; return <div class="sc-ex-motion-b-stage">
            <button type="button" class="m-btn m-btn-primary" use:ripple={o}>Kaydet</button>
            <div class="sc-ex-motion-b-card sc-ex-motion-b-ripple" tabindex="0" role="button" use:ripple={o}>HADİ kartı</div>
          </div> }}
        </div>
      },
    },
    scrollProgress: {
      code: `const seen = scrollProgress(() => card)   // 0 when it enters the viewport … 1 when it leaves
<div style={{ inlineSize: seen() * 100 + "%" }} />`,
      run: () => {
        let card: HTMLElement, bar: HTMLElement
        const seen = scrollProgress(() => card ?? null)
        effect(() => { if (bar) bar.style.inlineSize = Math.round(seen() * 100) + "%" })
        return <div class="sc-ex-motion-b-stack">
          <div class="sc-ex-motion-b-stage"><div class="sc-ex-motion-b-card" ref={(el: HTMLElement) => { card = el }}>Bu kart</div></div>
          <div class="sc-ex-motion-b-meter" aria-hidden="true"><i ref={(el: HTMLElement) => { bar = el }} /></div>
          <Out label="geçiş" value={() => Math.round(seen() * 100) + "%"} />
          <p class="sc-apip-note">Sayfayı kaydırın: kart görünüm alanından geçerken değer 0'dan 1'e gider.</p>
        </div>
      },
    },
    setReducedMotion: {
      code: `setReducedMotion(true)     // force on (a user setting)
setReducedMotion(false)    // force off
setReducedMotion(null)     // follow the system again`,
      run: () => {
        const keep = hold()
        const mode = signal("null")
        const back = () => { setReducedMotion(null); motion.config({ reduce: motion.config().reduce }, { persist: false }) }
        onCleanup(back)
        let box: HTMLElement
        const set = (v: string) => { mode.set(v); setReducedMotion(v === "null" ? null : v === "true"); keep(animate(box, { transform: ["translateX(0px)", "translateX(80px)", "translateX(0px)"] }, { duration: 800, easing: "in-out" })) }
        return <div class="sc-ex-motion-b-stack">
          <div class="sc-ex-motion-b-stage"><div class="sc-ex-motion-b-box" ref={(el: HTMLElement) => { box = el }} /></div>
          <Segmented value={mode} onChange={set} aria-label="Hareketi azalt" options={[{ value: "true", label: "açık" }, { value: "false", label: "kapalı" }, { value: "null", label: "sistem" }]} />
          <Out label="reducedMotion()" value={() => String(reducedMotion())} />
        </div>
      },
    },
    shapeMorph: {
      code: `shapeMorph(el, "star")      // clip-path polygons with the same point count
shapeMorph(el, "blob", { duration: 900, easing: "spring" })`,
      run: () => {
        const keep = hold()
        const shape = signal("circle")
        let el: HTMLElement
        const go = (v: string) => { shape.set(v); keep(shapeMorph(el, v as ShapeName)) }
        const names = ["circle", "triangle", "hexagon", "star", "blob"]
        return <div class="sc-ex-motion-b-stack">
          <div class="sc-ex-motion-b-stage"><div class="sc-ex-motion-b-shape" style={"clip-path:" + shapePolygon("circle")} ref={(e: HTMLElement) => { el = e }} /></div>
          <Segmented value={shape} onChange={go} aria-label="Şekil" options={names.map((v) => ({ value: v, label: v }))} />
        </div>
      },
    },
    shapePolygon: {
      code: `shapePolygon("star")        // "polygon(50% 5%, …)": 60 points
shapePolygon("flower", 24)  // fewer points: a rougher outline`,
      run: () => {
        const n = signal("60")
        const names = ["circle", "triangle", "hexagon", "star", "flower"]
        return <div class="sc-ex-motion-b-stack">
          <Pick sig={n} label="Nokta sayısı" options={["6", "12", "60"]} />
          <div class="sc-ex-motion-b-shapes">{() => names.map((s) => <figure><div class="sc-ex-motion-b-shape" style={"clip-path:" + shapePolygon(s as ShapeName, Number(n()))} /><figcaption>{s}</figcaption></figure>)}</div>
        </div>
      },
    },
    spring: {
      code: `const target = signal(0)
const x = spring(() => target(), { stiffness: 170, damping: 14 })
<div style={{ transform: "translateX(" + x() + "%)" }} />   // velocity carries across changes`,
      run: () => {
        const target = signal(0), damp = signal("14")
        const x = spring(() => target(), { stiffness: 170, damping: Number(damp.peek()) })
        let pill: HTMLElement
        effect(() => { if (pill) pill.style.transform = "translateX(" + x() + "%)" })
        return <div class="sc-ex-motion-b-stack">
          <div class="sc-ex-motion-b-lane" aria-hidden="true"><i class="sc-ex-motion-b-pill" ref={(el: HTMLElement) => { pill = el }} /></div>
          <Row>
            <Button onClick={() => target.set(0)}>Başa</Button><Button onClick={() => target.set(150)}>Ortaya</Button><Button onClick={() => target.set(300)}>Sona</Button>
            <Out label="hareket ediyor" value={() => (x.moving() ? "evet" : "hayır")} />
          </Row>
        </div>
      },
    },
    springEase: {
      code: `const ease = springEase({ stiffness: 180, damping: 9 })
ease(0.3)          // progress at 30 % of its natural duration (may overshoot 1)
ease.duration      // natural duration in ms
animate(card, { transform: ["scale(.6)", "none"] }, { easing: ease })`,
      run: () => {
        const damp = signal("9")
        const keep = hold()
        const ease = () => springEase({ stiffness: 180, damping: Number(damp()) })
        const curve = () => { const e = ease(); return Array.from({ length: 41 }, (_, i) => (i * 2.4).toFixed(1) + "," + (70 - e(i / 40) * 55).toFixed(1)).join(" ") }
        const go = (box: HTMLElement) => keep(animate(box, { transform: ["translateX(0px)", "translateX(110px)"] }, { easing: ease() }), "box")
        return <div class="sc-ex-motion-b-stack">
          <Pick sig={damp} label="Sönümleme" options={["6", "9", "20"]} />
          <div class="sc-ex-motion-b-stage">
            <svg class="sc-ex-motion-b-svg" viewBox="0 0 100 80" aria-hidden="true"><polyline class="sc-ex-motion-b-ink" points={curve} /></svg>
            <div class="sc-ex-motion-b-box" ref={(el: HTMLElement) => { nextFrame(() => go(el)); effect(() => { damp(); nextFrame(() => go(el)) }) }} />
          </div>
          <Out label="doğal süre" value={() => ease().duration + " ms"} />
        </div>
      },
    },
    stack: {
      code: `usePageTransitions(stack)
// { path: "/detail", meta: { transition: "stack" } }    // the new page slides over the old; RTL mirrors`,
      run: () => <Swap mirror frames={(side, dir, rtl) => stack.frames(side, dir, rtl, 32)} />,
    },
    stagger: {
      code: `animate(dots, [{ opacity: 0, transform: "scale(.4)" }, { opacity: 1, transform: "none" }], {
  stagger: stagger(60, { from: "center", grid: [6, 3] }),
})`,
      run: () => {
        const from = signal("center"), keep = hold()
        const dots: HTMLElement[] = []
        const go = () => keep(animate(dots, [{ opacity: 0, transform: "scale(.4)" }, { opacity: 1, transform: "none" }], { duration: 400, easing: "out", stagger: stagger(60, { from: from.peek() as "center", grid: [6, 3] }) }))
        nextFrame(go)
        return <div class="sc-ex-motion-b-stack">
          <Pick sig={from} label="Başlangıç" options={[["start", "baştan"], ["center", "ortadan"], ["end", "sondan"], ["edges", "kenarlardan"]]} />
          <div class="sc-ex-motion-b-stage"><div class="sc-ex-motion-b-grid" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <i class="sc-ex-motion-b-dot" ref={(el: HTMLElement) => { dots[i] = el }} />)}</div></div>
          <Row><Button variant="primary" onClick={go}>Yeniden oynat</Button></Row>
        </div>
      },
    },
    stateMorph: {
      code: `stateMorph(button, "loading")     // narrows to a circle with a spinner
stateMorph(button, "success")     // a check is drawn
stateMorph(button, "error")       // a cross is drawn and it shakes
stateMorph(button, "idle")        // back`,
      run: () => {
        const result = signal("success")
        let btn: HTMLElement, busy = false
        const timers: ReturnType<typeof setTimeout>[] = []
        onCleanup(() => timers.forEach(clearTimeout))
        const save = () => {
          if (busy) return
          busy = true
          stateMorph(btn, "loading")
          timers.push(setTimeout(() => {
            stateMorph(btn, result.peek() as "success")
            timers.push(setTimeout(() => { stateMorph(btn, "idle"); busy = false }, 1500))
          }, 1200))
        }
        return <div class="sc-ex-motion-b-stack">
          <div class="sc-ex-motion-b-stage"><button type="button" class="m-btn m-btn-primary" ref={(el: HTMLElement) => { btn = el }} on:click={save}>Kaydet</button></div>
          <Pick sig={result} label="Sonuç" options={[["success", "başarılı"], ["error", "hata"]]} />
        </div>
      },
    },
    steps: {
      code: `const ease = steps(4)          // 4 jumps, jump at the end
ease(0.3)                      // 0.25
animate(el, { transform: [from, to] }, { easing: ease })`,
      run: () => {
        const n = signal("4"), pos = signal("end")
        const keep = hold()
        const e = () => steps(Number(n()), pos() as "end")
        return <div class="sc-ex-motion-b-stack">
          <Pick sig={n} label="Adım" options={["3", "4", "8"]} />
          <Pick sig={pos} label="Konum" options={["end", "start", "jump-both"]} />
          <Replay label="Oynat" run={(box) => keep(animate(box, { transform: ["translateX(0px)", "translateX(150px)"] }, { duration: 1200, easing: e() }))} />
          <Out label="0, .25, .5, .75, 1" value={() => [0, 0.25, 0.5, 0.75, 1].map((t) => +e()(t).toFixed(2)).join(" · ")} />
        </div>
      },
    },
    supportsLinear: {
      code: `if (supportsLinear()) animate(el, frames, { easing: "spring" })   // native CSS linear() curve
// without it the engine keeps a close cubic-bezier, still native`,
      run: () => <div class="sc-ex-motion-b-stack">
        <Out label="linear()" value={supportsLinear() ? "destekleniyor" : "desteklenmiyor"} />
        <Replay label="Yaylı oynat" run={(box, keep) => keep(animate(box, { transform: ["translateX(0px)", "translateX(120px)"] }, { easing: "spring" }))} />
      </div>,
    },
    swipe: {
      code: `<div use:swipe={{ threshold: 40, onSwipe: (dir) => go(dir) }}>…</div>
// dir: "left" | "right" | "up" | "down"`,
      run: () => {
        const keep = hold()
        const lines = signal<string[]>([])
        let mark: HTMLElement
        const onSwipe = (dir: string) => {
          lines.update((l) => last(l, "kaydırma: " + dir, 4))
          const v: Record<string, [number, number]> = { left: [-44, 0], right: [44, 0], up: [0, -30], down: [0, 30] }
          const [x, y] = v[dir]!
          keep(animate(mark, [{ transform: "translate(0px, 0px)" }, { transform: "translate(" + x + "px, " + y + "px)", offset: 0.4 }, { transform: "none" }], { duration: 600, easing: "out" }))
        }
        return <div class="sc-ex-motion-b-stack">
          <div class="sc-ex-motion-b-stage"><div class="sc-ex-motion-b-card" use:swipe={{ onSwipe }}><span class="sc-ex-motion-b-box" ref={(el: HTMLElement) => { mark = el }} style="inline-size:1.25rem;block-size:1.25rem" /></div></div>
          <Log lines={lines} label="Kaydırma yönleri" />
        </div>
      },
    },
    tilt: {
      code: `<div class="card" use:tilt={{ max: 12, perspective: 800 }}>…</div>   // follows the pointer, settles on leave`,
      run: () => {
        const max = signal("14")
        return <div class="sc-ex-motion-b-stack">
          <Pick sig={max} label="En çok açı" options={["6", "14", "24"]} />
          {() => <div class="sc-ex-motion-b-stage"><div class="sc-ex-motion-b-card" use:tilt={{ max: Number(max()) }}>İmleci gezdir</div></div>}
        </div>
      },
    },
    timeline: {
      code: `const tl = timeline({ defaults: { duration: 500, easing: "out" } })
  .add(a, { transform: ["none", "translateX(220%)"] })
  .add(b, { transform: ["none", "translateX(220%)"] }, { at: "-=300" })
  .add(c, { transform: ["none", "translateX(220%)"] }, { at: "-=300" })
tl.play()    // pause(), reverse(), seek(0), progress()`,
      run: () => {
        const prog = signal(0)
        const els: HTMLElement[] = []
        const cls = ["", "sc-ex-motion-b-box-b", "sc-ex-motion-b-box-g"]
        const keep = hold()
        const tl = timeline({ defaults: { duration: 500, easing: "out" }, onUpdate: (p: number) => prog.set(p) })
        nextFrame(() => {
          els.forEach((el, i) => tl.add(el, { transform: ["none", "translateX(220%)"] }, i ? { at: "-=300" } : {}))
          keep(tl)
        })
        const replay = () => { tl.seek(0); tl.play() }
        return <div class="sc-ex-motion-b-stack">
          <div class="sc-ex-motion-b-stage" style="justify-content:flex-start;flex-direction:column;align-items:flex-start">
            {cls.map((c, i) => <div class={"sc-ex-motion-b-box " + c} style="inline-size:1.75rem;block-size:1.75rem" ref={(el: HTMLElement) => { els[i] = el }} />)}
          </div>
          <Row>
            <Button variant="primary" onClick={replay}>Oynat</Button><Button variant="ghost" onClick={() => tl.pause()}>Duraklat</Button>
            <Button variant="ghost" onClick={() => tl.reverse()}>Ters çevir</Button><Out label="ilerleme" value={() => Math.round(prog() * 100) + "%"} />
          </Row>
        </div>
      },
    },
    toD: {
      code: `toD([10, 80, 50, 10, 90, 80], true)    // "M10 80L50 10L90 80Z"
toD(points, false)                      // open polyline`,
      run: () => {
        const n = signal("5"), closed = signal("true")
        const pts = () => Array.from({ length: Number(n()) }, (_, i) => { const a = (i / Number(n())) * Math.PI * 2 - Math.PI / 2; return [50 + 40 * Math.cos(a), 50 + 40 * Math.sin(a)] }).flat()
        const d = () => toD(pts(), closed() === "true")
        return <div class="sc-ex-motion-b-stack">
          <Pick sig={n} label="Nokta" options={["3", "5", "8"]} />
          <Pick sig={closed} label="Kapalı" options={[["true", "kapalı"], ["false", "açık"]]} />
          <div class="sc-ex-motion-b-stage"><svg class="sc-ex-motion-b-svg" style="max-inline-size:8rem" viewBox="0 0 100 100" aria-hidden="true"><path class="sc-ex-motion-b-ink" d={d} /></svg></div>
          <Out label="d" value={d} />
        </div>
      },
    },
    toLinear: {
      code: `const css = toLinear((t) => t * t * (3 - 2 * t), 12)   // "linear(0, 0.02 9%, …)"
animate(el, frames, { easing: css })`,
      run: () => {
        const fn = signal("smooth"), pts = signal("12")
        const keep = hold()
        const f = (t: number) => (fn() === "smooth" ? t * t * (3 - 2 * t) : Math.sin((t * Math.PI) / 2))
        const css = () => toLinear(f, Number(pts()))
        return <div class="sc-ex-motion-b-stack">
          <Pick sig={fn} label="İşlev" options={[["smooth", "yumuşak"], ["sine", "sinüs"]]} />
          <Pick sig={pts} label="Nokta" options={["6", "12", "48"]} />
          <Replay label="Oynat" run={(box) => keep(animate(box, { transform: ["translateX(0px)", "translateX(150px)"] }, { duration: 1100, easing: css() }))} />
          <p class="sc-ex-motion-b-code">{css}</p>
        </div>
      },
    },
    track: {
      code: `const target = signal([0, 0])
const pos = track(() => target(), { duration: 500, easing: "out" })   // a number or a vector
pos()   // [x, y] while it moves; pos.snap([0, 0]) jumps`,
      run: () => {
        const target = signal<number[]>([50, 50])
        const pos = track(() => target(), { duration: 600, easing: "out" })
        let dot: HTMLElement
        effect(() => { const [x, y] = pos(); if (dot) dot.style.transform = "translate(" + x + "%, " + y + "%)" })
        return <div class="sc-ex-motion-b-stack">
          <div class="sc-ex-motion-b-pad" role="button" tabindex="0" aria-label="İşaretçinin gideceği yeri seçin"
            on:pointerdown={(e: PointerEvent) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); target.set([Math.round(((e.clientX - r.left) / r.width) * 100), Math.round(((e.clientY - r.top) / r.height) * 100)]) }}>
            <i style="inset-inline-start:0;inset-block-start:0" ref={(el: HTMLElement) => { dot = el }} />
          </div>
          <Out label="konum" value={() => pos().map((v) => Math.round(v)).join(", ")} />
        </div>
      },
    },
    transitionFrames: {
      code: `transitionFrames("slide", "in", "forward")          // [{ opacity: 0, transform: "translateX(32px)" }, …]
transitionFrames("slide", "in", "forward", true)    // mirrored for right-to-left
transitionFrames("scale", "out", "back")`,
      run: () => {
        const type = signal("slide"), side = signal("in"), dir = signal("forward")
        const keep = hold()
        const frames = () => transitionFrames(type(), side() as "in", dir() as Dir)
        return <div class="sc-ex-motion-b-stack">
          <Pick sig={type} label="Tür" options={["fade", "slide", "scale"]} />
          <Pick sig={side} label="Taraf" options={[["in", "giren"], ["out", "çıkan"]]} />
          <Pick sig={dir} label="Yön" options={[["forward", "ileri"], ["back", "geri"]]} />
          <Replay label="Kareleri oynat" run={(box) => keep(animate(box, frames(), { duration: 600, easing: "out" }))} />
          <pre class="sc-ex-motion-b-code">{() => JSON.stringify(frames(), null, 1)}</pre>
        </div>
      },
    },
    tween: {
      code: `const target = signal(0)
const value = tween(() => target(), { duration: 700, easing: "easeOutCubic" })
<span>{Math.round(value())}</span>   // counts up to every new target`,
      run: () => {
        const target = signal(0)
        const value = tween(() => target(), { duration: 800 })
        let bar: HTMLElement
        effect(() => { if (bar) bar.style.inlineSize = value() + "%" })
        return <div class="sc-ex-motion-b-stack">
          <div class="sc-ex-motion-b-meter" aria-hidden="true"><i ref={(el: HTMLElement) => { bar = el }} /></div>
          <Row>
            <Button onClick={() => target.set(0)}>0</Button><Button onClick={() => target.set(40)}>40</Button><Button onClick={() => target.set(100)}>100</Button>
            <Out label="değer" value={() => Math.round(value())} />
          </Row>
        </div>
      },
    },
    usePageTransitions: {
      code: `usePageTransitions(cube, flipPage, circle)    // now routes can name them:
// { path: "/photos", meta: { transition: "cube" } }`,
      run: () => {
        const lines = signal<string[]>([])
        const register = () => {
          usePageTransitions(cube, flipPage, circle)
          for (const name of ["cube", "flip", "circle"]) lines.update((l) => last(l, name + " → " + resolveTransition({}, { meta: { transition: name } }, null, "forward").type, 5))
        }
        return <Row><Button variant="primary" onClick={register}>Kaydet ve çöz</Button><Log lines={lines} label="Kayıtlı geçişler" /></Row>
      },
    },
    viewTransition: {
      code: `await viewTransition(() => list.set(shuffled))   // old and new snapshots cross-fade on the compositor
// no support, reduced motion or "Stop all": the update simply runs`,
      run: () => {
        const items = signal([1, 2, 3, 4])
        const state = signal("—")
        const cls = ["", "sc-ex-motion-b-box-b", "sc-ex-motion-b-box-g", "sc-ex-motion-b-box-p"]
        const go = async () => { state.set("güncelleniyor"); await viewTransition(() => items.update((l) => [...l.slice(1), l[0]!])); state.set("tamam") }
        return <div class="sc-ex-motion-b-stack">
          <div class="sc-ex-motion-b-stage sc-ex-motion-b-vt">{() => items().map((n) => <div class={"sc-ex-motion-b-box " + cls[(n - 1) % 4]}>{n}</div>)}</div>
          <Row><Button variant="primary" onClick={go}>Kaydır</Button><Out label="durum" value={state} /></Row>
        </div>
      },
    },
    webgl: {
      code: `const scene = webgl(gl, program, { state: { uPhase: 0, uColor: orange }, draw: (g) => g.drawArrays(g.TRIANGLES, 0, 3) })
animate(scene, { uPhase: [0, 1], uColor: [orange, blue] }, { duration: 2400, iterations: Infinity, direction: "alternate" })
// every state field is a uniform; colours become vec4`,
      run: () => {
        const keep = hold()
        const canvas = <canvas class="sc-ex-motion-b-canvas" width="320" height="140" role="img" aria-label="WebGL ile çizilen, renk değiştiren degrade" /> as HTMLCanvasElement
        const gl = canvas.getContext("webgl")
        if (!gl) return <p class="m-muted">Bu tarayıcıda WebGL yok.</p>
        const shader = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s }
        const prog = gl.createProgram()!
        gl.attachShader(prog, shader(gl.VERTEX_SHADER, "attribute vec2 p; varying vec2 v; void main(){ v = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }"))
        gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, "precision mediump float; varying vec2 v; uniform float uPhase; uniform vec4 uColor; void main(){ float w = .5 + .5 * sin(6.2832 * (v.x * 1.5 + uPhase)); gl_FragColor = vec4(uColor.rgb * mix(.55, 1., w * v.y + (1. - v.y) * .3), 1.); }"))
        gl.linkProgram(prog); gl.useProgram(prog)
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
        const loc = gl.getAttribLocation(prog, "p")
        gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
        onCleanup(() => gl.getExtension("WEBGL_lose_context")?.loseContext())
        const a = tok("--m-brand-orange"), b = tok("--m-brand-blue")
        const scene = webgl(gl, prog, { state: { uPhase: 0, uColor: a }, draw: (g) => g.drawArrays(g.TRIANGLES, 0, 3) })
        scene.draw()
        const pb = keep(animate(scene as never, { uPhase: [0, 1], uColor: [a, b] }, { duration: 2400, iterations: Infinity, direction: "alternate", easing: "in-out" }))
        const paused = signal(false)
        return <div class="sc-ex-motion-b-stack">{canvas}<Row><Button onClick={() => { if (paused.peek()) pb.play(); else pb.pause(); paused.update((v) => !v) }}>{() => (paused() ? "Sürdür" : "Duraklat")}</Button></Row></div>
      },
    },
    wipe: {
      code: `usePageTransitions(wipe)
// { path: "/next", meta: { transition: "wipe" } }    // a straight wipe; back reverses, RTL mirrors`,
      run: () => <Swap mirror frames={(side, dir, rtl) => wipe.frames(side, dir, rtl, 32)} />,
    },
    yieldToMain: {
      code: `for (const chunk of chunks) {
  work(chunk)
  await yieldToMain()     // give the browser back between chunks: no long task
}`,
      run: () => {
        const longest = signal(0), busy = signal(false)
        const spin = (ms: number) => { const t = performance.now(); while (performance.now() - t < ms) { /* busy */ } }
        const run = async (yields: boolean) => {
          busy.set(true); longest.set(0)
          let worst = 0, t = performance.now()
          for (let i = 0; i < 24; i++) {
            spin(10)
            if (yields) { await yieldToMain(); worst = Math.max(worst, performance.now() - t); t = performance.now() }
          }
          if (!yields) worst = performance.now() - t
          longest.set(Math.round(worst)); busy.set(false)
        }
        return <Row>
          <Button disabled={busy} onClick={() => void run(false)}>Tek seferde çalış</Button>
          <Button variant="primary" disabled={busy} onClick={() => void run(true)}>Parça parça çalış</Button>
          <Out label="en uzun kesintisiz iş" value={() => longest() + " ms"} />
        </Row>
      },
    },
    zoomThrough: {
      code: `usePageTransitions(zoomThrough)
// { path: "/deep", meta: { transition: "zoom-through" } }   // the old page grows past you, the new one comes from far`,
      run: () => <Swap frames={(side, dir, rtl) => zoomThrough.frames(side, dir, rtl, 32)} />,
    },
  },
})
