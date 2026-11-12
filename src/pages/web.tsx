// Web sites: every website block (src/components/landing) with its Playground, and three full sample sites at their own
// addresses (/web/product, /web/portfolio, /web/slides; the old ?view= links move there) built only from those blocks.
// A sample opens in a frame with a bar: device width, full screen, theme and writing direction for the preview only,
// the blocks it is made of (links to their demos), its source and the previous / next sample.
import "./web.css";
import { computed, signal, effect, onCleanup } from "hadi-march";
import { Link, query, navigate } from "hadi-march/router";
import { colorThemes, loadTheme, ThemeSwatch } from "hadi-march/ui";
import { arrowLeft, arrowRight, maximize, minimize, externalLink } from "hadi-march/icons";
import { Section } from "../demo.tsx";
import { ComponentDemo, demoId } from "../component-demo.tsx";
import { lazy } from "hadi-march/lazy";

// the sample pages load only when one is opened (?view=…), each as its own part
const ProductSample = lazy(() => import("../web/product.tsx"), { placeholder: "block", height: "100vh" })
const PortfolioSample = lazy(() => import("../web/portfolio.tsx"), { placeholder: "block", height: "100vh" })
const SlidesSample = lazy(() => import("../web/slides.tsx"), { placeholder: "card", height: "36rem" })

export const title = "Web siteleri"

const SAMPLES = [
  { view: "product", title: "Ürün tanıtım sayfası", desc: "Yüzen menü, kaydırınca düzleşen ürün karesi, bento, hikâye, fiyatlar, yorum duvarı, SSS ve altbilgi.",
    file: "product.tsx", blocks: ["site-nav", "hero", "logo-cloud", "feature-grid", "scroll-story", "stats-band", "counter", "pricing", "testimonials", "faq", "cta-band", "site-footer", "site-section", "scroll-progress"] },
  { view: "portfolio", title: "Kişisel portfolyo", desc: "Süzgeçli proje ızgarası, kapağın ayrıntı sayfasına büyüdüğü geçiş, yatay vaka şeridi, deneyim çizelgesi, iletişim formu.",
    file: "portfolio.tsx", blocks: ["site-nav", "hero", "project-grid", "project-detail", "horizontal-scroll", "roadmap", "stats-band", "feature-grid", "site-footer", "site-section"] },
  { view: "slides", title: "Sunum", desc: "Klavye, kaydırma ve dokunma; adım adım maddeler, konuşmacı penceresi, tam ekran, URL'de slayt numarası, yazdır.",
    file: "slides.tsx", blocks: ["presentation"] },
] as const
type Sample = typeof SAMPLES[number]
const SOURCE = "https://github.com/tlghn/hadimarch/blob/main/examples/showcase/src/web/"
const DEVICES = [{ id: "desktop", label: "Masaüstü", width: "" }, { id: "tablet", label: "Tablet", width: "834px" }, { id: "phone", label: "Telefon", width: "390px" }] as const
const blockName = (folder: string): string => folder.split("-").map((w) => w[0]!.toUpperCase() + w.slice(1)).join("")

function Blocks() {
  return <Section kicker="Bileşenler" title="Web siteleri" lead="Tanıtım, ana sayfa, portfolyo ve sunum için bloklar. Her blok mevcut bileşenlerden kurulur, hareket motoruyla canlanır, temaya, RTL'ye ve dile uyar. Yalnız kullanılan blok derlenir.">
    <div class="sc-samples">
      {SAMPLES.map((s) => <Link class="sc-sample" href={`/web/${s.view}` as never}><strong>{s.title}</strong><span>{s.desc}</span></Link>)}
    </div>
    <ComponentDemo folder="landing/hero" title="Hero" desc="Yedi görünüm, tek yapı: üst etiket, gradyan vurgulu başlık, açıklama, eylemler. Ürün varyantında kare kaydırdıkça düzleşir; parallax'ta katmanlar farklı hızda kayar." />
    <ComponentDemo folder="landing/site-nav" title="Site menüsü" desc="Saydamdan cama geçen, kaydırınca küçülen ya da yüzen hap görünümlü üst çubuk. Bağlantıların altında hap kayar; dar ekranda menü çekmeceye taşınır." />
    <ComponentDemo folder="landing/feature-grid" title="Özellik ızgarası" desc="Kartlar (imleç ışığıyla), sade, liste ya da bento. Kartlar sırayla belirir; bir satırdaki kutular eşit boyludur." />
    <ComponentDemo folder="landing/logo-cloud" title="Logo bulutu" desc="Eşit hücreli ızgara ya da sonsuz kayan şerit. Tek ton; üzerine gelince renklenir." />
    <ComponentDemo folder="landing/pricing" title="Fiyatlar" desc="Aylık / yıllık anahtarı: rakamlar odometre gibi döner, anahtarın başparmağı kayar, öne çıkan plan parlar." />
    <ComponentDemo folder="landing/testimonials" title="Yorumlar" desc="Izgara, iki sıra kayan şerit, solarak biten duvar (Daha fazla göster) ya da kaydırmalı." />
    <ComponentDemo folder="landing/faq" title="Sık sorulanlar" desc="Akordeon; iki sütunlu düzende yapışkan başlık; aramada aksan ve yazım hatasına dayanıklı sıralama." />
    <ComponentDemo folder="landing/stats-band" title="Rakamlar" desc="Görününce sayan büyük rakamlar; sade, çizgili ya da kartlı." />
    <ComponentDemo folder="landing/counter" title="Sayaç" desc="Görününce sayar, yeni değere süzülür; odometre modunda yalnız değişen basamaklar döner. Biçim Intl ile." />
    <ComponentDemo folder="landing/roadmap" title="Yol haritası ve zaman çizelgesi" desc="Kaydırdıkça dolan çizgi; geçilen noktalar yanar, süren adım parlar. Deneyim ve şirket hikâyesi için de." />
    <ComponentDemo folder="landing/scroll-story" title="Kaydırma hikâyesi" desc="Görsel sütunu sabit kalır, adımlar akar; etkin adımın görseli belirir, bölüm o adımın rengine geçer." />
    <ComponentDemo folder="landing/horizontal-scroll" title="Yatay kaydırma" desc="Sayfa aşağı kayarken paneller yana akar; dokunmatikte ve azaltılmış harekette yerel yatay kaydırıcı." />
    <ComponentDemo folder="landing/scroll-progress" title="Okuma ilerlemesi" desc="Sayfanın ya da bir makalenin ne kadarının okunduğunu gösteren ince çubuk." />
    <ComponentDemo folder="landing/reveal" title="Kaydırınca belirme" desc="Solma, yükselme, baştan ya da sondan kayma (RTL'de aynalı), ölçek, bulanıklık, çevirme; sırayla ya da kaydırmaya bağlı." />
    <ComponentDemo folder="landing/parallax" title="Parallax" desc="Her katman kendi hızında kayar; fare izleme açıkken derinliğine göre kayar. Yalnız transform." />
    <ComponentDemo folder="landing/project-grid" title="Proje ızgarası" desc="Süzgeç çipleri; seçince kalanlar yeni yerlerine süzülür (FLIP). Açınca kapak Lightbox'ta ya da ayrıntı sayfasında." />
    <ComponentDemo folder="landing/project-detail" title="Proje ayrıntısı" desc="Bir projeye tıkla: kapak ayrıntı sayfasındaki yerine büyür (paylaşılan öğe geçişi); geri dönüşte küçülür." />
    <ComponentDemo folder="landing/presentation" title="Sunum" desc="Ok tuşları, boşluk, kaydırma, dokunma; adım adım maddeler; konuşmacı görünümü (sonraki slayt, notlar, süre)." />
    <ComponentDemo folder="landing/video-background" title="Video arka plan" desc="Sessiz döngü, önce poster; görünmüyorken durur, veri tasarrufu ve azaltılmış harekette yalnız poster. Durdur düğmesi var." />
    <ComponentDemo folder="landing/cta-band" title="Eylem bandı" desc="Sayfa sonundaki çağrı paneli: gradyan, ağ, cam, sade ya da video arka plan; imleç ışığı." />
    <ComponentDemo folder="landing/newsletter" title="Bülten formu" desc="Doğrulama, bekleme düğmesi, başarıda beliren onay, hatada sallanan alan ve okunan ileti." />
    <ComponentDemo folder="landing/site-footer" title="Altbilgi" desc="Marka, bağlantı sütunları, sosyal bağlantılar, bülten, yasal satır, başa dön ve büyük yazı." />
    <ComponentDemo folder="landing/site-section" title="Bölüm çerçevesi" desc="Her bloğun çerçevesi: genişlik, dikey ritim, ton ve beliren başlık grubu." />
  </Section>
}

/** A sample site in its frame, with the preview bar. */
function SampleView(props: { sample: Sample; view: () => unknown }) {
  const s = props.sample
  const at = SAMPLES.findIndex((x) => x.view === s.view)
  const prev = SAMPLES[(at + SAMPLES.length - 1) % SAMPLES.length]!, next = SAMPLES[(at + 1) % SAMPLES.length]!
  const device = signal<string>("desktop"), full = signal(false), theme = signal<string>(""), rtl = signal(false), ready = signal(true)
  // a theme for this preview only: its stylesheet first, then the frame switches
  effect(() => { const id = theme(); if (!id) { ready.set(true); return } ready.set(false); void loadTheme(id).then(() => ready.set(true)) })
  // full screen: the frame covers the window; Esc comes back
  effect(() => {
    if (!full()) return
    const esc = (e: KeyboardEvent): void => { if (e.key === "Escape") full.set(false) }
    globalThis.addEventListener("keydown", esc)
    onCleanup(() => globalThis.removeEventListener("keydown", esc))
  })
  const width = (): string => DEVICES.find((d) => d.id === device())?.width || "100%"
  const fullLabel = (): string => (full() ? "Tam ekrandan çık (Esc)" : "Tam ekran")
  return <div class={() => (full() ? "sc-sample-wrap is-full" : "sc-sample-wrap")}>
    <div class="sc-sample-bar" role="toolbar" aria-label="Önizleme">
      <Link href="/web" class="sc-sample-back">{arrowLeft()}<span>Bloklar</span></Link>
      <strong class="sc-sample-name">{s.title}</strong>
      <div class="sc-seg" role="radiogroup" aria-label="Cihaz">
        {DEVICES.map((d) => <button type="button" role="radio" class="sc-seg-btn" aria-checked={() => String(device() === d.id)} on:click={() => device.set(d.id)}>{d.label}</button>)}
      </div>
      <div class="sc-seg" role="radiogroup" aria-label="Önizleme teması">
        <button type="button" role="radio" class="sc-seg-btn" aria-checked={() => String(theme() === "")} on:click={() => theme.set("")}>Sayfanınki</button>
        {colorThemes().map((th) => <button type="button" role="radio" class="sc-sample-swatch" title={th.name} aria-label={th.name} aria-checked={() => String(theme() === th.id)} on:click={() => theme.set(th.id)}><ThemeSwatch id={th.id} /></button>)}
      </div>
      <button type="button" class="sc-seg-btn sc-seg-solo" aria-pressed={() => String(rtl())} on:click={() => rtl.set(!rtl())}>Sağdan sola</button>
      <button type="button" class="sc-seg-btn sc-seg-solo" aria-pressed={() => String(full())} aria-label={fullLabel} title={fullLabel} on:click={() => full.set(!full())}>{() => (full() ? minimize() : maximize())}</button>
    </div>
    <details class="sc-sample-parts">
      <summary>{`Bu site ${s.blocks.length} bloktan oluşur · kaynak`}</summary>
      <div class="sc-sample-chips">
        {s.blocks.map((b) => <Link class="sc-chip-link" href={`/web#${demoId(`landing/${b}`)}` as never}><code>{blockName(b)}</code></Link>)}
        <a class="sc-chip-link sc-chip-src" href={SOURCE + s.file} target="_blank" rel="noopener">{externalLink()}<span>{`Kaynak: web/${s.file}`}</span></a>
      </div>
    </details>
    <div class="sc-sample-stage">
      <div class="sc-sample-device" style={() => ({ "--sc-device-w": width() })}
        data-hm-theme={() => (theme() && ready() ? theme() : undefined)} dir={() => (rtl() ? "rtl" : undefined)}>
        {props.view()}
      </div>
    </div>
    <nav class="sc-sample-pager" aria-label="Örnek siteler">
      <Link href={`/web/${prev.view}` as never} class="sc-sample-step">{arrowLeft()}<span><small>Önceki örnek</small>{prev.title}</span></Link>
      <Link href={`/web/${next.view}` as never} class="sc-sample-step sc-sample-step-next"><span><small>Sonraki örnek</small>{next.title}</span>{arrowRight()}</Link>
    </nav>
  </div>
}

export default function WebPage(props: { params?: { rest?: string } }) {
  // the old address (/web?view=product) moves to the sample's own one, without an extra history entry
  const legacy = String(query()["view"] ?? "")
  if (!props.params?.rest && SAMPLES.some((x) => x.view === legacy)) queueMicrotask(() => void navigate(`/web/${legacy}` as never, { replace: true }))
  // only the path matters here: query changes (the slide number) must not rebuild the sample
  const view = computed(() => (props.params?.rest ?? "").split("/")[0] ?? "")
  return <>{() => {
    const v = view()
    const sample = SAMPLES.find((x) => x.view === v)
    if (!sample) return <Blocks />
    const S = v === "product" ? ProductSample : v === "portfolio" ? PortfolioSample : SlidesSample
    return <SampleView sample={sample} view={() => <S />} />
  }}</>
}
