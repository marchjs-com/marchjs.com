// Navigation: NavSidebar — title, a "search or ask" box (Ctrl K), a featured item with a live badge, recent items,
// collapsible categories (with counts, "expand/collapse all"). The showcase's own side menu is the same component.
import { NavSidebar, Button, Card, Kbd, Stack, Segmented, Toggle, Field, Slider } from "hadi-march/ui";
import {
  inbox, users, crown, shieldCheck, hourglass, wallet, diamond, receipt, creditCard, image, flag, eye, barChart, gauge, globe, settings, store, truck, packageBox, plus, minus,
} from "hadi-march/icons";
import { Demo } from "../demo.tsx";
import { Hub } from "../hub.tsx";
import { ComponentDemo } from "../component-demo.tsx";
import { Playground } from "../playground.tsx";
import { Link } from "hadi-march/router";
import "./navigation.css";

const CATEGORY_ICONS = { "Üyeler ve roller": users, "Ekonomi ve ödemeler": wallet, "İçerik ve moderasyon": image, "Raporlar ve analiz": barChart, "Mağaza ve ticaret": store }
const ITEMS = [
  { id: "owners", label: "Yöneticiler", icon: crown, group: "Üyeler ve roller" },
  { id: "members", label: "Üyeler", icon: users, group: "Üyeler ve roller" },
  { id: "invites", label: "Davet bağlantıları ve toplu üye içe aktarma geçmişi", icon: users, group: "Üyeler ve roller" },
  { id: "roles", label: "Roller", icon: shieldCheck, group: "Üyeler ve roller" },
  { id: "waiting-room", label: "Bekleme Salonu", icon: hourglass, group: "Üyeler ve roller" },
  { id: "diamonds", label: "Elmas & Akçe", icon: diamond, group: "Ekonomi ve ödemeler" },
  { id: "payments", label: "Ödemeler", icon: creditCard, group: "Ekonomi ve ödemeler" },
  { id: "refunds", label: "İadeler", icon: receipt, group: "Ekonomi ve ödemeler" },
  { id: "moderation", label: "Moderasyon", icon: eye, group: "İçerik ve moderasyon" },
  { id: "reports", label: "Modere edilecek gönderiler", icon: flag, group: "İçerik ve moderasyon" },
  { id: "statistics", label: "İstatistik", icon: barChart, group: "Raporlar ve analiz" },
  { id: "operations", label: "Operasyon", icon: gauge, group: "Raporlar ve analiz" },
  { id: "usage-map", label: "Kullanım haritası", icon: globe, group: "Raporlar ve analiz" },
  { id: "store-settings", label: "Mağaza ayarları", icon: settings, group: "Mağaza ve ticaret" },
  { id: "couriers", label: "Kuryeler", icon: truck, group: "Mağaza ve ticaret" },
  { id: "store-products", label: "Mağaza ürünleri", icon: packageBox, group: "Mağaza ve ticaret" },
]

export default function Navigation(props: { params?: { rest?: string } }) {
  let $waiting = 0
  let $picked = "—"
  let $resizable = true
  let $collapse = true
  let $startWidth = 280
  let $minWidth = 200
  let $maxWidth = 440
  let $liveWidth = 280
  const items = ITEMS.map((x) => ({ ...x, onSelect: () => { $picked = x.label } }))
  const featured = [{ id: "support", label: "Destek talepleri", icon: inbox, badge: () => $waiting,
    sub: () => ($waiting ? `${$waiting} talep yanıt bekliyor` : "Yanıt bekleyen talep yok"), onSelect: () => { $picked = "Destek talepleri" } }]
  const RENDER: Record<string, () => unknown> = {
    "routing": () => <Demo wide title="Yönlendirici: kalıcı yerleşim, adlı outlet, modal rota" desc="İç içe yerleşim (sekme değişince yerleşimdeki metin kalır), yanda açılan kayıt (adreste ?~aside=), pencerede açılan kayıt (geri tuşu kapatır, yenileyince tam sayfa) ve üst çubuğa sayfanın kendi düğmeleri (Portal)."
    code={`createRouter({
routes: { "/team": { load: () => import("./list.tsx"), layouts: [shell, teamLayout] } },
outlets: { aside: { "/item/:id": () => import("./item.tsx") } },
})
// teamLayout: <Outlet /> + <Outlet name="aside" />
<Link href="/item/3" outlet="aside">Open beside</Link>
<Link href="/team/item/3" modal>Open over the list</Link>
<Portal to="toolbar"><Button>New record</Button></Portal>`}>
    <Link href="/navigation/router" class="hm-btn hm-btn-primary">Yönlendirici demosunu aç</Link>
  </Demo>,
    "admin-sidebar": () => <Demo wide title="Yönetim paneli kenar çubuğu" desc="Yaz: süzer (ö/o, ı/i katlanır). ↑ ↓ Home End gez, → kategoriyi aç, ← kapat ya da kategoriye dön, Enter seç. Rozet canlı: talep ekle."
    code={`<NavSidebar title="HADİ Yönetim"
items={[{ id: "members", label: "Üyeler", icon: users, href: "/members", group: "Üyeler ve roller" }, …]}
featured={[{ id: "support", label: "Destek talepleri", icon: inbox, href: "/support-tickets",
            badge: () => $pending, sub: () => $pending ? \`\${$pending} talep yanıt bekliyor\` : "Yanıt bekleyen talep yok" }]}
recent={5} groupIcons={CATEGORY_ICONS} collapsible />`}>
    <div class="sc-sb-demo">
      <div class="sc-sb-frame">
        <NavSidebar items={items} featured={featured} title="HADİ Yönetim" groupIcons={CATEGORY_ICONS} storageKey="sc.sb.demo" hotkey={false} recent={5} palette={false} label="Örnek kenar çubuğu" />
      </div>
      <Card title="Durum">
        <Stack gap={3}>
          <p class="hm-muted">Seçilen: <strong>{$picked}</strong></p>
          <div class="sc-row"><Button size="sm" icon={plus} on:click={() => { $waiting++ }}>Talep ekle</Button><Button size="sm" variant="ghost" icon={minus} on:click={() => { $waiting = Math.max(0, $waiting - 1) }}>Yanıtla</Button></div>
          <p class="hm-muted">Bu vitrinin sol menüsünde <Kbd keys="mod+k" /> komut paletini açar; ray düğmesi menüyü ikonlara daraltır.</p>
        </Stack>
      </Card>
    </div>
  </Demo>,
    "resizable-sidebar": () => <Demo wide title="Genişletilebilir kenar çubuğu" desc="İç kenardaki ince tutamağı sürükle (dokunmatikte de), çift tıkla: başlangıç genişliği. Tutamağa Tab ile gel: ← → 16 px (Shift: 64), Home/End en dar/en geniş. collapseBelow altına çekince yalnız ikon moduna geçer. Bu vitrinin sol menüsü de böyle."
    code={`<NavSidebar items={items} resizable width="18rem" minWidth={220} maxWidth={420}
collapseBelow={150} persist onResize={(w) => console.log(w)} />`}>
    <p class="hm-muted">Genişlik: <strong>{() => `${$liveWidth} px`}</strong></p>
    <Playground options={[
      { label: "resizable", get: () => $resizable, set: (v: boolean) => { $resizable = v } },
      // without resizing, the limits and collapseBelow have no effect
      { label: "collapseBelow={150}", get: () => $collapse, set: (v: boolean) => { $collapse = v }, visibleWhen: () => $resizable },
      { label: "width (başlangıç)", get: () => $startWidth, set: (v: number) => { $startWidth = v }, min: 220, max: 400, step: 10, unit: " px" },
      { label: "minWidth", get: () => $minWidth, set: (v: number) => { $minWidth = v }, min: 160, max: 300, step: 10, unit: " px", visibleWhen: () => $resizable },
      { label: "maxWidth", get: () => $maxWidth, set: (v: number) => { $maxWidth = v }, min: 320, max: 600, step: 10, unit: " px", visibleWhen: () => $resizable },
    ]}>
    <div class="sc-resize-frame">
      {() => {
        const opts = { resizable: $resizable, width: $startWidth, minWidth: $minWidth, maxWidth: $maxWidth, collapseBelow: $collapse ? 150 : undefined }
        return <NavSidebar items={items} featured={featured} title="Panel" groupIcons={CATEGORY_ICONS} storageKey={`sc.sb.resize.${opts.width}.${opts.minWidth}.${opts.maxWidth}`} persist={false}
          hotkey={false} palette={false} label="Genişletilebilir örnek" collapsible={$collapse} {...opts} onResize={(w: number) => { $liveWidth = w }} />
      }}
      <div class="sc-resize-content"><p class="hm-muted">Sayfa içeriği: kenar çubuğu genişledikçe bu alan daralır.</p></div>
    </div>
    </Playground>
  </Demo>,
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
  return <Hub base="/navigation" kicker="Gezinme" title="Gezinme" lead="NavSidebar: büyük panellerin kenar çubuğu. Arama kutusu bütün öğeleri süzer; son ziyaretler ve açık kategoriler hatırlanır; klavyeyle tam gezilir; dar ekranda çekmece, geniş ekranda ikon rayına daraltılır. Bu vitrinin sol menüsü de aynı bileşen." render={RENDER} params={props.params} />
}
