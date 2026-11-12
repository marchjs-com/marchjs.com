// Web sites: every website block (src/components/landing) with its Playground, and three full sample pages
// (?view=product | portfolio | slides) built only from those blocks.
import "./web.css";
import { computed } from "hadi-march";
import { Link, query } from "hadi-march/router";
import { Section } from "../demo.tsx";
import { ComponentDemo } from "../component-demo.tsx";
import ProductSample from "../web/product.tsx";
import PortfolioSample from "../web/portfolio.tsx";
import SlidesSample from "../web/slides.tsx";

export const title = "Web siteleri"

const SAMPLES = [
  { view: "product", title: "Ürün tanıtım sayfası", desc: "Yüzen menü, kaydırınca düzleşen ürün karesi, bento, hikâye, fiyatlar, yorum duvarı, SSS ve altbilgi." },
  { view: "portfolio", title: "Kişisel portfolyo", desc: "Süzgeçli proje ızgarası, kapağın ayrıntı sayfasına büyüdüğü geçiş, yatay vaka şeridi, deneyim çizelgesi, iletişim formu." },
  { view: "slides", title: "Sunum", desc: "Klavye, kaydırma ve dokunma; adım adım maddeler, konuşmacı penceresi, tam ekran, URL'de slayt numarası, yazdır." },
] as const

function Blocks() {
  return <Section kicker="Bileşenler" title="Web siteleri" lead="Tanıtım, ana sayfa, portfolyo ve sunum için bloklar. Her blok mevcut bileşenlerden kurulur, hareket motoruyla canlanır, temaya, RTL'ye ve dile uyar. Yalnız kullanılan blok derlenir.">
    <div class="sc-samples">
      {SAMPLES.map((s) => <Link class="sc-sample" href={`/web?view=${s.view}` as never}><strong>{s.title}</strong><span>{s.desc}</span></Link>)}
    </div>
    <ComponentDemo folder="landing/hero" title="Hero" desc="Yedi görünüm, tek yapı: üst etiket, gradyan vurgulu başlık, açıklama, eylemler. Ürün varyantında kare kaydırdıkça düzleşir; parallax'ta katmanlar farklı hızda kayar." />
    <ComponentDemo folder="landing/site-nav" title="Site menüsü" desc="Saydamdan cama geçen, kaydırınca küçülen ya da yüzen hap görünümlü üst çubuk. Bağlantıların altında hap kayar; dar ekranda menü çekmeceye taşınır." />
    <ComponentDemo folder="landing/feature-grid" title="Özellik ızgarası" desc="Kartlar (imleç ışığıyla), sade, liste ya da bento. Kartlar sırayla belirir; bir satırdaki kutular eşit boyludur." />
    <ComponentDemo folder="landing/logo-cloud" title="Logo bulutu" desc="Eşit hücreli ızgara ya da sonsuz kayan şerit. Tek ton; üzerine gelince renklenir." />
    <ComponentDemo folder="landing/pricing" title="Fiyatlar" desc="Aylık / yıllık anahtarı: rakamlar odometre gibi döner, anahtarın başparmağı kayar, öne çıkan plan parlar." />
    <ComponentDemo folder="landing/testimonials" title="Yorumlar" desc="Izgara, iki sıra kayan şerit, solarak biten duvar (Daha fazla göster) ya da kaydırmalı." />
    <ComponentDemo folder="landing/faq" title="Sık sorulanlar" desc="Akordeon; iki sütunlu düzende yapışkan başlık; aramada aksan ve yazım hatasına dayanıklı sıralama." />
    <ComponentDemo folder="landing/stats-band" title="Rakamlar" desc="Görününce sayan büyük rakamlar; sade, çizgili ya da kartlı." />
    <ComponentDemo folder="landing/counter" title="Sayaç" desc="Görününce sayar, yeni değere süzülür; odometre modunda yalnız değişen basamaklar döner. Biçim Intl ile." />
    <ComponentDemo folder="landing/roadmap" title="Yol haritası ve zaman çizelgesi" desc="Kaydırdıkça dolan çizgi; geçilen noktalar yanar, süren adım parlar. Deneyim ve şirket hikâyesi için de." />
    <ComponentDemo folder="landing/scroll-story" title="Kaydırma hikâyesi" desc="Görsel sütunu sabit kalır, adımlar akar; etkin adımın görseli belirir, bölüm o adımın rengine geçer." />
    <ComponentDemo folder="landing/horizontal-scroll" title="Yatay kaydırma" desc="Sayfa aşağı kayarken paneller yana akar; dokunmatikte ve azaltılmış harekette yerel yatay kaydırıcı." />
    <ComponentDemo folder="landing/scroll-progress" title="Okuma ilerlemesi" desc="Sayfanın ya da bir makalenin ne kadarının okunduğunu gösteren ince çubuk." />
    <ComponentDemo folder="landing/reveal" title="Kaydırınca belirme" desc="Solma, yükselme, baştan ya da sondan kayma (RTL'de aynalı), ölçek, bulanıklık, çevirme; sırayla ya da kaydırmaya bağlı." />
    <ComponentDemo folder="landing/parallax" title="Parallax" desc="Her katman kendi hızında kayar; fare izleme açıkken derinliğine göre kayar. Yalnız transform." />
    <ComponentDemo folder="landing/project-grid" title="Proje ızgarası" desc="Süzgeç çipleri; seçince kalanlar yeni yerlerine süzülür (FLIP). Açınca kapak Lightbox'ta ya da ayrıntı sayfasında." />
    <ComponentDemo folder="landing/project-detail" title="Proje ayrıntısı" desc="Bir projeye tıkla: kapak ayrıntı sayfasındaki yerine büyür (paylaşılan öğe geçişi); geri dönüşte küçülür." />
    <ComponentDemo folder="landing/presentation" title="Sunum" desc="Ok tuşları, boşluk, kaydırma, dokunma; adım adım maddeler; konuşmacı görünümü (sonraki slayt, notlar, süre)." />
    <ComponentDemo folder="landing/video-background" title="Video arka plan" desc="Sessiz döngü, önce poster; görünmüyorken durur, veri tasarrufu ve azaltılmış harekette yalnız poster. Durdur düğmesi var." />
    <ComponentDemo folder="landing/cta-band" title="Eylem bandı" desc="Sayfa sonundaki çağrı paneli: gradyan, ağ, cam, sade ya da video arka plan; imleç ışığı." />
    <ComponentDemo folder="landing/newsletter" title="Bülten formu" desc="Doğrulama, bekleme düğmesi, başarıda beliren onay, hatada sallanan alan ve okunan ileti." />
    <ComponentDemo folder="landing/site-footer" title="Altbilgi" desc="Marka, bağlantı sütunları, sosyal bağlantılar, bülten, yasal satır, başa dön ve büyük yazı." />
    <ComponentDemo folder="landing/site-section" title="Bölüm çerçevesi" desc="Her bloğun çerçevesi: genişlik, dikey ritim, ton ve beliren başlık grubu." />
  </Section>
}

export default function WebPage() {
  // only the view matters here: other query changes (the slide number) must not rebuild the sample
  const view = computed(() => String(query()["view"] ?? ""))
  return <>{() => {
    const v = view()
    const sample = v === "product" ? ProductSample : v === "portfolio" ? PortfolioSample : v === "slides" ? SlidesSample : null
    if (!sample) return <Blocks />
    const S = sample
    return <div class="sc-sample-wrap">
      <div class="sc-sample-bar"><Link href="/web">← Bloklar</Link><span class="hm-muted">{SAMPLES.find((s) => s.view === v)?.title}</span></div>
      <S />
    </div>
  }}</>
}
