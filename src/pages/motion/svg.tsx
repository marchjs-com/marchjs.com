// Motion › SVG: stroke drawing, path morph (any point count), motion along a path, clip reveals and SVG filters
// (blur, displacement, goo). Every animation is an engine Playback: global speed and "Stop all" reach it.
import "../motion-pages.css";
import { onCleanup } from "march";
// each helper from its own module: the page carries only what it uses (the same names are on "march/motion")
import { animate, type Playback } from "march/motion/engine/playback.ts";
import { drawPath, morphPath, followPath } from "march/motion/svg.ts";
import { clipReveal, type ClipShape, type ClipSide } from "march/motion/clip.ts";
import { filterBlur, displace, goo } from "march/motion/svg-filter.ts";
import { Section } from "../../demo.tsx";
import { MotionDemo, opt, EASES } from "../../playground.tsx";

const star = (n: number, r1: number, r2: number): string => {
  const p: string[] = [];
  for (let i = 0; i < n * 2; i++) { const a = (Math.PI * i) / n - Math.PI / 2, r = i % 2 ? r2 : r1; p.push(`${(100 + r * Math.cos(a)).toFixed(1)} ${(100 + r * Math.sin(a)).toFixed(1)}`) }
  return `M${p.join("L")}Z`
}
const SHAPES: Record<string, { label: string; d: string }> = {
  circle: { label: "daire", d: "M100 22A78 78 0 1 1 99.9 22Z" },
  star: { label: "yıldız", d: star(5, 84, 36) },
  heart: { label: "kalp", d: "M100 172C44 128 14 98 30 58C46 22 88 28 100 62C112 28 154 22 170 58C186 98 156 128 100 172Z" },
  blob: { label: "damla", d: "M104 24C150 22 182 58 178 104C174 150 140 178 98 176C52 174 22 146 24 100C26 56 60 26 104 24Z" },
  hex: { label: "altıgen", d: star(3, 82, 82) },
  bolt: { label: "şimşek", d: "M118 14L44 112H96L80 186L156 84H104Z" },
}

const ROAD = "M20 128C70 20 130 18 160 84S250 160 300 36"

export default function MotionSvg() {
  document.title = "SVG animasyonları · March"
  const live = new Set<Playback>()
  const keep = (p: Playback): Playback => { live.add(p); p.finished.then(() => live.delete(p), () => live.delete(p)); return p }
  const stopAll = (): void => { for (const p of live) p.cancel(); live.clear() }
  onCleanup(stopAll)

  // 1 · stroke drawing
  let $dDur = 1400, $dEase = "in-out", $dEach = 120, $dErase = false
  let drawing: SVGSVGElement | undefined
  const draw = (): void => { if (drawing) keep(drawPath(drawing.querySelectorAll(".sc-mo-ink"), $dErase ? { from: 1, to: 0, duration: $dDur, easing: $dEase, stagger: $dEach } : { duration: $dDur, easing: $dEase, stagger: $dEach })) }

  // 2 · morph
  let $shape = "star", $mEase = "spring", $mPoints = 72, $mDur = 700
  let morphEl: SVGPathElement | undefined
  const morph = (): void => { if (morphEl) keep(morphPath(morphEl, SHAPES[$shape]!.d, { easing: $mEase, points: $mPoints, duration: $mDur })) }

  // 3 · along a path
  let $fRotate = true, $fLoop = true, $fDur = 2600, $fEase = "in-out"
  let plane: SVGGElement | undefined, trail: SVGPathElement | undefined
  let flight: Playback | null = null
  const fly = (): void => {
    if (!plane || !trail) return
    flight?.cancel()
    flight = keep(followPath(plane, ROAD, { rotate: $fRotate, trail, duration: $fDur, easing: $fEase, iterations: $fLoop ? Infinity : 1, direction: $fLoop ? "alternate" : "normal" }))
  }

  // 4 · clip reveal
  let $cShape = "circle" as ClipShape, $cFrom = "start" as ClipSide, $cCount = 7, $cVertical = false, $cHide = false
  let origin = { x: 50, y: 50 }
  let poster: HTMLElement | undefined
  const reveal = (): void => { if (poster) keep(clipReveal(poster, { shape: $cShape, origin, from: $cFrom, count: $cCount, vertical: $cVertical, hide: $cHide, duration: 900, fill: "forwards" })) }
  const at = (e: PointerEvent): void => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    origin = { x: Math.round(((e.clientX - r.left) / r.width) * 100), y: Math.round(((e.clientY - r.top) / r.height) * 100) }
    reveal()
  }

  // 5 · filters
  let $fx = "displace", $axis = "x", $amount = 60, $freq = 0.02
  let fxEl: HTMLElement | undefined
  const filt = (): void => {
    if (!fxEl) return
    keep($fx === "blur" ? filterBlur(fxEl, { from: $amount / 3, axis: $axis as "x", duration: 900 }) : displace(fxEl, { from: $amount, frequency: $freq, duration: 1400 }))
  }

  // 6 · goo
  let $gBlur = 12, $gOn = true
  let gooEl: HTMLElement | undefined, offGoo: (() => void) | null = null
  const melt = (): void => {
    offGoo?.(); offGoo = null
    if (gooEl && $gOn) offGoo = goo(gooEl, { blur: $gBlur })
  }
  onCleanup(() => offGoo?.())
  const RADII = [0, 46, 64, 30, 56]
  const orbit = (el: HTMLElement, i: number): void => {
    const r = RADII[i]!, s = i % 2 ? -1 : 1
    queueMicrotask(() => keep(animate(el, [{ transform: `rotate(0deg) translateX(${r}px) rotate(0deg)` }, { transform: `rotate(${s * 360}deg) translateX(${r}px) rotate(${-s * 360}deg)` }], { duration: 3600 + i * 900, iterations: Infinity, easing: "linear" })))
  }

  return <Section kicker="Hareket" title="SVG animasyonları" lead="Çizgiler çizilerek belirir, şekiller nokta sayıları farklı olsa da birbirine dönüşür, öğeler bir yol boyunca yön alarak ilerler; kırpma ve SVG filtreleri ile ortaya çıkış. Hepsi tek hareket motorunda: global hız, Tümünü durdur ve hareketi azalt tercihi her birine ulaşır.">
    <MotionDemo wide title="Yol çizimi" desc="Her çizgi pathLength=1 ile ölçülmeden çizilir; stagger sırayla başlatır. Sil seçeneği aynı yolu tersine oynatır."
      call={() => `drawPath(svg.querySelectorAll("path"), { duration: ${$dDur}, easing: "${$dEase}", stagger: ${$dEach}${$dErase ? ", from: 1, to: 0" : ""} })`}
      code={`import { drawPath } from "march/motion"

drawPath(svg.querySelectorAll("path"), { duration: 1400, stagger: 120 })   // draw in
drawPath(logo, { from: 1, to: 0, easing: "in" })                         // erase`}
      options={[
        opt("Süre", () => $dDur, (v: number) => { $dDur = v }, { min: 400, max: 3000, step: 100, unit: " ms" }),
        opt("Sıra aralığı", () => $dEach, (v: number) => { $dEach = v }, { min: 0, max: 400, step: 20, unit: " ms" }),
        opt("Eğri", () => $dEase, (v: string) => { $dEase = v }, { options: EASES }),
        opt("Sil", () => $dErase, (v: boolean) => { $dErase = v }),
      ]} play={draw}>
      <svg class="sc-mo-art" viewBox="0 0 320 170" role="img" aria-label="Dağlar, güneş ve dalga çizimi" ref={(el: SVGSVGElement) => { drawing = el }}>
        <circle class="sc-mo-ink sc-mo-ink-o" cx="232" cy="52" r="26" />
        <path class="sc-mo-ink sc-mo-ink-p" d="M14 140L88 54L128 100L168 62L238 140" />
        <path class="sc-mo-ink sc-mo-ink-b" d="M10 150C40 136 60 164 90 150S140 136 170 150S220 164 250 150S290 136 312 150" />
        <path class="sc-mo-ink sc-mo-ink-g" d="M40 30C56 18 70 18 84 30M96 22C108 12 120 12 132 22" />
        <path class="sc-mo-ink sc-mo-ink-o" d="M232 14V4M266 52H276M232 90V100M188 52H198" />
      </svg>
    </MotionDemo>

    <MotionDemo title="Yol morph" desc="Komutları aynı olan yollar sayı sayı, farklı olanlar eşit aralıklı noktalara yeniden örneklenip en az yolu gidecek biçimde hizalanarak dönüşür."
      call={() => `morphPath(path, shapes.${$shape}, { easing: "${$mEase}", points: ${$mPoints}, duration: ${$mDur} })`}
      code={`import { morphPath } from "march/motion"

morphPath(pathEl, starD, { easing: "spring" })     // 10 corners → circle arcs → heart curves
morphPath(pathEl, heartD, { points: 120 })          // more points: smoother outline mid-way`}
      options={[
        opt("Şekil", () => $shape, (v: string) => { $shape = v }, { options: Object.entries(SHAPES).map(([value, s]) => ({ value, label: s.label })) }),
        opt("Eğri", () => $mEase, (v: string) => { $mEase = v }, { options: EASES }),
        opt("Nokta", () => $mPoints, (v: number) => { $mPoints = v }, { min: 12, max: 160, step: 4 }),
        opt("Süre", () => $mDur, (v: number) => { $mDur = v }, { min: 200, max: 2000, step: 50, unit: " ms" }),
      ]} play={morph}>
      <svg class="sc-mo-morph" viewBox="0 0 200 200" role="img" aria-label={() => `Şekil: ${SHAPES[$shape]!.label}`}>
        <defs><linearGradient id="sc-mo-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" class="sc-mo-stop-o" /><stop offset="1" class="sc-mo-stop-p" /></linearGradient></defs>
        <path d={SHAPES.circle!.d} fill="url(#sc-mo-grad)" ref={(el: SVGPathElement) => { morphEl = el }} />
      </svg>
    </MotionDemo>

    <MotionDemo title="Yol boyunca" desc="Öğe yolun üstünde yer alır ve teğete göre döner; iz aynı karede çizilir. Motorun tek değeri: duraklatınca birlikte durur."
      call={() => `followPath(plane, road, { rotate: ${$fRotate}, trail, duration: ${$fDur}, easing: "${$fEase}"${$fLoop ? ", iterations: Infinity, direction: \"alternate\"" : ""} })`}
      code={`import { followPath, drawPath } from "march/motion"

followPath(plane, roadD, { rotate: true, duration: 2600, trail: trailPath })   // trail drawn in the same frame`}
      options={[
        opt("Teğete dön", () => $fRotate, (v: boolean) => { $fRotate = v }),
        opt("Gidip gel", () => $fLoop, (v: boolean) => { $fLoop = v }),
        opt("Süre", () => $fDur, (v: number) => { $fDur = v }, { min: 800, max: 6000, step: 200, unit: " ms" }),
        opt("Eğri", () => $fEase, (v: string) => { $fEase = v }, { options: EASES.filter((e) => e.value !== "bounce") }),
      ]} play={fly}>
      <svg class="sc-mo-road" viewBox="0 0 320 160" role="img" aria-label="Yol boyunca uçan ok">
        <path class="sc-mo-road-bg" d={ROAD} />
        <path class="sc-mo-road-ink" d={ROAD} ref={(el: SVGPathElement) => { trail = el }} />
        <g ref={(el: SVGGElement) => { plane = el }}><path class="sc-mo-plane" d="M-12 -9L14 0L-12 9L-6 0Z" /></g>
      </svg>
    </MotionDemo>

    <MotionDemo title="Kırpma ile ortaya çıkış" desc="clip-path şekilleri: daire ve elmas tıklanan noktadan açılır, silme yazı yönüne göre aynalanır, panjur şeritleri birlikte açılır."
      call={() => `clipReveal(poster, { shape: "${$cShape}"${$cShape === "circle" || $cShape === "diamond" ? `, origin: { x: ${origin.x}, y: ${origin.y} }` : ""}${$cShape === "wipe" ? `, from: "${$cFrom}"` : ""}${$cShape === "blinds" ? `, count: ${$cCount}${$cVertical ? ", vertical: true" : ""}` : ""}${$cHide ? ", hide: true" : ""} })`}
      code={`import { clipReveal } from "march/motion"

clipReveal(card, { shape: "circle", origin: { x: 20, y: 80 } })   // % of the element
clipReveal(card, { shape: "wipe", from: "start" })                  // mirrors in RTL
clipReveal(card, { shape: "blinds", count: 7, hide: true })`}
      options={[
        opt("Şekil", () => $cShape, (v: ClipShape) => { $cShape = v }, { options: [{ value: "circle", label: "daire" }, { value: "wipe", label: "silme" }, { value: "diamond", label: "elmas" }, { value: "curtain", label: "perde" }, { value: "blinds", label: "panjur" }, { value: "inset", label: "çerçeve" }] }),
        opt("Başlangıç", () => $cFrom, (v: ClipSide) => { $cFrom = v }, { options: [{ value: "start", label: "baş" }, { value: "end", label: "son" }, { value: "top", label: "üst" }, { value: "bottom", label: "alt" }], visibleWhen: () => $cShape === "wipe" }),
        opt("Şerit", () => $cCount, (v: number) => { $cCount = v }, { min: 2, max: 16, visibleWhen: () => $cShape === "blinds" }),
        opt("Dikey", () => $cVertical, (v: boolean) => { $cVertical = v }, { visibleWhen: () => $cShape === "blinds" }),
        opt("Gizle", () => $cHide, (v: boolean) => { $cHide = v }),
      ]} play={reveal}>
      <div class="sc-mo-poster-wrap" on:pointerdown={at}>
        <div class="sc-mo-poster" ref={(el: HTMLElement) => { poster = el }}>
          <span class="sc-mo-poster-dot sc-mo-d1" /><span class="sc-mo-poster-dot sc-mo-d2" /><span class="sc-mo-poster-dot sc-mo-d3" />
          <strong>HADİ</strong><span>Yaz koleksiyonu</span>
        </div>
      </div>
    </MotionDemo>

    <MotionDemo title="SVG filtreleri" desc="Filtrenin sayıları motorda akar: yönlü bulanıklık bir hareket izi gibi oturur, türbülans ile yer değiştirme dalgalanıp durulur."
      call={() => $fx === "blur" ? `filterBlur(card, { from: ${Math.round($amount / 3)}, axis: "${$axis}" })` : `displace(card, { from: ${$amount}, frequency: ${$freq} })`}
      code={`import { filterBlur, displace } from "march/motion"

filterBlur(title, { from: 20, axis: "x" })              // motion blur settling to sharp
displace(card, { from: 60, frequency: 0.02 })           // turbulence that calms down`}
      options={[
        opt("Filtre", () => $fx, (v: string) => { $fx = v }, { options: [{ value: "displace", label: "dalga" }, { value: "blur", label: "bulanıklık" }] }),
        opt("Eksen", () => $axis, (v: string) => { $axis = v }, { options: [{ value: "x", label: "yatay" }, { value: "y", label: "dikey" }, { value: "both", label: "ikisi" }], visibleWhen: () => $fx === "blur" }),
        opt("Güç", () => $amount, (v: number) => { $amount = v }, { min: 10, max: 120, step: 5 }),
        opt("Sıklık", () => $freq, (v: number) => { $freq = v }, { min: 0.005, max: 0.08, step: 0.005, visibleWhen: () => $fx === "displace" }),
      ]} play={filt}>
      <div class="sc-mo-fx" ref={(el: HTMLElement) => { fxEl = el }}>
        <strong>HADİ</strong><span>Dalga dalga gelir</span>
      </div>
    </MotionDemo>

    <MotionDemo title="Goo" desc="Bulanıklık ve alfa kontrastı ile damlalar birbirine yaklaşınca kaynaşır. Damlaları motorun sonsuz animasyonları döndürür."
      call={() => $gOn ? `goo(container, { blur: ${$gBlur} })` : "// goo kapalı: damlalar ayrı"}
      code={`import { goo, animate } from "march/motion"

const off = goo(container, { blur: 12 })                 // children melt where they meet
animate(blob, [...orbit], { iterations: Infinity })`}
      options={[
        opt("Goo", () => $gOn, (v: boolean) => { $gOn = v }),
        opt("Erime", () => $gBlur, (v: number) => { $gBlur = v }, { min: 4, max: 24, visibleWhen: () => $gOn }),
      ]} play={melt}>
      <div class="sc-mo-goo" ref={(el: HTMLElement) => { gooEl = el }} aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => <span class={`sc-mo-blob sc-mo-blob-${i}`} ref={(el: HTMLElement) => orbit(el, i)} />)}
      </div>
    </MotionDemo>
  </Section>
}
