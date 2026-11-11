import "hadi-march/css/themes.css"; // the gallery shows every theme at once (other pages load themes on demand)
// Temalar ve tokenlar: her tema kendi kapsamında gerçek bileşenlerle (data-hm-theme), renk/yazı/yarıçap/gölge tokenları.
import { Button, Badge, Chip, Toggle, Progress, Avatar, AvatarGroup, colorThemes, setColorTheme, colorTheme, ThemeSwatch } from "hadi-march/ui";
import { THEMES } from "hadi-march/theme";
import { check } from "hadi-march/icons";
import { Demo, Section } from "../demo.tsx";

const COLORS = [
  ["bg", "Zemin"], ["surface", "Yüzey"], ["surface-2", "Yüzey 2"], ["border", "Çizgi"], ["text", "Metin"], ["muted", "İkincil metin"],
  ["primary", "Vurgu"], ["primary-solid", "Dolu düğme"], ["primary-soft", "Yumuşak vurgu"], ["success", "Başarı"], ["warn", "Uyarı"], ["danger", "Tehlike"], ["info", "Bilgi"],
]

function MiniApp(props: { id: string; name: string; desc: string }) {
  let $on = true
  return <article class={() => (colorTheme() === props.id ? "sc-mini is-active" : "sc-mini")} data-hm-theme={props.id}>
    <header class="sc-mini-head">
      <ThemeSwatch id={props.id} />
      <div><strong class="sc-mini-name">{props.name}</strong><span class="sc-mini-desc">{props.desc}</span></div>
    </header>
    <div class="sc-mini-body">
      <div class="sc-row"><Avatar name="Elif Yılmaz" size="sm" /><span class="sc-mini-text">Haftalık özet hazır</span><Badge tone="success" dot>Canlı</Badge></div>
      <Progress value={68} label="Hedef" showValue size="sm" />
      <div class="sc-row"><Chip tone="primary" size="sm">Tasarım</Chip><Chip size="sm">Ürün</Chip><Toggle bind:value={$on} aria-label="Açık" /></div>
      <div class="sc-row">
        <Button variant="primary" size="sm" icon={colorTheme() === props.id ? check : undefined} on:click={() => setColorTheme(props.id)}>{() => (colorTheme() === props.id ? "Seçili" : "Bu temayı kullan")}</Button>
        <Button size="sm" variant="ghost">Önizle</Button>
      </div>
    </div>
  </article>
}

export default function Themes() {
  return <Section kicker="Temel" title="Temalar ve tokenlar"
    lead="Bir tema yaklaşık 25 renk, iki yazı tipi ve bir yarıçaptır; gerisi (yüzeyler, hover, yumuşak tonlar, gölgeler) color-mix ile türetilir. Tema değişimi tek bir özniteliktir; satır içi stil yok. Varsayılan tema HADİ Sosyal'in markası.">
    <Demo wide title="Hazır temalar" desc="Her kart kendi temasıyla çizildi (data-hm-theme kapsamı). Seçtiğin tema bütün vitrine uygulanır; açık/koyu üst çubuktan."
      code={`import { setColorTheme, ThemePicker } from "hadi-march/ui"

setColorTheme("neon")          // <html data-hm-theme="neon">
<ThemePicker />                 // üst çubuk: tema + açık/koyu/sistem
<section data-hm-theme="gece">…</section>   // yalnız bu bölüm Gece Mavisi`}>
      <div class="sc-mini-grid">{THEMES.map((th) => <MiniApp id={th.id} name={th.name} desc={th.description ?? ""} />)}</div>
    </Demo>

    <Demo wide title="Kendi temanı yaz" desc="defineTheme ile renkleri ver, themeCss ile derleme anında .css üret, registerThemes ile seçiciye ekle."
      code={`import { defineTheme, themeCss } from "hadi-march/theme"

export const acme = defineTheme({
  id: "acme", name: "Acme", font: '"Inter"', display: '"Inter"', radius: 10,
  light: { bg: "#F7F8FA", surface: "#FFF", text: "#111827", muted: "#4B5563", border: "#E5E7EB",
           primary: "#0E7490", solid: "#0E7490", onSolid: "#FFF", /* … */ },
  dark:  { /* … */ },
})
fs.writeFileSync("acme.css", themeCss(acme))   // derleme betiğinde
registerThemes([{ id: "acme", name: "Acme" }])   // uygulamada`}>
      <p class="hm-muted">Hazır temalar: {colorThemes().map((x) => x.name).join(" · ")}</p>
    </Demo>

    <Demo title="Renk tokenları" desc="Etkin temanın anlamsal renkleri; koyu görünümde kendiliğinden değişir.">
      <div class="sc-tokens">{COLORS.map(([k, label]) => <div class="sc-token"><span class={`sc-tok sc-tok-${k}`} /><span><strong>{label}</strong><code>--hm-{k}</code></span></div>)}</div>
    </Demo>

    <Demo title="Kategorik palet" desc="Grafikler, avatarlar ve etiketler için 8 renk (tema başına).">
      <div class="sc-cats">{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <span class={`sc-cat sc-cat-${i}`}>{i}</span>)}</div>
      <AvatarGroup names={["Elif Yılmaz", "Mert Demir", "Zeynep Kaya", "Can Arslan", "Ayşe Çelik", "Emre Şahin", "Selin Aydın"]} max={6} size="md" />
    </Demo>

    <Demo title="Yazı ölçeği" desc="Gövde ve başlık yazı tipi temadan gelir (HADİ: Figtree + Bricolage Grotesque).">
      <div class="sc-type">
        <p class="sc-t-display">Hadi başlayalım</p>
        <p class="sc-t-3xl">Başlık 3XL · 32</p>
        <p class="sc-t-2xl">Başlık 2XL · 24</p>
        <p class="sc-t-xl">Başlık XL · 20</p>
        <p class="sc-t-lg">Gövde büyük · 16</p>
        <p class="sc-t-md">Gövde · 14 — Pijamalı hasta yağız şoföre çabucak güvendi.</p>
        <p class="sc-t-sm hm-muted">Küçük · 13 — ı İ ğ Ğ ş Ş ç Ç ö Ö ü Ü</p>
      </div>
    </Demo>

    <Demo title="Yarıçap ve yükselti" desc="Yarıçap ölçeği temanın tek değerinden türer; gölgeler koyu görünümde halkaya dönüşür.">
      <div class="sc-elev">{[1, 2, 3, 4].map((i) => <div class={`sc-elev-box sc-elev-${i}`}><span>radius-{i}</span><span class="hm-muted">shadow-{i}</span></div>)}</div>
    </Demo>
  </Section>
}
