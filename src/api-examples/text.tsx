// API examples of march/motion/text, march/motion/text/meta and march/fx: text animations, the split
// core, the catalog and the decorative canvas / CSS layers. Layout and rules: tools/api-examples.js.
import "./text.css";
import { signal, effect, untrack, onCleanup } from "march";
import {
  fade, dissolve, blurIn, rise, drop, slideIn, pop, zoomIn, flip, rotateIn, swing, elastic, bounceIn, tilt, perspective,
  skewIn, splitReveal, maskReveal, wipe, cascade, spin, jelly, trackIn, implode, explode, inkBleed, pixelate, glitch, shake,
  wave, bounce, jitter, float, pulse, rainbow, neon, breathe, glow, shimmer, highlight, underline, strike, gradientSweep,
  strokeDraw, typewriter, typeLoop, scramble, decode, matrix, splitFlap, counter, odometer, wordCycle, morph, parseNumber,
  magnetic, repel, splitText, graphemes, isRtl, order, type TextAnimation, type TextOptions, type SplitText, type StaggerFrom,
} from "march/motion/text";
import { TEXT_ANIMATIONS, type TextFamily } from "march/motion/text/meta";
import { Aurora, Noise, Particles, confetti, spotlight } from "march/fx";
import { Button, Badge } from "march/ui";
import { TextInput } from "march/forms";
import { examples } from "./types.ts";
import { Out, Row } from "./_kit.tsx";
export { default as SIG } from "./text.sig.gen.ts";

type V = { values: Record<string, unknown> }
type Opt = { kind?: "segmented" | "chips"; key: string; label: string; default: unknown; options?: readonly { value: unknown; label: string }[]; min?: number; max?: number; step?: number; unit?: string }

const UNIT: Record<string, string> = { char: "Harf", word: "Sözcük", line: "Satır" }
const FROM: Record<string, string> = { start: "Baştan", center: "Ortadan", end: "Sondan", edges: "Kenarlardan", random: "Rastgele" }
const EASE: Record<string, string> = { out: "Yumuşak", expo: "Hızlı", back: "Geri", elastic: "Esnek", bounce: "Sekme", linear: "Düz" }
const by = (d: string, units: string[]): Opt => ({ key: "by", label: "Bölme", default: d, options: units.map((u) => ({ value: u, label: UNIT[u]! })) })
const from = (d: string): Opt => ({ key: "from", label: "Başlangıç", default: d, options: ["start", "center", "end", "random"].map((v) => ({ value: v, label: FROM[v]! })) })
const ease = (d: string): Opt => ({ key: "easing", label: "Eğri", default: d, kind: "chips", options: ["out", "expo", "back", "elastic", "bounce", "linear"].map((v) => ({ value: v, label: EASE[v]! })) })
const ms = (key: string, label: string, d: number, min: number, max: number, step: number): Opt => ({ key, label, default: d, min, max, step, unit: "ms" })
const dur = (d: number, min = 200, max = 2000, step = 100): Opt => ms("duration", "Süre", d, min, max, step)
const stg = (d: number, max = 200, step = 5): Opt => ms("stagger", "Aralık", d, 0, max, step)
const OUT: Opt = { key: "out", label: "Çıkış olarak", default: false }
const ASSEMBLE: Opt = { key: "out", label: "Toplanarak gel", default: false }
const CARET: Opt = { key: "caret", label: "İmleç", default: true }
const COLOR: Opt = { key: "color", label: "Renk", default: "", options: [{ value: "", label: "Varsayılan" }, { value: "var(--m-primary)", label: "Turuncu" }, { value: "var(--m-info)", label: "Mavi" }, { value: "var(--m-success)", label: "Yeşil" }] }
const LOCALE: Opt = { key: "locale", label: "Biçim", default: "tr", options: [{ value: "tr", label: "tr" }, { value: "en", label: "en" }, { value: "de", label: "de" }] }
const END: Opt = { key: "end", label: "Hedef", default: 12500, options: [{ value: 12500, label: "12.500" }, { value: 48000, label: "48.000" }, { value: 99999, label: "99.999" }] }
const phrase = (d: string, more: string[]): Opt => ({ key: "phrase", label: "Metin", default: d, kind: "chips", options: [d, ...more].map((v) => ({ value: v, label: v })) });
const OPTION_KEYS = ["by", "from", "out", "easing", "stagger", "duration", "color", "caret", "hold", "end", "locale", "radius", "strength"]
const FAMILIES: Record<string, string> = { all: "Tümü", enter: "Giriş", loop: "Döngü", decorate: "Süs", content: "İçerik", interactive: "Etkileşim" }

/** Options the Playground set (undefined and "" are left out). */
function optsOf(values: Record<string, unknown> | undefined): TextOptions {
  const o: Record<string, unknown> = {}
  if (values) for (const k of OPTION_KEYS) { const v = values[k]; if (v !== undefined && v !== "") o[k] = v }
  return o as TextOptions
}

/** A small stage: one short phrase, the animation on it, replay / pause buttons and the playback state. Replays when an option changes. */
function Stage(props: { fn: (el: HTMLElement, o?: never) => TextAnimation; values: Record<string, unknown>; text: string; hint?: string }) {
  let el: HTMLElement | undefined
  let cur: TextAnimation | null = null
  const tick = signal(0)
  const state = signal("hazır")
  const play = () => {
    if (!el) return
    cur?.stop()
    el.textContent = (props.values["phrase"] as string | undefined) || props.text
    const a = (props.fn as (e: HTMLElement, o: TextOptions) => TextAnimation)(el, optsOf(props.values))
    cur = a
    state.set("çalışıyor")
    void a.finished.then(() => { if (cur === a) state.set(a.playback.state === "finished" ? "bitti" : "durdu") })
  }
  const toggle = () => {
    const pb = cur?.playback
    if (!pb) return
    if (pb.state === "paused") { pb.play(); state.set("çalışıyor") } else if (pb.state === "running") { pb.pause(); state.set("duraklatıldı") }
  }
  effect(() => { optsOf(props.values); void props.values["phrase"]; tick(); if (el) untrack(play) })
  onCleanup(() => cur?.stop())
  return <div class="sc-ex-text">
    <div class="sc-ex-text-stage"><span class="sc-ex-text-line" ref={(e: HTMLElement) => { el = e; queueMicrotask(() => untrack(play)) }}>{props.text}</span></div>
    <Row>
      <Button size="sm" variant="secondary" onClick={() => tick.update((x) => x + 1)}>Tekrar oynat</Button>
      <Button size="sm" variant="ghost" onClick={toggle}>Duraklat / sürdür</Button>
      <Out label="Durum" value={state} />
    </Row>
    {props.hint ? <p class="sc-ex-text-hint">{props.hint}</p> : null}
  </div>
}

export default examples({
  "march/motion/text": {
    fade: {
      code: `import { fade } from "march/motion/text"

// Fade each character in.
const a = fade(heading)
await a.finished   // plain text is back
// also: fade(el, { by: "word", from: "edges", out: true })`,
      play: { options: [by("char", ["char","word"]), from("start"), OUT, phrase("Hoş geldin Ada", ["Yeni sürüm yayında","Güne güzel başla"])] },
      run: (p: V) => <Stage fn={fade} values={p.values} text="Hoş geldin Ada" hint="Sakin bir giriş: başlıklar ve kısa duyurular için." />,
    },
    dissolve: {
      code: `import { dissolve } from "march/motion/text"

// Characters appear in random order, like a slow dissolve.
const a = dissolve(heading)
await a.finished   // plain text is back
// also: dissolve(el, { by: "word", duration: 1200, out: true })`,
      play: { options: [by("char", ["char","word"]), ms("duration", "Süre", 900, 200, 2000, 100), OUT, phrase("Yeni sürüm yayında", ["Hoş geldin Ada","Güne güzel başla"])] },
      run: (p: V) => <Stage fn={dissolve} values={p.values} text="Yeni sürüm yayında" hint="Harfler rastgele sırayla belirir; yumuşak bir açılış ekranı için." />,
    },
    blurIn: {
      code: `import { blurIn } from "march/motion/text"

// Words come into focus (filter).
const a = blurIn(heading)
await a.finished   // plain text is back
// also: blurIn(el, { by: "word", duration: 1200, out: true })`,
      play: { options: [by("word", ["word","char"]), ms("duration", "Süre", 800, 200, 2000, 100), OUT, phrase("Odaklanan sözcükler", ["Hoş geldin Ada","Yeni sürüm yayında"])] },
      run: (p: V) => <Stage fn={blurIn} values={p.values} text="Odaklanan sözcükler" hint="Sözcükler bulanıklıktan netleşir; vurgulu ilk cümlelerde iyi durur." />,
    },
    rise: {
      code: `import { rise } from "march/motion/text"

// Characters rise from below.
const a = rise(heading, { from: "center" })
await a.finished   // plain text is back
// also: rise(el, { by: "word", from: "edges", out: true })`,
      play: { options: [by("char", ["char","word"]), from("center"), OUT, phrase("Sade ve akıcı", ["Hoş geldin Ada","Yeni sürüm yayında"])] },
      run: (p: V) => <Stage fn={rise} values={p.values} text="Sade ve akıcı" hint="Harfler alttan yükselir; sayfa başlığında en çok kullanılan giriş." />,
    },
    drop: {
      code: `import { drop } from "march/motion/text"

// Characters drop from above.
const a = drop(heading)
await a.finished   // plain text is back
// also: drop(el, { by: "word", easing: "back", out: true })`,
      play: { options: [by("char", ["char","word"]), ease("expo"), OUT, phrase("Her şey hazır", ["Hoş geldin Ada","Yeni sürüm yayında"])] },
      run: (p: V) => <Stage fn={drop} values={p.values} text="Her şey hazır" hint="Harfler yukarıdan iner; bildirim ve uyarı başlıklarına uygun." />,
    },
    slideIn: {
      code: `import { slideIn } from "march/motion/text"

// Characters slide in along the reading direction (mirrored for RTL).
const a = slideIn(heading)
await a.finished   // plain text is back
// also: slideIn(el, { by: "word", stagger: 80, out: true })`,
      play: { options: [by("char", ["char","word"]), ms("stagger", "Aralık", 30, 0, 200, 5), OUT, phrase("Merhaba dünya", ["Hoş geldin Ada","Yeni sürüm yayında"])] },
      run: (p: V) => <Stage fn={slideIn} values={p.values} text="Merhaba dünya" hint="Okuma yönünde kayar; sağdan sola dillerde otomatik aynalanır." />,
    },
    pop: {
      code: `import { pop } from "march/motion/text"

// Characters pop up with a small overshoot.
const a = pop(heading)
await a.finished   // plain text is back
// also: pop(el, { by: "word", easing: "back", out: true })`,
      play: { options: [by("char", ["char","word"]), ease("out"), OUT, phrase("Hoş geldin Ada", ["Yeni sürüm yayında","Güne güzel başla"])] },
      run: (p: V) => <Stage fn={pop} values={p.values} text="Hoş geldin Ada" hint="Küçük bir taşmayla belirir; rozet ve kısa etiketler için." />,
    },
    zoomIn: {
      code: `import { zoomIn } from "march/motion/text"

// Characters shrink into place from large.
const a = zoomIn(heading)
await a.finished   // plain text is back
// also: zoomIn(el, { by: "word", easing: "back", out: true })`,
      play: { options: [by("char", ["char","word"]), ease("expo"), OUT, phrase("Yeni sürüm yayında", ["Hoş geldin Ada","Güne güzel başla"])] },
      run: (p: V) => <Stage fn={zoomIn} values={p.values} text="Yeni sürüm yayında" hint="Büyükten yerine oturur; kampanya ve sayaç başlıklarında dikkat çeker." />,
    },
    flip: {
      code: `import { flip } from "march/motion/text"

// Characters flip down into place (3D).
const a = flip(heading)
await a.finished   // plain text is back
// also: flip(el, { by: "word", easing: "back", out: true })`,
      play: { options: [by("char", ["char","word"]), ease("back"), OUT, phrase("Sade ve akıcı", ["Hoş geldin Ada","Yeni sürüm yayında"])] },
      run: (p: V) => <Stage fn={flip} values={p.values} text="Sade ve akıcı" hint="Üst kenardan aşağı döner (3B); menü ve sekme başlıkları için." />,
    },
    rotateIn: {
      code: `import { rotateIn } from "march/motion/text"

// Characters spin in from a half turn.
const a = rotateIn(heading)
await a.finished   // plain text is back
// also: rotateIn(el, { by: "word", easing: "back", out: true })`,
      play: { options: [by("char", ["char","word"]), ease("back"), OUT, phrase("Her şey hazır", ["Hoş geldin Ada","Yeni sürüm yayında"])] },
      run: (p: V) => <Stage fn={rotateIn} values={p.values} text="Her şey hazır" hint="Yarım turla yerine gelir; oyunlaştırılmış arayüzlerde eğlenceli durur." />,
    },
    swing: {
      code: `import { swing } from "march/motion/text"

// Characters swing down from their top edge like signs on a hook.
const a = swing(heading)
await a.finished   // plain text is back
// also: swing(el, { by: "word", stagger: 80, out: true })`,
      play: { options: [by("char", ["char","word"]), ms("stagger", "Aralık", 30, 0, 200, 5), OUT, phrase("Merhaba dünya", ["Hoş geldin Ada","Yeni sürüm yayında"])] },
      run: (p: V) => <Stage fn={swing} values={p.values} text="Merhaba dünya" hint="Askıdaki tabela gibi sallanarak iner; mağaza ve etkinlik başlıkları için." />,
    },
    elastic: {
      code: `import { elastic } from "march/motion/text"

// Characters stretch in on an elastic spring.
const a = elastic(heading)
await a.finished   // plain text is back
// also: elastic(el, { by: "word", stagger: 80, out: true })`,
      play: { options: [by("char", ["char","word"]), ms("stagger", "Aralık", 40, 0, 120, 5), OUT, phrase("Hoş geldin Ada", ["Yeni sürüm yayında","Güne güzel başla"])] },
      run: (p: V) => <Stage fn={elastic} values={p.values} text="Hoş geldin Ada" hint="Yay gibi gerilip yerine oturur; canlı, çocuksu bir ton verir." />,
    },
    bounceIn: {
      code: `import { bounceIn } from "march/motion/text"

// Characters fall and bounce on the baseline.
const a = bounceIn(heading)
await a.finished   // plain text is back
// also: bounceIn(el, { by: "word", stagger: 80, out: true })`,
      play: { options: [by("char", ["char","word"]), ms("stagger", "Aralık", 50, 0, 200, 5), OUT, phrase("Yeni sürüm yayında", ["Hoş geldin Ada","Güne güzel başla"])] },
      run: (p: V) => <Stage fn={bounceIn} values={p.values} text="Yeni sürüm yayında" hint="Harfler zeminde zıplayarak durur; kutlama mesajlarına uygun." />,
    },
    tilt: {
      code: `import { tilt } from "march/motion/text"

// Words tilt in from the side (3D).
const a = tilt(heading)
await a.finished   // plain text is back
// also: tilt(el, { by: "word", easing: "back", out: true })`,
      play: { options: [by("word", ["word","char"]), ease("expo"), OUT, phrase("Sade ve akıcı", ["Hoş geldin Ada","Yeni sürüm yayında"])] },
      run: (p: V) => <Stage fn={tilt} values={p.values} text="Sade ve akıcı" hint="Sözcükler yandan eğilerek gelir; iki üç sözcüklük sloganlar için." />,
    },
    perspective: {
      code: `import { perspective } from "march/motion/text"

// Words come forward out of the depth (3D).
const a = perspective(heading)
await a.finished   // plain text is back
// also: perspective(el, { by: "word", duration: 1200, out: true })`,
      play: { options: [by("word", ["word","char"]), ms("duration", "Süre", 900, 200, 2000, 100), OUT, phrase("Her şey hazır", ["Hoş geldin Ada","Yeni sürüm yayında"])] },
      run: (p: V) => <Stage fn={perspective} values={p.values} text="Her şey hazır" hint="Sözcükler derinlikten öne çıkar; hero başlıklarında etkili." />,
    },
    skewIn: {
      code: `import { skewIn } from "march/motion/text"

// Characters slide in leaning forward.
const a = skewIn(heading)
await a.finished   // plain text is back
// also: skewIn(el, { by: "word", from: "edges", out: true })`,
      play: { options: [by("char", ["char","word"]), from("start"), OUT, phrase("Merhaba dünya", ["Hoş geldin Ada","Yeni sürüm yayında"])] },
      run: (p: V) => <Stage fn={skewIn} values={p.values} text="Merhaba dünya" hint="Öne eğik kayarak gelir; hızlı ve dinamik bir his verir." />,
    },
    splitReveal: {
      code: `import { splitReveal } from "march/motion/text"

// Alternate characters come from above and below.
const a = splitReveal(heading)
await a.finished   // plain text is back
// also: splitReveal(el, { by: "word", stagger: 80, out: true })`,
      play: { options: [by("char", ["char","word"]), ms("stagger", "Aralık", 20, 0, 200, 5), OUT, phrase("Hoş geldin Ada", ["Yeni sürüm yayında","Güne güzel başla"])] },
      run: (p: V) => <Stage fn={splitReveal} values={p.values} text="Hoş geldin Ada" hint="Harfler dönüşümlü olarak üstten ve alttan gelir." />,
    },
    maskReveal: {
      code: `import { maskReveal } from "march/motion/text"

// Words rise out of a mask (clip-path).
const a = maskReveal(heading)
await a.finished   // plain text is back
// also: maskReveal(el, { by: "word", stagger: 80, out: true })`,
      play: { options: [by("word", ["word","char"]), ms("stagger", "Aralık", 90, 0, 300, 5), OUT, phrase("Yeni sürüm yayında", ["Hoş geldin Ada","Güne güzel başla"])] },
      run: (p: V) => <Stage fn={maskReveal} values={p.values} text="Yeni sürüm yayında" hint="Sözcükler maske içinden yükselir; editoryal başlıklar için." />,
    },
    wipe: {
      code: `import { wipe } from "march/motion/text"

// Lines are wiped on along the reading direction (clip-path).
const a = wipe(heading)
await a.finished   // plain text is back
// also: wipe(el, { by: "word", duration: 1200, out: true })`,
      play: { options: [by("line", ["line","word"]), ms("duration", "Süre", 900, 200, 2000, 100), OUT, phrase("Sade ve akıcı", ["Hoş geldin Ada","Yeni sürüm yayında"])] },
      run: (p: V) => <Stage fn={wipe} values={p.values} text="Sade ve akıcı" hint="Satır, okuma yönünde silinerek açılır; alt yazı ve ara başlıklar için." />,
    },
    cascade: {
      code: `import { cascade } from "march/motion/text"

// Characters tumble down from above, turning.
const a = cascade(heading)
await a.finished   // plain text is back
// also: cascade(el, { by: "word", from: "edges", out: true })`,
      play: { options: [by("char", ["char","word"]), from("start"), OUT, phrase("Her şey hazır", ["Hoş geldin Ada","Yeni sürüm yayında"])] },
      run: (p: V) => <Stage fn={cascade} values={p.values} text="Her şey hazır" hint="Harfler dönerek şelale gibi düşer; oyun ve eğlence temalarına uygun." />,
    },
    spin: {
      code: `import { spin } from "march/motion/text"

// Characters turn a full circle around their vertical axis.
const a = spin(heading)
await a.finished   // plain text is back
// also: spin(el, { by: "word", duration: 1200, out: true })`,
      play: { options: [by("char", ["char","word"]), ms("duration", "Süre", 900, 200, 2000, 100), OUT, phrase("Merhaba dünya", ["Hoş geldin Ada","Yeni sürüm yayında"])] },
      run: (p: V) => <Stage fn={spin} values={p.values} text="Merhaba dünya" hint="Her harf kendi ekseninde tam tur atar; logo yazılarında göz alıcı." />,
    },
    jelly: {
      code: `import { jelly } from "march/motion/text"

// Characters wobble like jelly.
const a = jelly(heading)
await a.finished   // plain text is back
// also: jelly(el, { by: "word", from: "edges", out: true })`,
      play: { options: [by("char", ["char","word"]), from("start"), OUT, phrase("Hoş geldin Ada", ["Yeni sürüm yayında","Güne güzel başla"])] },
      run: (p: V) => <Stage fn={jelly} values={p.values} text="Hoş geldin Ada" hint="Harfler jöle gibi titreşir; düğme ve ödül mesajları için." />,
    },
    trackIn: {
      code: `import { trackIn } from "march/motion/text"

// Lines contract from wide letter spacing into focus (letter-spacing, filter).
const a = trackIn(heading)
await a.finished   // plain text is back
// also: trackIn(el, { by: "word", duration: 1200, out: true })`,
      play: { options: [by("line", ["line","word","char"]), ms("duration", "Süre", 900, 200, 2000, 100), OUT, phrase("Yeni sürüm yayında", ["Hoş geldin Ada","Güne güzel başla"])] },
      run: (p: V) => <Stage fn={trackIn} values={p.values} text="Yeni sürüm yayında" hint="Geniş harf aralığı daralıp netleşir; sinematik başlıklar için." />,
    },
    implode: {
      code: `import { implode } from "march/motion/text"

// Characters fly in from scattered positions and assemble.
const a = implode(heading)
await a.finished   // plain text is back
// also: implode(el, { by: "word", duration: 1200, out: true })`,
      play: { options: [by("char", ["char","word"]), ms("duration", "Süre", 1000, 200, 2000, 100), OUT, phrase("Sade ve akıcı", ["Hoş geldin Ada","Yeni sürüm yayında"])] },
      run: (p: V) => <Stage fn={implode} values={p.values} text="Sade ve akıcı" hint="Dağınık harfler bir araya toplanır; yükleme sonrası ortaya çıkış için." />,
    },
    explode: {
      code: `import { explode } from "march/motion/text"

// Characters burst apart and vanish (an exit; 'out: true' assembles them instead).
const a = explode(heading)
await a.finished   // the text is gone
// also: explode(el, { by: "word", out: true, duration: 1200 })`,
      play: { options: [by("char", ["char","word"]), ASSEMBLE, ms("duration", "Süre", 900, 200, 2000, 100), phrase("Her şey hazır", ["Hoş geldin Ada","Yeni sürüm yayında"])] },
      run: (p: V) => <Stage fn={explode} values={p.values} text="Her şey hazır" hint="Metin dağılıp kaybolur; çıkış animasyonu olarak ya da toplanarak geri gelir." />,
    },
    inkBleed: {
      code: `import { inkBleed } from "march/motion/text"

// Words spread like ink on paper, from the middle out (filter).
const a = inkBleed(heading)
await a.finished   // plain text is back
// also: inkBleed(el, { by: "word", duration: 1200, out: true })`,
      play: { options: [by("word", ["word","char"]), ms("duration", "Süre", 1100, 200, 2000, 100), OUT, phrase("Merhaba dünya", ["Hoş geldin Ada","Yeni sürüm yayında"])] },
      run: (p: V) => <Stage fn={inkBleed} values={p.values} text="Merhaba dünya" hint="Sözcükler mürekkep gibi ortadan yayılır; edebi ve sakin tonlar için." />,
    },
    pixelate: {
      code: `import { pixelate } from "march/motion/text"

// Characters resolve in coarse steps, like a low-resolution image sharpening (filter).
const a = pixelate(heading)
await a.finished   // plain text is back
// also: pixelate(el, { by: "word", stagger: 80, out: true })`,
      play: { options: [by("char", ["char","word"]), ms("stagger", "Aralık", 35, 0, 200, 5), OUT, phrase("Hoş geldin Ada", ["Yeni sürüm yayında","Güne güzel başla"])] },
      run: (p: V) => <Stage fn={pixelate} values={p.values} text="Hoş geldin Ada" hint="Harfler kaba adımlarla keskinleşir; retro ve teknoloji temaları için." />,
    },
    glitch: {
      code: `import { glitch } from "march/motion/text"

// A digital glitch: characters jump and split into color channels.
const a = glitch(heading)
await a.finished   // plain text is back
// also: glitch(el, { by: "word", from: "edges", out: true })`,
      play: { options: [by("char", ["char","word"]), from("random"), OUT, phrase("Yeni sürüm yayında", ["Hoş geldin Ada","Güne güzel başla"])] },
      run: (p: V) => <Stage fn={glitch} values={p.values} text="Yeni sürüm yayında" hint="Dijital parazit etkisi; hata ve sistem durumu mesajlarına uygun." />,
    },
    shake: {
      code: `import { shake } from "march/motion/text"

// Words shake side to side (attention).
const a = shake(heading)
await a.finished   // plain text is back
// also: shake(el, { by: "word", duration: 1200, out: true })`,
      play: { options: [by("word", ["word","char"]), ms("duration", "Süre", 600, 200, 2000, 100), OUT, phrase("Sade ve akıcı", ["Hoş geldin Ada","Yeni sürüm yayında"])] },
      run: (p: V) => <Stage fn={shake} values={p.values} text="Sade ve akıcı" hint="Sözcükler yana sallanır; dikkat gerektiren uyarılar için." />,
    },
    wave: {
      code: `import { wave } from "march/motion/text"

// Characters ripple up and down in a wave.
const a = wave(badge)
a.stop()   // ends the loop, the text is back
// also: wave(el, { by: "word", stagger: 80 })`,
      play: { options: [by("char", ["char","word"]), ms("stagger", "Aralık", 60, 0, 200, 5), phrase("Her şey hazır", ["Hoş geldin Ada","Yeni sürüm yayında"])] },
      run: (p: V) => <Stage fn={wave} values={p.values} text="Her şey hazır" hint="Harfler sırayla yukarı aşağı gider; bekleme ve karşılama etiketleri için." />,
    },
    bounce: {
      code: `import { bounce } from "march/motion/text"

// Characters hop one after another.
const a = bounce(badge)
a.stop()   // ends the loop, the text is back
// also: bounce(el, { by: "word", stagger: 80 })`,
      play: { options: [by("char", ["char","word"]), ms("stagger", "Aralık", 70, 0, 200, 5), phrase("Merhaba dünya", ["Hoş geldin Ada","Yeni sürüm yayında"])] },
      run: (p: V) => <Stage fn={bounce} values={p.values} text="Merhaba dünya" hint="Harfler sürekli zıplar; yüklenirken eğlenceli bir bekleme göstergesi olur." />,
    },
    jitter: {
      code: `import { jitter } from "march/motion/text"

// Characters tremble nervously.
const a = jitter(badge)
a.stop()   // ends the loop, the text is back
// also: jitter(el, { by: "word", duration: 1200 })`,
      play: { options: [by("char", ["char","word"]), ms("duration", "Süre", 400, 100, 1000, 50), phrase("Hoş geldin Ada", ["Yeni sürüm yayında","Güne güzel başla"])] },
      run: (p: V) => <Stage fn={jitter} values={p.values} text="Hoş geldin Ada" hint="Harfler hafifçe titrer; gerilim ve hata hissi vermek için." />,
    },
    float: {
      code: `import { float } from "march/motion/text"

// Words drift gently, as if under water.
const a = float(badge)
a.stop()   // ends the loop, the text is back
// also: float(el, { by: "word", stagger: 80 })`,
      play: { options: [by("word", ["word","char"]), ms("stagger", "Aralık", 300, 0, 600, 50), phrase("Yeni sürüm yayında", ["Hoş geldin Ada","Güne güzel başla"])] },
      run: (p: V) => <Stage fn={float} values={p.values} text="Yeni sürüm yayında" hint="Sözcükler suda gibi süzülür; sakin boş durum ekranlarına uygun." />,
    },
    pulse: {
      code: `import { pulse } from "march/motion/text"

// Characters swell and shrink in turn.
const a = pulse(badge)
a.stop()   // ends the loop, the text is back
// also: pulse(el, { by: "word", stagger: 80 })`,
      play: { options: [by("char", ["char","word"]), ms("stagger", "Aralık", 80, 0, 200, 5), phrase("Sade ve akıcı", ["Hoş geldin Ada","Yeni sürüm yayında"])] },
      run: (p: V) => <Stage fn={pulse} values={p.values} text="Sade ve akıcı" hint="Harfler sırayla büyüyüp küçülür; canlı durum etiketleri için." />,
    },
    rainbow: {
      code: `import { rainbow } from "march/motion/text"

// Characters cycle through the hues.
const a = rainbow(badge)
a.stop()   // ends the loop, the text is back
// also: rainbow(el, { by: "word", stagger: 80 })`,
      play: { options: [by("char", ["char","word"]), ms("stagger", "Aralık", 90, 0, 200, 5), phrase("Her şey hazır", ["Hoş geldin Ada","Yeni sürüm yayında"])] },
      run: (p: V) => <Stage fn={rainbow} values={p.values} text="Her şey hazır" hint="Renkler harf harf döner; kutlama ve etkinlik başlıklarında şenlik verir." />,
    },
    neon: {
      code: `import { neon } from "march/motion/text"

// A flickering neon sign (text-shadow glow).
const a = neon(badge)
a.stop()   // ends the loop, the text is back
// also: neon(el, { by: "word", stagger: 80 })`,
      play: { options: [by("word", ["word","char"]), ms("stagger", "Aralık", 400, 0, 800, 50), phrase("Açık Neon Tabela", ["Hoş geldin Ada","Yeni sürüm yayında"])] },
      run: (p: V) => <Stage fn={neon} values={p.values} text="Açık Neon Tabela" hint="Titreyen neon tabela; gece teması ve mekan duyurularında iyi durur." />,
    },
    breathe: {
      code: `import { breathe } from "march/motion/text"

// Letter spacing breathes in and out (letter-spacing).
const a = breathe(badge)
a.stop()   // ends the loop, the text is back
// also: breathe(el, { by: "word", duration: 1200 })`,
      play: { options: [by("line", ["line","word","char"]), ms("duration", "Süre", 1800, 600, 3000, 200), phrase("Merhaba dünya", ["Hoş geldin Ada","Yeni sürüm yayında"])] },
      run: (p: V) => <Stage fn={breathe} values={p.values} text="Merhaba dünya" hint="Harf aralığı nefes alır gibi açılıp kapanır; meditasyon ve sakin başlıklar için." />,
    },
    glow: {
      code: `import { glow } from "march/motion/text"

// A soft glow pulses behind the text (text-shadow).
const a = glow(badge)
a.stop()   // ends the loop, the text is back
// also: glow(el, { by: "word", duration: 1200 })`,
      play: { options: [by("line", ["line","word","char"]), ms("duration", "Süre", 1400, 400, 3000, 200), phrase("Hoş geldin Ada", ["Yeni sürüm yayında","Güne güzel başla"])] },
      run: (p: V) => <Stage fn={glow} values={p.values} text="Hoş geldin Ada" hint="Arkada yumuşak bir ışıma atar; vurgulanan tek bir satır için." />,
    },
    shimmer: {
      code: `import { shimmer } from "march/motion/text"

// A light band sweeps across the text, over and over (gradient text).
const a = shimmer(badge)
a.stop()   // ends the loop, the text is back
// also: shimmer(el, { by: "word", duration: 1200 })`,
      play: { options: [by("line", ["line","word"]), ms("duration", "Süre", 1800, 600, 3000, 200), phrase("Yeni sürüm yayında", ["Hoş geldin Ada","Güne güzel başla"])] },
      run: (p: V) => <Stage fn={shimmer} values={p.values} text="Yeni sürüm yayında" hint="Işık bandı metnin üzerinden geçer; yükleniyor ve premium etiketlerinde kullanılır." />,
    },
    highlight: {
      code: `import { highlight } from "march/motion/text"

// A marker pen highlights each line.
const a = highlight(title)
await a.finished
// also: highlight(el, { color: "var(--m-info)", duration: 1200 })`,
      play: { options: [COLOR, ms("duration", "Süre", 700, 200, 2000, 100), phrase("Önemli bir cümle", ["Hoş geldin Ada","Yeni sürüm yayında"])] },
      run: (p: V) => <Stage fn={highlight} values={p.values} text="Önemli bir cümle" hint="Fosforlu kalem gibi satırı işaretler; önemli cümleyi öne çıkarır." />,
    },
    underline: {
      code: `import { underline } from "march/motion/text"

// An underline draws itself under each line.
const a = underline(title)
await a.finished
// also: underline(el, { color: "var(--m-info)", duration: 1200 })`,
      play: { options: [COLOR, ms("duration", "Süre", 700, 200, 2000, 100), phrase("Altı çizili başlık", ["Hoş geldin Ada","Yeni sürüm yayında"])] },
      run: (p: V) => <Stage fn={underline} values={p.values} text="Altı çizili başlık" hint="Çizgi satırın altına çekilir; bağlantı ve ara başlıklara uygun." />,
    },
    strike: {
      code: `import { strike } from "march/motion/text"

// A line strikes through the text.
const a = strike(title)
await a.finished
// also: strike(el, { color: "var(--m-info)", duration: 1200 })`,
      play: { options: [COLOR, ms("duration", "Süre", 700, 200, 2000, 100), phrase("Eski fiyat 99 TL", ["Hoş geldin Ada","Yeni sürüm yayında"])] },
      run: (p: V) => <Stage fn={strike} values={p.values} text="Eski fiyat 99 TL" hint="Çizgi satırın ortasından geçer; eski fiyat ve tamamlanan işlerde kullanılır." />,
    },
    gradientSweep: {
      code: `import { gradientSweep } from "march/motion/text"

// A band of color sweeps once across the text (gradient text), leaving it as it was.
const a = gradientSweep(title)
await a.finished
// also: gradientSweep(el, { color: "var(--m-info)", duration: 1200 })`,
      play: { options: [COLOR, ms("duration", "Süre", 1400, 400, 3000, 200), phrase("Parlayan başlık", ["Hoş geldin Ada","Yeni sürüm yayında"])] },
      run: (p: V) => <Stage fn={gradientSweep} values={p.values} text="Parlayan başlık" hint="Renkli bir bant bir kez geçer ve metin eski haline döner." />,
    },
    strokeDraw: {
      code: `import { strokeDraw } from "march/motion/text"

// The letter outlines are drawn with a pen (SVG stroke), then filled.
const a = strokeDraw(title)
await a.finished
// also: strokeDraw(el, { color: "var(--m-info)", duration: 1200 })`,
      play: { options: [COLOR, ms("duration", "Süre", 2200, 800, 4000, 200), phrase("Elle çizilmiş", ["Hoş geldin Ada","Yeni sürüm yayında"])] },
      run: (p: V) => <Stage fn={strokeDraw} values={p.values} text="Elle çizilmiş" hint="Harf çizgileri kalemle çizilir, sonra dolar; imza ve logo yazılarında etkili." />,
    },
    typewriter: {
      code: `import { typewriter } from "march/motion/text"

// Types the text one character at a time, with a caret. 'out: true' deletes it.
const a = typewriter(line)
await a.finished
// also: typewriter(el, { caret: false, duration: 1200, out: true })`,
      play: { options: [CARET, ms("duration", "Süre", 1500, 500, 4000, 250), OUT] },
      run: (p: V) => <Stage fn={typewriter} values={p.values} text="Merhaba, ben Ada" hint="Daktilo gibi harf harf yazar; çıkışta geri siler." />,
    },
    typeLoop: {
      code: `import { typeLoop } from "march/motion/text"

// Types a word, deletes it, types the next one: forever.
const a = typeLoop(slot)   // text: "hızlı|küçük|erişilebilir"
// or: typeLoop(slot, { words: ["hızlı", "küçük"] })
a.stop()
// also: typeLoop(el, { hold: 2400 })`,
      play: { options: [ms("hold", "Bekleme", 1200, 400, 3000, 200)] },
      run: (p: V) => <Stage fn={typeLoop} values={p.values} text="hızlı|küçük|erişilebilir" hint="Sözcükleri yazar, siler, sıradakine geçer; değişen değer önerilerinde kullanılır." />,
    },
    scramble: {
      code: `import { scramble } from "march/motion/text"

// Characters spin through random glyphs and settle one by one.
const a = scramble(line)
await a.finished
// also: scramble(el, { duration: 1200, from: "edges" })`,
      play: { options: [ms("duration", "Süre", 1400, 600, 3000, 200), from("start")] },
      run: (p: V) => <Stage fn={scramble} values={p.values} text="Şifre çözülüyor" hint="Karışık karakterlerden asıl metne çözülür; başlık geçişleri için." />,
    },
    decode: {
      code: `import { decode } from "march/motion/text"

// Characters appear as flickering binary in random order, then decode.
const a = decode(line)
await a.finished
// also: decode(el, { duration: 1200, from: "edges" })`,
      play: { options: [ms("duration", "Süre", 1600, 600, 3000, 200), from("random")] },
      run: (p: V) => <Stage fn={decode} values={p.values} text="Gizli ileti çözüldü" hint="İkili kodlardan okunur metne dönüşür; teknik temalara uygun." />,
    },
    matrix: {
      code: `import { matrix } from "march/motion/text"

// Green glyphs rain into place and turn into the text.
const a = matrix(line)
await a.finished
// also: matrix(el, { duration: 1200, from: "edges" })`,
      play: { options: [ms("duration", "Süre", 1800, 600, 3000, 200), from("random")] },
      run: (p: V) => <Stage fn={matrix} values={p.values} text="Sisteme giriş" hint="Yağan karakterlerden metin belirir; hacker estetiği için." />,
    },
    splitFlap: {
      code: `import { splitFlap } from "march/motion/text"

// A split-flap board: each character flips through the alphabet to its letter.
const a = splitFlap(line)
await a.finished
// also: splitFlap(el, { duration: 1200, from: "edges" })`,
      play: { options: [ms("duration", "Süre", 2000, 600, 4000, 200), from("start")] },
      run: (p: V) => <Stage fn={splitFlap} values={p.values} text="KALKIŞ 09:45" hint="Havalimanı panosu gibi harfler çevrilir; saat ve kalkış bilgileri için." />,
    },
    counter: {
      code: `import { counter } from "march/motion/text"

// Counts up to the number in the text, formatted for the locale.
const a = counter(line, { locale: "tr" })
await a.finished
// or: counter(price, { end: 48000 })
// also: counter(el, { locale: "de", end: 48000 })`,
      play: { options: [LOCALE, END] },
      run: (p: V) => <Stage fn={counter} values={p.values} text="₺12.500" hint="Metindeki sayıya kadar sayar; fiyat ve istatistik kartları için." />,
    },
    odometer: {
      code: `import { odometer } from "march/motion/text"

// Each digit rolls like a mechanical counter wheel.
const a = odometer(line)
await a.finished
// also: odometer(el, { duration: 1200, from: "edges" })`,
      play: { options: [ms("duration", "Süre", 1800, 600, 3000, 200), from("end")] },
      run: (p: V) => <Stage fn={odometer} values={p.values} text="2026" hint="Rakamlar kilometre sayacı gibi kayar; yıl ve adet gösterimleri için." />,
    },
    wordCycle: {
      code: `import { wordCycle } from "march/motion/text"

// Words roll in from below and out at the top, one after another.
const a = wordCycle(slot)   // text: "hızlı|küçük|erişilebilir"
// or: wordCycle(slot, { words: ["hızlı", "küçük"] })
a.stop()
// also: wordCycle(el, { hold: 2400 })`,
      play: { options: [ms("hold", "Bekleme", 1600, 400, 3000, 200)] },
      run: (p: V) => <Stage fn={wordCycle} values={p.values} text="hızlı|küçük|erişilebilir" hint="Sözcükler aşağıdan yukarı sırayla değişir; cümle içinde döngü yapar." />,
    },
    morph: {
      code: `import { morph } from "march/motion/text"

// Texts melt into each other with a blur.
const a = morph(slot)   // text: "Merhaba|Hello|مرحبا"
// or: morph(slot, { words: ["hızlı", "küçük"] })
a.stop()
// also: morph(el, { hold: 2400 })`,
      play: { options: [ms("hold", "Bekleme", 1600, 400, 3000, 200)] },
      run: (p: V) => <Stage fn={morph} values={p.values} text="Merhaba|Hello|مرحبا" hint="Metinler birbirine bulanarak dönüşür; dil seçenekleri tanıtımında iyi durur." />,
    },
    magnetic: {
      code: `import { magnetic } from "march/motion/text"

// Characters lean toward the pointer.
const a = magnetic(title)
a.stop()   // removes the pointer listeners
// also: magnetic(el, { radius: 180, strength: 24 })`,
      play: { options: [ms("radius", "Erişim", 120, 40, 240, 10), ms("strength", "Güç", 14, 4, 40, 2)] },
      run: (p: V) => <Stage fn={magnetic} values={p.values} text="İşaretçiyi yaklaştır" hint="Harfler işaretçiye doğru çekilir; oyuncu ve ilgi çekici başlıklar için." />,
    },
    repel: {
      code: `import { repel } from "march/motion/text"

// Characters dodge away from the pointer.
const a = repel(title)
a.stop()   // removes the pointer listeners
// also: repel(el, { radius: 180, strength: 24 })`,
      play: { options: [ms("radius", "Erişim", 120, 40, 240, 10), ms("strength", "Güç", 14, 4, 40, 2)] },
      run: (p: V) => <Stage fn={repel} values={p.values} text="İşaretçiyi yaklaştır" hint="Harfler işaretçiden kaçar; keşfetmeyi teşvik eden etkileşimlerde kullanılır." />,
    },
    splitText: {
      code: `import { splitText } from "march/motion/text"

const s = splitText(heading, "char")
s.parts.forEach((p, i) => p.classList.toggle("odd", i % 2 === 1))
s.revert()   // the original nodes are back`,
      play: { options: [by("char", ["char", "word", "line"])] },
      run: (p: V) => {
        let el: HTMLElement | undefined
        let cur: SplitText | null = null
        const info = signal("")
        const cut = () => {
          if (!el) return
          cur?.revert()
          cur = splitText(el, p.values["by"] as "char")
          cur.parts.forEach((x) => x.classList.add("sc-ex-text-part"))
          info.set(`${cur.parts.length} parça (${cur.by}): ${cur.parts.slice(0, 4).map((x) => x.textContent).join(" | ")}`)
        }
        const back = () => { cur?.revert(); cur = null; info.set("Özgün metin geri geldi") }
        effect(() => { void p.values["by"]; if (el) untrack(cut) })
        onCleanup(() => cur?.revert())
        return <div class="sc-ex-text">
          <div class="sc-ex-text-stage"><span class="sc-ex-text-line" ref={(e: HTMLElement) => { el = e; queueMicrotask(() => untrack(cut)) }}>Çağrı merkezi açık</span></div>
          <Row><Button size="sm" variant="secondary" onClick={cut}>Böl</Button><Button size="sm" variant="ghost" onClick={back}>Geri al</Button></Row>
          <Out label="Sonuç" value={info} />
        </div>
      },
    },
    graphemes: {
      code: `import { graphemes } from "march/motion/text"

graphemes("Ağaç 🇹🇷 👨‍👩‍👧")   // ["A", "ğ", "a", "ç", " ", "🇹🇷", " ", "👨‍👩‍👧"]`,
      run: () => {
        const text = signal("Ağaç 🇹🇷 👨‍👩‍👧 İ")
        return <div class="sc-ex-stack">
          <TextInput value={text} aria-label="Metin" />
          <Out label="Adet" value={() => `${graphemes(text()).length} (kod noktası: ${[...text()].length})`} />
          <Out label="Parçalar" value={() => graphemes(text()).join(" · ")} />
        </div>
      },
    },
    isRtl: {
      code: `import { isRtl } from "march/motion/text"

isRtl(heading)                        // false
heading.dir = "rtl"; isRtl(heading)   // true`,
      run: () => {
        let el: HTMLElement | undefined
        const res = signal("false")
        const set = (d: string) => { if (el) { el.dir = d; res.set(String(isRtl(el))) } }
        return <div class="sc-ex-stack">
          <div class="sc-ex-text-stage"><span class="sc-ex-text-line" ref={(e: HTMLElement) => { el = e }}>Merhaba dünya</span></div>
          <Row><Button size="sm" variant="secondary" onClick={() => set("ltr")}>Soldan sağa</Button><Button size="sm" variant="secondary" onClick={() => set("rtl")}>Sağdan sola</Button></Row>
          <Out label="isRtl(el)" value={res} />
        </div>
      },
    },
    order: {
      code: `import { order } from "march/motion/text"

order(5, "center")   // [2, 1, 0, 1, 2]
order(5, "end")      // [4, 3, 2, 1, 0]`,
      play: { options: [from("center"), { key: "n", label: "Parça", default: 5, options: [3, 5, 7, 9] }] },
      run: (p: V) => <div class="sc-ex-stack">
        <Out label={`order(n, from)`} value={() => JSON.stringify(order(p.values["n"] as number, p.values["from"] as StaggerFrom))} />
        <div class="sc-ex-text-ranks">{() => order(p.values["n"] as number, p.values["from"] as StaggerFrom).map((r) => <span class="sc-ex-text-rank">{r}</span>)}</div>
      </div>,
    },
    parseNumber: {
      code: `import { parseNumber } from "march/motion/text"

parseNumber("₺12.500,75 KDV dahil")
// { value: 12500.75, decimals: 2, before: "₺", after: " KDV dahil" }`,
      run: () => {
        const text = signal("₺12.500,75 KDV dahil")
        return <div class="sc-ex-stack">
          <TextInput value={text} aria-label="Sayı içeren metin" />
          <Out label="Sonuç" value={() => JSON.stringify(parseNumber(text()))} />
        </div>
      },
    },
  },
  "march/motion/text/meta": {
    TEXT_ANIMATIONS: {
      code: `import { TEXT_ANIMATIONS } from "march/motion/text/meta"

TEXT_ANIMATIONS.filter((a) => a.family === "loop").map((a) => a.name)`,
      play: { options: [{ key: "family", label: "Aile", default: "all", options: Object.keys(FAMILIES).map((v) => ({ value: v, label: FAMILIES[v]! })) }] },
      run: (p: V) => {
        const list = () => TEXT_ANIMATIONS.filter((a) => p.values["family"] === "all" || a.family === (p.values["family"] as TextFamily))
        return <div class="sc-ex-stack">
          <Out label="Adet" value={() => list().length} />
          <div class="sc-ex-text-chips">{() => list().map((a) => <Badge tone="info">{a.name}</Badge>)}</div>
        </div>
      },
    },
  },
  "march/fx": {
    Aurora: {
      code: `<div class="hero">
  <Aurora colors={["var(--m-primary)", "var(--m-info)", "var(--m-success)"]} />
  <h2>Hoş geldin</h2>
</div>`,
      play: { options: [{ key: "blobs", label: "Renk sayısı", default: 3, options: [1, 2, 3, 4] }] },
      run: (p: V) => <div class="sc-ex-text-fx">
        {() => <Aurora colors={["var(--m-primary)", "var(--m-info)", "var(--m-success)", "var(--m-warning)"].slice(0, p.values["blobs"] as number)} />}
        <strong class="sc-ex-text-fx-title">Hoş geldin</strong>
      </div>,
    },
    confetti: {
      code: `import { confetti } from "march/fx"

await confetti({ x: 200, y: 160, count: 120, spread: 70 })   // removes its canvas when done`,
      play: { options: [{ key: "count", label: "Adet", default: 120, options: [40, 120, 240] }, { key: "spread", label: "Açı", default: 70, options: [30, 70, 120] }] },
      run: (p: V) => {
        const state = signal("hazır")
        const go = (e: MouseEvent) => {
          state.set("uçuyor…")
          void confetti({ x: e.clientX, y: e.clientY, count: p.values["count"] as number, spread: p.values["spread"] as number }).then(() => state.set("bitti"))
        }
        return <Row><Button variant="primary" onClick={go}>Kutla</Button><Out label="Durum" value={state} /></Row>
      },
    },
    Noise: {
      code: `<Noise class="card">
  <h3>Dokulu kart</h3>
</Noise>`,
      play: { options: [{ key: "grain", label: "Gren", default: true }, { key: "tone", label: "Zemin", default: "primary", options: [{ value: "primary", label: "Turuncu" }, { value: "info", label: "Mavi" }, { value: "plain", label: "Düz" }] }] },
      run: (p: V) => <div class="sc-ex-text-fx-wrap">{() => {
        const cls = `sc-ex-text-card sc-ex-text-tone-${p.values["tone"]}`
        return p.values["grain"]
          ? <Noise class={cls}><strong>Dokulu kart</strong></Noise>
          : <div class={cls}><strong>Dokulu kart</strong></div>
      }}</div>,
    },
    Particles: {
      code: `<div class="hero">
  <Particles count={70} links={110} speed={0.35} interactive class="m-fx-fill" />
  <h2>Ağ</h2>
</div>`,
      play: { options: [{ key: "count", label: "Parçacık", default: 70, options: [20, 70, 140] }, { key: "links", label: "Bağlantı", default: 110, options: [{ value: 0, label: "Yok" }, { value: 70, label: "Kısa" }, { value: 110, label: "Uzun" }] }, { key: "interactive", label: "İşaretçiyi çek", default: true }] },
      run: (p: V) => <div class="sc-ex-text-fx">
        {() => <Particles count={p.values["count"] as number} links={p.values["links"] as number} speed={0.35} interactive={!!p.values["interactive"]} color="var(--m-primary)" class="m-fx-fill" />}
        <strong class="sc-ex-text-fx-title">Ağ</strong>
      </div>,
    },
    spotlight: {
      code: `import { spotlight } from "march/fx"

const off = spotlight(card)   // a light follows the pointer
off()`,
      run: () => {
        let off: (() => void) | undefined
        onCleanup(() => off?.())
        return <div class="sc-ex-text-card sc-ex-text-tone-plain" ref={(e: HTMLElement) => { off = spotlight(e) }}><strong>İşaretçiyi kartın üzerinde gezdir</strong></div>
      },
    },
  },
})
