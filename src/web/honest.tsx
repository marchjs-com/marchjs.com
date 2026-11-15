// Sample page: an anti-landing. It opens with who HADİ is not for (the visitor marks what applies and gets an honest
// verdict), then compares it with the alternatives including the rows where it is behind. Built from NotForYou and
// HonestCompare.
import { Button } from "march/ui";
import { SiteNav, Hero, SiteSection, NotForYou, HonestCompare, CtaBand, SiteFooter } from "march/components/landing/index.ts";
import { arrowRight, sparkles, globe, message, mail } from "march/icons";
import { NOT_FOR_YOU, FOR_YOU } from "march/components/landing/not-for-you/demo.tsx";
import { COMPARE_COLUMNS, COMPARE_ROWS } from "march/components/landing/honest-compare/demo.tsx";
import { FOOTER_COLUMNS } from "march/components/landing/site-footer/demo.tsx";

const LINKS = [{ label: "Kimin için değil", href: "#h-check" }, { label: "Karşılaştırma", href: "#h-compare" }]

export default function HonestSample() {
  return <div class="sc-sample-page">
    <SiteNav mode="solid" brand={{ name: "HADİ", mark: sparkles }} links={LINKS} actions={<Button size="sm" variant="secondary">Yine de dene</Button>} />
    <Hero variant="centered" size="lg" eyebrow="Dürüst tanıtım" title="HADİ herkes için değil" highlight="herkes için değil"
      lead="HADİ sosyal ağ, sohbet, etkinlik ve tanışma; hepsi bir arada. Bu herkese göre değil. Sana uymayanların üstünü çiz, sonucu sen gör."
      actions={[{ label: "Kendini kontrol et", href: "#h-check", iconEnd: arrowRight }, { label: "Karşılaştırmaya geç", href: "#h-compare", variant: "secondary" }]} />
    <SiteSection id="h-check" eyebrow="Önce sen" title="Sana uymayanları ele" lead="Sen olmayan her satıra dokun, üstü çizilsin. Hepsini çizdiysen HADİ tam sana göre.">
      <NotForYou check markedHint="Sen bir HADİ'lisin" items={NOT_FOR_YOU} forYou={FOR_YOU} />
    </SiteSection>
    <SiteSection id="h-compare" tone="muted" eyebrow="Karşılaştırma" title="Sıradan bir etkinlik grubuyla yan yana" lead="Küçük bir grubun daha iyi olduğu yerleri de gösteriyoruz; yanında nedeni yazıyor.">
      <HonestCompare columns={COMPARE_COLUMNS} rows={COMPARE_ROWS} caption="HADİ ve küçük bir etkinlik grubu" />
    </SiteSection>
    <CtaBand variant="plain" title="Hâlâ buradaysan HADİ büyük ihtimalle sana göre" lead="Bir dene, sana uyup uymadığını kendin gör." actions={[{ label: "HADİ'yi aç", iconEnd: arrowRight }]} />
    <SiteFooter brand={{ name: "HADİ", mark: sparkles }} about="Yakınındaki insanlarla buluşmanın en kolay yolu. hadisosyal.com" columns={FOOTER_COLUMNS}
      social={[{ label: "Web", href: "#", icon: globe }, { label: "Topluluk", href: "#", icon: message }, { label: "E-posta", href: "#", icon: mail }]}
      legal={[{ label: "Gizlilik", href: "#" }, { label: "Koşullar", href: "#" }]} />
  </div>
}
