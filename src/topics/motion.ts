// The topics of /motion (one page each, /motion/<slug>): titles, one-line descriptions, groups. The section page loads
// only this file; src/topics.ts gathers every section for the menu, MarchIDE and the start-up titles.
import type { Topic } from "./types.ts";

export const TOPICS: readonly Topic[] = [
  { slug: "spring-tween", title: "Yay ve tween", desc: "Aynı hedef, iki fizik: yay (aşar ve oturur) ve sekme eğrili tween.", group: "Temeller" },
  { slug: "numbers", title: "Hareketli sayılar", desc: "tween ile değer akışı; tabular rakamlar zıplamaz.", group: "Temeller" },
  { slug: "flip", title: "FLIP listeler", desc: "Ekle, karıştır, sil: öğeler yeni yerlerine kayar (<For animate>).", group: "Temeller" },
  { slug: "timeline-stagger", title: "Zaman çizelgesi ve stagger", desc: "Ortadan dışa doğru gecikmeli giriş, ardından dönüş.", group: "Temeller" },
  { slug: "gestures", title: "Jestler", desc: "Sürükle (geri yaylanır, ok tuşlarıyla da), mıknatıslı düğme, basınca küçülme.", group: "Temeller" },
  { slug: "spotlight", title: "Spot ışığı, parçacıklar, parallax", desc: "İmleci kartın üstünde gezdir; parçacıklar imlece tepki verir; görsel katmanlar farklı hızda kayar.", group: "Temeller" },
  { slug: "reveal", title: "Kayınca belir", desc: "reveal ve inView: görünür alana girince bir kez oynar.", group: "Temeller" },
  { slug: "svg", title: "SVG animasyonları", desc: "Yol çizimi, şekil morph, yol boyunca, kırpma, SVG filtreleri.", group: "Kütüphane" },
  { slug: "morph", title: "Morph", desc: "Düğme → diyalog, kart → sayfa, paylaşılan öğe, ikon ve şekil morph.", group: "Kütüphane" },
  { slug: "pages", title: "Sayfa geçişi efektleri", desc: "Daire, silme, yığın, küp, çevir, perde, panjur, piksel, morph.", group: "Kütüphane" },
  { slug: "micro", title: "Mikro etkileşimler", desc: "Dalga, mıknatıs, eğim ve katman parallax, yaylı basma, durum morph.", group: "Kütüphane" },
  { slug: "scroll", title: "Kaydırma animasyonları", desc: "Kaydırma zaman çizelgesi, parallax katmanları, yapışkan sahne, ilerleme.", group: "Kütüphane" },
  { slug: "lists", title: "Liste animasyonları", desc: "Ekle / kaldır / sırala FLIP, çıkış kopyası, sırayla giriş.", group: "Kütüphane" },
];
