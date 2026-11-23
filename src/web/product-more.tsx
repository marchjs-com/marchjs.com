// Sample product page, lower half: loaded when it comes near the viewport (see product.tsx).
import { Button } from "march/ui";
import { SiteSection } from "march/components/landing/site-section";
import { Testimonials } from "march/components/landing/testimonials";
import { Faq } from "march/components/landing/faq";
import { CtaBand } from "march/components/landing/cta-band";
import { SiteFooter } from "march/components/landing/site-footer";
import { arrowRight, sparkles, globe, message, mail } from "march/icons";
import { QUOTES } from "../catalog/landing/testimonials/demo.tsx";
import { FAQ } from "../catalog/landing/faq/demo.tsx";
import { FOOTER_COLUMNS } from "../catalog/landing/site-footer/demo.tsx";

export default function ProductMore() {
  return <>
    <SiteSection id="p-customers" tone="muted" eyebrow="Yorumlar" title="HADİ'de buluşanlar ne diyor?">
      <Testimonials variant="wall" items={QUOTES} />
    </SiteSection>
    <SiteSection id="p-faq">
      <Faq layout="split" items={FAQ} title="Sık sorulanlar" lead="Aradığını bulamadın mı? Bize yaz, yanıtlayalım." contact={<Button variant="secondary">Bize yaz</Button>} />
    </SiteSection>
    <CtaBand variant="gradient" title="Bu hafta sonu bir plan yap" lead="Yakınındaki etkinliklere katıl ya da kendi buluşmanı kur." actions={[{ label: "HADİ'ye katıl", iconEnd: arrowRight }, { label: "Etkinliklere göz at" }]} note="Ücretsiz · Premium isteğe bağlı" />
    <SiteFooter brand={{ name: "HADİ", mark: sparkles }} about="Sosyal ağ, sohbet ve etkinlikler tek yerde. hadisosyal.com" columns={FOOTER_COLUMNS}
      social={[{ label: "Web", href: "#", icon: globe }, { label: "Topluluk", href: "#", icon: message }, { label: "E-posta", href: "#", icon: mail }]}
      newsletter={{ title: "Bülten", lead: "Ayda bir: yeni etkinlikler ve yenilikler.", onSubmit: () => new Promise((r) => setTimeout(r, 700)) }}
      legal={[{ label: "Gizlilik", href: "#" }, { label: "Koşullar", href: "#" }]} wordmark="HADİ" />
  </>
}
