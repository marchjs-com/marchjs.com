// Home page sections (a lazy part): the tools an editor app is made of. A node graph you drag, connect and run
// (march/flow); an easing curve that drives real animations as you pull it; a drawing board on the undo history;
// colour, icon and font pickers dressing one card; the accessibility preferences tried on a sample card first.
// Real March APIs throughout; numbers shown are computed.
import "./tools.css";
import { onCleanup } from "march";
import { animate, inView, reducedMotion } from "march/motion";
import { EasingCurveEditor } from "march/components/motion/easing-curve-editor";
import { createFlow, createFlowRunner, emit, FlowCanvas, FlowControls, type FlowDoc, type FlowNodeType, type TimelineEntry } from "march/flow";
import { ColorPicker } from "march/components/composite/color-picker";
import { FontPicker, type FontChoice } from "march/components/composite/font-picker";
import { IconPicker } from "march/components/forms/icon-picker";
import { undoHistory } from "march/managers/undo/history";
import { a11y, type MotionPref } from "march/managers/accessibility";
import { Badge, Button, Kbd, Segmented, Slider, Toggle } from "march/ui";
import { Icon, check as checkIcon, eye, play as playIcon, redo, sparkles, trash, undo } from "march/icons";
import { Icon as NamedIcon } from "march/icons/packs";
import { Reveal } from "march/components/landing/reveal";
import { Head } from "../head.tsx";
import { every } from "../clock.ts";

// ── flow editor ─────────────────────────────────────────────────────────────────────────────────────────────────

const FLOW_TYPES: readonly FlowNodeType[] = [
  { type: "form", label: "Anket gönderildi", category: "Tetikleyici", color: "brand-orange", outputs: [{ id: "out" }],
    fields: [{ key: "score", label: "Puan", kind: "number", default: 8, min: 0, max: 10 }], run: ({ data }) => Number(data["score"] ?? 8) },
  { type: "check", label: "Puan yüksek mi?", category: "Mantık", color: "brand-blue", inputs: [{ id: "in" }],
    outputs: [{ id: "yes", label: "evet" }, { id: "no", label: "hayır" }],
    run: ({ input }) => emit(Number(input) >= 7 ? { yes: input } : { no: input }) },
  { type: "thanks", label: "Teşekkür kartı", category: "Eylem", color: "brand-green", inputs: [{ id: "in" }],
    run: ({ input }) => `Teşekkür kartı gönderildi (puan ${String(input)})` },
  { type: "ticket", label: "Destek kaydı", category: "Eylem", color: "brand-purple", inputs: [{ id: "in" }],
    run: ({ input }) => `Destek kaydı açıldı (puan ${String(input)})` },
]

const flowDoc = (): FlowDoc => ({
  schema: "march.flow/v1", name: "Anket akışı",
  nodes: [
    { id: "form", type: "form", x: 24, y: 96, data: { score: 8 } },
    { id: "check", type: "check", x: 312, y: 96 },
    { id: "thanks", type: "thanks", x: 600, y: 16 },
    { id: "ticket", type: "ticket", x: 600, y: 196 },
  ],
  edges: [
    { id: "e-form", from: "form.out", to: "check.in" },
    { id: "e-yes", from: "check.yes", to: "thanks.in" },
  ],
  viewport: { x: 8, y: 8, zoom: 0.78 },
})

function FlowSection() {
  const flow = createFlow({ types: FLOW_TYPES, doc: flowDoc(), undo: false })
  const runner = createFlowRunner(flow, { nodeMs: 620, travelMs: 520 })
  onCleanup(() => runner.reset())
  const last = (): TimelineEntry | undefined => runner.timeline().filter((e) => e.status === "done" && typeof e.value === "string").at(-1)
  const missing = (): boolean => !flow.edges().some((e) => e.to === "ticket.in")
  return <section class="sc-sec" aria-labelledby="sc-tl-flow-h">
    <Head id="sc-tl-flow-h" kicker="Akış düzenleyici" color="brand-orange" title="Düğüm tabanlı akış düzenleyici" example="Düğümleri sürükle, bağla, çalıştır"
      lead="Bir anketin yolculuğu: düğümleri tut taşı, bir çıkıştan girişe çizgi çek, ardından çalıştır. Değer kenar boyunca akar, her düğüm sırası gelince yanar; adım adım da gidebilirsin." />
    <Reveal class="sc-tl-flow" effect="up" stagger={110}>
      <div class="sc-tl-flow-stage">
        <FlowCanvas flow={flow} snap={16} fields controls={["zoom", "fit", "layout"]} label="Anket akışı" />
      </div>
      <aside class="sc-tl-flow-side sc-card">
        <FlowControls runner={runner} flow={flow} timeline step reset status clock count />
        <div class="sc-tl-flow-out" aria-live="polite">
          <span class="sc-tl-label">Son çıktı</span>
          <b>{() => String(last()?.value ?? "Henüz çalışmadı")}</b>
        </div>
        <p class="sc-tl-hint">{() => (missing()
          ? "İpucu: “hayır” çıkışını Destek kaydına bağla, sonra puanı düşür ve yeniden çalıştır."
          : `Bağlantılar tamam: ${flow.nodes().length} düğüm, ${flow.edges().length} kenar. Puanı düşür, öbür yoldan gitsin.`)}</p>
      </aside>
    </Reveal>
  </section>
}

// ── easing curve editor ─────────────────────────────────────────────────────────────────────────────────────────

const EASE_LOOP_MS = 1700

function EasingSection() {
  let $ease = "cubic-bezier(.34, 1.56, .64, 1)"
  let $dur = 900
  let track: HTMLElement | undefined, ball: HTMLElement | undefined, card: HTMLElement | undefined, bar: HTMLElement | undefined
  let fwd = true
  const runs: { cancel(): unknown }[] = []
  const stopAll = (): void => { for (const p of runs.splice(0)) p.cancel() }
  const play = (): void => {
    if (!track || !ball || !card || !bar) return
    stopAll()
    const d = Math.max(0, track.clientWidth - ball.offsetWidth)
    const [a, b] = fwd ? [0, 1] : [1, 0]
    fwd = !fwd
    const o = { duration: $dur, easing: $ease, fill: "forwards" as const }
    runs.push(
      animate(ball, [{ transform: `translateX(${a * d}px)` }, { transform: `translateX(${b * d}px)` }], o),
      animate(card, [{ transform: `scale(${0.7 + a * 0.3}) rotate(${(1 - a) * -8}deg)` }, { transform: `scale(${0.7 + b * 0.3}) rotate(${(1 - b) * -8}deg)` }], o),
      animate(bar, [{ transform: `scaleX(${a})` }, { transform: `scaleX(${b})` }], o),
    )
  }
  const watch = (box: Element): void => {
    let stop: (() => void) | undefined
    const off = inView(box, { threshold: 0.3, rootMargin: "0px",
      enter: () => { play(); if (!reducedMotion() && !stop) stop = every(EASE_LOOP_MS, play) },
      leave: () => { stop?.(); stop = undefined } })
    onCleanup(() => { off(); stop?.(); stopAll() })
  }
  return <section class="sc-sec" aria-labelledby="sc-tl-ease-h">
    <Head id="sc-tl-ease-h" kicker="Yumuşatma eğrisi" color="brand-purple" title="Yumuşatma eğrisi düzenleyici" example="Eğriyi çek, hareket anında değişsin"
      lead="İki tutamacı sürükle: top, kart ve çubuk aynı eğriyle oynar. Taşma, sekme, yavaş kalkış… hepsi tek bir cubic-bezier; motor onu adıyla da tanır." />
    <Reveal class="sc-tl-ease" effect="up" stagger={110}>
      <div class="sc-tl-ease-editor sc-card">
        <EasingCurveEditor bind:value={$ease} name="sc-tl-ease" preview="none" duration={$dur} />
      </div>
      <div class="sc-tl-ease-stage sc-card" ref={watch}>
        <div class="sc-tl-ease-track" ref={(el: HTMLElement) => { track = el }}>
          <span class="sc-tl-ease-ball" ref={(el: HTMLElement) => { ball = el }} />
        </div>
        <div class="sc-tl-ease-row">
          <div class="sc-tl-ease-card" ref={(el: HTMLElement) => { card = el }}><Icon of={sparkles} size="xl" /><b>Merhaba</b></div>
          <div class="sc-tl-ease-meter"><i ref={(el: HTMLElement) => { bar = el }} /></div>
        </div>
        <Slider bind:value={$dur} min={250} max={1600} step={50} format={(v: number) => `${v} ms`} label="Süre" />
        <div class="sc-tl-ease-foot">
          <Button variant="primary" onClick={play}><Icon of={playIcon} size="md" />Oynat</Button>
          <code class="sc-tl-code">{() => `animate(kart, kareler, { duration: ${$dur}, easing: "${$ease}" })`}</code>
        </div>
      </div>
    </Reveal>
  </section>
}

// ── undo / redo ─────────────────────────────────────────────────────────────────────────────────────────────────

const COLS = 12
const ROWS = 8
const INKS: readonly { id: number; name: string }[] = [
  { id: 1, name: "Mavi" }, { id: 2, name: "Pembe" }, { id: 3, name: "Sarı" }, { id: 4, name: "Yeşil" }, { id: 0, name: "Silgi" },
]
/** The starting picture, a heart: one letter per cell (p pink, b blue, . empty). */
const HEART: readonly string[] = [
  "............",
  "..pp....pp..",
  ".pppp..pppp.",
  ".pppppppppp.",
  "..pppppppp..",
  "...pppppp...",
  "....pppp....",
  ".....pp.....",
]
const INK_OF: Readonly<Record<string, number>> = { p: 2, b: 1 }
const START: readonly number[] = HEART.join("").split("").map((ch) => INK_OF[ch] ?? 0)
const CELLS: readonly number[] = START.map((_, i) => i)

function UndoSection() {
  const hist = undoHistory({ limit: 50 })
  onCleanup(() => hist.dispose())
  let $cells: readonly number[] = START
  let $ink = 1
  let grid: HTMLElement | undefined
  let before: readonly number[] | null = null
  let painted = 0
  const inkName = (id: number): string => INKS.find((k) => k.id === id)?.name ?? ""
  const cellAt = (e: PointerEvent): number => {
    if (!grid) return -1
    const r = grid.getBoundingClientRect()
    const c = Math.floor((e.clientX - r.left) / r.width * COLS), w = Math.floor((e.clientY - r.top) / r.height * ROWS)
    return c < 0 || c >= COLS || w < 0 || w >= ROWS ? -1 : w * COLS + c
  }
  const paint = (e: PointerEvent): void => {
    const i = cellAt(e)
    if (i < 0 || $cells[i] === $ink) return
    $cells = $cells.map((v, k) => (k === i ? $ink : v))
    painted++
  }
  const down = (e: PointerEvent): void => { before = $cells; painted = 0; grid?.setPointerCapture(e.pointerId); paint(e) }
  const end = (): void => {
    if (!before) return
    const a = before, b = $cells
    before = null
    if (painted) hist.push({ label: `${inkName($ink)} · ${painted} kare`, undo: () => { $cells = a }, redo: () => { $cells = b } })
  }
  const clear = (): void => {
    const a = $cells
    if (a.every((v) => v === 0)) return
    hist.run("Temizle", () => { $cells = START.map(() => 0) }, () => { $cells = a })
  }
  const keys = (e: KeyboardEvent): void => {
    if (!(e.ctrlKey || e.metaKey)) return
    const k = e.key.toLowerCase()
    if (k === "z" && !e.shiftKey) { e.preventDefault(); void hist.undo() }
    else if (k === "y" || (k === "z" && e.shiftKey)) { e.preventDefault(); void hist.redo() }
  }
  const saved = (): boolean => { hist.past(); return hist.atSaved() }
  return <section class="sc-sec" aria-labelledby="sc-tl-undo-h">
    <Head id="sc-tl-undo-h" kicker="Geri al, yinele" color="brand-pink" title="Geri al ve yinele tarihçesi" example="Her fırça darbesi geri alınabilir"
      lead="Kareleri boya, sil, temizle; her darbe tek adım olarak tarihçeye yazılır. Düğmelerle ya da klavyeyle geri dön, yinele; tarihçede nerede olduğunu hep gör." />
    <Reveal class="sc-tl-undo" effect="up" stagger={110}>
      <div class="sc-tl-undo-board sc-card" on:keydown={keys}>
        <div class="sc-tl-inks" role="radiogroup" aria-label="Fırça">
          {INKS.map((k) => <button type="button" role="radio" class={`sc-tl-ink sc-tl-c${k.id}`} aria-checked={() => String($ink === k.id)}
            on:click={() => { $ink = k.id }}><span class="sc-tl-ink-dot" aria-hidden="true" />{k.name}</button>)}
        </div>
        <div class="sc-tl-grid" tabindex="0" role="img" aria-label={() => `Çizim alanı, ${$cells.filter((v) => v).length} boyalı kare`}
          ref={(el: HTMLElement) => { grid = el }} on:pointerdown={down} on:pointermove={(e: PointerEvent) => { if (before) paint(e) }}
          on:pointerup={end} on:pointercancel={end}>
          {CELLS.map((i) => <span class={() => `sc-tl-px sc-tl-c${$cells[i] ?? 0}`} />)}
        </div>
        <div class="sc-tl-undo-bar">
          <Button onClick={() => void hist.undo()} disabled={() => !hist.past().length}><Icon of={undo} size="md" />Geri al</Button>
          <Button onClick={() => void hist.redo()} disabled={() => !hist.future().length}><Icon of={redo} size="md" />Yinele</Button>
          <Button variant="ghost" onClick={clear}><Icon of={trash} size="md" />Temizle</Button>
          <span class="sc-tl-keys"><Kbd>Ctrl</Kbd>+<Kbd>Z</Kbd> · <Kbd>Ctrl</Kbd>+<Kbd>Y</Kbd></span>
        </div>
      </div>
      <aside class="sc-tl-undo-side sc-card">
        <div class="sc-tl-undo-head">
          <b>Tarihçe</b>
          <Badge tone={() => (saved() ? "success" : "warn")}>{() => (saved() ? "Kaydedildi" : "Kaydedilmemiş")}</Badge>
        </div>
        <ol class="sc-tl-steps">
          {() => hist.future().slice().reverse().map((l) => <li class="sc-tl-step is-future">{l}</li>)}
          <li class="sc-tl-step is-now">{() => `Şu an · ${hist.past().length} adım geride, ${hist.future().length} adım ileride`}</li>
          {() => hist.past().map((l) => <li class="sc-tl-step">{l}</li>)}
        </ol>
        <Button variant="ghost" onClick={() => hist.markSaved()}><Icon of={checkIcon} size="md" />Burayı kaydet</Button>
      </aside>
    </Reveal>
  </section>
}

// ── pickers ─────────────────────────────────────────────────────────────────────────────────────────────────────

function PickersSection() {
  let $color = "#2f6fec"
  let $icon = "sparkles"
  let $font = ""
  let $stack = ""
  return <section class="sc-sec" aria-labelledby="sc-tl-pick-h">
    <Head id="sc-tl-pick-h" kicker="Seçiciler" color="brand-gold" title="Renk, ikon ve yazı tipi seçicileri" example="Renk, ikon, yazı tipi: üçü bir kartı giydirir"
      lead="Renk seçici karşıtlığı ölçer, ikon seçici adıyla arar, yazı tipi seçici önizleyerek yükler. Hangisine dokunsan kart o an değişir." />
    <Reveal class="sc-tl-pick" effect="up" stagger={110}>
      <div class="sc-tl-pick-col sc-card">
        <span class="sc-tl-label">Renk</span>
        <ColorPicker bind:value={$color} format="hex" />
      </div>
      <div class="sc-tl-pick-col sc-card">
        <span class="sc-tl-label">İkon</span>
        <IconPicker value={() => $icon} onChange={(n: string | null) => { $icon = n ?? "sparkles" }} label="Kartın ikonu" />
        <span class="sc-tl-label">Yazı tipi</span>
        <FontPicker bind:value={$font} view="popover" category="all" onPick={(c: FontChoice) => { $stack = c.stack }} />
        <p class="sc-tl-hint">Web yazı tipleri yalnızca sen seçince ve izin verince yüklenir.</p>
      </div>
      <div class="sc-tl-preview sc-card" style={() => ({ "--sc-tl-pick": $color, "font-family": $stack || null })}>
        <span class="sc-tl-preview-icon"><NamedIcon name={$icon} size="em" /></span>
        <b class="sc-tl-preview-title">{() => ($font ? `${$font} ile yeni başlık` : "Yeni başlığın burada")}</b>
        <p>Rengin, ikonun ve yazı tipin bu kartta bir araya gelir; aynı değerler temaya da yazılabilir.</p>
        <div class="sc-tl-preview-foot">
          <span class="sc-tl-chip">{() => $color}</span>
          <span class="sc-tl-chip">{() => $icon}</span>
          <span class="sc-tl-btn">Hemen dene</span>
        </div>
      </div>
    </Reveal>
  </section>
}

// ── accessibility ───────────────────────────────────────────────────────────────────────────────────────────────

/** Audit rule ids (managers/accessibility audit) in Turkish; an unknown rule shows its English message. */
const RULE_TR: Readonly<Record<string, string>> = {
  "img-alt": "Görselin alternatif metni yok",
  name: "Düğmenin erişilebilir adı yok",
  label: "Form alanının etiketi yok",
  "duplicate-id": "Aynı kimlik iki kez kullanılmış",
  tabindex: "Pozitif tabindex odak sırasını bozuyor",
  "heading-order": "Başlık düzeyi atlanmış",
  "hidden-focus": "Gizli alanın içinde odaklanabilir öğe var",
}

function A11ySection() {
  let $motion: MotionPref = "system"
  let $scale = 100
  let $contrast = false
  let $links = false
  let $spacing = false
  let $focus = false
  let $broken = false
  let $issues: readonly string[] | null = null
  let sample: HTMLElement | undefined
  const prefs = () => ({ motion: $motion, fontScale: $scale / 100, contrast: $contrast, underlineLinks: $links, textSpacing: $spacing, strongFocus: $focus })
  const check = (): void => {
    $issues = a11y.audit(sample).map((i) => RULE_TR[i.rule] ?? i.message)
  }
  const on = (v: boolean): string | null => (v ? "" : null)
  return <section class="sc-sec" aria-labelledby="sc-tl-a11y-h">
    <Head id="sc-tl-a11y-h" kicker="Erişilebilirlik" color="brand-green" title="Herkes için erişilebilirlik ayarları" example="Ayarları önce bu kartta dene, sonra bütün sayfaya uygula"
      lead="Yazı boyutu, karşıtlık, metin aralığı, odak halkası, hareket: ayarlar yalnızca örnek kartı değiştirir. Beğenirsen tek tıkla tüm sayfaya uygula; denetçi de eksikleri söyler." />
    <Reveal class="sc-tl-a11y" effect="up" stagger={110}>
      <div class="sc-tl-a11y-panel sc-card">
        <span class="sc-tl-label">Hareket</span>
        <Segmented bind:value={$motion} options={[{ value: "system", label: "Sistem" }, { value: "reduce", label: "Azalt" }, { value: "full", label: "Tam" }]} />
        <Slider bind:value={$scale} min={85} max={200} step={5} format={(v: number) => `${v}%`} label="Yazı boyutu" />
        <Toggle bind:value={$contrast}>Yüksek karşıtlık</Toggle>
        <Toggle bind:value={$links}>Bağlantıların altını çiz</Toggle>
        <Toggle bind:value={$spacing}>Geniş metin aralığı</Toggle>
        <Toggle bind:value={$focus}>Güçlü odak halkası</Toggle>
        <div class="sc-tl-a11y-actions">
          <Button variant="primary" onClick={() => a11y.set(prefs())}><Icon of={eye} size="md" />Tüm sayfaya uygula</Button>
          <Button variant="ghost" onClick={() => a11y.reset()}>Sayfayı sıfırla</Button>
        </div>
      </div>
      <div class="sc-tl-a11y-right">
        <article class="sc-tl-sample sc-card" ref={(el: HTMLElement) => { sample = el }} data-motion={() => $motion}
          data-contrast={() => on($contrast)} data-links={() => on($links)} data-spacing={() => on($spacing)} data-focus={() => on($focus)}
          style={() => ({ "--sc-tl-scale": String($scale / 100) })}>
          <div class="sc-tl-sample-top"><span class="sc-tl-live" aria-hidden="true" /><span class="sc-tl-sample-kicker">Canlı yayın</span></div>
          <h3 class="sc-tl-sample-title">Akşam konseri başlıyor</h3>
          <p class="sc-tl-sample-text">Sahneye çıkmadan önce programa göz at, <a href="#sc-tl-a11y-h">oturma planını</a> incele ve yerini ayırt.</p>
          <div class="sc-tl-sample-foot">
            <button type="button" class="sc-tl-btn">Yer ayır</button>
            {() => ($broken ? <span class="sc-tl-broken"><button type="button" class="sc-tl-iconbtn"><Icon of={sparkles} size="md" /></button><input class="sc-tl-input" type="text" /></span> : null)}
          </div>
        </article>
        <div class="sc-tl-audit sc-card">
          <div class="sc-tl-audit-head">
            <Toggle bind:value={$broken}>Hatalı öğe ekle</Toggle>
            <Button onClick={check}><Icon of={checkIcon} size="md" />Denetle</Button>
          </div>
          <div aria-live="polite">{() => ($issues === null
            ? <p class="sc-tl-hint">Denetçi kartı tarar: adsız düğme, etiketsiz alan, alt metinsiz görsel, atlanan başlık…</p>
            : $issues.length
              ? <ul class="sc-tl-issues">{$issues.map((s) => <li>{s}</li>)}</ul>
              : <p class="sc-tl-ok"><Icon of={checkIcon} size="md" />Sorun bulunmadı</p>)}</div>
        </div>
      </div>
    </Reveal>
  </section>
}

export default function MoreTools() {
  return <>
    <FlowSection />
    <EasingSection />
    <UndoSection />
    <PickersSection />
    <A11ySection />
  </>
}
