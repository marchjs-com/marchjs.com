// Home page sections for developers (a lazy part): the March language next to what the compiler makes of it, the CLI
// playing its commands in a read-only terminal, the size budgets as growing bars, extensions that change a component
// from one place (a live Button), and widget points that any code fills (with the CDN one-liner). Real components
// and the real compiler output; the numbers come from home-stats.gen.ts.
import "./dev.css";
import { onCleanup, intercept, version } from "march";
import { inView, reducedMotion } from "march/motion";
import { Badge, Button, Chip, CodeView, CopyButton, Toggle } from "march/ui";
import { Terminal, type TerminalApi } from "march/components/composite/terminal";
import { Reveal } from "march/components/landing/index.ts";
import { Widget, widgetPoint } from "march/widget";
import { sparkles } from "march/icons";
import { HOME_STATS as S } from "../../home-stats.gen.ts";
import { Head } from "../head.tsx";
import { every } from "../clock.ts";

// ── the language ────────────────────────────────────────────────────────────────────────────────────────────────

/** Each example: what you write, and what the March compiler writes for it (its real output, laid out on lines). */
const LANG: readonly { name: string; source: string; compiled: string }[] = [
  {
    name: "$sinyal",
    source: `let $n = 0
export const Counter = () =>
  <button on:click={() => $n++}>{$n} kez</button>`,
    compiled: `const _$t1 = _$tpl(["button", [], " kez"])
const $n = _$signal(0)
export const Counter = () => _$t1((_r) => {
  const _1 = _r.firstChild
  _$p(_r, "button", "on:click", () => $n.set($n() + 1))
  _$ins(_r, () => ($n()), _1, 1)
})`,
  },
  {
    name: "bind:",
    source: `let $name = ""
export const Hello = () => <>
  <TextInput bind:value={$name} />
  <p>Merhaba {$name}</p>
</>`,
    compiled: `const _$t1 = _$tpl(["p", [], "Merhaba "])
const $name = _$signal("")
export const Hello = () => [
  _$h(TextInput, { "bind:value": $name }),
  _$t1((_r) => { _$ins(_r, () => ($name()), null, 1) }),
]`,
  },
  {
    name: "m: · sx · use:",
    source: `export const Box = () =>
  <section m:color="brand-blue" sx={{ p: 4, text: "lg" }} use:reveal>
    Kutu
  </section>`,
    compiled: `const _$t1 = _$tpl(["section", [["data-m-color", "brand-blue"]], "Kutu"])
export const Box = () => _$t1((_r) => {
  _$p(_r, "section", "sx", "m-p-4 m-text-lg")
  _$p(_r, "section", "use:reveal", [reveal, undefined])
})`,
  },
]

function Language() {
  let $at = 0
  return <section class="sc-sec" aria-labelledby="sc-dv-lang-h">
    <Head id="sc-dv-lang-h" kicker="Dil" color="brand-orange" title="Kısa yazılan, hızlı derlenen bir dil" example="Yazdığın kadar kısa, derlendiği kadar hızlı"
      lead="$ ile başlayan değişken bir sinyaldir; bind:, on:, use:, m: ve sx tek satırda iş görür. Derleyici bunu şablon klonlayan, yalnız değişen düğümü güncelleyen sade koda çevirir." />
    <div class="sc-dv-tabs" role="group" aria-label="Örnek">
      {LANG.map((x, i) => <Chip size="sm" selected={() => $at === i} onClick={() => { $at = i }}>{x.name}</Chip>)}
    </div>
    <Reveal class="sc-dv-pair" effect="up" stagger={110}>
      <div class="sc-dv-side"><span class="sc-dv-cap">Sen yazarsın</span><CodeView code={() => LANG[$at]!.source} lang="tsx" label="March kodu" /></div>
      <div class="sc-dv-side"><span class="sc-dv-cap">Derleyici yazar</span><CodeView code={() => LANG[$at]!.compiled} lang="js" label="Derlenmiş kod" /></div>
    </Reveal>
  </section>
}

// ── the CLI ─────────────────────────────────────────────────────────────────────────────────────────────────────

/** What the three commands print (a short run of each), one line at a time. */
const CLI: readonly { text: string; tone?: "success" | "info" | "muted" }[] = [
  { text: "$ march dev", tone: "info" },
  { text: "Geliştirme sunucusu açıldı, dosyalar izleniyor", tone: "muted" },
  { text: "✔ rebuilt · canlı yenileme hazır", tone: "success" },
  { text: "$ march build", tone: "info" },
  { text: "✔ sayfalar parçalara ayrıldı, bütçeler denetlendi", tone: "success" },
  { text: "✔ önceden çizildi: her rota kendi index.html'i", tone: "success" },
  { text: "$ march check", tone: "info" },
  { text: "✔ tür denetimi: March sözdizimi dahil, hata yok", tone: "success" },
]
const CLI_MS = 420

function Cli() {
  let api: TerminalApi | null = null
  const play = (box: Element) => {
    let stop: (() => void) | undefined, at = 0
    const off = inView(box, { once: false, rootMargin: "0px", threshold: 0.3,
      enter: () => {
        if (!api || at >= CLI.length) return
        if (reducedMotion()) { for (; at < CLI.length; at++) api.print(CLI[at]!.text, { tone: CLI[at]!.tone }); return }
        stop ??= every(CLI_MS, () => {
          if (!api || at >= CLI.length) { stop?.(); stop = undefined; return }
          api.print(CLI[at]!.text, { tone: CLI[at]!.tone }); at++
        })
      },
      leave: () => { stop?.(); stop = undefined } })
    onCleanup(() => { off(); stop?.() })
  }
  return <section class="sc-sec" aria-labelledby="sc-dv-cli-h">
    <Head id="sc-dv-cli-h" kicker="Komut satırı" color="brand-green" title="Geliştirme, derleme ve denetim tek komut satırında" example="Üç komut: geliştir, derle, denetle"
      lead="Tek derleme aracı esbuild. march dev canlı yeniler ve hatayı sayfanın üstüne yazar; march build sayfaları parçalara ayırıp bütçeleri denetler; march check March sözdizimini de anlar." />
    <Reveal class="sc-dv-term" effect="up">
      <div ref={play}><Terminal readonly scheme="dark" height="16rem" label="March komut satırı" ref={(a: TerminalApi) => { api = a }} /></div>
    </Reveal>
  </section>
}

// ── size ────────────────────────────────────────────────────────────────────────────────────────────────────────

const kb = (bytes: number): string => `${Math.round(bytes / 1024)} KB`
const BUDGETS: readonly { label: string; bytes: number; text: string }[] = [
  { label: "Giriş", bytes: S.budget.entry, text: "İlk yüklenen dosya: çekirdek ve kabuk" },
  { label: "Açılış", bytes: S.budget.boot, text: "İlk ekran için gelen her şey" },
  { label: "Sayfa", bytes: S.budget.route, text: "Bir sayfanın en fazla getirebileceği" },
]

function Size() {
  let $shown = false
  const most = Math.max(...BUDGETS.map((b) => b.bytes))
  const grow = (box: Element) => onCleanup(inView(box, { once: true, threshold: 0.4, enter: () => { $shown = true } }))
  return <section class="sc-sec" aria-labelledby="sc-dv-size-h">
    <Head id="sc-dv-size-h" kicker="Boyut" color="brand-blue" title="Kullanılmayan kod derlemeye girmez" example="Yalnız kullandığın pakete girer"
      lead="Bir bileşeni içe aktarırsan yalnız o ve CSS'i gelir; geri kalan paket derlemeye hiç girmez. Bütçeler her derlemede ölçülür, aşan derleme yayına çıkmaz." />
    <div class={() => `sc-dv-bars sc-card${$shown ? " is-shown" : ""}`} ref={grow}>
      {BUDGETS.map((b) => <div class="sc-dv-bar">
        <div class="sc-dv-bar-top"><b>{b.label}</b><Badge tone="info">{kb(b.bytes)}</Badge></div>
        <div class="sc-dv-bar-track"><span class="sc-dv-bar-fill" style={{ "--sc-dv-w": `${Math.round((b.bytes / most) * 100)}%` }} /></div>
        <span class="sc-dv-bar-text">{b.text}</span>
      </div>)}
    </div>
  </section>
}

// ── extensions ──────────────────────────────────────────────────────────────────────────────────────────────────

/** The stage the extension is limited to: only the Buttons drawn inside it change. */
function Stage(props: { children?: unknown }) {
  return <div class="sc-dv-stage">{props.children}</div>
}
const EXT_CODE = `intercept(Button, {
  name: "kampanya",
  props: () => ({ variant: "primary", icon: sparkles }),
  on: { onClick: (next, e) => { track("tıklama"); next(e) } },
})`

function Extensions() {
  let $on = false
  let $clicks = 0
  // one place changes the stage's Buttons (those with its class): their look and their click; it re-runs as `on` changes
  const mine = (p: { class?: unknown }): boolean => String(p.class ?? "").includes("sc-dv-ext-btn")
  onCleanup(intercept(Button, {
    name: "sc-dv-campaign",
    // a prop it adds later is named on every run (null while off), so the Button knows it from the start
    props: (p) => (!mine(p) ? null : $on ? { variant: "primary", icon: sparkles } : { icon: null }),
    on: { onClick: (next: (...a: unknown[]) => unknown, ...args: unknown[]) => { if ($on) $clicks++; return next(...args) } },
  }))
  return <section class="sc-sec" aria-labelledby="sc-dv-ext-h">
    <Head id="sc-dv-ext-h" kicker="Eklentiler" color="brand-purple" title="Eklentilerle bileşenleri dışarıdan değiştir" example="Bileşene dokunmadan değiştir"
      lead="Bir yerden kaydedilen eklenti, seçtiğin bileşenlere yeni prop ekler, props'u ve tıklamayı araya girerek değiştirir. Sarmalayıcı bileşen yok, kopya yok." />
    <Reveal class="sc-dv-ext" effect="up" stagger={110}>
      <div class="sc-dv-ext-demo sc-card">
        <Toggle bind:value={$on}>Eklenti açık</Toggle>
        <Stage>
          <Button class="sc-dv-ext-btn" variant="ghost">Kaydet</Button>
          <Button class="sc-dv-ext-btn" variant="secondary">Paylaş</Button>
        </Stage>
        <span class="sc-dv-note">{() => ($on ? `Eklenti açık: düğmeler değişti, tıklamalar sayılıyor (${$clicks})` : "Eklenti kapalı: düğmeler kendi hâlinde")}</span>
      </div>
      <CodeView code={EXT_CODE} lang="tsx" label="Eklenti kodu" />
    </Reveal>
  </section>
}

// ── embed anywhere: widget points ───────────────────────────────────────────────────────────────────────────────

interface CardInput { title: string }
/** A widget point the section fills: a plain card by default; the button adds a provider that draws it richer. */
const point = widgetPoint<CardInput>("sc-dv-card", { defaults: [{ id: "plain", render: (input) => <div class="sc-dv-wcard"><b>{input.title}</b><span>Varsayılan sağlayıcı</span></div> }] })
const CDN = `<script type="module" src="https://cdn.marchjs.com/${version}/march.js"></script>`

function Embed() {
  let $rich = false
  let remove: (() => void) | null = null
  const toggle = (): void => {
    if (remove) { remove(); remove = null; $rich = false; return }
    remove = point.provide({ id: "rich", order: 1, render: (input) => <div class="sc-dv-wcard is-rich">
      <Badge tone="success">Yeni sağlayıcı</Badge><b>{input.title}</b><span>Aynı nokta, başka bir çizim: kimse sayfayı değiştirmedi.</span>
    </div> })
    $rich = true
  }
  onCleanup(() => remove?.())
  return <section class="sc-sec" aria-labelledby="sc-dv-embed-h">
    <Head id="sc-dv-embed-h" kicker="Her yere" color="brand-blue" title="Her sayfaya gömülebilir" example="Bir sayfaya göm, bir noktayı doldur"
      lead="Tek satırla CDN'den her sayfaya eklenir. Widget noktaları, uygulamanın bir yerini başka kodun doldurmasına izin verir: eklentiler, temalar, panolar." />
    <Reveal class="sc-dv-embed" effect="up" stagger={110}>
      <div class="sc-dv-embed-demo sc-card">
        <Widget sources={[point]} input={{ title: "Bir widget noktası" }} />
        <Button variant={$rich ? "secondary" : "primary"} on:click={toggle}>{() => ($rich ? "Sağlayıcıyı kaldır" : "Sağlayıcı ekle")}</Button>
      </div>
      <div class="sc-dv-embed-cdn sc-card">
        <span class="sc-dv-cap">CDN'den tek satır</span>
        <code class="sc-dv-cdn">{CDN}</code>
        <CopyButton text={CDN} label="CDN satırını kopyala" />
      </div>
    </Reveal>
  </section>
}

export default function MoreDev() {
  return <>
    <Language />
    <Cli />
    <Size />
    <Extensions />
    <Embed />
  </>
}
