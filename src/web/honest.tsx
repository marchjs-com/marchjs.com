// Sample page: an anti-landing. It opens with who HADİ is not for (the visitor marks what applies and gets an honest
// verdict), compares it with the alternatives including the rows where it is behind, and lists the known gaps with
// their plan. Built from NotForYou, HonestCompare and Roadmap.
import { Button } from "hadi-march/ui";
import { SiteNav, Hero, SiteSection, NotForYou, HonestCompare, Roadmap, CtaBand, SiteFooter } from "hadi-march/components/landing/index.ts";
import { arrowRight, sparkles, globe, message, mail } from "hadi-march/icons";
import { NOT_FOR_YOU, FOR_YOU } from "hadi-march/components/landing/not-for-you/demo.tsx";
import { COMPARE_COLUMNS, COMPARE_ROWS } from "hadi-march/components/landing/honest-compare/demo.tsx";
import { FOOTER_COLUMNS } from "hadi-march/components/landing/site-footer/demo.tsx";

const LINKS = [{ label: "Kimin için değil", href: "#h-check" }, { label: "Karşılaştırma", href: "#h-compare" }, { label: "Eksikler", href: "#h-gaps" }]

const GAPS = [
  { time: "Bugün", title: "Yalnız web", body: "Telefonda tarayıcıdan açılıyor, ana ekrana eklenebiliyor. Mağaza uygulaması yok.", status: "now" as const },
  { time: "Bahar", title: "Masaüstü bildirimleri", body: "Bir etkinliğe yer açılınca haber vermek için.", status: "next" as const },
  { time: "Yaz", title: "Tekrarlayan etkinlikler", body: "Her salı koşu gibi düzenli buluşmalar; şimdilik her biri ayrı kuruluyor.", status: "next" as const },
  { time: "Planlamıyoruz", title: "Bilet satışı ve takipçi sayısı", body: "HADİ küçük ve ücretsiz buluşmalar için. Bunlar onu başka bir şeye çevirir.", status: "next" as const },
]

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
    <SiteSection id="h-gaps" eyebrow="Bilinen eksikler" title="Neyi ne zaman kapatıyoruz" lead="Bazılarını hiç kapatmayacağız. Onları da yazdık.">
      <Roadmap items={GAPS} />
    </SiteSection>
    <CtaBand variant="plain" title="Hâlâ buradaysan HADİ büyük ihtimalle sana göre" lead="Ücretsiz, kayıt bir dakika. Beğenmezsen hesabını tek tıkla silersin." actions={[{ label: "HADİ'yi aç", iconEnd: arrowRight }]} />
    <SiteFooter brand={{ name: "HADİ", mark: sparkles }} about="Yakınındaki insanlarla buluşmanın en kolay yolu. hadisosyal.com" columns={FOOTER_COLUMNS}
      social={[{ label: "Web", href: "#", icon: globe }, { label: "Topluluk", href: "#", icon: message }, { label: "E-posta", href: "#", icon: mail }]}
      legal={[{ label: "Gizlilik", href: "#" }, { label: "Koşullar", href: "#" }]} />
  </div>
}
