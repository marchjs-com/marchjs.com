// Sample page: a product landing page built only from the website blocks (hadi-march/landing).
import { Button } from "hadi-march/ui";
import { SiteNav, Hero, LogoCloud, SiteSection, FeatureGrid, ScrollStory, StatsBand, Pricing, ScrollProgress } from "hadi-march/components/landing/index.ts";
import { lazy } from "hadi-march/lazy";
import { arrowRight, sparkles } from "hadi-march/icons";
import { MockApp, Wordmark, LOGO_NAMES } from "hadi-march/components/landing/demo-kit.tsx";
import { FEATURES } from "hadi-march/components/landing/feature-grid/demo.tsx";
import { STORY } from "hadi-march/components/landing/scroll-story/demo.tsx";
import { STATS } from "hadi-march/components/landing/stats-band/demo.tsx";
import { PLANS } from "hadi-march/components/landing/pricing/demo.tsx";
import { Counter } from "hadi-march/components/landing/index.ts";

const LINKS = [
  { label: "Özellikler", href: "#p-features" }, { label: "Nasıl çalışır", href: "#p-story" },
  { label: "Fiyatlar", href: "#p-pricing" }, { label: "Müşteriler", href: "#p-customers" }, { label: "SSS", href: "#p-faq" },
]

// the lower half (customers, questions, call to action, footer) loads as it comes near: a long page stays light
const ProductMore = lazy(() => import("./product-more.tsx"), { when: "visible", placeholder: "block", height: "120rem" })

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
    <ProductMore />
  </div>
}
