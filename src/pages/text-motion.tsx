// Motion › Text animations: every march/motion/text export with a live preview, a replay button and its measured
// cost; a shared playground (text, split unit, duration, stagger, easing — each option shows only where it has an
// effect) with a Code tab. Cards play when they scroll into view; everything follows the global motion controls.
import "./text-motion.css";
import { signal, effect, onCleanup, untrack } from "march";
import * as TX from "march/motion/text";
import { TEXT_ANIMATIONS, type TextAnimMeta, type TextFamily, type TextOptionKey } from "march/motion/text/meta";
import { motion, ease } from "march/motion";
import { Button, Badge, Tabs, CodeView, Slider, Field } from "march/ui";
import { Segmented, TextInput } from "march/forms";
import { Demo, Section } from "../demo.tsx";
import { Playground, type PlayOption } from "../playground.tsx";
import { TEXT_COSTS } from "../text-costs.gen.ts";

type Run = (el: HTMLElement, o?: Record<string, unknown>) => TX.TextAnimation;
const FN = TX as unknown as Record<string, Run>;
const SAMPLE = "March";

const FAMILY: Record<TextFamily, { title: string; desc: string }> = {
  enter: { title: "Giriş ve çıkış", desc: "Parça parça giriş; hepsi { out: true } ile çıkış olarak da oynar." },
  loop: { title: "Döngüler", desc: "Sürekli efektler: ekran dışında ve “Tümünü durdur” ile durur, azaltılmış harekette sabit kalır." },
  decorate: { title: "Süslemeler", desc: "Metnin üstüne çizilen işaretler: fosforlu kalem, alt çizgi, üstü çizili, renk süpürmesi, SVG kontur." },
  content: { title: "Metin değişimi", desc: "Görünen karakterler değişir, ekran okuyucu her zaman gerçek metni duyar." },
  interactive: { title: "Etkileşimli", desc: "Harfler işaretçiye tepki verir; azaltılmış harekette kıpırdamaz." },
};

const DESC: Record<string, string> = {
  fade: "Harfler sırayla belirir.", dissolve: "Harfler rastgele sırayla, titreyerek çözülür.", blurIn: "Kelimeler bulanıklıktan netleşir.",
  rise: "Harfler aşağıdan yükselir.", drop: "Harfler yukarıdan düşer.", slideIn: "Harfler okuma yönünde kayar (RTL'de aynalanır).",
  pop: "Harfler küçük bir taşmayla patlar.", zoomIn: "Harfler büyükten yerine küçülür.", flip: "Harfler 3B olarak aşağı döner.",
  rotateIn: "Harfler yarım turdan dönerek gelir.", swing: "Harfler kancadaki tabela gibi sallanarak iner.", elastic: "Harfler elastik yayla gerilir.",
  bounceIn: "Harfler düşüp taban çizgisinde zıplar.", tilt: "Kelimeler yandan 3B eğilerek gelir.", perspective: "Kelimeler derinlikten öne çıkar.",
  skewIn: "Harfler öne eğik kayar.", splitReveal: "Harfler sırayla üstten ve alttan gelir.", maskReveal: "Kelimeler bir maskenin içinden yükselir.",
  wipe: "Satırlar okuma yönünde silinerek açılır.", cascade: "Harfler dönerek yukarıdan dökülür.", spin: "Harfler dikey eksende tam tur atar.",
  jelly: "Harfler jöle gibi esner.", trackIn: "Geniş harf aralığı odaklanarak toplanır.", implode: "Dağınık harfler uçup birleşir.",
  explode: "Harfler patlayıp kaybolur (çıkış).", inkBleed: "Kelimeler ortadan dışa mürekkep gibi yayılır.", pixelate: "Harfler kaba adımlarla netleşir.",
  glitch: "Dijital bozulma: harfler sıçrar, renk kanallarına ayrılır.", shake: "Kelimeler sağa sola sarsılır.",
  wave: "Harfler dalga gibi inip kalkar.", bounce: "Harfler sırayla zıplar.", jitter: "Harfler sinirli sinirli titrer.",
  float: "Kelimeler su altındaymış gibi süzülür.", pulse: "Harfler sırayla şişip söner.", rainbow: "Harfler gökkuşağı renklerinde döner.",
  neon: "Titreyen neon tabela.", breathe: "Harf aralığı nefes alır.", glow: "Metnin arkasında yumuşak bir ışık nabız gibi atar.",
  shimmer: "Metnin üstünden ışık bandı geçer.",
  highlight: "Fosforlu kalem satırları işaretler.", underline: "Alt çizgi kendini çizer.", strike: "Metnin üstü çizilir.",
  gradientSweep: "Bir renk bandı metnin üstünden bir kez geçer.", strokeDraw: "Harf konturları kalemle çizilir, sonra dolar (SVG).",
  typewriter: "Daktilo: imleçle harf harf yazar.", typeLoop: "Bir kelime yazar, siler, sonrakini yazar.", scramble: "Rastgele karakterler sırayla yerine oturur.",
  decode: "İkili sayılar rastgele sırayla çözülür.", matrix: "Yeşil glifler yağıp metne dönüşür.", splitFlap: "Havalimanı panosu: her harf alfabede döner.",
  counter: "Metindeki sayıya, yerel biçimde sayar.", odometer: "Her rakam sayaç çarkı gibi döner.", wordCycle: "Kelimeler alttan girip üstten çıkar.",
  morph: "Metinler bulanıklıkla birbirine erir.", magnetic: "Harfler işaretçiye doğru eğilir.", repel: "Harfler işaretçiden kaçar.",
};

const kb = (b: number | undefined): string => (b == null ? "–" : `${(b / 1024).toLocaleString("tr", { maximumFractionDigits: 1, minimumFractionDigits: 1 })} KB`);

/** Global motion control: speed, pause all, reduced motion (the same switches the whole showcase uses). */
function Control() {
  const s = motion.settings()
  let $speed = s.speed
  let $reduce: string = s.reduce
  effect(() => { motion.config({ speed: $speed, reduce: $reduce as "system" }) })
  return <div class="sc-tx-control">
    <Field label={() => `Global hız: ${$speed.toFixed(2)}×`}><Slider bind:value={$speed} min={0.1} max={3} step={0.05} /></Field>
    <Field label="Hareketi azalt"><Segmented bind:value={$reduce} options={[{ value: "system", label: "Sistem" }, { value: "reduce", label: "Azalt" }, { value: "full", label: "Tam" }]} /></Field>
    <Button variant={motion.paused() ? "primary" : "secondary"} on:click={() => motion.togglePause()}>{() => motion.paused() ? "Tümünü sürdür" : "Tümünü durdur"}</Button>
  </div>
}

/** Run `fn` once when the element scrolls into view (at once without IntersectionObserver). */
function whenVisible(el: Element, fn: () => void): () => void {
  if (typeof IntersectionObserver !== "function") { queueMicrotask(fn); return () => {} }
  const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); fn() } }, { threshold: 0.3 })
  io.observe(el)
  return () => io.disconnect()
}

/** One animation: name, cost, description, live preview, replay. */
function Card(props: { m: TextAnimMeta }) {
  const m = props.m
  let el: HTMLElement | undefined
  let cur: TX.TextAnimation | null = null
  let off: (() => void) | null = null
  const play = () => { if (el) cur = FN[m.name]!(el) }
  onCleanup(() => { off?.(); cur?.stop() })
  const pointer = m.family === "interactive"
  return <article class="sc-tx-card" data-tx={m.name}>
    <header class="sc-tx-card-head">
      <code class="sc-tx-name">{m.name}</code>
      <Badge tone="info">{kb(TEXT_COSTS[m.name])}</Badge>
    </header>
    <p class="sc-tx-desc">{DESC[m.name]}</p>
    <div class="sc-tx-stage">
      <span class="sc-tx-text" ref={(e: HTMLElement) => { el = e; off = whenVisible(e, play) }}>{m.sample ?? SAMPLE}</span>
    </div>
    <footer class="sc-tx-card-foot">
      <code class="sc-tx-snippet">{`${m.name}(el)`}</code>
      {pointer ? <span class="sc-tx-hint">İşaretçiyi yaklaştır</span> : <Button size="sm" variant="ghost" on:click={play} aria-label={`${m.name}: tekrar oynat`}>Tekrar oynat</Button>}
    </footer>
  </article>
}

const EASINGS = ["out", "in-out", "expo", "back", "linear", "spring-wobbly", "bounce", "elastic", "steps(5, end)"];
/** A small curve of an easing (preview card for the picker). */
function Curve(props: { name: string }) {
  const f = ease(props.name)
  const pts = Array.from({ length: 41 }, (_, i) => { const t = i / 40; return `${(4 + t * 52).toFixed(1)},${(46 - f(t) * 32).toFixed(1)}` }).join(" ")
  return <svg class="sc-tx-curve" viewBox="0 0 60 56" aria-hidden="true"><polyline points={pts} /></svg>
}
const UNITS = [
  { value: "char", label: "Harf", preview: () => <span class="sc-tx-pv sc-tx-pv-char"><i>H</i><i>a</i><i>r</i><i>f</i></span> },
  { value: "word", label: "Kelime", preview: () => <span class="sc-tx-pv"><i>Hadi</i><i>March</i></span> },
  { value: "line", label: "Satır", preview: () => <span class="sc-tx-pv sc-tx-pv-line"><i>Birinci satır</i><i>İkinci</i></span> },
];
const DEFAULT_TEXT = "Merhaba, hareketli dünya!"
/** A good starting duration per family (a typewriter needs longer than a fade). */
const FAMILY_MS: Record<TextFamily, number> = { enter: 600, loop: 800, decorate: 900, content: 1800, interactive: 600 }

/** Shared playground: pick an animation, change the text and the shared options, read the code. */
function Lab() {
  const name = signal("rise")
  const text = signal(DEFAULT_TEXT)
  const by = signal<string>("char")
  const duration = signal(600)
  const each = signal(30)
  const easing = signal("expo")
  const meta = () => TEXT_ANIMATIONS.find((a) => a.name === name()) ?? TEXT_ANIMATIONS[0]!
  const has = (k: TextOptionKey) => () => meta().options.includes(k)
  const opts = (): Record<string, unknown> => {
    const o: Record<string, unknown> = {}, ks = meta().options
    if (ks.includes("by")) o.by = by()
    if (ks.includes("duration")) o.duration = duration()
    if (ks.includes("stagger")) o.stagger = each()
    if (ks.includes("easing")) o.easing = easing()
    return o
  }
  let el: HTMLElement | undefined
  let cur: TX.TextAnimation | null = null
  const play = () => { if (!el) return; cur?.stop(); el.textContent = text(); cur = FN[name()]!(el, opts()) }
  // a cycle needs "|" between its words: switching to one brings its sample, switching away the plain text
  effect(() => { const m = meta(); untrack(() => { duration.set(FAMILY_MS[m.family]); if (m.sample) text.set(m.sample); else if (TEXT_ANIMATIONS.some((a) => a.sample === text())) text.set(DEFAULT_TEXT) }) })
  effect(() => { opts(); text(); untrack(play) })
  onCleanup(() => cur?.stop())
  const code = () => {
    const o = opts(), body = Object.entries(o).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(", ")
    return `import { ${name()} } from "march/motion/text";\n\nconst el = document.querySelector("h1")!;\nconst a = ${name()}(el${body ? `, { ${body} }` : ""});\n// a.replay(); a.stop(); a.playback.pause(); await a.finished;`
  }
  const options: PlayOption[] = [
    { label: "Animasyon", get: name, set: name.set as (v: never) => void, options: TEXT_ANIMATIONS.map((a) => ({ value: a.name, label: a.name, hint: DESC[a.name] })) },
    { label: "Bölme birimi", get: by, set: by.set as (v: never) => void, options: UNITS, visibleWhen: has("by") },
    { label: "Süre", get: duration, set: duration.set as (v: never) => void, min: 100, max: 3000, step: 50, unit: " ms", visibleWhen: has("duration") },
    { label: "Stagger", get: each, set: each.set as (v: never) => void, min: 0, max: 300, step: 5, unit: " ms", visibleWhen: has("stagger") },
    { label: "Easing", get: easing, set: easing.set as (v: never) => void, options: EASINGS.map((e) => ({ value: e, label: e, preview: () => <Curve name={e} /> })), visibleWhen: has("easing") },
  ]
  const preview = <Playground options={options} label="Metin animasyonu seçenekleri">
    <div class="sc-tx-lab">
      <Field label="Metin"><TextInput value={text()} onChange={(v: string) => text.set(v)} /></Field>
      <div class="sc-tx-lab-stage"><span class="sc-tx-lab-text" ref={(e: HTMLElement) => { el = e; queueMicrotask(play) }}>{DEFAULT_TEXT}</span></div>
      <div class="sc-tx-row">
        <Button variant="primary" on:click={play}>Tekrar oynat</Button>
        {() => meta().family === "enter" ? <Button variant="secondary" on:click={() => { if (el) { cur?.stop(); el.textContent = text(); cur = FN[name()]!(el, { ...opts(), out: true }) } }}>Çıkış olarak oynat</Button> : null}
        <span class="sc-tx-meta">{() => `${FAMILY[meta().family].title} · ${kb(TEXT_COSTS[name()])} gzip`}</span>
      </div>
    </div>
  </Playground>
  return <Tabs label="Playground" tabs={[
    { id: "on", label: "Önizleme", content: preview },
    { id: "code", label: "Kod", content: () => <CodeView code={code} lang="ts" /> },
  ]} />
}

const ORDER: TextFamily[] = ["enter", "loop", "decorate", "content", "interactive"]

export default function TextMotion() {
  return <Section kicker="Hareket" title="Metin animasyonları" lead={`${TEXT_ANIMATIONS.length} metin animasyonu, her biri ayrı dışa aktarım: yalnız kullandığın derlenir. Hepsi tek hareket motorunda çalışır; global hız, “Tümünü durdur” ve azaltılmış hareket hepsine uyar. Metin erişilebilir kalır: ekran okuyucu parçaları değil, metni duyar; Türkçe harfler, emoji ve sağdan sola yazı bozulmaz.`}>
    <Demo wide title="Genel denetim" desc="Bu sayfadaki her metin animasyonu aynı motor ayarlarını izler.">
      <Control />
    </Demo>
    <Demo wide title="Playground" desc="Bir animasyon seç, metni ve ortak seçenekleri değiştir. Bir seçenek yalnız o animasyonda etkiliyse görünür.">
      <Lab />
    </Demo>
    {ORDER.map((f) => <Demo wide title={FAMILY[f].title} desc={FAMILY[f].desc}>
      <div class="sc-tx-grid">{TEXT_ANIMATIONS.filter((a) => a.family === f).map((m) => <Card m={m} />)}</div>
    </Demo>)}
  </Section>
}
