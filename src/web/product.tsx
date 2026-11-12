// Sample page: a product landing page built only from the website blocks (hadi-march/landing).
import { Button } from "hadi-march/ui";
import { SiteNav, Hero, LogoCloud, SiteSection, FeatureGrid, ScrollStory, StatsBand, Pricing, Testimonials, Faq, CtaBand, SiteFooter, ScrollProgress } from "hadi-march/landing";
import { arrowRight, sparkles, globe, message, mail } from "hadi-march/icons";
import { MockApp, Wordmark, LOGO_NAMES } from "hadi-march/components/landing/demo-kit.tsx";
import { FEATURES } from "hadi-march/components/landing/feature-grid/demo.tsx";
import { STORY } from "hadi-march/components/landing/scroll-story/demo.tsx";
import { STATS } from "hadi-march/components/landing/stats-band/demo.tsx";
import { PLANS } from "hadi-march/components/landing/pricing/demo.tsx";
import { QUOTES } from "hadi-march/components/landing/testimonials/demo.tsx";
import { FAQ } from "hadi-march/components/landing/faq/demo.tsx";
import { FOOTER_COLUMNS } from "hadi-march/components/landing/site-footer/demo.tsx";
import { Counter } from "hadi-march/landing";

const LINKS = [
  { label: "Özellikler", href: "#p-features" }, { label: "Nasıl çalışır", href: "#p-story" },
  { label: "Fiyatlar", href: "#p-pricing" }, { label: "Müşteriler", href: "#p-customers" }, { label: "SSS", href: "#p-faq" },
]

export default function ProductSample() {
  const bento = FEATURES.map((f, i) => ({ ...f, span: (["big", "normal", "normal", "wide", "normal", "normal"] as const)[i],
    media: i === 0 ? <MockApp class="sc-mock-sm" /> : i === 3 ? <div class="sc-bento-stat"><Counter value={98.6} decimals={1} suffix="%" /><span>daha az JavaScript</span></div> : undefined }))
  return <div class="sc-sample-page">
    <ScrollProgress />
    <SiteNav mode="floating" brand={{ name: "Acme", mark: sparkles }} links={LINKS}
      actions={<><Button variant="ghost" size="sm">Giriş</Button><Button size="sm">Ücretsiz başla</Button></>} />
    <Hero variant="product" size="lg" eyebrow="Yeni: Acme 2.0 yayında" eyebrowHref="#p-features"
      title="Web sitesi kurmanın en hızlı yolu" highlight="en hızlı"
      lead="Hazır bloklar, akıcı hareket ve sıfır bağımlılık. Tanıtım sayfan dakikalar içinde, her cihazda kusursuz."
      actions={[{ label: "Ücretsiz başla", iconEnd: arrowRight }, { label: "Demoyu izle", variant: "secondary" }]}
      note="Kredi kartı gerekmez · 2 dakikada kurulum" media={<MockApp /> as Node} />
    <SiteSection space="sm">
      <LogoCloud title="12.000'den fazla ekip Acme ile yayında" variant="marquee" logos={LOGO_NAMES.map((name) => ({ name, node: <Wordmark name={name} /> }))} />
    </SiteSection>
    <SiteSection id="p-features" eyebrow="Özellikler" title="İhtiyacın olan her şey, fazlası değil" lead="Her blok tek bir işi çok iyi yapar ve diğerleriyle aynı dili konuşur.">
      <FeatureGrid variant="bento" items={bento} />
    </SiteSection>
    <SiteSection id="p-story" tone="muted" eyebrow="Nasıl çalışır" title="Fikirden yayına dört adım">
      <ScrollStory steps={STORY} />
    </SiteSection>
    <SiteSection space="sm">
      <StatsBand items={STATS} />
    </SiteSection>
    <SiteSection id="p-pricing" eyebrow="Fiyatlar" title="Basit, öngörülebilir fiyatlar" lead="Yıllık ödemede iki ay bizden.">
      <Pricing plans={PLANS.slice(0, 3)} saving="2 ay bedava" />
    </SiteSection>
    <SiteSection id="p-customers" tone="muted" eyebrow="Müşteriler" title="Ekipler ne diyor?">
      <Testimonials variant="wall" items={QUOTES} />
    </SiteSection>
    <SiteSection id="p-faq">
      <Faq layout="split" search items={FAQ} title="Sık sorulanlar" lead="Aradığını bulamadın mı? Ekibimiz bir gün içinde yanıt verir." contact={<Button variant="secondary">Bize yaz</Button>} />
    </SiteSection>
    <CtaBand variant="gradient" title="Siteni bu hafta yayına al" lead="Ücretsiz başla, büyüdükçe yükselt." actions={[{ label: "Ücretsiz başla", iconEnd: arrowRight }, { label: "Satışla görüş" }]} note="14 gün ücretsiz · istediğin an iptal" />
    <SiteFooter brand={{ name: "Acme", mark: sparkles }} about="Web sitelerini hızlı, erişilebilir ve güzel yapan bloklar." columns={FOOTER_COLUMNS}
      social={[{ label: "Web", href: "#", icon: globe }, { label: "Topluluk", href: "#", icon: message }, { label: "E-posta", href: "#", icon: mail }]}
      newsletter={{ title: "Bülten", lead: "Ayda bir, yalnız yenilikler.", onSubmit: () => new Promise((r) => setTimeout(r, 700)) }}
      legal={[{ label: "Gizlilik", href: "#" }, { label: "Koşullar", href: "#" }]} wordmark="Acme" />
  </div>
}
