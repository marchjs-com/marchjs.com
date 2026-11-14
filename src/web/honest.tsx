// Sample page: an anti-landing. It opens with who HADİ is not for (the visitor marks what applies and gets an honest
// verdict), then compares it with the alternatives including the rows where it is behind. Built from NotForYou and
// HonestCompare.
import { Button } from "hadi-march/ui";
import { SiteNav, Hero, SiteSection, NotForYou, HonestCompare, CtaBand, SiteFooter } from "hadi-march/components/landing/index.ts";
import { arrowRight, sparkles, globe, message, mail } from "hadi-march/icons";
import { NOT_FOR_YOU, FOR_YOU } from "hadi-march/components/landing/not-for-you/demo.tsx";
import { COMPARE_COLUMNS, COMPARE_ROWS } from "hadi-march/components/landing/honest-compare/demo.tsx";
import { FOOTER_COLUMNS } from "hadi-march/components/landing/site-footer/demo.tsx";

const LINKS = [{ label: "Kimin için değil", href: "#h-check" }, { label: "Karşılaştırma", href: "#h-compare" }]

export default function HonestSample() {
  return <div class="sc-sample-page">
    <SiteNav mode="solid" brand={{ name: "HADİ", mark: sparkles }} links={LINKS} actions={<Button size="sm" variant="secondary">Yine de dene</Button>} />
    <Hero variant="centered" size="lg" eyebrow="Dürüst tanıtım" title="HADİ herkes için değil" highlight="herkes için değil"
      lead="Zamanını boşa harcamamak için önce kimin için olmadığını söyleyelim. Sana uyanları işaretle; sonucu biz değil, sen göreceksin."
      actions={[{ label: "Kendini kontrol et", href: "#h-check", iconEnd: arrowRight }, { label: "Karşılaştırmaya geç", href: "#h-compare", variant: "secondary" }]} />
    <SiteSection id="h-check" eyebrow="Önce sen" title="Sana uyanları işaretle" lead="Sana uyan her satıra dokun. Yarısından fazlası uyuyorsa başka bir uygulama daha iyi olabilir.">
      <NotForYou check items={NOT_FOR_YOU} forYou={FOR_YOU} />
    </SiteSection>
    <SiteSection id="h-compare" tone="muted" eyebrow="Karşılaştırma" title="Alternatiflerle yan yana" lead="Geride olduğumuz satırları da gösteriyoruz; yanında nedeni yazıyor.">
      <HonestCompare columns={COMPARE_COLUMNS} rows={COMPARE_ROWS} caption="HADİ ve alternatifleri" />
    </SiteSection>
    <CtaBand variant="plain" title="Hâlâ buradaysan HADİ büyük ihtimalle sana göre" lead="Bir dene, sana uyup uymadığını kendin gör." actions={[{ label: "HADİ'yi aç", iconEnd: arrowRight }]} />
    <SiteFooter brand={{ name: "HADİ", mark: sparkles }} about="Yakınındaki insanlarla buluşmanın en kolay yolu. hadisosyal.com" columns={FOOTER_COLUMNS}
      social={[{ label: "Web", href: "#", icon: globe }, { label: "Topluluk", href: "#", icon: message }, { label: "E-posta", href: "#", icon: mail }]}
      legal={[{ label: "Gizlilik", href: "#" }, { label: "Koşullar", href: "#" }]} />
  </div>
}
