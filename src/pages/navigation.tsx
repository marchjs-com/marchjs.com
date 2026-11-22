// Navigation: one MarchIDE page per navigation component (and the router: /navigation/routing) (NavSidebar, Tabs, Breadcrumbs, …).
import { Hub } from "../hub.tsx";
import { TOPICS } from "../topics/navigation.ts";
import { ComponentDemo } from "../component-demo.tsx";
import "./navigation.css";

export default function Navigation(props: { params?: { rest?: string } }) {
  const RENDER: Record<string, () => unknown> = {
    "thread-nav": () => <ComponentDemo folder="navigation/thread-nav" title="ThreadNav: iplik gezinme" desc="Uygulamanın gezinmesi bir iplik: bölümler Dock gibi büyüyen boncuklar, bir boncuk kategorilerin kapsülünü açar, kategorinin sayfaları ikinci bir iplikte sarkar, damla bulunduğun yeri gösterir ve oraya akar." />,
    "section-timeline": () => <ComponentDemo folder="navigation/section-timeline" title="SectionTimeline: bölüm zaman çizelgesi" desc="Uzun bir sayfanın her bölümü için bir nokta; okunan bölüm renkli, basınca oraya kayar. İmleç yaklaşınca Dock gibi büyür, adlar açılır. Dikey ya da yatay; istenirse adres satırı okunan bölümü izler." />,
    "page-dots": () => <ComponentDemo folder="navigation/page-dots" title="PageDots: sayfa noktaları" desc="Sayfa başına bir nokta; etkin olan uzar ve renklenir. onChange verilirse noktalar düğmedir (ok tuşları, Home / End), verilmezse yalnız konumu gösterir." />,
    "period-nav": () => <ComponentDemo folder="navigation/period-nav" title="PeriodNav: dönem gezinme" desc="Takvimin dönemini adımlayan küçük grup: önceki, bugün, sonraki. Başlık verilirse dönemin adı okların arasında durur (Calendar ay satırı), verilmezse üç düğme bitişik tek denetimdir (Scheduler çubuğu). Oklar sağdan sola yazıda yer değiştirir." />,
    "nav-sidebar": () => <ComponentDemo folder="composite/nav-sidebar" title="NavSidebar: seçenekler" desc="Karmaşık bileşen: kategori sırası, ilk açılışta hangi kategorilerin açık olduğu, ikon rayına daraltma ve son kullanılanlar sayısı. Parçaları aşağıdaki satırda, her biri kendi sayfasına bağlı." />,
    "bottom-nav": () => <ComponentDemo folder="composite/bottom-nav" title="BottomNav: mobil sekme çubuğu" desc="Etkin sekmeye kayan renkli baloncuk, sayı ve nokta rozetleri, ortada dört HADİ rengiyle dönen halkalı Oluştur düğmesi. Sohbet sekmesine geçince rozet sıfırlanır; Oluştur rozeti artırır." />,
    "stepper": () => <ComponentDemo folder="navigation/stepper" title="Stepper: morph geçişli adımlar" desc="Vurgu eski adımdan yenisine sıvı gibi uzayıp oturur; adım içeriği gidiş yönüne göre bulanıklaşıp kayarak değişir (RTL'de aynalı), çerçeve yüksekliği izler. Adıma tıklayın ya da Geri / İleri." />,
    "pull-to-refresh": () => <ComponentDemo folder="feedback/pull-to-refresh" title="PullToRefresh: çekerek yenile" desc="Listenin en üstünde aşağı çekin (dokunma ya da fare). Eşiği geçince bırakın: gösterge döner, yenileme bitince içerik yerine oturur. Klavyede Tab ile gelen Yenile düğmesi aynı işi yapar." />,
    "tabs": () => <ComponentDemo folder="navigation/tabs" title="Tabs: sekmeli paneller" desc="Ok tuşlarıyla gezinme (RTL'de aynalı), sayı rozeti, devre dışı sekme; yalnız etkin panel çizilir. Üyeler sekmesindeki daveti onaylayınca rozet azalır." />,
    "steps": () => <ComponentDemo folder="navigation/steps" title="Steps: aşamalar" desc="Biten adımlar onaylı, geçerli adım vurgulu. onSelect verilince her adım bir düğme; dikey düzende açıklamalar alt alta." />,
    "pagination": () => <ComponentDemo folder="navigation/pagination" title="Pagination: sayfalama" desc="İlk ve son sayfa, geçerli sayfa ve komşuları görünür; aradakiler üç noktaya katlanır. Önceki / Sonraki uçlarda devre dışı." />,
    "nav-menu": () => <ComponentDemo folder="navigation/nav-menu" title="NavMenu: uygulama menüsü" desc="Gruplar, sabitlenen ve son kullanılan öğeler, süzme kutusu, ikon rayı. Dar ekranda menü düğmesiyle açılan çekmece olur." />,
    "overflow-text": () => <ComponentDemo folder="typography/overflow-text" title="Taşan metin: OverflowText ve Marquee" desc="Yalnız sığmayan metin kayar; sığan metin yerinde durur. Kenarlar mantıksal yönde solar; Arapça (RTL) ters yöne kayar; ekran okuyucu metni bir kez okur; azaltılmış harekette kaymaz." />,
  }
  return <Hub section="/navigation" topics={TOPICS} kicker="Gezinme" title="Gezinme" lead="NavSidebar: büyük panellerin kenar çubuğu. Arama kutusu bütün öğeleri süzer; son ziyaretler ve açık kategoriler hatırlanır; klavyeyle tam gezilir; dar ekranda çekmece, geniş ekranda ikon rayına daraltılır. Bu vitrinin sol menüsü de aynı bileşen." render={RENDER} params={props.params} />
}
