// The topics of /data (one page each, /data/<slug>): titles, one-line descriptions, groups. The section page loads
// only this file; src/topics.ts gathers every section for the menu, MarchIDE and the start-up titles.
import type { Topic } from "./types.ts";

export const TOPICS: readonly Topic[] = [
  { slug: "table", title: "Tablo", name: "Table", desc: "10.000 satır; sıralama, sütunlar, seçim, toplu işlem.", group: "Tablo ve listeler" },
  { slug: "tree", title: "Ağaç", name: "Tree", desc: "Genişleyen ağaç; ok tuşlarıyla gezinme.", group: "Tablo ve listeler" },
  { slug: "kanban", title: "Kanban", name: "Kanban", desc: "Sürükle bırak pano; klavyeyle taşıma.", group: "Tablo ve listeler" },
  { slug: "timeline", title: "Zaman akışı", name: "Timeline", desc: "Olaylar sırayla, tonlu noktalar.", group: "Tablo ve listeler" },
  { slug: "key-value", title: "Anahtar-değer", name: "KeyValue", desc: "Ayrıntı özeti; bir ile dört sütun.", group: "Ayrıntı" },
  { slug: "json-view", title: "JSON görünümü", name: "JsonView", desc: "Açılır JSON ağacı, türe göre renkler.", group: "Ayrıntı" },
  { slug: "code-view", title: "Kod görünümü", name: "CodeView", desc: "Salt okunur kod, satır numarası, renkler.", group: "Ayrıntı" },
  { slug: "card", title: "Kart", name: "Card", desc: "Başlık, eylemler, alt bilgi.", group: "Yapı taşları" },
  { slug: "badge", title: "Rozet", name: "Badge", desc: "Durum ve sayı.", group: "Yapı taşları" },
  { slug: "list-row", title: "Liste satırı", name: "ListRow", desc: "İkon, başlık, alt metin, son yuva; bağlantı, düğme ya da düz.", group: "Yapı taşları" },
  { slug: "stat-tile", title: "İstatistik karosu", name: "StatTile", desc: "Değer ve etiket; tıklanabilir, sayaçlı.", group: "Yapı taşları" },
  { slug: "icon-tile", title: "İkon karosu", name: "IconTile", desc: "Renkli zeminli yuvarlak köşeli karede ikon: dokuz ton ya da herhangi bir tema rengi.", group: "Yapı taşları" },
  { slug: "link-card", title: "Bağlantı kartı", name: "LinkCard", desc: "Tamamı bağlantı olan kart: ikon karosu, başlık, açıklama, sondaki metin ve üstüne gelince ok.", group: "Yapı taşları" },
  { slug: "time-ruler", title: "Zaman cetveli", name: "TimeRuler", desc: "Tikler, zaman etiketleri ve oynatma başı; sürüklenebilir ya da yalnız gösterge.", group: "Yapı taşları" },
];
