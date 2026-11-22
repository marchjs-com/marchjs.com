// The topics of /buttons (one page each, /buttons/<slug>): titles, one-line descriptions, groups. The section page loads
// only this file; src/topics.ts gathers every section for the menu, MarchIDE and the start-up titles.
import type { Topic } from "./types.ts";

export const TOPICS: readonly Topic[] = [
  { slug: "button", title: "Düğme", name: "Button", desc: "Beş varyant, üç boyut; yükleniyor düğmeyi kilitler ve ikonun yerinde çark döner.", group: "Eylemler" },
  { slug: "icon-button", title: "İkon düğmesi", name: "IconButton", desc: "Erişilebilir ad zorunlu; aynı ad ipucu olarak da görünür.", group: "Eylemler" },
  { slug: "button-group", title: "Düğme grubu", name: "ButtonGroup", desc: "Aralıklı ya da bitişik; bitişik şeritte yuvarlak uçlar RTL'de de dışta kalır.", group: "Eylemler" },
  { slug: "scroll-to-top", title: "Başa dön düğmesi", name: "ScrollToTop", desc: "Sayfa aşağı kayınca belirir, basınca yumuşakça başa döner; varsayılan olarak sayfa köşesine yerleşir.", group: "Eylemler" },
  { slug: "copy-button", title: "Kopyala düğmesi", name: "CopyButton", desc: "Kopyalandı der ve bunu ekran okuyucuya duyurur; pano yoksa bildirimle söyler.", group: "Eylemler" },
  { slug: "menu", title: "Menü ve açılır menü", name: "Menu · Dropdown", desc: "Ok tuşları, Home/End, Esc; kısayollar platforma göre yazılır, action() onaylı silme ve bildirimi getirir.", group: "Eylemler" },
  { slug: "chip", title: "Çip", name: "Chip", desc: "Etiket hapı: düz, seçilebilir süzgeç ya da kaldırılabilir; seçili işareti ve rengi değiştirilebilir.", group: "Eylemler" },
  { slug: "chevron", title: "Dönen ok", name: "Chevron", desc: "Açılınca döner; dört yön, RTL'de aynalanır, en yakın aria-expanded'ı kendisi izler.", group: "Eylemler" },
  { slug: "secret", title: "Gizli değer", name: "Secret", desc: "API anahtarı, kart numarası: dizinle gizli aralıklar, göz düğmesi ve kopyala; gizli karakterler sayfada hiç yer almaz.", group: "Tipografi" },
  { slug: "undo-redo", title: "Geri al / yinele", name: "UndoRedo", desc: "Düzenleyicilerin geri al / yinele düğme çifti; ipucunda adımın adı ve kısayol.", group: "Eylemler" },
];
