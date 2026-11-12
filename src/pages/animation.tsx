// Motion engine: one keyframe-based engine for every animation. Global control (speed, stop all, reduced motion, slow
// motion, character) with an fps / long-task panel; "one engine" (a DOM card, a canvas wave and a WebGL gradient in one
// timeline); the keyframe gallery; a timeline editor; a curve editor; the 200-item stagger check; keyframes → CSS.
import "./animation.css";
import { onCleanup, effect } from "hadi-march";
import {
  animate, timeline, stagger, motion, frameMonitor, installPresets, keyframesCss, ease, springEase, canvas2d, webgl,
  PRESETS, type Playback, type PresetName,
} from "hadi-march/motion";
import { Button, Badge, Slider, Field, CodeView } from "hadi-march/ui";
import { Segmented, Toggle } from "hadi-march/forms";
import { Demo, Section } from "../demo.tsx";

installPresets();
const NAMES = Object.keys(PRESETS) as PresetName[];
const LOOPS = new Set(NAMES.filter((n) => (PRESETS[n][1] as { iterations?: number }).iterations === Infinity));

/** Global switchboard + live fps / long tasks. */
function Control() {
  const s = motion.settings()
  let $speed = s.speed
  let $reduce: string = s.reduce
  let $character = s.character
  let $slow = s.slowMo < 1
  const mon = frameMonitor()
  onCleanup(() => mon.stop())
  effect(() => { motion.config({ speed: $speed, reduce: $reduce as "system", character: $character, slowMo: $slow ? 0.2 : 1 }) })
  return <div class="sc-an-control">
    <div class="sc-an-row">
      <Field label={() => `Global hız: ${$speed.toFixed(2)}×`}><Slider bind:value={$speed} min={0.1} max={3} step={0.05} /></Field>
      <Button variant={motion.paused() ? "primary" : "secondary"} on:click={() => motion.togglePause()} data-an="pause-all">{() => motion.paused() ? "Tümünü sürdür" : "Tümünü durdur"}</Button>
    </div>
    <div class="sc-an-row">
      <Field label="Hareketi azalt"><Segmented bind:value={$reduce} options={[{ value: "system", label: "Sistem" }, { value: "reduce", label: "Azalt" }, { value: "full", label: "Tam" }]} /></Field>
      <Field label="Karakter"><Segmented bind:value={$character} options={[{ value: "default", label: "Varsayılan" }, { value: "calm", label: "Sakin" }, { value: "lively", label: "Canlı" }]} /></Field>
      <Toggle bind:value={$slow}>Yavaş çekim (0.2×)</Toggle>
    </div>
    <div class="sc-an-meters" aria-live="off">
      <span class="sc-an-meter"><b data-an="fps">{() => mon.fps()}</b> fps</span>
      <span class="sc-an-meter"><b data-an="drops">{() => mon.drops()}</b> düşen kare</span>
      <span class="sc-an-meter"><b data-an="long">{() => mon.longTasks()}</b> uzun görev</span>
      <span class="sc-an-meter"><b>{() => mon.longest()}</b> ms en uzun</span>
      <span class="sc-an-meter sc-an-css"><i class="sc-an-spinner" aria-hidden="true" /> saf CSS animasyonu da aynı denetimde</span>
    </div>
  </div>
}

const VERT = "attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }";
const FRAG = `precision mediump float;
uniform float uTime; uniform vec4 uColorA; uniform vec4 uColorB; uniform vec2 uSize;
void main() {
  vec2 uv = gl_FragCoord.xy / uSize;
  float w = 0.5 + 0.5 * sin(uv.x * 6.2831 + uTime * 6.2831) * cos(uv.y * 3.1415 + uTime * 3.1415);
  gl_FragColor = mix(uColorA, uColorB, clamp(uv.y * 0.6 + w * 0.4, 0.0, 1.0));
}`;
function setupGl(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: true, preserveDrawingBuffer: true })
  if (!gl) return null
  const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s }
  const prog = gl.createProgram()!
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null
  gl.useProgram(prog)
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  return { gl, prog }
}
const fit = (c: HTMLCanvasElement) => { const r = c.getBoundingClientRect(); const d = Math.min(2, globalThis.devicePixelRatio || 1); c.width = Math.max(1, Math.round(r.width * d)); c.height = Math.max(1, Math.round(r.height * d)) }

/** One timeline drives a DOM card (WAAPI), a canvas wave (canvas2d) and a WebGL gradient (uniforms). */
function OneEngine() {
  let $playing = true
  let $rate = 1
  let card: HTMLElement | undefined, wave: HTMLCanvasElement | undefined, sky: HTMLCanvasElement | undefined
  let tl: Playback | null = null
  let $noGl = false
  const build = () => {
    if (!card || !wave || !sky || tl) return
    fit(wave); fit(sky)
    const w = canvas2d(wave, (st: { phase: number; amp: number; hue: string }, ctx) => {
      const { width: W, height: H } = ctx.canvas
      ctx.clearRect(0, 0, W, H)
      ctx.lineWidth = 3 * Math.min(2, globalThis.devicePixelRatio || 1); ctx.strokeStyle = st.hue; ctx.beginPath()
      for (let x = 0; x <= W; x += 4) { const y = H / 2 + Math.sin(x / W * Math.PI * 4 + st.phase) * st.amp * H / 100; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y) }
      ctx.stroke()
    }, { phase: 0, amp: 10, hue: "#3b82f6" })
    const g = setupGl(sky)
    tl = timeline({ defaults: { duration: 3000, easing: "in-out" } })
      .add(card, [{ transform: "translateX(0%) rotate(0deg)", opacity: 0.6 }, { transform: "translateX(60%) rotate(8deg)", opacity: 1 }], { iterations: Infinity, direction: "alternate", at: 0 })
      .add(w, { phase: [0, Math.PI * 4], amp: [10, 38], hue: ["#3b82f6", "#ec4899"] }, { iterations: Infinity, direction: "alternate", at: 0 })
    if (g) {
      const target = webgl(g.gl, g.prog, { state: { uTime: 0, uColorA: "#1e3a8a", uColorB: "#22d3ee", uSize: [sky.width, sky.height] }, draw: (gl) => { gl.viewport(0, 0, sky!.width, sky!.height); gl.drawArrays(gl.TRIANGLES, 0, 6) } })
      tl.add(target, { uTime: [0, 1], uColorA: ["#1e3a8a", "#7c3aed"], uColorB: ["#22d3ee", "#f59e0b"] }, { iterations: Infinity, direction: "alternate", at: 0 })
      target.draw()
    } else $noGl = true
    tl.play()
  }
  effect(() => { const r = $rate; if (tl) tl.playbackRate = r })
  onCleanup(() => tl?.cancel())
  const toggle = () => { if (!tl) return; if ($playing) tl.pause(); else tl.play(); $playing = !$playing }
  return <div class="sc-an-one">
    <div class="sc-an-one-stage">
      <div class="sc-an-lane"><span class="sc-an-tag">DOM · WAAPI</span><div class="sc-an-card" ref={(el: HTMLElement) => { card = el; queueMicrotask(build) }}>Kart</div></div>
      <div class="sc-an-lane"><span class="sc-an-tag">canvas2d</span><canvas class="sc-an-canvas" aria-hidden="true" ref={(el: HTMLCanvasElement) => { wave = el; queueMicrotask(build) }} /></div>
      <div class="sc-an-lane"><span class="sc-an-tag">{() => $noGl ? "WebGL yok" : "WebGL · uniform"}</span><canvas class="sc-an-canvas" aria-hidden="true" ref={(el: HTMLCanvasElement) => { sky = el; queueMicrotask(build) }} /></div>
    </div>
    <div class="sc-an-row">
      <Button variant="primary" on:click={toggle} data-an="one-toggle">{() => $playing ? "Duraklat" : "Oynat"}</Button>
      <Field label={() => `Bu timeline'ın hızı: ${$rate.toFixed(2)}×`}><Slider bind:value={$rate} min={0.25} max={3} step={0.05} /></Field>
    </div>
  </div>
}

function Gallery() {
  const loops = new Map<string, Playback>()
  const boxes = new Map<string, HTMLElement>()
  onCleanup(() => loops.forEach((p) => p.cancel()))
  const play = (name: PresetName) => {
    const el = boxes.get(name); if (!el) return
    if (LOOPS.has(name)) { const cur = loops.get(name); if (cur) { cur.cancel(); loops.delete(name); return } loops.set(name, animate(el, name)); return }
    animate(el, name)
  }
  const all = () => { const els = NAMES.filter((n) => !LOOPS.has(n)).map((n) => boxes.get(n)!); timeline().add(els, "fadeUp", { stagger: stagger(40, { from: "center" }) }).play() }
  return <div class="sc-stage">
    <div class="sc-an-gallery">
      {NAMES.map((name) => <button type="button" class="sc-an-kf" on:click={() => play(name)}>
        <span class="sc-an-kf-box" ref={(el: HTMLElement) => { boxes.set(name, el) }} />
        <span class="sc-an-kf-name">{name}</span>
        {LOOPS.has(name) ? <Badge tone="info">döngü</Badge> : null}
      </button>)}
    </div>
    <div class="sc-an-row"><Button on:click={all}>Hepsini sırayla (stagger, ortadan)</Button></div>
  </div>
}

interface Step { id: number; label: string; at: number; dur: number; frames: PresetName }
function TimelineEditor() {
  let $steps: Step[] = [
    { id: 1, label: "Başlık", at: 0, dur: 500, frames: "fadeDown" },
    { id: 2, label: "Kart", at: 300, dur: 600, frames: "zoomIn" },
    { id: 3, label: "Düğme", at: 700, dur: 500, frames: "pop" },
    { id: 4, label: "Rozet", at: 1000, dur: 700, frames: "bounceIn" },
  ]
  let $time = 0
  const TOTAL = 2400
  const els = new Map<number, HTMLElement>()
  let tl: Playback | null = null
  const rebuild = () => {
    const t = tl?.currentTime ?? 0
    tl?.cancel()
    tl = timeline({ onUpdate: (_p, ms) => { $time = Math.round(ms) } })
    for (const s of $steps.peek()) { const el = els.get(s.id); if (el) tl.add(el, s.frames, { at: s.at, duration: s.dur }) }
    tl.seek(Math.min(t, tl.duration))
  }
  onCleanup(() => tl?.cancel())
  // drag a bar: pointer x → new start (ms), snapped to 50 ms
  const dragBar = (id: number) => (e: PointerEvent) => {
    const s = $steps.peek().find((x) => x.id === id)!
    const bar = e.currentTarget as HTMLElement, track = bar.parentElement!
    const w = track.getBoundingClientRect().width || 1, x0 = e.clientX, at0 = s.at
    bar.setPointerCapture(e.pointerId)
    const move = (m: PointerEvent) => { const at = Math.max(0, Math.min(TOTAL - s.dur, Math.round((at0 + ((m.clientX - x0) / w) * TOTAL) / 50) * 50)); $steps = $steps.map((x) => x.id === s.id ? { ...x, at } : x) }
    const up = () => { bar.removeEventListener("pointermove", move); bar.removeEventListener("pointerup", up); rebuild() }
    bar.addEventListener("pointermove", move); bar.addEventListener("pointerup", up)
  }
  const key = (s: Step) => (e: KeyboardEvent) => {
    const d = e.key === "ArrowRight" ? 50 : e.key === "ArrowLeft" ? -50 : 0
    if (!d) return
    e.preventDefault(); $steps = $steps.map((x) => x.id === s.id ? { ...x, at: Math.max(0, Math.min(TOTAL - x.dur, x.at + d)) } : x); rebuild()
  }
  return <div class="sc-stage">
    <div class="sc-an-tl-stage">
      {$steps.peek().map((s) => <span class={`sc-an-tl-item sc-an-tl-${s.id}`} ref={(el: HTMLElement) => { els.set(s.id, el); queueMicrotask(rebuild) }}>{s.label}</span>)}
    </div>
    <div class="sc-an-tracks">
      {$steps.peek().map((s) => <div class="sc-an-track">
        <span class="sc-an-track-name">{s.label}</span>
        <div class="sc-an-track-lane">
          <button type="button" class={`sc-an-bar sc-an-tl-${s.id}`} aria-label={() => `${s.label}: ${$steps.find((x) => x.id === s.id)!.at} ms'de başlar (oklarla kaydır)`}
            style={{ left: `${($steps.find((x) => x.id === s.id)!.at / TOTAL) * 100}%`, width: `${(s.dur / TOTAL) * 100}%` }}
            on:pointerdown={dragBar(s.id)} on:keydown={key(s)}>{s.frames}</button>
        </div>
      </div>)}
      <div class="sc-an-playhead-lane"><span class="sc-an-playhead" style={{ left: `${($time / TOTAL) * 100}%` }} /></div>
    </div>
    <div on:input={(e: Event) => tl?.seek(Number((e.target as HTMLInputElement).value))}><Field label={() => `seek: ${$time} ms`}><Slider bind:value={$time} min={0} max={TOTAL} step={10} /></Field></div>
    <div class="sc-an-row">
      <Button variant="primary" on:click={() => { if (tl && tl.currentTime >= tl.duration) tl.seek(0); tl?.play() }}>Oynat</Button>
      <Button on:click={() => tl?.pause()}>Duraklat</Button>
      <Button on:click={() => tl?.reverse()}>Ters</Button>
    </div>
  </div>
}

const PRESET_CURVES: [string, string][] = [["out", "Çıkış"], ["in-out", "Giriş-çıkış"], ["back", "Geri"], ["expo", "Üstel"], ["spring", "Yay"], ["bounce", "Sekme"], ["steps(5, end)", "Adım"]]
function CurveEditor() {
  let $p = [0.33, 1, 0.68, 1]
  let $named = ""
  let $k = 170
  let $c = 14
  const current = () => ($named === "spring*" ? springEase({ stiffness: $k, damping: $c }) : $named ? ease($named) : ease(`cubic-bezier(${$p.join(",")})`))
  const path = () => { const e = current(); let d = ""; for (let i = 0; i <= 80; i++) { const x = i / 80; d += `${i ? "L" : "M"}${(x * 200).toFixed(1)} ${(160 - e(x) * 120).toFixed(1)}` } return d }
  const css = () => current().css ?? "(yalnız JS)"
  let ball: HTMLElement | undefined
  let run: Playback | null = null
  const preview = () => { if (!ball) return; run?.cancel(); run = animate(ball, { transform: ["translateX(0px)", "translateX(220px)"] }, { duration: current().duration ?? 900, easing: current(), fill: "both" }) }
  onCleanup(() => run?.cancel())
  const handle = (i: 0 | 1) => (e: PointerEvent) => {
    const svg = (e.currentTarget as SVGElement).ownerSVGElement!
    const r = svg.getBoundingClientRect()
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    const move = (m: PointerEvent) => {
      const x = Math.max(0, Math.min(1, (m.clientX - r.left) / r.width)), y = (160 - ((m.clientY - r.top) / r.height) * 200) / 120
      const p = [...$p]; p[i * 2] = Math.round(x * 100) / 100; p[i * 2 + 1] = Math.round(Math.max(-0.6, Math.min(1.6, y)) * 100) / 100
      $p = p; $named = ""
    }
    const up = () => { e.target!.removeEventListener("pointermove", move as EventListener); e.target!.removeEventListener("pointerup", up); preview() }
    e.target!.addEventListener("pointermove", move as EventListener); e.target!.addEventListener("pointerup", up)
  }
  return <div class="sc-stage">
    <div class="sc-an-curve">
      <svg viewBox="0 0 200 200" class="sc-an-curve-svg" role="img" aria-label="Eğri">
        <rect x="0" y="40" width="200" height="120" class="sc-an-curve-box" />
        <path d={path} class="sc-an-curve-path" />
        {() => !$named ? [
          <line x1="0" y1="160" x2={$p[0] * 200} y2={160 - $p[1] * 120} class="sc-an-curve-arm" />,
          <line x1="200" y1="40" x2={$p[2] * 200} y2={160 - $p[3] * 120} class="sc-an-curve-arm" />,
          <circle cx={$p[0] * 200} cy={160 - $p[1] * 120} r="7" class="sc-an-curve-handle" on:pointerdown={handle(0)} />,
          <circle cx={$p[2] * 200} cy={160 - $p[3] * 120} r="7" class="sc-an-curve-handle" on:pointerdown={handle(1)} />,
        ] : null}
      </svg>
      <div class="sc-an-curve-side">
        <div class="sc-an-chips">{PRESET_CURVES.map(([v, label]) => <Button size="sm" variant={() => $named === v ? "primary" : "secondary"} on:click={() => { $named = v; preview() }}>{label}</Button>)}
          <Button size="sm" variant={() => $named === "spring*" ? "primary" : "secondary"} on:click={() => { $named = "spring*"; preview() }}>Özel yay</Button></div>
        {() => $named === "spring*" ? <div on:change={() => queueMicrotask(preview)}>
          <Field label={() => `Sertlik ${$k}`}><Slider bind:value={$k} min={40} max={600} /></Field>
          <Field label={() => `Sönüm ${$c}`}><Slider bind:value={$c} min={2} max={60} /></Field>
        </div> : null}
        <code class="sc-an-css-out" data-an="curve-css">{css}</code>
      </div>
    </div>
    <div class="sc-an-ball-lane"><span class="sc-an-ball" ref={(el: HTMLElement) => { ball = el }} /></div>
    <div class="sc-an-row"><Button on:click={preview}>Önizle</Button></div>
  </div>
}

function Stagger200() {
  let $result = ""
  let host: HTMLElement | undefined
  const runIt = async () => {
    if (!host) return
    const dots = [...host.children] as HTMLElement[]
    const mon = frameMonitor()
    const p = timeline().add(dots, [{ opacity: 0, transform: "scale(.2) translateY(12px)" }, { opacity: 1, transform: "scale(1) translateY(0px)" }], { duration: 600, easing: "spring-snappy", stagger: stagger(4, { grid: [20, 10], from: "center" }) })
    const t0 = performance.now()
    p.play()
    const startMs = performance.now() - t0
    await p.finished
    const drops = mon.drops(), longT = mon.longTasks(), frames = mon.frames()
    mon.stop()
    $result = `${frames} kare · ${drops} düşen kare · ${longT} uzun görev · başlatma ${startMs.toFixed(1)} ms`
    host.dataset.anDrops = String(drops); host.dataset.anLong = String(longT); host.dataset.anStart = startMs.toFixed(1)
  }
  return <div class="sc-stage">
    <div class="sc-an-dots" ref={(el: HTMLElement) => { host = el }}>{Array.from({ length: 200 }, (_, i) => <i class={`sc-an-dot sc-cat-bg-${(i % 8) + 1}`} />)}</div>
    <div class="sc-an-row"><Button variant="primary" on:click={runIt} data-an="stagger-run">200 öğeyi oynat</Button><output class="sc-an-result" data-an="stagger-result">{() => $result}</output></div>
  </div>
}

export default function Animation() {
  return <Section kicker="Hareket" title="Animasyon motoru" lead="Tek keyframe motoru: değer katmanı hedeften bağımsız; DOM (WAAPI), CSS değişkeni, canvas, WebGL ve düz nesneler aynı timeline'da oynar. Tek saat, global hız, durdurma ve 'hareketi azalt' her animasyona — saf CSS animasyonlarına bile — ulaşır.">
    <Demo wide title="Global denetim" desc="motion.config: hız, tümünü durdur, azaltılmış hareket, karakter ve yavaş çekim. Ayar kalıcıdır; fps ve uzun görevler canlı ölçülür. Tümünü durdur bütün vitrini durdurur: başka sayfaya geç, iskeletler, kayan yazılar, canvas katmanları, ilerleme çubukları ve sayfa geçişleri de durur; alttaki uyarı her sayfada kalır."
      code={`motion.config({ speed: 0.5 })      // tüm animasyonlar yarı hızda
motion.pauseAll(); motion.resumeAll()  // WAAPI, canvas, WebGL, yaylar, CSS animasyonları
motion.config({ reduce: "reduce" })    // ya da "system" (prefers-reduced-motion)
motion.config({ character: "calm" })   // temalar hareket karakteri verir
const m = frameMonitor(); m.fps(); m.drops(); m.longTasks()`}>
      <Control />
    </Demo>
    <Demo wide title="Tek motor" desc="Aynı timeline: bir kart (DOM, WAAPI), bir canvas dalgası ve bir WebGL gradyanı. Tek Duraklat düğmesi ve hız kaydırıcısı üçünü birden yönetir."
      code={`const wave = canvas2d(canvas, (s, ctx) => draw(s, ctx), { phase: 0, amp: 10, hue: "#3b82f6" })
const sky = webgl(gl, program, { state: { uTime: 0, uColorA: "#1e3a8a" }, draw: (gl) => gl.drawArrays(gl.TRIANGLES, 0, 6) })
const tl = timeline({ defaults: { duration: 3000, easing: "in-out" } })
  .add(card, [{ transform: "translateX(0%)" }, { transform: "translateX(60%)" }], { at: 0, iterations: Infinity, direction: "alternate" })
  .add(wave, { phase: [0, 12.57], amp: [10, 38], hue: ["#3b82f6", "#ec4899"] }, { at: 0, iterations: Infinity, direction: "alternate" })
  .add(sky, { uTime: [0, 1], uColorA: ["#1e3a8a", "#7c3aed"] }, { at: 0, iterations: Infinity, direction: "alternate" })
tl.play(); tl.pause(); tl.playbackRate = 2`}>
      <OneEngine />
    </Demo>
    <Demo title="Keyframe galerisi" desc="installPresets(): adla oynat — animate(el, 'pop'). Döngüler tıklayınca durur. Hepsi transform / opacity / filter: compositor'da çalışır."
      code={`installPresets()
animate(el, "pop")                       // yay eğrisi CSS linear() ile, WAAPI'de
keyframes("myIn", { opacity: [0, 1] }, { duration: 200 })
timeline().add(".card", "fadeUp", { stagger: stagger(40, { from: "center" }) }).play()`}>
      <Gallery />
    </Demo>
    <Demo title="Zaman çizelgesi düzenleyici" desc="Çubukları sürükle (ya da oklarla kaydır), oynat, ters çevir; seek kaydırıcısı zamanı doğrudan ayarlar."
      code={`const tl = timeline()
  .add(title, "fadeDown", { at: 0, duration: 500 })
  .add(card, "zoomIn", { at: 300, duration: 600 })
  .label("cta").add(button, "pop", { at: "cta-=100" })
tl.seek(450); tl.play(); tl.reverse(); await tl.finished`}>
      <TimelineEditor />
    </Demo>
    <Demo title="Eğri editörü" desc="Tutamaçları sürükle: cubic-bezier. Yay ve sekme fizikten hesaplanır ve CSS linear() olarak WAAPI'ye gider."
      code={`ease("out")  ease("--hm-ease-expo")  ease("steps(5, end)")
springEase({ stiffness: 170, damping: 14 }).css   // "linear(0, 0.07 4%, …, 1)"
defineEasing("brand", "cubic-bezier(.2,.9,.1,1)")`}>
      <CurveEditor />
    </Demo>
    <Demo title="200 öğe stagger" desc="200 nokta, ızgara stagger'ı ortadan. Başlatma süresi, düşen kareler ve uzun görevler ölçülür."
      code={`const m = frameMonitor()
await timeline().add(dots, frames, { stagger: stagger(4, { grid: [20, 10], from: "center" }) }).play()
m.drops(); m.longTasks()`}>
      <Stagger200 />
    </Demo>
    <Demo wide title="Keyframe'ler → tek CSS dosyası" desc="keyframesCss() (ya da tools/gen-motion-css.js) kayıtlardan @keyframes ve .hm-anim-* sınıfları üretir; azaltılmış harekette hemen biter.">
      <CodeView code={keyframesCss({ names: ["fadeUp", "pop", "spin"] }).trim()} lang="css" copy />
    </Demo>
  </Section>
}
