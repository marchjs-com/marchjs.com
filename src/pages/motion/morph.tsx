// Motion › Morph: container transforms (button → dialog, card → page), shared element FLIP, icon morphs and shape
// morphs. Each one is an engine Playback (global speed, "Stop all", reduced motion).
import "../motion-pages.css";
import { morph, morphBack, morphIcon, shapeMorph, MORPH_ICONS, type MorphIconName, type ShapeName } from "hadi-march/motion/morph.ts";
import type { Playback } from "hadi-march/motion";
import { Button } from "hadi-march/ui";
import { Section } from "../../demo.tsx";
import { MotionDemo, opt, EASES } from "../../playground.tsx";

const PEOPLE = [
  { id: "a", name: "Ada", role: "Tasarım", tone: 1 },
  { id: "b", name: "Bora", role: "Ürün", tone: 2 },
  { id: "c", name: "Ceren", role: "Mühendislik", tone: 3 },
  { id: "d", name: "Deniz", role: "Pazarlama", tone: 4 },
]
const CARDS = [
  { id: "x", title: "HADİ Studio", text: "Yaz koleksiyonu çekimleri ve kampanya takvimi.", tone: "o" },
  { id: "y", title: "HADİ Radyo", text: "Haftalık yayın akışı ve konuk listesi.", tone: "b" },
  { id: "z", title: "HADİ Bahçe", text: "Mevsimlik dikim planı ve sulama saatleri.", tone: "g" },
]
const SHAPES: { value: ShapeName; label: string }[] = [
  { value: "circle", label: "daire" }, { value: "square", label: "kare" }, { value: "triangle", label: "üçgen" }, { value: "diamond", label: "elmas" },
  { value: "hexagon", label: "altıgen" }, { value: "star", label: "yıldız" }, { value: "blob", label: "damla" }, { value: "flower", label: "çiçek" },
]
const ICON_PAIRS: { a: MorphIconName; b: MorphIconName; la: string; lb: string }[] = [
  { a: "play", b: "pause", la: "Oynat", lb: "Duraklat" },
  { a: "menu", b: "close", la: "Menüyü aç", lb: "Menüyü kapat" },
  { a: "plus", b: "check", la: "Ekle", lb: "Eklendi" },
]

export default function MotionMorph() {
  document.title = "Morph · March"

  // 1 · button → dialog
  let $bDur = 520, $bEase = "expo", $bFade = true
  let $dlg = false
  let trigger: HTMLElement | undefined, dialog: HTMLElement | undefined
  const openDlg = (): void => {
    $dlg = true
    queueMicrotask(() => { if (trigger && dialog) { morph(trigger, dialog, { duration: $bDur, easing: $bEase, fadeContent: $bFade }); dialog.querySelector<HTMLElement>("input")?.focus() } })
  }
  let dlgClosing: Playback | null = null
  const closeDlg = (): void => {
    if (!trigger || !dialog || !$dlg || dlgClosing) return
    const p = dlgClosing = morphBack(dialog, trigger, { duration: $bDur * 0.8, fadeContent: $bFade })
    // a reopen during the shrink cancels it (state "idle"): the dialog stays open
    void p.finished.then(() => { if (dlgClosing === p) dlgClosing = null; if (p.state !== "finished") return; $dlg = false; trigger?.focus() })
  }

  // 2 · card → page
  let $cDur = 600, $cEase = "expo"
  let $page = ""
  const cardEls = new Map<string, HTMLElement>()
  let pageEl: HTMLElement | undefined
  const openCard = (id: string): void => {
    $page = id
    queueMicrotask(() => { const c = cardEls.get(id); if (c && pageEl) { morph(c, pageEl, { duration: $cDur, easing: $cEase }); pageEl.querySelector<HTMLElement>("button")?.focus() } })
  }
  let cardClosing: Playback | null = null
  const closeCard = (): void => {
    const c = cardEls.get($page)
    if (!c || !pageEl || cardClosing) return
    const p = cardClosing = morphBack(pageEl, c, { duration: $cDur * 0.75 })
    void p.finished.then(() => { if (cardClosing === p) cardClosing = null; if (p.state !== "finished") return; $page = ""; c.focus() })
  }

  // 3 · shared element
  let $sDur = 500, $sEase = "spring"
  let $who = "a"
  const thumbs = new Map<string, HTMLElement>()
  let big: HTMLElement | undefined
  const pickWho = (id: string): void => {
    if (id === $who) return
    $who = id
    queueMicrotask(() => { const t = thumbs.get(id); if (t && big) morph(t, big, { mode: "scale", hideSource: false, duration: $sDur, easing: $sEase }) })
  }

  // 4 · icons
  let $iEase = "spring-snappy", $iDur = 380
  const iconOn = ICON_PAIRS.map(() => false)
  let $iconTick = 0
  const paths: SVGPathElement[] = []
  const toggleIcon = (i: number): void => {
    iconOn[i] = !iconOn[i]; $iconTick++
    const p = ICON_PAIRS[i]!
    morphIcon(paths[i]!, iconOn[i] ? p.b : p.a, { easing: $iEase, duration: $iDur })
  }
  const playIcons = (): void => { ICON_PAIRS.forEach((_, i) => { if (paths[i]) toggleIcon(i) }) }

  // 5 · shapes
  let $shape = "star" as ShapeName, $shEase = "spring", $shPoints = 60
  let blobEl: HTMLElement | undefined
  const reshape = (): void => { if (blobEl) shapeMorph(blobEl, $shape, { easing: $shEase, points: $shPoints }) }

  return <Section kicker="Hareket" title="Morph" lead="Bir öğe başka bir öğeye dönüşür: düğme diyaloğa, kart sayfaya büyür; içerik gerilmez, kırpılarak açılır, renk ve köşe yarıçapı birlikte akar. Aynı resim bir yerden ötekine FLIP ile taşınır; ikonlar ve şekiller nokta nokta dönüşür.">
    <MotionDemo wide title="Düğme → diyalog" desc="Diyalog düğmenin kutusundan büyür (kırpma + taşıma), kapatınca düğmeye geri küçülür ve odak düğmeye döner. Esc kapatır."
      call={() => `morph(button, dialog, { duration: ${$bDur}, easing: "${$bEase}", fadeContent: ${$bFade} })`}
      code={`import { morph, morphBack } from "hadi-march/motion"

open = true; morph(button, dialog)                              // dialog grows out of the button
await morphBack(dialog, button).finished; open = false          // and shrinks back into it`}
      options={[
        opt("Süre", () => $bDur, (v: number) => { $bDur = v }, { min: 200, max: 1400, step: 20, unit: " ms" }),
        opt("Eğri", () => $bEase, (v: string) => { $bEase = v }, { options: [{ value: "expo", label: "hızlı" }, ...EASES] }),
        opt("İçerik solması", () => $bFade, (v: boolean) => { $bFade = v }),
      ]}>
      <div class="sc-mo-box">
        <Button variant="primary" ref={(el: HTMLElement) => { trigger = el }} on:click={openDlg} aria-haspopup="dialog" aria-expanded={() => String($dlg)}>Yeni etkinlik</Button>
        <div class="sc-mo-dialog" role="dialog" aria-modal="false" aria-labelledby="sc-mo-dlg-t" hidden={!$dlg} ref={(el: HTMLElement) => { dialog = el }} on:keydown={(e: KeyboardEvent) => { if (e.key === "Escape") closeDlg() }}>
          <h3 id="sc-mo-dlg-t">Yeni etkinlik</h3>
          <label class="sc-mo-field"><span>Ad</span><input class="m-input" value="HADİ buluşması" /></label>
          <label class="sc-mo-field"><span>Tarih</span><input class="m-input" type="date" /></label>
          <div class="sc-mo-actions"><Button variant="ghost" on:click={closeDlg}>Vazgeç</Button><Button variant="primary" on:click={closeDlg}>Kaydet</Button></div>
        </div>
      </div>
    </MotionDemo>

    <MotionDemo wide title="Kart → sayfa" desc="Kart, seçilince bulunduğu yerden sayfa boyutuna açılır; geri dönünce yeniden karta küçülür."
      call={() => `morph(card, page, { duration: ${$cDur}, easing: "${$cEase}" })`}
      code={`import { morph, morphBack } from "hadi-march/motion"

morph(cardEl, pageEl, { duration: 600 })
morphBack(pageEl, cardEl).finished.then(() => (open = null))`}
      options={[
        opt("Süre", () => $cDur, (v: number) => { $cDur = v }, { min: 200, max: 1400, step: 20, unit: " ms" }),
        opt("Eğri", () => $cEase, (v: string) => { $cEase = v }, { options: [{ value: "expo", label: "hızlı" }, ...EASES] }),
      ]}>
      <div class="sc-mo-cards-wrap">
        <ul class="sc-mo-cards">
          {CARDS.map((c) => <li><button type="button" class={`sc-mo-card sc-mo-t-${c.tone}`} ref={(el: HTMLElement) => { cardEls.set(c.id, el) }} on:click={() => openCard(c.id)}>
            <strong>{c.title}</strong><span>{c.text}</span>
          </button></li>)}
        </ul>
        <section class={() => `sc-mo-page sc-mo-t-${CARDS.find((c) => c.id === $page)?.tone ?? "o"}`} hidden={!$page} aria-label={() => CARDS.find((c) => c.id === $page)?.title ?? ""} ref={(el: HTMLElement) => { pageEl = el }}>
          <Button size="sm" variant="secondary" on:click={closeCard}>Geri</Button>
          <h3>{() => CARDS.find((c) => c.id === $page)?.title}</h3>
          <p>{() => CARDS.find((c) => c.id === $page)?.text}</p>
          <p>Bu alan kartın büyümüş hâli: içerik kırpma ile açılır, metin gerilmez.</p>
        </section>
      </div>
    </MotionDemo>

    <MotionDemo title="Paylaşılan öğe" desc="Küçük resim seçilince büyük alandaki aynı kişi, küçük resmin yerinden ölçeklenerek gelir (FLIP)."
      call={() => `morph(thumb, big, { mode: "scale", hideSource: false, duration: ${$sDur}, easing: "${$sEase}" })`}
      code={`import { morph } from "hadi-march/motion"

morph(thumbEl, bigEl, { mode: "scale", hideSource: false })   // same picture, scaled from there to here`}
      options={[
        opt("Süre", () => $sDur, (v: number) => { $sDur = v }, { min: 200, max: 1400, step: 20, unit: " ms" }),
        opt("Eğri", () => $sEase, (v: string) => { $sEase = v }, { options: EASES }),
      ]}>
      <div class="sc-mo-shared">
        <div class={() => `sc-mo-big sc-cat-bg-${PEOPLE.find((p) => p.id === $who)!.tone}`} ref={(el: HTMLElement) => { big = el }} role="img" aria-label={() => PEOPLE.find((p) => p.id === $who)!.name}>
          <span>{() => PEOPLE.find((p) => p.id === $who)!.name.slice(0, 1)}</span>
        </div>
        <p class="sc-mo-who"><strong>{() => PEOPLE.find((p) => p.id === $who)!.name}</strong> {() => PEOPLE.find((p) => p.id === $who)!.role}</p>
        <div class="sc-mo-thumbs" role="radiogroup" aria-label="Kişi">
          {PEOPLE.map((p) => <button type="button" role="radio" aria-checked={() => String($who === p.id)} aria-label={p.name} class={`sc-mo-thumb sc-cat-bg-${p.tone}`} ref={(el: HTMLElement) => { thumbs.set(p.id, el) }} on:click={() => pickWho(p.id)}>{p.name.slice(0, 1)}</button>)}
        </div>
      </div>
    </MotionDemo>

    <MotionDemo title="İkon morph" desc="Oynat↔duraklat, menü↔kapat, ekle↔onay: her ikon aynı yapıda üç çubuk, bu yüzden nokta nokta dönüşür."
      call={() => `morphIcon(path, "${iconOn[0] ? "pause" : "play"}", { easing: "${$iEase}", duration: ${$iDur} })  // tık: ${$iconTick}`}
      code={`import { morphIcon, MORPH_ICONS } from "hadi-march/motion"

<svg viewBox="0 0 24 24"><path d={MORPH_ICONS.play} /></svg>
morphIcon(path, playing ? "pause" : "play")             // play pause menu close plus check minus`}
      options={[
        opt("Eğri", () => $iEase, (v: string) => { $iEase = v }, { options: [{ value: "spring-snappy", label: "çevik yay" }, ...EASES] }),
        opt("Süre", () => $iDur, (v: number) => { $iDur = v }, { min: 150, max: 1200, step: 10, unit: " ms" }),
      ]} play={playIcons}>
      <div class="sc-mo-icons">
        {ICON_PAIRS.map((p, i) => <button type="button" class="sc-mo-iconbtn" aria-pressed={() => ($iconTick, String(iconOn[i]))} aria-label={() => ($iconTick, iconOn[i] ? p.lb : p.la)} on:click={() => toggleIcon(i)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d={MORPH_ICONS[p.a]} ref={(el: SVGPathElement) => { paths[i] = el }} /></svg>
        </button>)}
      </div>
    </MotionDemo>

    <MotionDemo title="Şekil morph" desc="Sekiz şekil aynı açılarda örneklenmiş clip-path çokgenleri: tarayıcı aralarını kendisi ara değerler, motor zamanlar."
      call={() => `shapeMorph(el, "${$shape}", { easing: "${$shEase}", points: ${$shPoints} })`}
      code={`import { shapeMorph, shapePolygon } from "hadi-march/motion"

shapeMorph(el, "star", { easing: "spring" })        // circle square triangle diamond hexagon star blob flower
el.style.clipPath = shapePolygon("hexagon")         // a static outline`}
      options={[
        opt("Şekil", () => $shape, (v: ShapeName) => { $shape = v }, { options: SHAPES }),
        opt("Eğri", () => $shEase, (v: string) => { $shEase = v }, { options: EASES }),
        opt("Nokta", () => $shPoints, (v: number) => { $shPoints = v }, { min: 12, max: 120, step: 4 }),
      ]} play={reshape}>
      <div class="sc-mo-shape" ref={(el: HTMLElement) => { blobEl = el }} role="img" aria-label={() => SHAPES.find((s) => s.value === $shape)!.label} />
    </MotionDemo>
  </Section>
}
