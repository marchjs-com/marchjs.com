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
  { label: "Neler var", href: "#p-features" }, { label: "Nasıl çalışır", href: "#p-story" },
  { label: "Premium", href: "#p-pricing" }, { label: "Yorumlar", href: "#p-customers" }, { label: "SSS", href: "#p-faq" },
]

// the lower half (customers, questions, call to action, footer) loads as it comes near: a long page stays light
const ProductMore = lazy(() => import("./product-more.tsx"), { when: "visible", placeholder: "block", height: "120rem" })

export default function ProductSample() {
  const bento = FEATURES.map((f, i) => ({ ...f, span: (["big", "normal", "normal", "wide", "normal", "normal"] as const)[i],
    media: i === 0 ? <MockApp class="sc-mock-sm" /> : i === 3 ? <div class="sc-bento-stat"><Counter value={1200} suffix="+" /><span>etkinlik her hafta</span></div> : undefined }))
  return <div class="sc-sample-page">
    <ScrollProgress />
    <SiteNav mode="floating" brand={{ name: "HADİ", mark: sparkles }} links={LINKS}
      actions={<><Button variant="ghost" size="sm">Giriş</Button><Button size="sm">Katıl</Button></>} />
    <Hero variant="product" size="lg" eyebrow="Yeni: tanışma yemekleri" eyebrowHref="#p-features"
      title="Yakınındaki insanlarla bugün buluş" highlight="bugün buluş"
      lead="Sosyal ağ, sohbet ve etkinlikler tek uygulamada. Ne yapmak istediğini seç; gerisini HADİ halleder."
      actions={[{ label: "HADİ'ye katıl", iconEnd: arrowRight }, { label: "Etkinliklere göz at", variant: "secondary" }]}
      note="Ücretsiz · telefonda ve tarayıcıda" media={<MockApp /> as Node} />
    <SiteSection space="sm">
      <LogoCloud title="Bu topluluklar HADİ'de buluşuyor" variant="marquee" logos={LOGO_NAMES.filter((name) => name !== "HADİ").map((name) => ({ name, node: <Wordmark name={name} /> }))} />
    </SiteSection>
    <SiteSection id="p-features" eyebrow="Neler var" title="Sosyal ağ ve etkinlik merkezi, bir arada" lead="Keşfet, katıl, tanış, paylaş: ayrı ayrı uygulamaya gerek yok.">
      <FeatureGrid variant="bento" items={bento} />
    </SiteSection>
    <SiteSection id="p-story" tone="muted" eyebrow="Nasıl çalışır" title="Ekrandan masaya dört adım">
      <ScrollStory steps={STORY} />
    </SiteSection>
    <SiteSection space="sm">
      <StatsBand items={STATS} />
    </SiteSection>
    <SiteSection id="p-pricing" eyebrow="Premium" title="HADİ ücretsiz; Premium isteğe bağlı" lead="Yıllık ödemede 4 ay bizden.">
      <Pricing plans={PLANS} currency="TRY" saving="4 ay bedava" />
    </SiteSection>
    <ProductMore />
  </div>
}
