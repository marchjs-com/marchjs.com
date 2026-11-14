// Web sites: every website block (src/components/landing) with its Playground, one page per block (/web/<block>).
// The sample sites built from these blocks live in their own section (/sites, pages/sites.tsx); an old sample address
// (/web/product, /web?view=product) moves there.
import "./web.css";
import { query, navigate } from "hadi-march/router";
import { Hub } from "../hub.tsx";
import { ComponentDemo } from "../component-demo.tsx";
import { HUBS } from "../topics.ts";

export const title = "Bileşenler"

function Blocks(props: { params?: { rest?: string } | undefined }) {
  const RENDER: Record<string, () => unknown> = {
    "hero": () => <ComponentDemo folder="landing/hero" title="Hero" desc="Yedi görünüm, tek yapı: üst etiket, gradyan vurgulu başlık, açıklama, eylemler. Ürün varyantında kare kaydırdıkça düzleşir; parallax'ta katmanlar farklı hızda kayar." />,
    "site-nav": () => <ComponentDemo folder="landing/site-nav" title="Site menüsü" desc="Saydamdan cama geçen, kaydırınca küçülen ya da yüzen hap görünümlü üst çubuk. Bağlantıların altında hap kayar; dar ekranda menü çekmeceye taşınır." />,
    "feature-grid": () => <ComponentDemo folder="landing/feature-grid" title="Özellik ızgarası" desc="Kartlar (imleç ışığıyla), sade, liste ya da bento. Kartlar sırayla belirir; bir satırdaki kutular eşit boyludur." />,
    "logo-cloud": () => <ComponentDemo folder="landing/logo-cloud" title="Logo bulutu" desc="Eşit hücreli ızgara ya da sonsuz kayan şerit. Tek ton; üzerine gelince renklenir." />,
    "pricing": () => <ComponentDemo folder="landing/pricing" title="Fiyatlar" desc="Aylık / yıllık anahtarı: rakamlar odometre gibi döner, anahtarın başparmağı kayar, öne çıkan plan parlar." />,
    "testimonials": () => <ComponentDemo folder="landing/testimonials" title="Yorumlar" desc="Izgara, iki sıra kayan şerit, solarak biten duvar (Daha fazla göster) ya da kaydırmalı." />,
    "faq": () => <ComponentDemo folder="landing/faq" title="Sık sorulanlar" desc="Akordeon; iki sütunlu düzende yapışkan başlık; aramada aksan ve yazım hatasına dayanıklı sıralama." />,
    "stats-band": () => <ComponentDemo folder="landing/stats-band" title="Rakamlar" desc="Görününce sayan büyük rakamlar; sade, çizgili ya da kartlı." />,
    "counter": () => <ComponentDemo folder="landing/counter" title="Sayaç" desc="Görününce sayar, yeni değere süzülür; odometre modunda yalnız değişen basamaklar döner. Biçim Intl ile." />,
    "roadmap": () => <ComponentDemo folder="landing/roadmap" title="Yol haritası ve zaman çizelgesi" desc="Kaydırdıkça dolan çizgi; geçilen noktalar yanar, süren adım parlar. Deneyim ve şirket hikâyesi için de." />,
    "scroll-story": () => <ComponentDemo folder="landing/scroll-story" title="Kaydırma hikâyesi" desc="Görsel sütunu sabit kalır, adımlar akar; etkin adımın görseli belirir, bölüm o adımın rengine geçer." />,
    "horizontal-scroll": () => <ComponentDemo folder="landing/horizontal-scroll" title="Yatay kaydırma" desc="Sayfa aşağı kayarken paneller yana akar; dokunmatikte ve azaltılmış harekette yerel yatay kaydırıcı." />,
    "scroll-progress": () => <ComponentDemo folder="landing/scroll-progress" title="Okuma ilerlemesi" desc="Sayfanın ya da bir makalenin ne kadarının okunduğunu gösteren ince çubuk." />,
    "reveal": () => <ComponentDemo folder="landing/reveal" title="Kaydırınca belirme" desc="Solma, yükselme, baştan ya da sondan kayma (RTL'de aynalı), ölçek, bulanıklık, çevirme; sırayla ya da kaydırmaya bağlı." />,
    "parallax": () => <ComponentDemo folder="landing/parallax" title="Parallax" desc="Her katman kendi hızında kayar; fare izleme açıkken derinliğine göre kayar. Yalnız transform." />,
    "project-grid": () => <ComponentDemo folder="landing/project-grid" title="Proje ızgarası" desc="Süzgeç çipleri; seçince kalanlar yeni yerlerine süzülür (FLIP). Açınca kapak Lightbox'ta ya da ayrıntı sayfasında." />,
    "project-detail": () => <ComponentDemo folder="landing/project-detail" title="Proje ayrıntısı" desc="Bir projeye tıkla: kapak ayrıntı sayfasındaki yerine büyür (paylaşılan öğe geçişi); geri dönüşte küçülür." />,
    "presentation": () => <ComponentDemo folder="landing/presentation" title="Sunum" desc="Ok tuşları, boşluk, kaydırma, dokunma; adım adım maddeler; konuşmacı görünümü (sonraki slayt, notlar, süre)." />,
    "video-background": () => <ComponentDemo folder="landing/video-background" title="Video arka plan" desc="Sessiz döngü, önce poster; görünmüyorken durur, veri tasarrufu ve azaltılmış harekette yalnız poster. Durdur düğmesi var." />,
    "cta-band": () => <ComponentDemo folder="landing/cta-band" title="Eylem bandı" desc="Sayfa sonundaki çağrı paneli: gradyan, ağ, cam, sade ya da video arka plan; imleç ışığı." />,
    "newsletter": () => <ComponentDemo folder="landing/newsletter" title="Bülten formu" desc="Doğrulama, bekleme düğmesi, başarıda beliren onay, hatada sallanan alan ve okunan ileti." />,
    "site-footer": () => <ComponentDemo folder="landing/site-footer" title="Altbilgi" desc="Marka, bağlantı sütunları, sosyal bağlantılar, bülten, yasal satır, başa dön ve büyük yazı." />,
    "before-after": () => <ComponentDemo folder="landing/before-after" title="Önce / sonra" desc="İki katman, aralarında sürüklenen bir ayırıcı. Herhangi bir yere basınca ayırıcı oraya atlar; tutamak klavyeyle de kayar; imleci izleme modunda basmak gerekmez. İlk göründüğünde bir kez sallanır." />,
    "not-for-you": () => <ComponentDemo folder="landing/not-for-you" title="Kimin için değil" desc="Anti-landing bloğu: kimin için olmadığı ve kimin için olduğu. İşaretlenebilir modda her satır bir anahtar; altta sonuç cümlesi değişir ve ekran okuyucuya okunur." />,
    "honest-compare": () => <ComponentDemo folder="landing/honest-compare" title="Dürüst karşılaştırma" desc="Var / kısmen / yok ya da metin. Her satırda ürün en iyi rakiple kıyaslanır: önde, eşit ya da geride. Geride olunan satırın notu hep görünür; süzgeç yalnız onları bırakır. İlk sütun yatay kaydırmada sabit." />,
    "live-feed": () => <ComponentDemo folder="landing/live-feed" title="Canlı akış" desc="Satırlar ya da duvar. Liste bir sinyalden (en yeni başta) ya da next() ile her birkaç saniyede bir gelir; yalnız ekrandayken çeker. İmleç ya da odak içerideyken ve Durdur düğmesiyle durur (WCAG 2.2.2); yeni öğeler varsayılan olarak okunmaz." />,
    "live-counter": () => <ComponentDemo folder="landing/live-counter" title="Canlı sayaç" desc="Değer sunucudan bir sinyalle gelir ya da başlangıç ve dakikadaki artışla hareket saatinde küçük adımlarla büyür; yalnız ekrandayken. Basamaklar odometre gibi döner, canlı noktası nabız gibi atar." />,
    "branching-story": () => <ComponentDemo folder="landing/branching-story" title="Dallanan hikâye" desc="Her bölüm seçimlerle biter; seçilen düğme parlar, diğerleri söner, sayfa okuma yönünden döner (geri giderken öbür yandan, RTL'de aynalı). Üstteki yolda herhangi bir adıma dokununca oraya döner; bulunan sonlar sayılır. Odak yeni bölüm başlığına geçer." />,
    "site-section": () => <ComponentDemo folder="landing/site-section" title="Bölüm çerçevesi" desc="Her bloğun çerçevesi: genişlik, dikey ritim, ton ve beliren başlık grubu." />,
  }
  return <Hub section="/web" kicker="Web tasarım araçları" title="Bileşenler" lead="Tanıtım, ana sayfa, portfolyo ve sunum için bloklar. Bunlarla kurulmuş tam uygulamalar Örnek uygulamalar bölümünde. Her blok mevcut bileşenlerden kurulur, hareket motoruyla canlanır, temaya, RTL'ye ve dile uyar. Yalnız kullanılan blok derlenir." render={RENDER} params={props.params} />
}

export default function WebPage(props: { params?: { rest?: string } }) {
  // a sample site used to open here (/web/product, /web?view=product): it now has its own address under /sites
  const rest = (props.params?.rest ?? "").split("/")[0] ?? "", legacy = rest || String(query()["view"] ?? "")
  if (legacy && (HUBS["/sites"] ?? []).some((x) => x.slug === legacy)) {
    const q = new URLSearchParams(globalThis.location?.search ?? ""); q.delete("view")
    const qs = q.toString()
    queueMicrotask(() => void navigate(`/sites/${legacy}${qs ? `?${qs}` : ""}` as never, { replace: true }))
    return null
  }
  return <Blocks params={props.params} />
}
