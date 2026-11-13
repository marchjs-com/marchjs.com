import { t } from "hadi-march";
import "hadi-march/css/themes.css"; // the gallery shows every theme at once (other pages load themes on demand)
// Themes and tokens: each theme scoped with real components (data-hm-theme); color, type, radius and shadow tokens.
import { Button, Badge, Chip, Toggle, Progress, Avatar, AvatarGroup, setColorTheme, colorTheme, ThemeSwatch } from "hadi-march/ui";
import { THEMES } from "hadi-march/theme";
import { check } from "hadi-march/icons";
import { Demo } from "../demo.tsx";
import { Hub } from "../hub.tsx";
import { ComponentDemo } from "../component-demo.tsx";

const BRAND = [
  ["orange", "Heyecan", "Vurgu (primary)", "#F2801F", "#FEF0E3"],
  ["blue", "Aktivite", "Bilgi (info)", "#1D9AD6", "#E5F4FB"],
  ["green", "Dostluk", "Başarı (success)", "#78BE3A", "#EEF7E5"],
  ["purple", "İletişim", "Özel (special)", "#A3338C", "#F6E8F3"],
] as const
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
      <div class="sc-row"><Avatar name="Elif Yılmaz" size="sm" /><span class="sc-mini-text">Haftalık özet hazır</span>{() => <Badge tone={$on ? "success" : "neutral"} dot>{$on ? "Canlı" : "Durdu"}</Badge>}</div>
      <Progress value={68} label="Hedef" showValue size="sm" />
      <div class="sc-row"><Chip tone="primary" size="sm">Tasarım</Chip><Chip size="sm">Ürün</Chip><Toggle bind:value={$on} aria-label="Canlı yayın" /></div>
      <div class="sc-row">
        <Button variant="primary" size="sm" icon={colorTheme() === props.id ? check : undefined} on:click={() => setColorTheme(props.id)}>{() => (colorTheme() === props.id ? "Seçili" : "Bu temayı kullan")}</Button>
        <Button size="sm" variant="ghost">Önizle</Button>
      </div>
    </div>
  </article>
}

export default function Themes(props: { params?: { rest?: string } }) {
  const RENDER: Record<string, () => unknown> = {
    "presets": () => <Demo wide title="Hazır temalar" desc="Her kart kendi temasıyla çizildi (data-hm-theme kapsamı). Seçtiğin tema bütün vitrine uygulanır; açık/koyu üst çubuktan."
    code={`import { setColorTheme, ThemePicker } from "hadi-march/ui"
setColorTheme("neon")          // <html data-hm-theme="neon">
<ThemePicker />                 // top bar: theme + light/dark/system
<section data-hm-theme="night">…</section>   // only this section uses Night Blue`}>
    <div class="sc-mini-grid">{THEMES.map((th) => <MiniApp id={th.id} name={t(th.name)} desc={t(th.description ?? "")} />)}</div>
  </Demo>,
    "theme-menu": () => <ComponentDemo folder="composite/theme-menu" title="ThemeMenu: tek menüde görünüm" desc="Karmaşık bileşen: açık / koyu / sistem, renk teması ve vurgu rengi tek açılır menüde; bölümler ThemePicker ve AccentPicker ile aynı. Parçaları aşağıdaki satırda." />,
    "theme-editor": () => <ComponentDemo folder="composite/theme-editor" title="Kendi temanı yaz"
    desc="Tema düzenleyici: hazır bir temadan ya da sıfırdan başla; açık ve koyu kip için her renk tokenı, ton ölçeği ve WCAG kontrast denetimi; yazı, biçim ve hareket tokenları. Önizleme yalnız bu kartta çizilir; istersen bütün vitrine uygula. Çıktı defineTheme kodu, CSS ve JSON; paylaşım bağlantısı ve tema seçiciye ekleme." />,
    "brand-colors": () => <Demo wide title="Marka renkleri" desc="HADİ Sosyal'ın dört resmi rengi (hadi_colors.dart ile birebir). Yazı rengi zemine göre okunurluk kuralıyla seçilir: beyaz en az 2,6:1 veriyorsa beyaz, yoksa koyu; metin olarak kullanılan tonu AA (4,5:1) için koyulaştırılır."
    code={`--hm-brand-orange · --hm-brand-orange-soft · --hm-on-brand-orange · --hm-brand-orange-text
--hm-brand-blue · --hm-brand-green · --hm-brand-purple (same four tokens each)
primary = brand-orange · info = brand-blue · success = brand-green · special = brand-purple · danger = error`}>
    <div class="sc-brands" data-hm-theme="hadi">
      {BRAND.map(([id, name, role, hex, soft]) => <div class={`sc-brand sc-b-${id}`}>
        <div class="sc-brand-fill"><strong>{name}</strong><span>{hex}</span></div>
        <div class="sc-brand-soft"><span class="sc-brand-text">{role}</span><code>--hm-brand-{id}</code><span class="hm-muted">soft {soft}</span></div>
      </div>)}
    </div>
    <div class="sc-ribbon" data-hm-theme="hadi" aria-hidden="true" />
  </Demo>,
    "color-tokens": () => <Demo title="Renk tokenları" desc="Etkin temanın anlamsal renkleri; koyu görünümde kendiliğinden değişir.">
    <div class="sc-tokens">{COLORS.map(([k, label]) => <div class="sc-token"><span class={`sc-tok sc-tok-${k}`} /><span><strong>{label}</strong><code>--hm-{k}</code></span></div>)}</div>
  </Demo>,
    "palette": () => <Demo title="Kategorik palet" desc="Grafikler, avatarlar ve etiketler için 8 renk (tema başına).">
    <div class="sc-cats">{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <span class={`sc-cat sc-cat-${i}`}>{i}</span>)}</div>
    <AvatarGroup names={["Elif Yılmaz", "Mert Demir", "Zeynep Kaya", "Can Arslan", "Ayşe Çelik", "Emre Şahin", "Selin Aydın"]} max={6} size="md" />
  </Demo>,
    "type-scale": () => <Demo title="Yazı ölçeği" desc="Gövde ve başlık yazı tipi temadan gelir (HADİ: Figtree + Bricolage Grotesque).">
    <div class="sc-type">
      <p class="sc-t-display">Hadi başlayalım</p>
      <p class="sc-t-3xl">Başlık 3XL · 32</p>
      <p class="sc-t-2xl">Başlık 2XL · 24</p>
      <p class="sc-t-xl">Başlık XL · 20</p>
      <p class="sc-t-lg">Gövde büyük · 16</p>
      <p class="sc-t-md">Gövde · 14 — Pijamalı hasta yağız şoföre çabucak güvendi.</p>
      <p class="sc-t-sm hm-muted">Küçük · 13 — ı İ ğ Ğ ş Ş ç Ç ö Ö ü Ü</p>
    </div>
  </Demo>,
    "radius-elevation": () => <Demo title="Yarıçap ve yükselti" desc="Yarıçap ölçeği temanın tek değerinden türer; gölgeler koyu görünümde halkaya dönüşür.">
    <div class="sc-elev">{[1, 2, 3, 4].map((i) => <div class={`sc-elev-box sc-elev-${i}`}><span>radius-{i}</span><span class="hm-muted">shadow-{i}</span></div>)}</div>
  </Demo>,
  }
  return <Hub section="/themes" kicker="Temel" title="Temalar ve tokenlar" lead="Bir tema yaklaşık 25 renk, iki yazı tipi ve bir yarıçaptır; gerisi (yüzeyler, hover, yumuşak tonlar, gölgeler) color-mix ile türetilir. Tema değişimi tek bir özniteliktir; satır içi stil yok. Varsayılan tema HADİ Sosyal'in markası." render={RENDER} params={props.params} />
}
