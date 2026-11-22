// The topics of /ide-shell (one page each, /ide-shell/<slug>): titles, one-line descriptions, groups. The section page loads
// only this file; src/topics.ts gathers every section for the menu, MarchIDE and the start-up titles.
import type { Topic } from "./types.ts";

export const TOPICS: readonly Topic[] = [
  { slug: "live", title: "Canlı demo", desc: "Bu sayfadaki bileşenlerin hepsiyle kurulu küçük bir editör: dosya ağacı, sekmeli editörler, ayarlar…", group: "Kabuk" },
  { slug: "app-ui", title: "march-app-ui", name: "AppUI", desc: "March IDE çekirdeği: üst çubuk, Yerleşim menüsü, yan ve alt yuvalar, çalışma alanı", group: "Karmaşık bileşenler" },
  { slug: "dock-layout", title: "Kenetlenen paneller", name: "DockLayout", desc: "Sekmeyi bir grubun kenarına, ortasına ya da alanın kenarına bırak; kapatınca şeride daralır, açınca eski boyutuyla döner", group: "Karmaşık bileşenler" },
  { slug: "network-throttle", title: "Ağ hızı", name: "NetworkThrottle", desc: "Çevrimdışı, yavaş / hızlı 3G, 4G ya da kendi bant genişliğin ve gecikmen; hız göstergesi ve canlı istek şelalesi", group: "Karmaşık bileşenler" },
  { slug: "property-grid", title: "Özellik ızgarası", name: "PropertyGrid", desc: "Gruplu, aranabilir satırlar; her tür kendi form denetimiyle düzenlenir.", group: "Karmaşık bileşenler" },
  { slug: "overflow-toolbar", title: "Taşan araç çubuğu", name: "OverflowToolbar", desc: "Genişliği daralt: önceliği en düşük öğeler “Daha fazla” menüsüne geçer, yer açılınca kayarak geri gelir.", group: "Eylemler" },
  { slug: "status-bar", title: "Durum çubuğu", name: "StatusBar", desc: "Başta ve sonda öğeler; düğmeler bir eylem ya da komut çalıştırır.", group: "Yerleşim" },
  { slug: "activity-bar", title: "Etkinlik çubuğu", name: "ActivityBar", desc: "Yan görünümü değiştirir; gösterge etkin simgeye kayar.", group: "Gezinme" },
  { slug: "breadcrumbs", title: "Sayfa yolu", name: "Breadcrumbs", desc: "Dosya yolu; kardeşi olan parça menü açar.", group: "Gezinme" },
];
