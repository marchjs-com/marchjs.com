// Home: hero (a stage glowing in the theme colors), animated numbers, section cards, a live counter.
import { t } from "hadi-march";
import { tween, reveal, magnet } from "hadi-march/motion";
import { Particles, confetti } from "hadi-march/fx";
import { Button, LinkCard, Kbd, Card, Badge, Grid, openPalette, ThemeSwatch, colorThemes, setColorTheme, colorTheme } from "hadi-march/ui";
import { arrowRight, command, sparkles } from "hadi-march/icons";
import { PAGES } from "../nav.ts";
import { Demo } from "../demo.tsx";
import { PAGE_META } from "../nav-meta.ts";

function Counter(props: { to: number; suffix?: string; label: string }) {
  let $target = 0
  queueMicrotask(() => { $target = props.to })
  const v = tween(() => $target, { duration: 1400, easing: "easeOutExpo" })
  return <div class="sc-stat">
    <span class="sc-stat-n">{() => `${Math.round(v())}${props.suffix ?? ""}`}</span>
    <span class="sc-stat-l">{props.label}</span>
  </div>
}

export default function Home() {
  let $clicks = 0
  const celebrate = (e: MouseEvent) => {
    $clicks++
    const r = (e.currentTarget as Element).getBoundingClientRect()
    void confetti({ x: r.left + r.width / 2, y: r.top })
  }
  return <div class="sc-home">
    <section class="sc-hero">
      <div class="sc-hero-glow" aria-hidden="true" />
      <div class="sc-hero-grid" aria-hidden="true" />
      <Particles count={70} links={110} interactive class="hm-fx-fill sc-hero-particles" />
      <div class="sc-hero-inner">
        <span class="sc-pill" use:reveal={{ duration: 600 }}><Badge tone="primary" dot>Yeni</Badge> Tema sistemi · 7 hazır tema</span>
        <h1 class="sc-hero-title" use:reveal={{ duration: 800, delay: 80 }}>Arayüzü yaz,<br /><span class="hm-gradient-text">March yürütsün.</span></h1>
        <p class="sc-hero-sub" use:reveal={{ duration: 800, delay: 180 }}>
          İnce taneli sinyaller, gerçek DOM, sıfır bağımlılık. Bileşenler, formlar, tablolar, grafikler ve animasyonlar tek kitaplıkta;
          sıkı CSP ve Trusted Types ile çalışır.
        </p>
        <div class="sc-hero-cta" use:reveal={{ duration: 800, delay: 280 }}>
          <Button variant="primary" size="lg" href="/buttons" iconEnd={arrowRight}>Bileşenlere göz at</Button>
          <Button size="lg" icon={command} onClick={openPalette}>Komut paleti <Kbd keys="mod+k" /></Button>
          <Button size="lg" variant="ghost" icon={sparkles} onClick={celebrate} use:magnet={{ strength: 0.3 }}>{() => ($clicks ? `Kutla (${$clicks})` : "Kutla")}</Button>
        </div>
        <div class="sc-stats" use:reveal={{ duration: 800, delay: 380 }}>
          <Counter to={0} label="çalışma zamanı bağımlılığı" />
          <Counter to={90} suffix="+" label="bileşen" />
          <Counter to={7} label="hazır tema" />
          <Counter to={132} label="SVG ikon" />
        </div>
      </div>
    </section>

    <div class="sc-page">
      <section class="sc-themes-strip" aria-label="Temalar">
        <span class="sc-strip-label">Tema seç:</span>
        {colorThemes().map((th) => <button type="button" class={() => (colorTheme() === th.id ? "sc-theme-chip is-active" : "sc-theme-chip")} on:click={() => setColorTheme(th.id)}>
          <ThemeSwatch id={th.id} />{t(th.name)}
        </button>)}
      </section>

      <Grid cols={4} minCol="17rem" gap={3} fill="stretch" equal>
        {PAGES.filter((p) => p.path !== "/").map((p, i) => <div use:reveal={{ delay: i * 40 }}>
          <LinkCard href={p.path} icon={PAGE_META[p.path]?.icon} tone={(["primary", "info", "success", "violet", "warn", "pink", "teal", "danger", "neutral", "primary"] as const)[i % 10]} title={p.title} description={PAGE_META[p.path]?.desc} />
        </div>)}
      </Grid>

      <div class="sc-demos">
        <Demo title="Yalnız değişen düğüm güncellenir" desc="Bileşen bir kez çalışır; $ ile başlayan değişkenler sinyaldir. Sanal DOM yok."
          code={`
function Counter() {
  let $n = 0
  const $even = $n % 2 === 0
  return <Card title="Sayaç">
    <p>{$n} kez tıklandı · {$even ? "çift" : "tek"}</p>
    <Button variant="primary" on:click={() => $n++}>Artır</Button>
  </Card>
}`}>
          <LiveCounter />
        </Demo>
      </div>
    </div>
  </div>
}

function LiveCounter() {
  let $n = 0
  const $even = $n % 2 === 0
  return <Card title="Sayaç" subtitle="Sinyal → yalnız metin düğümü değişir">
    <p class="sc-big">{$n} <span class="hm-muted">kez tıklandı · {$even ? "çift" : "tek"}</span></p>
    <Button variant="primary" on:click={() => $n++}>Artır</Button>
  </Card>
}
