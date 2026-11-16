// Home page sections (a lazy part): motion you can touch. A card that springs back where it was thrown from (three
// springs to pick), a list that reorders with FLIP, words that never stop moving (looping text effects), stage effects
// behind a headline (particles, aurora, grain) and a little app whose screens change with page transitions. Real
// motion engine calls throughout; with reduced motion everything is simply in place.
import "./motion.css";
import "march/motion/motion.css";
import { onCleanup, For } from "march";
import { animate, animateList, reducedMotion, flipPage, wipe, stack, cube, zoomThrough, curtain, blinds, type PageVariant } from "march/motion";
import { wave, rainbow, neon, shimmer, glow, float, type TextAnimation } from "march/motion/text";
import { draggable } from "march/behaviors/drag";
import { Particles, Aurora, Noise } from "march/fx";
import { Button, Chip, Badge, Avatar } from "march/ui";
import { Reveal } from "march/components/landing/index.ts";
import { Icon, home, user, settings, sparkles, star, heart, zap } from "march/icons";
import { Head } from "../head.tsx";

// ── springs ─────────────────────────────────────────────────────────────────────────────────────────────────────

/** The springs the card can fall back with (engine easing names). */
const SPRINGS: readonly { name: string; label: string }[] = [
  { name: "spring", label: "Yay" }, { name: "spring-wobbly", label: "Lastik" }, { name: "spring-snappy", label: "Çevik" },
]
/** How long the card takes to fall back (ms); the spring curve shapes it. */
const BACK_MS = 1100

function Springs() {
  let $x = 0
  let $y = 0
  let $held = false
  let $spring = "spring-wobbly"
  let card: HTMLElement | null = null
  // the spring now playing: a new grab stops it (it would hold the card where it ends and hide the drag)
  let run: { cancel(): void } | null = null
  /** Let go from (x, y): the card is put home at once and the spring plays from where it was (it keeps nothing after). */
  const back = (x: number, y: number): void => {
    $x = 0; $y = 0
    run?.cancel(); run = null
    if (!card || reducedMotion() || (!x && !y)) return
    run = animate(card, [{ translate: `${x}px ${y}px` }, { translate: "0px 0px" }], { duration: BACK_MS, easing: $spring, fill: "none" })
  }
  const grab = (el: Element) => {
    card = el as HTMLElement
    onCleanup(draggable(el, {
      onStart: () => { run?.cancel(); run = null; $held = true },
      onMove: (p) => { $x = p.dx; $y = p.dy },
      onEnd: (p) => { $held = false; back(p.dx, p.dy) },
    }))
  }
  /** Throw it somewhere at random (for those who do not drag). */
  const fling = (): void => {
    const a = Math.random() * Math.PI * 2, r = 90 + Math.random() * 60
    back(Math.cos(a) * r, Math.sin(a) * r * 0.6)
  }
  return <section class="sc-sec" aria-labelledby="sc-mx-spring-h">
    <Head id="sc-mx-spring-h" kicker="Yay fiziği" color="brand-orange" title="Gerçek yay fiziğiyle hareket" example="Fırlat, geri yaylansın"
      lead="Gerçek yay fiziği: sertlik, sönüm, kütle. Kartı tut, sürükle, bırak; seçtiğin yayla yerine döner. Her geçiş aynı motordan geçer, genel hız ve duraklatma onu da durdurur." />
    <Reveal class="sc-mx-spring" effect="up" stagger={100}>
      <div class="sc-mx-spring-stage sc-card">
        <div class="sc-mx-spring-home" aria-hidden="true" />
        <div class={() => `sc-mx-spring-card${$held ? " is-held" : ""}`} ref={grab} style={{ translate: `${$x}px ${$y}px` }}
          role="img" aria-label="Sürüklenebilir kart">
          <Icon of={sparkles} size="xl" /><b>Beni sürükle</b><span>bırakınca yaylanır</span>
        </div>
      </div>
      <div class="sc-mx-spring-side">
        <div class="sc-mx-chips" role="group" aria-label="Yay">
          {SPRINGS.map((s) => <Chip size="sm" selected={() => $spring === s.name} onClick={() => { $spring = s.name; fling() }}>{s.label}</Chip>)}
        </div>
        <code class="sc-mx-code">{() => `animate(card, frames, { easing: "${$spring}" })`}</code>
        <Button variant="primary" icon={zap} on:click={fling}>Fırlat</Button>
      </div>
    </Reveal>
  </section>
}

// ── FLIP ────────────────────────────────────────────────────────────────────────────────────────────────────────

interface Item { id: number; name: string; tone: number }
const NAMES = ["Sinyaller", "Bileşenler", "Hareket", "Temalar", "Grafikler", "Formlar", "Yönlendirici", "Çeviri", "Testler", "İkonlar"]

function Flip() {
  let nextId = 0
  const make = (name: string): Item => ({ id: nextId++, name, tone: nextId % 4 })
  let $items: Item[] = NAMES.slice(0, 6).map(make)
  const shuffle = (): void => { const a = [...$items]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!] } $items = a }
  const sort = (): void => { $items = [...$items].sort((a, b) => a.name.localeCompare(b.name, "tr")) }
  const add = (): void => { const free = NAMES.filter((n) => !$items.some((i) => i.name === n)); if (free.length) $items = [make(free[Math.floor(Math.random() * free.length)]!), ...$items] }
  const drop = (): void => { if ($items.length > 1) { const k = Math.floor(Math.random() * $items.length); $items = $items.filter((_, i) => i !== k) } }
  // the list watches its own children: added ones pop in, removed ones fade where they were, the rest glide (FLIP)
  const watch = (el: Element) => onCleanup(animateList(el as HTMLElement, { enter: "pop", exit: "fade", easing: "spring", stagger: 40 }))
  return <section class="sc-sec" aria-labelledby="sc-mx-flip-h">
    <Head id="sc-mx-flip-h" kicker="FLIP" color="brand-blue" title="FLIP ile liste animasyonları" example="Liste değişir, her öğe kendi yolundan gider"
      lead="Karıştır, sırala, ekle, çıkar: yer değiştiren her kart eski yerinden yenisine süzülür, gelen belirir, giden yerinde söner. Tek satır: animateList." />
    <Reveal class="sc-mx-flip" effect="up" stagger={100}>
      <div class="sc-mx-flip-tools">
        <Button size="sm" variant="primary" on:click={shuffle}>Karıştır</Button>
        <Button size="sm" on:click={sort}>Sırala</Button>
        <Button size="sm" on:click={add}>Ekle</Button>
        <Button size="sm" variant="ghost" on:click={drop}>Çıkar</Button>
      </div>
      <div class="sc-mx-flip-list" ref={watch}>
        <For each={$items} key="id">{(it: () => Item) => <div class={`sc-mx-flip-item sc-card is-${it().tone + 1}`}><b>{it().name}</b></div>}</For>
      </div>
    </Reveal>
  </section>
}

// ── looping text ────────────────────────────────────────────────────────────────────────────────────────────────

type Loop = (el: HTMLElement) => TextAnimation
/** The looping effects to pick (they pause off screen and stay still with reduced motion). */
const LOOPS: readonly { name: string; play: Loop }[] = [
  { name: "wave", play: (el) => wave(el, {}) },
  { name: "rainbow", play: (el) => rainbow(el, {}) },
  { name: "neon", play: (el) => neon(el, {}) },
  { name: "shimmer", play: (el) => shimmer(el, {}) },
  { name: "glow", play: (el) => glow(el, {}) },
  { name: "float", play: (el) => float(el, {}) },
]
const LOOP_TEXT = "Hiç durmayan kelimeler"

function Loops() {
  let $at = 0
  let word: HTMLElement | null = null
  let run: TextAnimation | null = null
  const play = (i: number): void => {
    $at = i
    if (!word) return
    run?.stop()
    word.textContent = LOOP_TEXT
    run = LOOPS[i]!.play(word)
  }
  const start = (el: HTMLElement) => {
    word = el
    queueMicrotask(() => play($at))
    onCleanup(() => run?.stop())
  }
  return <section class="sc-sec" aria-labelledby="sc-mx-loop-h">
    <Head id="sc-mx-loop-h" kicker="Döngü efektleri" color="brand-purple" title="Sonsuz döngüde metin efektleri" example="Bazı kelimeler hiç durmaz"
      lead="Dalga, gökkuşağı, neon, parıltı, ışıma: harf harf ya da kelime kelime, sonsuz döngüde. Ekrandan çıkınca durur, geri gelince devam eder." />
    <Reveal class="sc-mx-loop" effect="scale">
      <div class="sc-mx-loop-stage sc-card"><span class="sc-mx-loop-word" ref={start}>{LOOP_TEXT}</span></div>
      <div class="sc-mx-chips" role="group" aria-label="Döngü efekti">
        {LOOPS.map((l, i) => <Chip size="sm" selected={() => $at === i} onClick={() => play(i)}>{l.name}</Chip>)}
      </div>
    </Reveal>
  </section>
}

// ── stage effects ───────────────────────────────────────────────────────────────────────────────────────────────

const FX: readonly { id: "particles" | "aurora" | "noise"; label: string }[] = [
  { id: "particles", label: "Parçacıklar" }, { id: "aurora", label: "Kutup ışıkları" }, { id: "noise", label: "Gren" },
]
const AURORA = ["var(--m-brand-orange, var(--m-cat-1))", "var(--m-brand-blue, var(--m-cat-2))", "var(--m-brand-purple, var(--m-cat-4))", "var(--m-brand-green, var(--m-cat-3))"]

function Effects() {
  let $fx: "particles" | "aurora" | "noise" = "particles"
  const title = () => <div class="sc-mx-fx-copy"><b class="sc-mx-fx-title">Sahne senin</b><span>Arka plan efektleri: tuval, CSS değişkenleri, CSP uyumlu</span></div>
  return <section class="sc-sec" aria-labelledby="sc-mx-fx-h">
    <Head id="sc-mx-fx-h" kicker="Efektler" color="brand-green" title="Parçacık, kutup ışığı ve gren efektleri" example="Başlığın arkasında bir dünya"
      lead="Fareye yaklaşan parçacıklar, akan kutup ışıkları, film greni: ayrı bir modül, yalnız kullanınca yüklenir; ekran dışında durur." />
    <Reveal class="sc-mx-fx" effect="up" stagger={100}>
      <div class="sc-mx-fx-stage">
        {() => ($fx === "particles" ? <><Particles count={70} links={120} speed={0.4} color="var(--m-accent, var(--m-primary))" interactive class="m-fx-fill" />{title()}</>
          : $fx === "aurora" ? <><Aurora colors={AURORA} />{title()}</>
            : <Noise class="sc-mx-fx-grain">{title()}</Noise>)}
      </div>
      <div class="sc-mx-chips" role="group" aria-label="Efekt">
        {FX.map((f) => <Chip size="sm" selected={() => $fx === f.id} onClick={() => { $fx = f.id }}>{f.label}</Chip>)}
      </div>
    </Reveal>
  </section>
}

// ── page transitions ────────────────────────────────────────────────────────────────────────────────────────────

/** The transitions to pick (the router's page variants, played here on a little app's screens). */
const VARIANTS: readonly { label: string; v: PageVariant }[] = [
  { label: "Küp", v: cube }, { label: "Silme", v: wipe }, { label: "Deste", v: stack }, { label: "Çevir", v: flipPage },
  { label: "Yakınlaş", v: zoomThrough }, { label: "Perde", v: curtain }, { label: "Panjur", v: blinds },
]
const SCREENS = [
  { icon: home, title: "Ana sayfa", text: "Bugün üç yeni etkinlik var" },
  { icon: user, title: "Profil", text: "Öykü · İstanbul" },
  { icon: settings, title: "Ayarlar", text: "Koyu kip, bildirimler açık" },
]
/** How long a screen change plays (ms). */
const PAGE_MS = 650

function Pages() {
  let $tab = 0
  let $variant = 0
  const panes: HTMLElement[] = []
  let busy = false
  // the two animations of the swap now playing: when it ends they are let go, so no last frame stays on a screen
  // (a clip of curtain or blinds held on it would leave that screen blank the next time it comes)
  let running: { cancel(): void }[] = []
  const go = (to: number): void => {
    const from = $tab
    if (to === from || busy) return
    const a = panes[from], b = panes[to], v = VARIANTS[$variant]!.v
    $tab = to
    running.forEach((r) => r.cancel()); running = []
    if (!a || !b || reducedMotion()) return
    const dir = to > from ? "forward" : "back", rtl = getComputedStyle(b).direction === "rtl"
    busy = true
    a.classList.add("is-leaving")
    const pIn = animate(b, v.frames("in", dir, rtl), { duration: PAGE_MS, easing: "out" })
    const pOut = animate(a, v.frames("out", dir, rtl), { duration: PAGE_MS, easing: "out" })
    running = [pIn, pOut]
    void pIn.finished.then(() => { a.classList.remove("is-leaving"); running.forEach((r) => r.cancel()); running = []; busy = false })
  }
  return <section class="sc-sec" aria-labelledby="sc-mx-page-h">
    <Head id="sc-mx-page-h" kicker="Sayfa geçişleri" color="brand-orange" title="Rotalar arasında sayfa geçişleri" example="Ekranlar arasında sinema"
      lead="Küp, deste, perde, panjur, yakınlaşma: her rota kendi geçişini seçer, geri gidince tersine oynar, sağdan sola dillerde aynalanır." />
    <Reveal class="sc-mx-page" effect="up" stagger={100}>
      <div class="sc-mx-page-app sc-card">
        <div class="sc-mx-page-stage">
          {SCREENS.map((s, i) => <div class={() => `sc-mx-page-pane is-${i + 1}${$tab === i ? " is-on" : ""}`} ref={(el: HTMLElement) => { panes[i] = el }}>
            <Avatar name={s.title} size="lg" decorative />
            <b>{s.title}</b><span>{s.text}</span>
            <div class="sc-mx-page-row"><Badge tone="info">{s.title}</Badge><Icon of={i === 1 ? heart : star} size="md" /></div>
          </div>)}
        </div>
        <nav class="sc-mx-page-tabs" aria-label="Ekranlar">
          {SCREENS.map((s, i) => <button type="button" class={() => `sc-mx-page-tab${$tab === i ? " is-on" : ""}`} aria-current={() => ($tab === i ? "page" : null)} on:click={() => go(i)}>
            <Icon of={s.icon} size="md" /><span>{s.title}</span>
          </button>)}
        </nav>
      </div>
      <div class="sc-mx-chips" role="group" aria-label="Geçiş">
        {VARIANTS.map((v, i) => <Chip size="sm" selected={() => $variant === i} onClick={() => { $variant = i; go(($tab + 1) % SCREENS.length) }}>{v.label}</Chip>)}
      </div>
    </Reveal>
  </section>
}

export default function MoreMotion() {
  return <>
    <Springs />
    <Flip />
    <Loops />
    <Effects />
    <Pages />
  </>
}
