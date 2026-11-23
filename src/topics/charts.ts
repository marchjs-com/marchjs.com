// The topics of /charts (one page each, /charts/<slug>): titles, one-line descriptions, groups. The section page loads
// only this file; src/topics.ts gathers every section for the menu, MarchIDE and the start-up titles.
import type { Topic } from "./types.ts";

export const TOPICS: readonly Topic[] = [
  { slug: "line-chart", title: "Çizgi ve alan", name: "LineChart · AreaChart", desc: "Zaman, sayı ya da kategori ekseni; birden çok seri, sürükleyerek yakınlaştırma, ← → ile noktalar.", group: "Grafikler" },
  { slug: "bar-chart", title: "Çubuk grafik", name: "BarChart", desc: "Gruplu ya da yığılmış, dikey ya da yatay; veri değişince çubuklar kayar.", group: "Grafikler" },
  { slug: "pie-chart", title: "Pasta ve halka", name: "PieChart", desc: "Bütünün payları; halkanın ortasında toplam, dilimler odaklanır ve yeni açılara döner.", group: "Grafikler" },
  { slug: "heatmap", title: "Isı haritası", name: "Heatmap", desc: "Gün × saat ya da hafta takvimi; tema vurgusunun tonlarında yoğunluk.", group: "Grafikler" },
  { slug: "stat", title: "Gösterge", name: "Stat", desc: "Değer, önceki döneme göre değişim (iyi yeşil, kötü kırmızı) ve eğilim çizgisi.", group: "Grafikler" },
  { slug: "sparkline", title: "Eğilim çizgisi", name: "Sparkline", desc: "Eksensiz küçük çizgi: tablo hücresinde, liste satırında, göstergede.", group: "Grafikler" },
  { slug: "progress-ring", title: "İlerleme halkası", name: "ProgressRing", desc: "0–100 puan halkası; düşük / orta / yüksek düzey ya da birden çok renk.", group: "Grafikler" },
  { slug: "bar-list", title: "Çubuk listesi", name: "BarList", desc: "Sıralı yatay çubuklar: en çok ziyaret edilen sayfalar, ülkeler, şarkılar.", group: "Grafikler" },
];
