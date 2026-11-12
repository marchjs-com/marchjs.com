// Motion › Scroll: scroll-linked timelines, parallax layers, a sticky stage that steps through its scenes and a
// progress indicator. Each runs in its own scroll box here (`source`), the page scroll works the same without it.
import "../motion-pages.css";
import { effect, onCleanup } from "hadi-march";
import { scrollTimeline, parallaxLayers, stickyReveal, scrollIndicator } from "hadi-march/motion/scroll-fx.ts";
import { Section } from "../../demo.tsx";
// the demo kit comes from the /motion/* hub (already loaded): importing it here would split 1 KB into a file of its own
import type * as Kit from "../../motion-kit.tsx";

const FX: Record<string, { label: string; frames: Keyframe[] }> = {
  rise: { label: "yüksel", frames: [{ opacity: 0, transform: "translateY(60px) scale(.94)" }, { opacity: 1, transform: "none" }] },
  turn: { label: "dön", frames: [{ opacity: 0, transform: "perspective(700px) rotateX(55deg)" }, { opacity: 1, transform: "none" }] },
  slide: { label: "kay", frames: [{ opacity: 0, transform: "translateX(-40%)" }, { opacity: 1, transform: "none" }] },
  blur: { label: "netleş", frames: [{ opacity: 0, filter: "blur(12px)", transform: "scale(1.08)" }, { opacity: 1, filter: "blur(0px)", transform: "none" }] },
  zoom: { label: "yakınlaş", frames: [{ opacity: 0, transform: "scale(.6)", borderRadius: "50%" }, { opacity: 1, transform: "none" }] },
}
const ITEMS = ["Keşfet", "Planla", "Paylaş", "Kutla", "Tekrarla", "Büyüt"]
const STEPS = [
  { t: "Fikir", d: "Bir taslakla başla.", tone: "o" },
  { t: "Tasarım", d: "Renkleri ve akışı seç.", tone: "b" },
  { t: "Yapım", d: "Bileşenleri birleştir.", tone: "g" },
  { t: "Yayın", d: "Dünyaya göster.", tone: "p" },
]

export default function MotionScroll(props: { kit: typeof Kit }) {
  const { MotionDemo, opt } = props.kit
  document.title = "Kaydırma animasyonları · March"

  // 1 · scroll timeline
  let $fx = "rise", $start = 0, $end = 45, $reverse = false
  let box1: HTMLElement | undefined
  const cards: HTMLElement[] = []
  // 2 · parallax
  let $strength = 160
  let box2: HTMLElement | undefined, scene: HTMLElement | undefined
  // 3 · sticky
  let $steps = 4
  let $active = 0
  let box3: HTMLElement | undefined, sticky: HTMLElement | undefined
  // 4 · indicator
  let $vertical = false
  let box4: HTMLElement | undefined, bar: HTMLElement | undefined

  // each effect re-binds when its options change (and stops with the page)
  const bind = (deps: () => unknown, fn: () => (() => void) | void): void => {
    let stop: (() => void) | void
    effect(() => { deps(); stop?.(); stop = undefined; queueMicrotask(() => { stop = fn() }) })
    onCleanup(() => stop?.())
  }
  bind(() => [$fx, $start, $end, $reverse], () => {
    if (!box1) return
    // reverse: the cards leave the same way as they scroll out at the top
    const frames = $reverse ? [...FX[$fx]!.frames].reverse() : FX[$fx]!.frames
    const range: [number, number] = $reverse ? [1 - $end / 100, 1 - $start / 100] : [$start / 100, $end / 100]
    const stops = cards.map((c) => scrollTimeline(c, frames, { source: box1, range }))
    return () => stops.forEach((s) => s())
  })
  bind(() => $strength, () => { return scene && box2 ? parallaxLayers(scene, { source: box2, strength: $strength }) : undefined })
  bind(() => $steps, () => { return sticky && box3 ? stickyReveal(sticky, { source: box3, onStep: (i) => { $active = i } }) : undefined })
  bind(() => $vertical, () => { return bar && box4 ? scrollIndicator(bar, { source: box4, vertical: $vertical }) : undefined })

  return <Section kicker="Hareket" title="Kaydırma animasyonları" lead="Kaydırma konumu bir zaman çizelgesini sürer: her kare motorun keyframe'i, aynı eğri ve stagger ile. Parallax katmanları farklı hızda kayar, yapışkan sahne adım adım değişir, ilerleme çubuğu yazı yönüne göre dolar. Duraklatınca donar; hareketi azalt tercihinde parallax durur.">
    <MotionDemo title="Kaydırma zaman çizelgesi" desc="Kartlar kutu içinde göründükçe keyframe'leri kaydırmayla ilerler; aralık, geçişin kaydırmanın hangi bölümünde olacağını seçer."
      call={() => $reverse ? `scrollTimeline(card, frames.${$fx}.reverse(), { source: box, range: [${(1 - $end / 100).toFixed(2)}, ${(1 - $start / 100).toFixed(2)}] })` : `scrollTimeline(card, frames.${$fx}, { source: box, range: [${($start / 100).toFixed(2)}, ${($end / 100).toFixed(2)}] })`}
      code={`import { scrollTimeline } from "hadi-march/motion"

scrollTimeline(card, [{ opacity: 0, transform: "translateY(60px)" }, { opacity: 1, transform: "none" }],
  { range: [0, 0.45] })                 // from entering at the bottom to 45 % of the way through
scrollTimeline(timeline().add(…), null)  // any Playback or timeline, scrubbed by scroll`}
      options={[
        opt("Efekt", () => $fx, (v: string) => { $fx = v }, { options: Object.entries(FX).map(([value, f]) => ({ value, label: f.label })) }),
        opt("Başlangıç", () => $start, (v: number) => { $start = Math.min(v, $end - 5) }, { min: 0, max: 60, step: 5, unit: "%" }),
        opt("Bitiş", () => $end, (v: number) => { $end = Math.max(v, $start + 5) }, { min: 10, max: 100, step: 5, unit: "%" }),
        opt("Çıkışta da", () => $reverse, (v: boolean) => { $reverse = v }),
      ]}>
      <div class="sc-mo-scroll" tabindex="0" role="region" aria-label="Kaydırılabilir kartlar" ref={(el: HTMLElement) => { box1 = el }}>
        <p class="sc-mo-scroll-hint">Aşağı kaydır</p>
        {ITEMS.map((t, i) => <div class={`sc-mo-scard sc-mo-t-${["o", "b", "g", "p"][i % 4]}`} ref={(el: HTMLElement) => { cards[i] = el }}><strong>{t}</strong><span>{`${i + 1}. adım`}</span></div>)}
        <p class="sc-mo-scroll-hint">Son</p>
      </div>
    </MotionDemo>

    <MotionDemo title="Parallax katmanları" desc="data-depth değeri büyük olan katman daha çok yol alır; eksi değerler ters yöne gider."
      call={() => `parallaxLayers(scene, { source: box, strength: ${$strength} })`}
      code={`import { parallaxLayers } from "hadi-march/motion"

<div class="hero"><img data-depth="0.2" …/><img data-depth="0.6" …/><h1 data-depth="-0.3">…</h1></div>
parallaxLayers(hero, { strength: 160 })`}
      options={[opt("Güç", () => $strength, (v: number) => { $strength = v }, { min: 0, max: 400, step: 10, unit: " px" })]}>
      <div class="sc-mo-scroll" tabindex="0" role="region" aria-label="Parallax sahnesi" ref={(el: HTMLElement) => { box2 = el }}>
        <div class="sc-mo-pad" />
        <div class="sc-mo-plx2" ref={(el: HTMLElement) => { scene = el }}>
          <span class="sc-mo-plx2-sun" data-depth="0.2" aria-hidden="true" />
          <span class="sc-mo-plx2-m sc-mo-plx2-m1" data-depth="0.4" aria-hidden="true" />
          <span class="sc-mo-plx2-m sc-mo-plx2-m2" data-depth="0.7" aria-hidden="true" />
          <strong class="sc-mo-plx2-t" data-depth="-0.4">Acme Dağ</strong>
          <span class="sc-mo-plx2-m sc-mo-plx2-m3" data-depth="1" aria-hidden="true" />
        </div>
        <div class="sc-mo-pad" />
      </div>
    </MotionDemo>

    <MotionDemo wide title="Yapışkan sahne" desc="Bölüm kaydıkça sahne yerinde kalır, adımlar sırayla gelir ve gider; etkin adım ekran okuyucuya da bildirilir."
      call={() => `stickyReveal(section, { steps: "[data-step]", onStep: (i) => … })  // etkin: ${$active + 1} / ${$steps}`}
      code={`import { stickyReveal } from "hadi-march/motion"

<section style="height: 400vh"><div class="stage" style="position: sticky; top: 0">
  <article data-step>…</article> <article data-step>…</article> …
</div></section>
stickyReveal(section, { onStep: (i) => (active = i) })   // sets --hm-scroll (0..1) on the section too`}
      options={[opt("Adım", () => $steps, (v: number) => { $steps = v }, { options: [{ value: 2, label: "2" }, { value: 3, label: "3" }, { value: 4, label: "4" }] })]}>
      <div class="sc-mo-scroll sc-mo-scroll-tall" tabindex="0" role="region" aria-label="Yapışkan sahne" ref={(el: HTMLElement) => { box3 = el }}>
        {() => { const n = $steps; return <section class="sc-mo-sticky" style={{ "--n": String(n) }} ref={(el: HTMLElement) => { sticky = el }}>
          <div class="sc-mo-sticky-stage">
            <div class="sc-mo-sticky-bar" aria-hidden="true" />
            {STEPS.slice(0, n).map((s, i) => <article data-step class={`sc-mo-step sc-mo-t-${s.tone}`} aria-hidden={() => String($active !== i)}><span>{`${i + 1} / ${n}`}</span><strong>{s.t}</strong><p>{s.d}</p></article>)}
            <p class="hm-sr-only" aria-live="polite">{() => `${$active + 1}. adım: ${STEPS[$active]?.t ?? ""}`}</p>
          </div>
        </section> }}
      </div>
    </MotionDemo>

    <MotionDemo title="İlerleme" desc="Kaydırma ilerlemesi bir çubuğu doldurur; yatayda yazı yönünün başından (sağdan sola yazımda sağdan). Bilgi taşıdığı için hareketi azalt tercihinde de çalışır."
      call={() => `scrollIndicator(bar, { source: article${$vertical ? ", vertical: true" : ""} })`}
      code={`import { scrollIndicator } from "hadi-march/motion"

scrollIndicator(barEl)                          // the page
scrollIndicator(barEl, { source: articleEl })   // a scroll box`}
      options={[opt("Dikey", () => $vertical, (v: boolean) => { $vertical = v })]}>
      <div class={() => $vertical ? "sc-mo-read sc-mo-read-v" : "sc-mo-read"}>
        <div class="sc-mo-read-track" aria-hidden="true"><div class="sc-mo-read-bar" ref={(el: HTMLElement) => { bar = el }} /></div>
        <article class="sc-mo-scroll" tabindex="0" aria-label="Örnek yazı" ref={(el: HTMLElement) => { box4 = el }}>
          {["Acme bahar bülteni", "Bu sezon bahçede neler var?", "Tohumdan fideye", "Sulama saatleri", "Hasat günü", "Kış hazırlığı"].map((h, i) => <section class="sc-mo-read-sec"><h3>{h}</h3><p>{`Bölüm ${i + 1}: çubuk kaydırdıkça dolar, başa dönünce boşalır. Okunan kısım hep görünür.`}</p></section>)}
        </article>
      </div>
    </MotionDemo>
  </Section>
}
