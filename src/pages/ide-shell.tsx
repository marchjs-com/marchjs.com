// IDE shell (Complex components): DockLayout, PropertyGrid, OverflowToolbar, StatusBar, ActivityBar, Breadcrumbs and the
// command palette, each as its own card, then a mini editor built only from them.
import "./ide.css";
import { Button } from "march/ui";
import { Hub } from "../hub.tsx";
import { TOPICS } from "../topics/ide-shell.ts";
import { ComponentDemo } from "../component-demo.tsx";
import { Demo } from "../demo.tsx";


export default function IdePage(props: { params?: { rest?: string } }) {
  const RENDER: Record<string, () => unknown> = {
    "live": () => <Demo wide title="Canlı demo: mini editör" desc="Bu sayfadaki bileşenlerin hepsiyle kurulu küçük bir editör: dosya ağacı, sekmeli editörler, ayarlar (PropertyGrid), konsol, komut paleti. Kendi sayfasında açılır.">
    <p><Button href="/ide-live" variant="primary">Mini editörü aç</Button></p>
  </Demo>,
    "app-ui": () => <ComponentDemo folder="composite/app-ui" title="AppUI: march-app-ui çekirdeği" desc="IDE kabuğunun tabanı: üst çubuk (başlık, araçlar, Yerleşim menüsü), yan yuva (ActivityBar), DockLayout çalışma alanı ve alt yuva (StatusBar). Yerleşim menüsünde hazır ve kayıtlı düzenler, paneller." />,
    "dock-layout": () => <ComponentDemo folder="composite/dock-layout" title="DockLayout: sürükle, bırak, yerleştir" desc="Sekmeyi bir grubun kenarına bırak: yeni bölme; ortasına ya da sekmelerin arasına: sekme; alanın kenarına: tüm yerleşimin kenarı. Daralt düğmesi grubu şeride indirir (satırda dikey, sütunda yatay), açınca eski boyutuyla döner. Ayırıcıyı çift tıkla: eşit boyut. Sağ tık ya da ⋯: panel menüsü." />,
    "network-throttle": () => <ComponentDemo folder="composite/network-throttle" title="NetworkThrottle: ağ hızı" desc="Bir ağ seç, sonra bir dosya yükle: istek o hızla gelir. Hazır ağlar (çevrimdışı, yavaş 3G, hızlı 3G, 4G, Wi-Fi, kısıtsız) ya da kendi gelen / giden bant genişliğin ve gecikmen. İbre hızı izler, şelalede her isteğin bekleme ve indirme süresi görünür. Bir kapsam verilirse yalnız o kod yavaşlar (MarchIDE önizlemesi böyle)." />,
    "property-grid": () => <ComponentDemo folder="composite/property-grid" title="PropertyGrid: özellik düzenleyici" desc="Gruplu, aranabilir satırlar; her tür kendi form denetimiyle düzenlenir. Her değişiklik bir geri alma adımı (Ctrl+Z ya da başlıktaki düğmeler), kaydedilmemiş değişiklikler DirtyState’e kayıtlı: sayfadan ayrılırken sorulur. Değişen satır işaretlenir, tek tek sıfırlanır." />,
    "overflow-toolbar": () => <ComponentDemo folder="actions/overflow-toolbar" title="OverflowToolbar: taşan öğeler menüye" desc="Genişliği daralt: önceliği en düşük öğeler “Daha fazla” menüsüne geçer, yer açılınca kayarak geri gelir. Öğe bir komut kimliği olabilir (Komut yöneticisi): başlık, ikon, kısayol ve etkinlik komuttan gelir." />,
    "status-bar": () => <ComponentDemo folder="layout/status-bar" title="StatusBar: durum çubuğu" desc="Başta ve sonda öğeler; düğmeler bir eylem ya da komut çalıştırır. Kaydediliyor durumunda nokta hareket motoruyla nefes alır; durum değişince ekran okuyucuya duyurulur. Daraldıkça önceliği düşük öğeler “…” menüsüne geçer." />,
    "activity-bar": () => <ComponentDemo folder="navigation/activity-bar" title="ActivityBar: görünüm çubuğu" desc="Yan görünümü değiştirir; gösterge etkin simgeye kayar. Etkin simgeye yeniden basınca yan görünüm kapanır. Rozetler, sonda duran öğeler, dikey ya da yatay." />,
    "breadcrumbs": () => <ComponentDemo folder="navigation/breadcrumbs" title="Breadcrumbs: yol çubuğu" desc="Dosya yolu; kardeşi olan parça menü açar. Daraltınca ortadaki parçalar “…” menüsünde toplanır, ilk ve son kalır." />,
  }
  return <Hub section="/ide-shell" topics={TOPICS} kicker="Karmaşık bileşenler" title="IDE kabuğu" lead="Editör ve geliştirici araçları için yerleşim parçaları; tabanı march-app-ui (AppUI ve DockLayout): sürükle-bırak panel yerleşimi, özellik düzenleyici, taşan araç çubuğu, durum ve etkinlik çubukları, yol çubuğu. Hepsi mevcut bileşenlerden kurulur ve komut paletine bağlanır." render={RENDER} params={props.params} />
}
