// API examples of hadi-march/motion, part two (measure … registerVar): clock, colour and path maths, morphs, page transitions, gestures, springs.
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
export { default as SIG } from "./motion-b.sig.gen.ts";

export default examples({
  "hadi-march/motion": {
    measure: {
      code: `mutate(() => log("yazma"))      // asked first …
measure(() => log("okuma"))     // … asked second
nextFrame(() => log("güncelleme"))
// one frame runs: okuma → güncelleme → yazma`,
      run: () => {
        const lines = signal<string[]>([])
        const go = () => {
          lines.set([])
          mutate(() => lines.update((l) => last(l, "yazma (ilk istenen)")))
          measure(() => lines.update((l) => last(l, "okuma (ikinci istenen)")))
          nextFrame(() => lines.update((l) => last(l, "güncelleme (üçüncü istenen)")))
        }
        return <Row><Button onClick={go}>Sırayla iste</Button><Log lines={lines} label="Çalışma sırası" /></Row>
      },
    },
    mixColor: {
      code: `const css = getComputedStyle(document.documentElement)
const a = css.getPropertyValue("--hm-brand-orange")
const b = css.getPropertyValue("--hm-brand-blue")
mixColor(a, b, 0.5)    // "oklab(…)": mixed in OKLab, no muddy middle`,
      run: () => {
        const t = signal(50)
        const a = tok("--hm-brand-orange"), b = tok("--hm-brand-blue")
        const mixed = () => mixColor(a, b, t() / 100)
        return <div class="sc-ex-motion-b-stack">
          <div class="sc-ex-motion-b-swatch" ref={(el: HTMLElement) => { effect(() => { el.style.background = mixed() }) }} role="img" aria-label="Karışmış renk" />
          <input class="sc-ex-motion-b-range" type="range" min="0" max="100" value="50" aria-label="Karışım oranı" on:input={(e: Event) => t.set(num(e))} />
          <Out label="t" value={() => (t() / 100).toFixed(2)} />
        </div>
      },
    },
    morph: {
      code: `// the dialog grows out of the button's box
dialog.hidden = false
morph(button, dialog)                       // clip + move, colours and radius blend
morph(thumb, big, { mode: "scale" })         // same picture in two places: FLIP`,
      run: () => {
        const keep = hold()
        let src: HTMLElement, panel: HTMLElement
        const open = () => { src.style.visibility = ""; panel.hidden = false; keep(morph(src, panel)) }
        const reset = () => { keep(animate(panel, { opacity: [1, 1] }, { duration: 1 })).cancel(); panel.hidden = true; src.style.visibility = "" }
        return <div class="sc-ex-motion-b-stack">
          <div class="sc-ex-motion-b-stage">
            <button type="button" class="hm-btn hm-btn-primary sc-ex-motion-b-src" ref={(el: HTMLElement) => { src = el }} on:click={open}>Aç</button>
            <div class="sc-ex-motion-b-panel" hidden ref={(el: HTMLElement) => { panel = el }}><strong>HADİ Atölye</strong><span class="hm-muted">Kutu, düğmenin yerinden büyür.</span></div>
          </div>
          <Row><Button variant="ghost" onClick={reset}>Sıfırla</Button></Row>
        </div>
      },
    },
    morphBack: {
      code: `await morphBack(dialog, button).finished   // shrinks into the button, which shows again
dialog.hidden = true`,
      run: () => {
        const keep = hold()
        let src: HTMLElement, panel: HTMLElement
        const open = () => { panel.hidden = false; src.style.visibility = "hidden"; keep(morph(src, panel)) }
        const close = () => { if (panel.hidden) return; void keep(morphBack(panel, src)).finished.then(() => { panel.hidden = true }) }
        nextFrame(open)
        return <div class="sc-ex-motion-b-stack">
          <div class="sc-ex-motion-b-stage">
            <button type="button" class="hm-btn hm-btn-primary sc-ex-motion-b-src" ref={(el: HTMLElement) => { src = el }} on:click={open}>Aç</button>
            <div class="sc-ex-motion-b-panel" ref={(el: HTMLElement) => { panel = el }}><strong>HADİ Atölye</strong><span class="hm-muted">Kapatınca düğmeye geri çekilir.</span></div>
          </div>
          <Row><Button variant="primary" onClick={close}>Kapat</Button><Button variant="ghost" onClick={open}>Yeniden aç</Button></Row>
        </div>
      },
    },
    morphIcon: {
      code: `morphIcon(path, "pause")    // play → pause: every icon has the same commands
morphIcon(path, "close", { duration: 500 })`,
      run: () => {
        const keep = hold()
        const name = signal("play")
        let path: SVGPathElement
        const to = (v: string) => { name.set(v); keep(morphIcon(path, v as keyof typeof MORPH_ICONS)) }
        return <div class="sc-ex-motion-b-stack">
          <div class="sc-ex-motion-b-stage"><svg class="sc-ex-motion-b-svg" style="max-inline-size:6rem" viewBox="0 0 24 24" aria-hidden="true"><path class="sc-ex-motion-b-fill" d={MORPH_ICONS.play} ref={(el: SVGPathElement) => { path = el }} /></svg></div>
          <Segmented value={name} onChange={to} aria-label="Simge" options={Object.keys(MORPH_ICONS).map((k) => ({ value: k, label: k }))} />
        </div>
      },
    },
    morphPage: {
      code: `usePageTransitions(morphPage)
// { path: "/photo/:id", meta: { transition: "morph" } }
// the new page grows out of the link or card that was pressed`,
      run: () => <Swap frames={(side, dir, rtl) => morphPage.frames(side, dir, rtl, 32)} duration={900} />,
    },
    morphPath: {
      code: `morphPath(path, starD)                        // different commands: both are resampled
morphPath(path, heartD, { points: 120, easing: "spring" })`,
      run: () => {
        const keep = hold()
        let path: SVGPathElement
        const to = signal("circle")
        const go = (v: string) => { to.set(v); keep(morphPath(path, D[v as keyof typeof D]!, { duration: 900 })) }
        return <div class="sc-ex-motion-b-stack">
          <div class="sc-ex-motion-b-stage"><svg class="sc-ex-motion-b-svg" style="max-inline-size:9rem" viewBox="0 0 100 100" aria-hidden="true"><path class="sc-ex-motion-b-fill" d={D.circle} ref={(el: SVGPathElement) => { path = el }} /></svg></div>
          <Segmented value={to} onChange={go} aria-label="Şekil" options={[{ value: "circle", label: "daire" }, { value: "star", label: "yıldız" }, { value: "heart", label: "kalp" }]} />
        </div>
      },
    },
    motion: {
      code: `motion.config({ speed: 0.5 }, { persist: false })   // every animation, everywhere
motion.pauseAll()                                    // …and stop all of them
motion.resumeAll()
motion.config().speed                                // 0.5`,
      run: () => {
        const keep = hold()
        const before = motion.config()
        const speed = signal(String(before.speed))
        const restore = () => { motion.resumeAll(); motion.config({ speed: before.speed }, { persist: false }); speed.set(String(before.speed)) }
        onCleanup(restore)
        let pill: HTMLElement
        nextFrame(() => keep(animate(pill, { transform: ["translateX(0%)", "translateX(300%)"] }, { duration: 1400, iterations: Infinity, direction: "alternate", easing: "in-out" })))
        return <div class="sc-ex-motion-b-stack">
          <div class="sc-ex-motion-b-lane" aria-hidden="true"><i class="sc-ex-motion-b-pill" ref={(el: HTMLElement) => { pill = el }} /></div>
          <Row>
            <Segmented value={speed} onChange={(v: string) => { speed.set(v); motion.config({ speed: Number(v) }, { persist: false }) }} aria-label="Hız"
              options={[{ value: "0.25", label: "0,25×" }, { value: "1", label: "1×" }, { value: "3", label: "3×" }]} />
            <Button variant="ghost" onClick={() => motion.togglePause()}>{() => (motion.paused() ? "Sürdür" : "Tümünü durdur")}</Button>
            <Button variant="ghost" onClick={restore}>Eski ayara dön</Button>
          </Row>
          <Out label="hız" value={() => motion.settings().speed + "×"} />
        </div>
      },
    },
    mutate: {
      code: `let width = 0
measure(() => { width = lane.offsetWidth })                // read first
mutate(() => { bar.style.inlineSize = width * 0.6 + "px" })   // then write`,
      run: () => {
        const width = signal(0), on = signal(false)
        let lane: HTMLElement, bar: HTMLElement
        const go = () => {
          let w = 0
          const target = on.peek() ? 0 : 0.6
          mutate(() => { bar.style.inlineSize = Math.round(w * target) + "px" })
          measure(() => { w = lane.offsetWidth; width.set(w) })
          on.update((v) => !v)
        }
        return <div class="sc-ex-motion-b-stack">
          <div class="sc-ex-motion-b-meter" ref={(el: HTMLElement) => { lane = el; bar = el.firstElementChild as HTMLElement }}><i /></div>
          <Row><Button onClick={go}>Ölç ve yaz</Button><Out label="okunan genişlik" value={() => width() + " px"} /></Row>
        </div>
      },
    },
    navDirection: {
      code: `navDirection()        // "forward" | "back" for the entry the router is showing
// after history.back(), the same call answers "back"`,
      run: () => {
        const lines = signal<string[]>([])
        return <div class="sc-ex-motion-b-stack">
          <Row><Button onClick={() => lines.update((l) => last(l, "yön: " + navDirection()))}>Yönü oku</Button><Log lines={lines} label="Okunan yönler" /></Row>
        </div>
      },
    },
    nextFrame: {
      code: `const stop = nextFrame(() => log("B"))     // cancel it before the frame
stop()
nextFrame(() => log("A"))                  // runs once, on the next frame`,
      run: () => {
        const lines = signal<string[]>([])
        const go = () => {
          const t0 = performance.now(), at = () => Math.round(performance.now() - t0) + " ms"
          lines.set([])
          const stop = nextFrame(() => lines.update((l) => last(l, "B çalıştı")))
          stop()
          nextFrame(() => lines.update((l) => last(l, "A çalıştı, istekten " + at() + " sonra")))
          lines.update((l) => last(l, "B iptal edildi"))
        }
        return <Row><Button onClick={go}>İste</Button><Log lines={lines} label="Kare çağrıları" /></Row>
      },
    },
    normalize: {
      code: `normalize([{ opacity: 0, transform: "scale(.8)" }, { opacity: 1, offset: 0.6 }, { transform: "none" }])
normalize({ opacity: [0, 1], x: [0, 100] })   // → one track per property`,
      run: () => {
        const form = signal("array")
        const tracks = () => normalize(form() === "array" ? [{ opacity: 0, transform: "scale(.8)" }, { opacity: 1, offset: 0.6 }, { transform: "none" }] : { opacity: [0, 1], x: [0, 100] })
        return <div class="sc-ex-motion-b-stack">
          <Pick sig={form} label="Yazım" options={[["array", "kare dizisi"], ["object", "özellik listesi"]]} />
          <ul class="sc-ex-log" style="list-style:none;margin:0;padding:var(--hm-space-2)">{() => tracks().map((t) => <li><strong>{t.prop}</strong>{": " + t.offsets.map((o, i) => o + " → " + (t.values[i] ?? "şu anki")).join(" · ")}</li>)}</ul>
        </div>
      },
    },
    onFrame: {
      code: `const stop = onFrame((time, dt) => {
  pill.style.transform = "translateX(" + Math.sin(time / 500) * 100 + "%)"
})
stop()    // clock time follows global speed and stops with "Stop all"`,
      run: () => {
        const clock = signal(0), on = signal(true)
        let pill: HTMLElement, stop: (() => void) | null = null
        const start = () => {
          stop = onFrame((t) => { pill.style.transform = "translateX(" + (150 + Math.sin(t / 500) * 150) + "%)"; clock.set(Math.round(t / 100) / 10) })
          on.set(true)
        }
        const halt = () => { stop?.(); stop = null; on.set(false) }
        onCleanup(halt)
        nextFrame(start)
        return <div class="sc-ex-motion-b-stack">
          <div class="sc-ex-motion-b-lane" aria-hidden="true"><i class="sc-ex-motion-b-pill" ref={(el: HTMLElement) => { pill = el }} /></div>
          <Row><Button onClick={() => (on.peek() ? halt() : start())}>{() => (on() ? "Durdur" : "Başlat")}</Button><Out label="saat" value={() => clock() + " sn"} /></Row>
        </div>
      },
    },
    pageTransitions: {
      code: `const off = pageTransitions({ type: "slide", duration: 320 })   // once, after createRouter()
// { path: "/photos/:id", meta: { transition: "scale" } }
off()                                                            // turn them off`,
      run: () => {
        const type = signal("slide")
        return <div class="sc-ex-motion-b-stack">
          <Pick sig={type} label="Geçiş türü" options={["fade", "slide", "scale"]} />
          <Swap mirror frames={(side, dir, rtl) => transitionFrames(type.peek(), side, dir, rtl, 48)} duration={500} />
        </div>
      },
    },
    parallax: {
      code: `<img src={cover} use:parallax={0.2} />    // moves at 0.2 × the page scroll
<div use:parallax={-0.3}>…</div>          // negative: the other way`,
      run: () => {
        const speed = signal("0.3")
        return <div class="sc-ex-motion-b-stack">
          <Pick sig={speed} label="Oran" options={[["-0.3", "-0,3"], ["0.1", "0,1"], ["0.3", "0,3"]]} />
          {() => <div class="sc-ex-motion-b-stage"><div class="sc-ex-motion-b-box sc-ex-motion-b-box-b" use:parallax={Number(speed())} ref={(e: HTMLElement) => { el = e }} /></div>}
          <p class="sc-apip-note">Sayfayı kaydırın: kutu sayfadan farklı hızda kayar.</p>
        </div>
      },
    },
    parseColor: {
      code: `const out = [0, 0, 0, 0]
parseColor("oklch(0.7 0.15 55)", out)     // true; out = [L·α, a·α, b·α, α]
parseColor("not-a-colour", out)           // false`,
      run: () => {
        const name = signal("--hm-brand-orange")
        const parsed = () => { const out = [0, 0, 0, 0], v = tok(name()); const ok = parseColor(v, out); return { v, ok, out: out.map((n) => Math.round(n * 1000) / 1000) } }
        return <div class="sc-ex-motion-b-stack">
          <Pick sig={name} label="Renk" options={[["--hm-brand-orange", "turuncu"], ["--hm-brand-blue", "mavi"], ["--hm-brand-green", "yeşil"], ["--hm-brand-purple", "mor"]]} />
          <div class="sc-ex-motion-b-swatch" style={() => "background:var(" + name() + ")"} role="img" aria-label="Seçilen renk" />
          <Out label="değer" value={() => parsed().v} />
          <Out label="çözüldü" value={() => (parsed().ok ? "evet" : "hayır")} />
          <Out label="OKLab [L, a, b, α]" value={() => JSON.stringify(parsed().out)} />
        </div>
      },
    },
    parsePath: {
      code: `parsePath("M10 80 C 40 10, 65 10, 95 80 S 150 150, 180 80")
// → [{ c: "M", v: [10, 80] }, { c: "C", v: [40, 10, 65, 10, 95, 80] }, …]`,
      run: () => {
        const d = signal("M10 80 C 40 10, 65 10, 95 80 S 150 150, 180 80")
        return <div class="sc-ex-motion-b-stack">
          <input class="hm-input" value={d()} aria-label="Yol (d)" on:input={(e: Event) => d.set((e.target as HTMLInputElement).value)} />
          <ol class="sc-ex-log">{() => parsePath(d()).map((s) => <li>{s.c + " " + s.v.join(" ")}</li>)}</ol>
        </div>
      },
    },
    pathLength: {
      code: `pathLength("M0 0L30 40")                      // 50
pathLength("M8 60C30 6 60 6 80 40S130 80 152 30")`,
      run: () => {
        const which = signal("route")
        const d = () => D[which() as keyof typeof D]!
        return <div class="sc-ex-motion-b-stack">
          <Pick sig={which} label="Yol" options={[["route", "rota"], ["circle", "daire"]]} />
          <div class="sc-ex-motion-b-stage"><svg class="sc-ex-motion-b-svg" viewBox="0 0 160 100" aria-hidden="true"><path class="sc-ex-motion-b-ink" d={d} /></svg></div>
          <Out label="uzunluk" value={() => pathLength(d()).toFixed(1)} />
        </div>
      },
    },
    pathSampler: {
      code: `const at = pathSampler("M8 60C30 6 60 6 80 40S130 80 152 30")
at(0.5)   // { x, y, angle }: the point halfway along and its tangent in degrees`,
      run: () => {
        const at = pathSampler(D.route), p = signal(40)
        const q = () => at(p() / 100)
        return <div class="sc-ex-motion-b-stack">
          <div class="sc-ex-motion-b-stage"><svg class="sc-ex-motion-b-svg" viewBox="0 0 160 100" aria-hidden="true">
            <path class="sc-ex-motion-b-ink sc-ex-motion-b-ink-dim" d={D.route} /><circle class="sc-ex-motion-b-mark" r="5" cx={() => q().x} cy={() => q().y} />
          </svg></div>
          <input class="sc-ex-motion-b-range" type="range" min="0" max="100" value="40" aria-label="Yol üzerindeki yer" on:input={(e: Event) => p.set(num(e))} />
          <Out label="x, y" value={() => q().x.toFixed(1) + ", " + q().y.toFixed(1)} />
          <Out label="açı" value={() => q().angle.toFixed(0) + "°"} />
        </div>
      },
    },
    pixelDissolve: {
      code: `usePageTransitions(pixelDissolve)
// { path: "/gallery", meta: { transition: "pixel" } }   // cells of a grid appear in a shuffled order`,
      run: () => <Swap frames={(side, dir, rtl) => pixelDissolve.frames(side, dir, rtl, 32)} duration={1100} />,
    },
    pointerDrag: {
      code: `<div on:pointerdown={(e) => pointerDrag(e, {
  threshold: 6,
  onMove: (p) => (el.style.transform = "translate(" + p.dx + "px, " + p.dy + "px)"),
  onEnd: (p, cancelled) => settle(el, p),     // Escape cancels
  onClick: () => open(),                      // released before the threshold
})} />`,
      run: () => {
        const keep = hold()
        const lines = signal<string[]>([])
        const add = (s: string) => lines.update((l) => last(l, s, 5))
        const down = (e: PointerEvent) => {
          const el = e.currentTarget as HTMLElement
          pointerDrag(e, {
            threshold: 6,
            onStart: () => add("başladı"),
            onMove: (p) => { el.style.transform = "translate(" + p.dx + "px, " + p.dy + "px)" },
            onEnd: (p, cancelled) => {
              add(cancelled ? "iptal edildi" : "bitti: " + Math.round(p.dx) + ", " + Math.round(p.dy))
              const from = el.style.transform
              el.style.transform = ""
              keep(animate(el, [{ transform: from }, { transform: "none" }], { easing: "spring", fill: "none" }), el)
            },
            onClick: () => add("tıklama (eşik aşılmadı)"),
          })
        }
        return <div class="sc-ex-motion-b-stack">
          <div class="sc-ex-motion-b-stage"><div class="sc-ex-motion-b-handle" role="button" tabindex="0" aria-label="Sürüklenecek tutamak" on:pointerdown={down} /></div>
          <Log lines={lines} label="Sürükleme olayları" />
        </div>
      },
    },
    preset: {
      code: `installPresets()                                       // fadeIn, zoomIn, pop …
preset("hadi-pop", "zoomIn", { duration: 400, easing: "spring" })
animate(card, "hadi-pop")                              // by name, anywhere`,
      run: () => {
        installPresets()
        const ez = signal("spring")
        return <Replay label="hadi-pop oynat" run={(box, keep) => { preset("hadi-pop", "zoomIn", { duration: 500, easing: ez.peek() }); keep(animate(box, "hadi-pop")) }}>
          <Pick sig={ez} label="Eğri" options={["spring", "bounce", "out"]} />
        </Replay>
      },
    },
    press: {
      code: `<button use:press>Kaydet</button>
<div use:press={{ scale: 0.9, easing: "spring-wobbly" }}>…</div>`,
      run: () => {
        const ez = signal("spring-wobbly")
        return <div class="sc-ex-motion-b-stack">
          <Pick sig={ez} label="Bırakış" options={["spring-wobbly", "spring-snappy", "easeOutBack"]} />
          {() => <div class="sc-ex-motion-b-stage"><button type="button" class="hm-btn hm-btn-primary" use:press={{ scale: 0.88, easing: ez() }}>Bas ve bırak</button></div>}
        </div>
      },
    },
    reducedMotion: {
      code: `if (reducedMotion()) showStaticState()
// live: reads the system setting or the app's own override`,
      run: () => <Replay label="Kutuyu oynat" run={(box, keep) => keep(animate(box, { transform: ["translateX(0px)", "translateX(80px)", "translateX(0px)"] }, { duration: 900, easing: "in-out" }))}>
        <Out label="hareketi azalt" value={() => (reducedMotion() ? "açık" : "kapalı")} />
      </Replay>,
    },
    registerVar: {
      code: `registerVar("--turn", "<angle>", "0deg")        // now it interpolates, natively
animate(box, { "--turn": ["0deg", "270deg"] })     // .box { transform: rotate(var(--turn)) }`,
      run: () => {
        const ok = registerVar("--ex-b-turn", "<angle>", "0deg")
        return <div class="sc-ex-motion-b-stack">
          <Replay label="Döndür" run={(box, keep) => { box.classList.add("sc-ex-motion-b-turn"); keep(animate(box, { "--ex-b-turn": ["0deg", "270deg"] }, { duration: 1000, easing: "in-out" })) }} />
          <Out label="kayıtlı" value={ok ? "evet" : "hayır (tarayıcı desteklemiyor)"} />
        </div>
      },
    },
  },
})
