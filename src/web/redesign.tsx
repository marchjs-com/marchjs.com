// Sample page: a redesign launch. Every claim is shown, not told: a BeforeAfter for the whole screen and one for each
// detail (feed, profile, reading), then the numbers that changed and a call to action.
import { Button } from "march/ui";
import { SiteNav, Hero, SiteSection, BeforeAfter, StatsBand, CtaBand, SiteFooter } from "march/components/landing/index.ts";
import { arrowRight, sparkles, globe, message, mail } from "march/icons";
import { MockApp } from "march/components/landing/demo-kit.tsx";
import { FOOTER_COLUMNS } from "march/components/landing/site-footer/demo.tsx";

const LINKS = [{ label: "Karşılaştır", href: "#r-compare" }, { label: "Ayrıntılar", href: "#r-details" }, { label: "Rakamlar", href: "#r-numbers" }]

const POSTS = [
  { who: "Elif", what: "Kadıköy'de akşam koşusu, 5 km, herkes gelebilir", when: "19:00" },
  { who: "Mert", what: "Pazar kahvaltısı için 3 kişi aranıyor", when: "Pazar" },
  { who: "Zeynep", what: "Masa oyunu gecesi: yeni başlayanlara anlatırız", when: "Cuma" },
]

/** The old feed: one dense grey list. */
function FeedOld() {
  return <div class="sc-rd-feed is-old" aria-hidden="true">
    {POSTS.map((p) => <div class="sc-rd-row"><b>{p.who}</b><span>{p.what}</span><small>{p.when}</small></div>)}
  </div>
}
/** The new feed: cards with an avatar, the time as a chip and a join button. */
function FeedNew() {
  return <div class="sc-rd-feed is-new" aria-hidden="true">
    {POSTS.map((p, i) => <div class="sc-rd-card"><i class={`sc-rd-av c${i + 1}`}>{p.who[0]}</i><div><b>{p.who}</b><span>{p.what}</span></div><small>{p.when}</small></div>)}
  </div>
}
function ProfileOld() {
  return <div class="sc-rd-profile is-old" aria-hidden="true"><i class="sc-rd-av" /><b>Deniz Kaya</b><span>İstanbul · 128 etkinlik · 1,2 B takipçi · Üye: 2023</span></div>
}
function ProfileNew() {
  return <div class="sc-rd-profile is-new" aria-hidden="true">
    <i class="sc-rd-cover" /><i class="sc-rd-av c2">D</i><b>Deniz Kaya</b><span>İstanbul</span>
    <div class="sc-rd-nums"><p><b>128</b>etkinlik</p><p><b>1,2 B</b>takipçi</p><p><b>2023</b>üye</p></div>
  </div>
}
const TEXT = "Yakınındaki insanlarla bugün buluş. HADİ ilgi alanlarına uyan etkinlikleri gösterir, sen yalnız Katıl'a basarsın; gerisini topluluk halleder."
const ReadOld = () => <div class="sc-rd-read is-old" aria-hidden="true"><p>{TEXT}</p><p>{TEXT}</p></div>
const ReadNew = () => <div class="sc-rd-read is-new" aria-hidden="true"><p>{TEXT}</p></div>

export default function RedesignSample() {
  return <div class="sc-sample-page">
    <SiteNav mode="floating" brand={{ name: "HADİ", mark: sparkles }} links={LINKS} actions={<Button size="sm">Yeni HADİ'yi aç</Button>} />
    <Hero variant="centered" size="lg" eyebrow="Yeniden tasarım" title="HADİ'nin yeni yüzü" highlight="yeni yüzü"
      lead="Anlatmak yerine gösteriyoruz: ayırıcıyı sürükle, eskisiyle yenisini kendin karşılaştır."
      actions={[{ label: "Karşılaştır", href: "#r-compare", iconEnd: arrowRight }]} />
    <SiteSection id="r-compare" space="sm">
      <BeforeAfter class="sc-rd-hero" ratio="16 / 10" beforeLabel="HADİ 1.0" afterLabel="HADİ 2.0" label="HADİ 1.0 ve 2.0 ana ekranı"
        before={<MockApp class="sc-ba-old" />} after={<MockApp />} />
      <p class="sc-rd-tip m-muted">İpucu: herhangi bir yere bas, ayırıcı oraya atlar. Klavyede ← → ile de kayar.</p>
    </SiteSection>
    <SiteSection id="r-details" tone="muted" eyebrow="Ayrıntılar" title="Her ekran, tek tek" lead="Üç değişiklik, üç ayrı karşılaştırma.">
      <div class="sc-rd-grid">
        <figure class="sc-rd-fig">
          <BeforeAfter ratio="4 / 3" orientation="vertical" beforeLabel="Önce" afterLabel="Sonra" label="Akış: önce ve sonra" before={<FeedOld />} after={<FeedNew />} />
          <figcaption><b>Akış</b> Sık bir liste yerine kartlar: kim, ne, ne zaman ilk bakışta. Bu karşılaştırma dikey: ayırıcıyı aşağı yukarı çek.</figcaption>
        </figure>
        <figure class="sc-rd-fig">
          <BeforeAfter ratio="4 / 3" beforeLabel="Önce" afterLabel="Sonra" label="Profil: önce ve sonra" before={<ProfileOld />} after={<ProfileNew />} />
          <figcaption><b>Profil</b> Tek satıra sıkışan bilgiler artık rakam olarak öne çıkıyor.</figcaption>
        </figure>
        <figure class="sc-rd-fig">
          <BeforeAfter ratio="4 / 3" follow hint={false} beforeLabel="Önce" afterLabel="Sonra" label="Okuma: önce ve sonra" before={<ReadOld />} after={<ReadNew />} />
          <figcaption><b>Okuma</b> Daha büyük yazı, daha geniş satır aralığı. Bunda basmana gerek yok, imleci gezdir.</figcaption>
        </figure>
      </div>
    </SiteSection>
    <SiteSection id="r-numbers" space="sm">
      <StatsBand items={[
        { value: 38, suffix: "%", label: "daha hızlı ilk açılış" },
        { value: 2.4, decimals: 1, suffix: " kat", label: "daha çok etkinliğe katılım" },
        { value: 100, label: "erişilebilirlik puanı", note: "Lighthouse" },
      ]} />
    </SiteSection>
    <CtaBand variant="gradient" title="Yeni HADİ bugün herkeste" lead="Güncellemen gerekmiyor, uygulamayı açman yeterli." actions={[{ label: "HADİ'yi aç", iconEnd: arrowRight }]} />
    <SiteFooter brand={{ name: "HADİ", mark: sparkles }} about="Yakınındaki insanlarla buluşmanın en kolay yolu. hadisosyal.com" columns={FOOTER_COLUMNS}
      social={[{ label: "Web", href: "#", icon: globe }, { label: "Topluluk", href: "#", icon: message }, { label: "E-posta", href: "#", icon: mail }]}
      legal={[{ label: "Gizlilik", href: "#" }, { label: "Koşullar", href: "#" }]} />
  </div>
}
