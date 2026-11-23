// What makes MarchJS different, shown live on the home page (above the map): signals (a panel updates itself and only
// the nodes that changed flash; the panel ran once), everything in one package (rows of component names sliding past
// and real components wired to each other) and the IDE in the browser (code types itself, the preview follows letter
// by letter). Real components throughout; the numbers come from home-stats.gen.ts.
import "./features.css";
import { onCleanup } from "march";
import { inView, reducedMotion } from "march/motion";
import { every } from "./clock.ts";
import { Link } from "march/router";
import { Avatar, AvatarGroup, Badge, Button, Chip, CodeView, LikeButton, Progress, Rating, Slider, Toggle } from "march/ui";
import { bounceIn, elastic, glitch, inkBleed, jelly, pixelate, splitFlap, swing } from "march/motion/text";
import { Reveal } from "march/components/landing/reveal";
import { CodeEditor } from "march/components/composite/code-editor";
import { Icon, arrowRight, check, eye, globe, lock, shieldCheck, sparkles } from "march/icons";
import { HOME_STATS as S } from "../home-stats.gen.ts";
import { Head } from "./head.tsx";


// ── signals ─────────────────────────────────────────────────────────────────────────────────────────────────────

/** How often the live panel ticks by itself while it is on screen (ms), and how long a changed node glows. */
const TICK_MS = 1200, GLOW_MS = 650
// the code of the panel beside it (Panel and its button), as it is
const SIGNAL_CODE = `let $n = 0

// yalnız rakam güncellenir
<div>Sayaç <b>{$n}</b></div>
// yalnız çubuk güncellenir
<Progress value={($n % 10) * 10} label="İlerleme" />
// beş adımda bir: yalnız rozet güncellenir
<div>Tur <Badge tone={$n % 10 < 5 ? "success" : "info"}>
  {$n % 10 < 5 ? "ilk yarı" : "ikinci yarı"}
</Badge></div>
<div>Bu satır hiç değişmez</div>
<div>Bu da yerinde durur</div>

<Button on:click={() => $n++}>Artır</Button>`

function Signals() {
  let $n = 0
  let $auto = true
  let $changes = 0
  // how many times the panel's own function ran: once (a change never runs it again)
  let $runs = 0
  const Panel = () => {
    $runs++
    return <div class="sc-live-panel" ref={watch}>
      <div class="sc-live-row"><span class="sc-live-k">Sayaç</span><b class="sc-live-n" data-glow>{$n}</b></div>
      <div class="sc-live-row"><Progress value={($n % 10) * 10} label="İlerleme" /></div>
      {/* changes only every fifth step: most steps it stays as it is, and does not glow */}
      <div class="sc-live-row"><span class="sc-live-k">Tur</span><span class="sc-live-badge" data-glow><Badge tone={$n % 10 < 5 ? "success" : "info"}>
        {$n % 10 < 5 ? "ilk yarı" : "ikinci yarı"}
      </Badge></span></div>
      <div class="sc-live-row is-still"><span class="sc-live-k">Bu satır</span><span>hiç değişmez</span></div>
      <div class="sc-live-row is-still"><span class="sc-live-k">Bu da</span><span>yerinde durur</span></div>
    </div>
  }
  // every DOM node that changes glows for a moment: only that node (the number, the progress track, the badge), not its
  // row, and only when its value really changed (a class or text written again with the same value is no change)
  function watch(panel: Element): void {
    const glows = new WeakMap<Element, ReturnType<typeof setTimeout>>()
    const mo = new MutationObserver((list) => {
      for (const m of list) {
        if (m.type === "attributes" && (m.target as Element).getAttribute(m.attributeName!) === m.oldValue) continue
        if (m.type === "characterData" && m.target.nodeValue === m.oldValue) continue
        const at = (m.type === "characterData" ? m.target.parentElement : m.target) as Element | null
        const node = at?.closest<HTMLElement>("[data-glow]") ?? at?.closest<HTMLElement>('[role="progressbar"]')
        // the glow itself is a class change of the node: not a change of the panel (it would glow forever)
        if (!node || (m.type === "attributes" && m.attributeName === "class" && m.target === node)) continue
        $changes++
        // a node already glowing keeps glowing a while longer (no restart: reading a size to restart it would force a
        // layout of the page)
        node.classList.add("is-glow")
        clearTimeout(glows.get(node))
        glows.set(node, setTimeout(() => node.classList.remove("is-glow"), GLOW_MS))
      }
    })
    mo.observe(panel, { subtree: true, characterData: true, characterDataOldValue: true, childList: true, attributes: true, attributeOldValue: true, attributeFilter: ["aria-valuenow", "class"] })
    onCleanup(() => mo.disconnect())
  }
  // it ticks by itself while on screen, until someone presses the button
  const tick = (box: Element) => {
    let timer: (() => void) | undefined
    const stop = inView(box, { once: false, rootMargin: "0px", threshold: 0.4,
      enter: () => { if (!reducedMotion()) timer ??= every(TICK_MS, () => { if ($auto) $n++ }) },
      leave: () => { timer?.(); timer = undefined } })
    onCleanup(() => { stop(); timer?.() })
  }
  return <section class="sc-sec" aria-labelledby="sc-live-h">
    <Head id="sc-live-h" kicker="Sinyaller" color="brand-orange" title="Sinyaller yalnız değişen yeri günceller" example="Bir kez çalışır, sonra yalnız değişen yer"
      lead="Sanal DOM yok, yeniden çizim yok. Bir değer değişince ona bağlı tek düğüm güncellenir; bileşenin kendisi bir daha çalışmaz." />
    <Reveal class="sc-live" effect="up" stagger={120}>
      <div class="sc-live-code sc-card">
        <CodeView code={SIGNAL_CODE} lang="tsx" label="Sinyal örneği" />
        <div class="sc-live-meters">
          <div class="sc-live-meter"><b>{$changes}</b><span>güncellenen düğüm</span></div>
          <div class="sc-live-meter"><b>{$runs}</b><span>bileşen çalışması</span></div>
        </div>
      </div>
      <div class="sc-live-demo sc-card" ref={tick}>
        <Panel />
        <div class="sc-live-actions">
          <Button variant="primary" icon={sparkles} on:click={() => { $auto = false; $n++ }}>Artır</Button>
          <span class="sc-live-hint">{() => ($auto ? "Kendi kendine artıyor; parlayan yalnız değişen düğüm" : "Şimdi sen artırıyorsun")}</span>
        </div>
      </div>
    </Reveal>
  </section>
}

// ── everything in one package ───────────────────────────────────────────────────────────────────────────────────

/** Names of a few components, in three rows that slide past (every one is a real component of the package). */
const ROWS: readonly (readonly string[])[] = [
  ["Button", "DatePicker", "DataTable", "Dialog", "CommandPalette", "Tabs", "ColorPicker", "Kanban", "Calendar", "Toast", "Tooltip", "Carousel"],
  ["FlowEditor", "CodeEditor", "Terminal", "DockLayout", "PropertyGrid", "Debugger", "TreeView", "JsonEditor", "BarChart", "Heatmap", "Stepper", "Wizard"],
  ["ChatBubble", "LikeButton", "PostCard", "Avatar", "Rating", "Slider", "Toggle", "Combobox", "IconPicker", "FontPicker", "Pricing", "Reveal"],
]
const PEOPLE = ["Tolga", "Öykü", "Bulut", "Rüzgar", "Deniz", "Ada"]

function Package() {
  let $volume = 64
  let $notify = true
  let $stars = 4
  let $liked = false
  let $likes = S.components
  let $picked = ["Formlar", "Hareket"]
  const CHIPS = ["Formlar", "Hareket", "Grafik", "Sohbet"]
  const pick = (c: string): void => { $picked = $picked.includes(c) ? $picked.filter((x) => x !== c) : [...$picked, c] }
  return <section class="sc-sec" aria-labelledby="sc-kit-h">
    <Head id="sc-kit-h" kicker="Tek paket" color="brand-blue" title="Her şey tek pakette, başka bağımlılık yok" example={`${S.components} bileşen, tek pakette`}
      lead={`${S.icons.total.toLocaleString("tr")} ikon, ${S.animations.total} animasyon, ${S.themes} tema, ${S.managers} yönetici. Hepsi aynı paketten, başka bağımlılık yok; yalnız kullandığın derlenir.`} />
    <div class="sc-kit-rows" aria-hidden="true">
      {ROWS.map((row, i) => <div class={`sc-kit-row is-${i + 1}`}><div class="sc-kit-track">{[...row, ...row].map((n) => <span class="sc-kit-name">{n}</span>)}</div></div>)}
    </div>
    <Reveal class="sc-kit-grid" effect="scale" stagger={80}>
      <div class="sc-kit-tile sc-card"><span class="sc-kit-cap">Slider → Progress</span>
        <Slider bind:value={$volume} label="Ses" />
        <Progress value={$volume} label="Ses düzeyi" />
      </div>
      <div class="sc-kit-tile sc-card"><span class="sc-kit-cap">Toggle</span>
        <Toggle bind:value={$notify}>Bildirimler</Toggle>
        <span class="sc-kit-note">{() => ($notify ? "Bildirimler açık" : "Sessiz")}</span>
      </div>
      <div class="sc-kit-tile sc-card"><span class="sc-kit-cap">Rating · LikeButton</span>
        <Rating bind:value={$stars} m:color="brand-gold" label="Puan" />
        <LikeButton liked={$liked} count={$likes} countFormat="full" label="Beğen" onToggle={(on: boolean) => { $liked = on; $likes += on ? 1 : -1 }} />
      </div>
      <div class="sc-kit-tile sc-card"><span class="sc-kit-cap">Chip</span>
        <div class="sc-kit-chips">{CHIPS.map((c) => <Chip size="sm" selected={() => $picked.includes(c)} onClick={() => pick(c)}>{c}</Chip>)}</div>
        <span class="sc-kit-note">{() => ($picked.length ? $picked.join(" · ") : "Hiçbiri seçili değil")}</span>
      </div>
      <div class="sc-kit-tile sc-card"><span class="sc-kit-cap">AvatarGroup</span>
        <AvatarGroup names={PEOPLE} max={4} size="sm" label="Ekip" />
        <span class="sc-kit-note">Ekip burada</span>
      </div>
    </Reveal>
  </section>
}

// ── the IDE in the browser ──────────────────────────────────────────────────────────────────────────────────────

/** What the editor types, one after another: the code and what the preview draws while its text is typed. */
const SNIPPETS: readonly { code: string; kind: "primary" | "secondary" | "badge" }[] = [
  { code: '<Button variant="primary">Merhaba MarchJS</Button>', kind: "primary" },
  { code: "<Button variant=\"secondary\" icon={sparkles}>Hadi başlayalım</Button>", kind: "secondary" },
  { code: '<Badge tone="success">Dışa aktarıldı</Badge>', kind: "badge" },
]
/** Typing speed and the pause on a finished snippet (ms). */
const TYPE_MS = 45, HOLD_MS = 1800

function Ide() {
  let $at = 0
  let $typed = 0
  const snippet = () => SNIPPETS[$at]!
  /** The part of the label typed so far (between the opening tag and the closing one); null before the tag closes. */
  const label = (): string | null => {
    const code = snippet().code, open = code.indexOf(">") + 1, close = code.lastIndexOf("</")
    return $typed < open ? null : code.slice(open, Math.min($typed, close))
  }
  const run = (box: Element) => {
    let timer: ReturnType<typeof setTimeout> | undefined, on = false
    const step = (): void => {
      if (!on) return
      const len = snippet().code.length
      if ($typed < len) { $typed++; timer = setTimeout(step, TYPE_MS) }
      else timer = setTimeout(() => { $at = ($at + 1) % SNIPPETS.length; $typed = 0; step() }, HOLD_MS)
    }
    const stop = inView(box, { once: false, rootMargin: "0px", threshold: 0.3,
      enter: () => { if (reducedMotion()) { $typed = snippet().code.length; return } on = true; clearTimeout(timer); step() },
      leave: () => { on = false; clearTimeout(timer) } })
    onCleanup(() => { stop(); on = false; clearTimeout(timer) })
  }
  return <section class="sc-sec" aria-labelledby="sc-try-h">
    <Head id="sc-try-h" kicker="Tarayıcıda IDE" color="brand-green" title="Tarayıcıda çalışan bir IDE" example="Yaz, gör, dışa aktar"
      lead="Kurulum yok, npm yok. MarchIDE'de bileşenini yaz, önizlemede harf harf gör; son derlemeyi zip olarak indir ya da cdn.marchjs.com'dan yükle." />
    <Reveal class="sc-try" effect="up" stagger={120}>
      <div class="sc-try-win sc-card" ref={run}>
        <div class="sc-try-bar" aria-hidden="true"><i /><i /><i /><span>Button.tsx</span></div>
        {/* a read-only code editor: the code is typed into it */}
        <CodeEditor value={snippet().code.slice(0, $typed)} lang="tsx" readonly shortcuts={false} label="Yazılan kod" class="sc-try-editor" />
      </div>
      <div class="sc-try-out sc-card" aria-live="off">
        <span class="sc-try-tag">Önizleme</span>
        <div class="sc-try-stage">
          {() => {
            const text = label()
            if (text === null) return <span class="sc-try-wait">derleniyor…</span>
            const k = snippet().kind
            return k === "badge" ? <Badge tone="success">{text || " "}</Badge>
              : <Button variant={k} icon={k === "secondary" ? sparkles : undefined}>{text || " "}</Button>
          }}
        </div>
        <Link href="/ide" class="sc-try-go">MarchIDE'yi aç <span aria-hidden="true">→</span></Link>
      </div>
    </Reveal>
    <div class="sc-try-cta">
      <Button variant="primary" href="/ide" iconEnd={arrowRight}>Hemen dene</Button>
    </div>
  </section>
}

// ── motion: one word, an effect after another ───────────────────────────────────────────────────────────────────

type Play = (el: HTMLElement) => { stop(): void } | void
/** The effects the stage plays in turn (a few of the text animations; the chips pick one). */
const EFFECTS: readonly { name: string; play: Play }[] = [
  { name: "bounceIn", play: (el) => bounceIn(el, { by: "char", keep: true }) },
  { name: "jelly", play: (el) => jelly(el, { by: "char", keep: true }) },
  { name: "glitch", play: (el) => glitch(el, { keep: true }) },
  { name: "inkBleed", play: (el) => inkBleed(el, { by: "char", keep: true }) },
  { name: "splitFlap", play: (el) => splitFlap(el, { keep: true }) },
  { name: "swing", play: (el) => swing(el, { by: "char", keep: true }) },
  { name: "pixelate", play: (el) => pixelate(el, { keep: true }) },
  { name: "elastic", play: (el) => elastic(el, { by: "char", keep: true }) },
]
/** How long an effect stays before the next one plays (ms). */
const EFFECT_MS = 2600

function Motion() {
  let $at = 0
  let $auto = true
  let word: HTMLElement | null = null
  let run: { stop(): void } | void
  const play = (i: number): void => {
    $at = i
    if (!word || reducedMotion()) return
    run?.stop()
    word.textContent = "MarchJS"
    run = EFFECTS[i]!.play(word)
  }
  const stage = (box: Element) => {
    let timer: (() => void) | undefined
    const stop = inView(box, { once: false, rootMargin: "0px", threshold: 0.4,
      enter: () => { if (reducedMotion()) return; play($at); timer ??= every(EFFECT_MS, () => { if ($auto) play(($at + 1) % EFFECTS.length) }) },
      leave: () => { timer?.(); timer = undefined } })
    onCleanup(() => { stop(); timer?.(); run?.stop() })
  }
  return <section class="sc-sec" aria-labelledby="sc-move-h">
    <Head id="sc-move-h" kicker="Hareket" color="brand-purple" title="Kendi hareket motoruyla gelen animasyonlar" example="Her harf sahneye çıkar"
      lead={`${S.animations.text} metin efekti, yay fiziği, kaydırma, sayfa geçişleri; hepsi kendi hareket motorunda, hareket azaltma tercihine uyar.`} />
    <Reveal class="sc-move" effect="scale" stagger={100}>
      <div class="sc-move-stage sc-card" ref={stage}>
        <span class="sc-move-word" ref={(el: HTMLElement) => { word = el }}>MarchJS</span>
        <code class="sc-move-name">{() => `${EFFECTS[$at]!.name}(el)`}</code>
      </div>
      <div class="sc-move-chips" role="group" aria-label="Efekt">
        {EFFECTS.map((e, i) => <Chip size="sm" selected={() => $at === i} onClick={() => { $auto = false; play(i) }}>{e.name}</Chip>)}
      </div>
    </Reveal>
    <Link href="/text-motion" class="sc-fast-link">{`${S.animations.text} efektin hepsi`}</Link>
  </section>
}

// ── every language, both directions ─────────────────────────────────────────────────────────────────────────────

/** The same small card in a few languages; Arabic turns the layout around (right to left). */
const LANGS: readonly { code: string; name: string; dir: "ltr" | "rtl"; text: string; open: string; later: string; badge: string }[] = [
  { code: "tr", name: "Türkçe", dir: "ltr", text: "Akşam yemeğe geliyor musun?", open: "Yanıtla", later: "Sonra", badge: "Yeni" },
  { code: "en", name: "English", dir: "ltr", text: "Are you coming to dinner tonight?", open: "Reply", later: "Later", badge: "New" },
  { code: "ar", name: "العربية", dir: "rtl", text: "هل ستأتي إلى العشاء الليلة؟", open: "رد", later: "لاحقًا", badge: "جديد" },
  { code: "de", name: "Deutsch", dir: "ltr", text: "Kommst du heute Abend zum Essen?", open: "Antworten", later: "Später", badge: "Neu" },
]
const LANG_MS = 2400
const A11Y: readonly { icon: unknown; text: string }[] = [
  { icon: check, text: "Klavyeyle eksiksiz kullanım" },
  { icon: eye, text: "Ekran okuyucu metinleri" },
  { icon: sparkles, text: "Hareket azaltma tercihi" },
  { icon: globe, text: "Sağdan sola diller, aynalanmış düzen" },
]

function Global() {
  let $at = 0
  let $auto = true
  const lang = () => LANGS[$at]!
  const cycle = (box: Element) => {
    let timer: (() => void) | undefined
    const stop = inView(box, { once: false, rootMargin: "0px", threshold: 0.4,
      enter: () => { if (!reducedMotion()) timer ??= every(LANG_MS, () => { if ($auto) $at = ($at + 1) % LANGS.length }) },
      leave: () => { timer?.(); timer = undefined } })
    onCleanup(() => { stop(); timer?.() })
  }
  return <section class="sc-sec" aria-labelledby="sc-intl-h">
    <Head id="sc-intl-h" kicker="Her dilde" color="brand-blue" title="Çeviri, yerelleştirme ve sağdan sola baştan içinde" example="Her dilde, her yönde"
      lead="Metinler çevrilir, sayılar ve tarihler yerelleşir, sağdan sola diller düzeni kendiliğinden aynalar. Erişilebilirlik sonradan eklenmez, baştan içindedir." />
    <Reveal class="sc-intl" effect="up" stagger={120}>
      <div class="sc-intl-demo sc-card" ref={cycle}>
        <div class="sc-move-chips" role="group" aria-label="Dil">
          {LANGS.map((l, i) => <Chip size="sm" selected={() => $at === i} onClick={() => { $auto = false; $at = i }}>{l.name}</Chip>)}
        </div>
        <div class="sc-intl-card" dir={() => lang().dir} lang={() => lang().code}>
          <Avatar name="Öykü" color="brand-blue" size="md" decorative />
          <div class="sc-intl-body">
            <div class="sc-intl-top"><b>Öykü</b><Badge tone="info">{() => lang().badge}</Badge></div>
            <p class="sc-intl-text">{() => lang().text}</p>
            <div class="sc-intl-actions"><Button size="sm" variant="primary" iconEnd={arrowRight}>{() => lang().open}</Button><Button size="sm" variant="ghost">{() => lang().later}</Button></div>
          </div>
        </div>
      </div>
      <ul class="sc-intl-list">
        {A11Y.map((a) => <li><Icon of={a.icon as never} size="lg" /><span>{a.text}</span></li>)}
      </ul>
    </Reveal>
  </section>
}

// ── secure from day one ─────────────────────────────────────────────────────────────────────────────────────────

const CSP = [
  "Content-Security-Policy:",
  "  default-src 'self';",
  "  script-src 'self';",
  "  style-src 'self';",
  "  require-trusted-types-for 'script';",
].join("\n")
const SAFE: readonly { icon: unknown; text: string }[] = [
  { icon: lock, text: "Satır içi stil yok, eval yok" },
  { icon: shieldCheck, text: "Trusted Types ile güvenli DOM" },
  { icon: check, text: "HTML yalnız temizlenerek eklenir" },
  { icon: shieldCheck, text: "Katı CSP altında her bileşen çalışır" },
]

function Secure() {
  return <section class="sc-sec" aria-labelledby="sc-safe-h">
    <Head id="sc-safe-h" kicker="Güvenlik" color="brand-green" title="Güvenlik baştan: her bileşen katı CSP altında çalışır" example="Katı CSP ile ilk günden"
      lead="Sonradan yamanmaz: her bileşen en sıkı içerik güvenliği politikası altında yazılır ve test edilir." />
    <Reveal class="sc-safe" effect="up" stagger={110}>
      <div class="sc-safe-code"><CodeView code={CSP} lang="sh" label="Güvenlik başlığı" /></div>
      <ul class="sc-safe-list">
        {SAFE.map((x) => <li class="sc-card"><Icon of={x.icon as never} size="lg" /><span>{x.text}</span></li>)}
      </ul>
    </Reveal>
  </section>
}

/** The sections, in order. */
export function Features() {
  return <>
    <Signals />
    <Package />
    <Motion />
    <Ide />
    <Global />
    <Secure />
  </>
}
