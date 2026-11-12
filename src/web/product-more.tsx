// Sample product page, lower half: loaded when it comes near the viewport (see product.tsx).
import { Button } from "hadi-march/ui";
import { SiteSection, Testimonials, Faq, CtaBand, SiteFooter } from "hadi-march/components/landing/index.ts";
import { arrowRight, sparkles, globe, message, mail } from "hadi-march/icons";
import { QUOTES } from "hadi-march/components/landing/testimonials/demo.tsx";
import { FAQ } from "hadi-march/components/landing/faq/demo.tsx";
import { FOOTER_COLUMNS } from "hadi-march/components/landing/site-footer/demo.tsx";

export default function ProductMore() {
  return <>
    <SiteSection id="p-customers" tone="muted" eyebrow="Müşteriler" title="Ekipler ne diyor?">
      <Testimonials variant="wall" items={QUOTES} />
    </SiteSection>
    <SiteSection id="p-faq">
      <Faq layout="split" items={FAQ} title="Sık sorulanlar" lead="Aradığını bulamadın mı? Ekibimiz bir gün içinde yanıt verir." contact={<Button variant="secondary">Bize yaz</Button>} />
    </SiteSection>
    <CtaBand variant="gradient" title="Siteni bu hafta yayına al" lead="Ücretsiz başla, büyüdükçe yükselt." actions={[{ label: "Ücretsiz başla", iconEnd: arrowRight }, { label: "Satışla görüş" }]} note="14 gün ücretsiz · istediğin an iptal" />
    <SiteFooter brand={{ name: "Acme", mark: sparkles }} about="Web sitelerini hızlı, erişilebilir ve güzel yapan bloklar." columns={FOOTER_COLUMNS}
      social={[{ label: "Web", href: "#", icon: globe }, { label: "Topluluk", href: "#", icon: message }, { label: "E-posta", href: "#", icon: mail }]}
      newsletter={{ title: "Bülten", lead: "Ayda bir, yalnız yenilikler.", onSubmit: () => new Promise((r) => setTimeout(r, 700)) }}
      legal={[{ label: "Gizlilik", href: "#" }, { label: "Koşullar", href: "#" }]} wordmark="Acme" />
  </>
}
