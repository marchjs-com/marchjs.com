// Sample page: the landing page is a story. Instead of a feature list, the visitor plays a Saturday on HADİ and finds
// the features by choosing (sample content). Built from BranchingStory.
import { Button } from "march/ui";
import { SiteNav, Hero, SiteSection, BranchingStory, CtaBand, SiteFooter } from "march/components/landing/index.ts";
import { arrowRight, sparkles, globe, message, mail } from "march/icons";
import { SATURDAY } from "march/components/landing/branching-story/demo.tsx";
import { FOOTER_COLUMNS } from "march/components/landing/site-footer/demo.tsx";

export default function StorySample() {
  return <div class="sc-sample-page">
    <SiteNav mode="transparent" brand={{ name: "HADİ", mark: sparkles }} links={[{ label: "Hikâye", href: "#s-story" }]} actions={<Button size="sm">Katıl</Button>} />
    <Hero variant="mesh" size="lg" eyebrow="Kendi hikâyeni seç" title="HADİ'de bir cumartesi" highlight="bir cumartesi"
      lead="Özellik listesi yok. Bir hafta sonunu sen yaşa; her seçim seni HADİ'nin başka bir yüzüne götürür. Beş farklı son var."
      actions={[{ label: "Başla", href: "#s-story", iconEnd: arrowRight }]} note="İpucu: seçimleri 1, 2, 3 tuşlarıyla da yapabilirsin" />
    <SiteSection id="s-story" space="sm">
      <div class="sc-story-wrap">
        <BranchingStory start="intro" passages={SATURDAY} minHeight="26rem" label="HADİ'de bir cumartesi"
          action={<Button iconEnd={arrowRight}>Bu cumartesiyi gerçek yap</Button>} />
      </div>
    </SiteSection>
    <CtaBand variant="mesh" title="Hikâyenin devamı sende" lead="Yakınındaki etkinliklere katıl, buluşmanı kur, yeni insanlarla tanış." actions={[{ label: "HADİ'ye katıl", iconEnd: arrowRight }]} note="Ücretsiz · Premium isteğe bağlı" />
    <SiteFooter brand={{ name: "HADİ", mark: sparkles }} about="Sosyal ağ, sohbet ve etkinlikler tek yerde. hadisosyal.com" columns={FOOTER_COLUMNS}
      social={[{ label: "Web", href: "#", icon: globe }, { label: "Topluluk", href: "#", icon: message }, { label: "E-posta", href: "#", icon: mail }]}
      legal={[{ label: "Gizlilik", href: "#" }, { label: "Koşullar", href: "#" }]} />
  </div>
}
