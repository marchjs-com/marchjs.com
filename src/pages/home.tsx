// Home: a hero on the four HADİ colors with a live preview (theme and accent recolor the whole page at once), then the
// sections below the fold (live numbers, categories, highlights, performance, a first example). The page is its own
// lazy route chunk; its parts are modules of that chunk (a separate lazy part fell under the 10 KB file floor), and
// every moving preview runs only while it is on screen.
// No number here is typed by hand: they come from home-stats.gen.ts (tools/gen-home-stats.js) and march-report.json.
import "./home.css";
import { reveal, animate, inView } from "hadi-march/motion";
import { Button, Badge, Kbd, Grid, LinkCard, type IconTone, ThemeSwatch, colorThemes, colorTheme, setColorTheme, accent, setAccent, openPalette } from "hadi-march/ui";
import { tokenColor, type ColorToken } from "hadi-march/theme/colors.ts";
import { arrowRight, braces, code, command, sparkles } from "hadi-march/icons";
import { Demo } from "../demo.tsx";
import { HOME_STATS as S } from "../home-stats.gen.ts";
import { MENU_GROUPS } from "hadi-march/components/categories.ts";
import { pages } from "../app.tsx";
import { withMeta } from "../nav-meta.ts";

import Sections from "../home/sections.tsx";

/** The aurora behind the hero: the four HADİ colors, as theme tokens. */
const BRAND: ColorToken[] = ["brand-orange", "brand-blue", "brand-green", "brand-purple"];
/** Accent choices of the live preview: the theme's own primary and the four HADİ colors. */
const ACCENTS: ColorToken[] = ["primary", ...BRAND];
const ACCENT_NAMES: Record<string, string> = { primary: "Temanın rengi", "brand-orange": "Heyecan", "brand-blue": "Aktivite", "brand-green": "Dostluk", "brand-purple": "İletişim" };

/** Action: the aurora blobs drift on the motion engine while the hero is on screen (global speed, "stop all" and
 *  reduced motion apply; mirrored in RTL). */
function drift(el: Element): () => void {
  let runs: { cancel(): void }[] = []
  const stop = () => { runs.forEach((r) => r.cancel()); runs = [] }
  const off = inView(el, {
    enter: () => {
      stop()
      const s = el.closest("[dir=rtl]") ? -1 : 1
      runs = [...el.children].map((b, i) => animate(b, [
        { transform: "translate(0, 0) scale(1)" },
        { transform: `translate(${s * (i % 2 ? -8 : 10)}%, ${i < 2 ? 12 : -10}%) scale(${i % 2 ? 0.9 : 1.15})` },
      ], { duration: 9000 + i * 2600, iterations: Infinity, direction: "alternate", easing: "easeInOutCubic" }))
    },
    leave: stop,
  })
  return () => { off(); stop() }
}

/** The live preview: picking a theme or an accent here recolors every component on the page. */
function LivePreview() {
  const themes = colorThemes()
  const at = () => Math.max(0, themes.findIndex((th) => th.id === colorTheme()))
  return <div class="sc-live" role="group" aria-label="Canlı önizleme">
    <div class="sc-live-head">
      <span class="sc-live-dot" aria-hidden="true" />
      <span class="sc-live-title">Canlı önizleme</span>
      <Badge tone="primary">{() => themes[at()]?.name ?? ""}</Badge>
    </div>
    <div class="sc-live-row" role="radiogroup" aria-label="Tema">
      {themes.map((th) => <button type="button" role="radio" class="sc-live-theme" aria-checked={() => String(colorTheme() === th.id)} aria-label={th.name} title={th.name} on:click={() => setColorTheme(th.id)}>
        <ThemeSwatch id={th.id} />
      </button>)}
    </div>
    <div class="sc-live-row" role="radiogroup" aria-label="Vurgu rengi">
      {ACCENTS.map((c) => <button type="button" role="radio" class="sc-live-accent" aria-checked={() => String(accent() === c)} aria-label={ACCENT_NAMES[c]} title={ACCENT_NAMES[c]} on:click={() => setAccent(c)}
        style={c === "primary" ? undefined : { "--sc-dot": tokenColor(c) }}>
        <span class={c === "primary" ? "sc-live-dot-theme" : "sc-live-dot-color"} aria-hidden="true" />
      </button>)}
    </div>
    <div class="sc-live-sample">
      <div class="sc-live-chips">
        <Badge tone="primary" dot>Seçili</Badge>
        <Badge tone="success">Yayında</Badge>
        <Badge>Taslak</Badge>
      </div>
      <div class="sc-live-meter">
        <span class="sc-live-meter-l">{() => `Tema ${at() + 1} / ${themes.length}`}</span>
        <span class="sc-live-meter-bar" role="progressbar" aria-label="Tema" aria-valuemin="1" aria-valuemax={String(themes.length)} aria-valuenow={() => String(at() + 1)}>
          <span style={() => ({ "inline-size": `${((at() + 1) / Math.max(1, themes.length)) * 100}%` })} />
        </span>
      </div>
      <div class="sc-live-actions">
        <Button variant="primary" icon={sparkles}>Kaydet</Button>
        <Button>Vazgeç</Button>
      </div>
    </div>
  </div>
}

// ── categories ──────────────────────────────────────────────────────────────────────────────────────────────────

const TONES: IconTone[] = ["primary", "info", "success", "violet", "warn", "pink", "teal", "danger"]

function Categories() {
  const list = withMeta(pages())
  const byCat = new Map(S.categories.map((c) => [c.label, c.components]))
  const cards = MENU_GROUPS.filter((g) => g !== "İlk Adımlar").map((group) => {
    const own = list.filter((p) => p.group === group)
    const n = byCat.get(group) ?? 0
    const meta = group === "Yöneticiler" ? `${S.managers} yönetici` : n ? `${n} bileşen` : `${own.length} sayfa`
    return { group, own, meta }
  }).filter((c) => c.own.length)
  return <section class="sc-section sc-home-cats" aria-labelledby="sc-cat-h">
    <header class="sc-section-head">
      <p class="sc-eyebrow">Katalog</p>
      <h2 id="sc-cat-h" class="sc-section-title">Her şey bir kategoride</h2>
      <p class="sc-section-sub">Kategori başına kayıtlı bileşenler ve sayfalar; her kart ilgili vitrine götürür.</p>
    </header>
    <Grid cols={4} minCol="16rem" gap={3} fill="stretch" equal>
      {cards.map((c, i) => <div class="sc-home-cat" use:reveal={{ delay: (i % 4) * 60 }}>
        <LinkCard href={c.own[0]!.path} icon={c.own[0]!.icon} tone={TONES[i % TONES.length]} title={c.group} meta={c.meta}
          description={[...new Set(c.own.map((p) => p.title.replace(/^[^:]+:\s*/, "").trim()).filter(Boolean))].join(" · ")} />
      </div>)}
    </Grid>
  </section>
}

// ── first example ───────────────────────────────────────────────────────────────────────────────────────────────

// the package name is spliced in: the build rewrites `from "hadi-march…"` even inside strings
const PKG = "hadi-march"
const START = [
  `import { render } from "${PKG}"`,
  `import { Button } from "${PKG}/ui"`,
  `render(() => <Button variant="primary">Merhaba</Button>, document.body)`,
].join("\n")

function FirstExample() {
  const lines = START.split("\n").length
  return <section class="sc-section sc-start" aria-labelledby="sc-start-h">
    <div class="sc-start-copy">
      <p class="sc-eyebrow">Başla</p>
      <h2 id="sc-start-h" class="sc-section-title">{`${lines} satırda başla`}</h2>
      <p class="sc-section-sub">Kur, içe aktar, çiz. Derleyici JSX'i gerçek DOM'a çevirir; sanal DOM, çalışma zamanı bağımlılığı ya da yapılandırma yok.</p>
      <pre class="sc-start-pre" aria-label="Örnek kod"><code>{START}</code></pre>
      <div class="sc-start-cta">
        <Button variant="primary" href="/start" iconEnd={arrowRight}>İlk Adımlar</Button>
        <Button href="/language" icon={code}>March dili</Button>
      </div>
    </div>
    <div class="sc-start-code"><Demo title="Sonuç" desc="Aynı kod, canlı: tema ve vurgu rengi buna da uygulanır." code={START}>
      <Button variant="primary" icon={sparkles}>Merhaba</Button>
    </Demo></div>
  </section>
}

export default function Home() {
  return <div class="sc-home">
    <section class="sc-hero" aria-labelledby="sc-hero-title">
      <div class="sc-hero-aurora" aria-hidden="true" use:drift>
        {BRAND.map((c) => <span class="sc-hero-blob" style={{ "--sc-blob": tokenColor(c) }} />)}
      </div>
      <div class="sc-hero-mesh" aria-hidden="true" />
      <div class="sc-hero-inner">
        <div class="sc-hero-copy">
          <span class="sc-pill" use:reveal={{ duration: 600 }}>
            <Badge tone="primary" dot>Açık kaynak</Badge>
            {`${S.components} bileşen · ${S.icons.total} ikon · ${S.animations.total} animasyon`}
          </span>
          <h1 id="sc-hero-title" class="sc-hero-title" use:reveal={{ duration: 800, delay: 80 }}>
            <span class="sc-hero-brand">HADI March</span>
          </h1>
          <p class="sc-hero-lead" use:reveal={{ duration: 800, delay: 160 }}>
            Sinyallerle çalışan, <span class="hm-gradient-text">sıfır bağımlılıklı</span> TypeScript arayüz çatısı.
          </p>
          <p class="sc-hero-sub" use:reveal={{ duration: 800, delay: 220 }}>
            Bileşenler, formlar, veri, grafikler, hareket motoru ve yöneticiler tek pakette. Gerçek DOM, ince taneli
            güncelleme, sıkı CSP, tam sağdan sola ve erişilebilirlik hazır.
          </p>
          <div class="sc-hero-cta" use:reveal={{ duration: 800, delay: 300 }}>
            <Button variant="primary" size="lg" href="/start" iconEnd={arrowRight}>İlk Adımlar</Button>
            <Button size="lg" href="/start" icon={braces}>API başvurusu</Button>
            <Button size="lg" variant="ghost" icon={command} onClick={openPalette}>Ara <Kbd keys="mod+k" /></Button>
          </div>
        </div>
        <div class="sc-hero-demo" use:reveal={{ duration: 900, delay: 240 }}>
          <LivePreview />
        </div>
      </div>
    </section>
    <Sections categories={<Categories />} start={<FirstExample />} />
  </div>
}
