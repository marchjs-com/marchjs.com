// The topics of /layout (one page each, /layout/<slug>): titles, one-line descriptions, groups. The section page loads
// only this file; src/topics.ts gathers every section for the menu, MarchIDE and the start-up titles.
import type { Topic } from "./types.ts";

export const TOPICS: readonly Topic[] = [
  { slug: "grid-live", title: "Canlı karşılaştırma", desc: "Kart sayısını, sütunu ve kapsayıcı genişliğini değiştir; seçili mod tam genişlikte, altında beşi yan yana.", group: "Örnekler" },
  { slug: "grid-modes", title: "Beş mod yan yana", desc: "Aynı kart ve sütun sayısıyla; her kutu sabit bir sanal genişlikte (sütun başına 10rem) çizilip sığacak…", group: "Örnekler" },
  { slug: "grid", title: "Izgara", name: "Grid", desc: "Sütun sayısı, son satırın davranışı ve dengeleme.", group: "Yerleşim" },
  { slug: "stack", title: "Yığın, araç çubuğu ve ayraç", name: "Stack · Toolbar · Divider", desc: "Satır ya da sütun, boşluk belirteçleri (0–8), hizalama ve satır kaydırma; etiketli araç çubuğu ve ayraçlar.", group: "Yerleşim" },
  { slug: "joined", title: "Bitişik bütün", name: "Joined", desc: "İçine ne konursa kendi çerçevesini, köşesini, gölgesini bırakır; bütünün tek çerçevesi ve köşesi, aralarda çizgi; dikey ya da yatay.", group: "Yerleşim" },
  { slug: "spacer", title: "Boşluk", name: "Spacer", desc: "Kendinden sonrakileri satırın mantıksal sonuna iter; RTL'de aynalanır.", group: "Yerleşim" },
  { slug: "splitter", title: "Bölücü", name: "Splitter", desc: "Tutamacı sürükleyin ya da odaklayıp ← → (RTL'de aynalı), Home / End; Enter başlangıç payına döndürür.", group: "Yerleşim" },
  { slug: "accordion", title: "Akordeon", name: "Accordion", desc: "Varsayılan tek açık bölüm; birden çok açık seçeneği, yükseklik animasyonu, başlıklar arasında ↑ ↓ Home End.", group: "Yerleşim" },
  { slug: "disclosure", title: "Açılır bölüm", name: "Disclosure", desc: "Yerel details / summary üzerinde: klavye ve ekran okuyucu desteği hazır, açılıp kapanma animasyonlu.", group: "Yerleşim" },
  { slug: "layout", title: "Sayfa çerçevesi", name: "Layout", desc: "Değiştirilebilir sayfa çerçevesi", group: "Yerleşim" },
  { slug: "bottom-right-controls", title: "Sayfa köşeleri", name: "BottomRightControls", desc: "Sayfa çapı denetimler dört köşeden birine sırayla yerleşir, üst üste binmez; sağdan sola yazımda aynalanır.", group: "Yerleşim" },
  { slug: "overlay-scope", title: "Katman kapsamı", name: "OverlayScope", desc: "İçinde açılan çekmece, pencere, menü ve bildirim bu kutuda kalır; kipli pencere yalnız kutuyu kilitler.", group: "Yerleşim" },
  { slug: "window", title: "Pencere", name: "Window", desc: "Başlıktan sürükle; kenara bırakınca yarısına, üste bırakınca tamamına yerleşir; başlığa çift tıkla: alanı…", group: "Yerleşim" },
  { slug: "exploded-view", title: "Parçalarına ayır", name: "ExplodedView", desc: "Aynı öğeler eğilir, plaka plaka yükselir ve geri birleşir: bir kartın parçaları ya da bir öğenin katmanları.", group: "Yerleşim" },
  { slug: "device-preview", title: "Cihaz önizlemesi", name: "DevicePreview", desc: "Telefon, tablet ya da masaüstü penceresi, gerçek ekran boyu, dönme; fare 1–3 parmak: gerçek dokunma olayları, kıstırma, döndürme; kumandada salla, eğ, çevrimdışı, pil, klavye", group: "Yerleşim" },
  { slug: "device-picker", title: "Cihaz seçici", name: "DevicePicker", desc: "Onlarca telefon, tablet ve masaüstü ekranı; silüet, boyut, piksel oranı; arama, gruplar, dikey / yatay ve kendi cihazın", group: "Yerleşim" },
  { slug: "app-shell", title: "Uygulama kabuğu", name: "AppShell", desc: "Kenar çubuğu sütunu, üst duyuru ve kayan ana alan; önce gelen 'İçeriğe geç' bağlantısı.", group: "Yerleşim" },
  { slug: "panel-header", title: "Panel başlığı", name: "PanelHeader", desc: "Panelin üst (ya da alt) çubuğu: ikon, başlık, alt başlık, sayı, eylemler ve kapat düğmesi; sürükleme tutamacı da olur.", group: "Yerleşim" },
  { slug: "resize-handle", title: "Boyutlandırma tutamacı", name: "ResizeHandle", desc: "Kenardaki ya da köşedeki tutamaç: sürükle, ok tuşları, Home / End, Enter başa döndürür; tek görünüm.", group: "Yerleşim" },
];
