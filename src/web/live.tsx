// Sample page: a living wall. The page proves the place is busy instead of saying so: live counters that grow while
// you watch and a wall of activity that keeps arriving (sample data). Built from LiveCounter and LiveFeed.
import { Button } from "hadi-march/ui";
import { SiteNav, Hero, SiteSection, LiveFeed, LiveCounter, CtaBand, SiteFooter } from "hadi-march/components/landing/index.ts";
import { arrowRight, sparkles, globe, message, mail } from "hadi-march/icons";
import { activitySource } from "hadi-march/components/landing/live-feed/demo.tsx";
import { FOOTER_COLUMNS } from "hadi-march/components/landing/site-footer/demo.tsx";

const LINKS = [{ label: "Şu an", href: "#l-now" }, { label: "Az önce", href: "#l-wall" }]

export default function LiveSample() {
  return <div class="sc-sample-page">
    <SiteNav mode="floating" brand={{ name: "HADİ", mark: sparkles }} links={LINKS} actions={<Button size="sm">Katıl</Button>} />
    <Hero variant="aurora" size="lg" eyebrow="Şu an canlı" title="HADİ hiç uyumaz" highlight="hiç uyumaz"
      lead="Anlatmak yerine gösteriyoruz: bu sayfadaki her şey sen bakarken değişiyor."
      actions={[{ label: "Ne oluyor, bak", href: "#l-wall", iconEnd: arrowRight }]} />
    <SiteSection id="l-now" space="sm">
      <div class="sc-live-counters">
        <LiveCounter from={18420} rate={42} label="kişi bu hafta bir etkinliğe katıldı" />
        <LiveCounter from={1264} rate={9} label="etkinlik şu an devam ediyor" />
        <LiveCounter from={3187} rate={18} label="yeni arkadaşlık bugün" />
      </div>
    </SiteSection>
    <SiteSection id="l-wall" tone="muted" eyebrow="Az önce" title="HADİ'de şimdi neler oluyor" lead="Üstüne gelince durur; istersen düğmeyle tamamen durdur.">
      <LiveFeed variant="wall" max={9} every={1800} next={activitySource()} label="HADİ'de az önce" />
    </SiteSection>
    <SiteSection eyebrow="Senin şehrinde" title="Yakınındakiler" lead="Kendi şehrindeki akışı görmek için HADİ'ye katıl.">
      <div class="sc-live-split">
        <LiveFeed max={4} every={3200} next={activitySource()} label="Yakınındaki etkinlikler" />
        <div class="sc-live-aside">
          <LiveCounter from={214} rate={6} label="kişi şu an yakınında bir şeyler planlıyor" />
          <p class="hm-muted">Rakamlar ve akış bu örnekte temsilidir; gerçek sitede sunucudan gelir.</p>
        </div>
      </div>
    </SiteSection>
    <CtaBand variant="gradient" title="Sen de bu akışta ol" lead="Yakınındaki etkinliklere katıl ya da kendi buluşmanı kur." actions={[{ label: "HADİ'ye katıl", iconEnd: arrowRight }]} note="Ücretsiz · Premium isteğe bağlı" />
    <SiteFooter brand={{ name: "HADİ", mark: sparkles }} about="Sosyal ağ, sohbet ve etkinlikler tek yerde. hadisosyal.com" columns={FOOTER_COLUMNS}
      social={[{ label: "Web", href: "#", icon: globe }, { label: "Topluluk", href: "#", icon: message }, { label: "E-posta", href: "#", icon: mail }]}
      legal={[{ label: "Gizlilik", href: "#" }, { label: "Koşullar", href: "#" }]} />
  </div>
}
