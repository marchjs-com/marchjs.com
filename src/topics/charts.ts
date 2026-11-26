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
  { slug: "gauge", title: "Kadran", name: "Gauge", desc: "İbreli kadran: bölgeler, kırmızı çizgi, yaylı ibre, tepe işareti; hız, devir, yarım ve VU.", group: "Göstergeler" },
  { slug: "odometer", title: "Sayaç çarkları", name: "Odometer", desc: "Mekanik, dijital ya da yaprak saat sayaç: sabit hane, kırmızı kesir çarkı, birim.", group: "Göstergeler" },
  { slug: "level-meter", title: "Seviye ölçer", name: "LevelMeter", desc: "Stüdyo tipi LED ölçer: sayı ya da canlı ses, stereo, tepe ve kırpılma ışığı, dB ölçeği.", group: "Göstergeler" },
  { slug: "oscilloscope", title: "Osiloskop", name: "Oscilloscope", desc: "Sesin dalga biçimi canlı: tetiklenen iz, fosfor izi, XY Lissajous; modern ya da retro CRT.", group: "Ses" },
  { slug: "spectrum", title: "Spektrum", name: "Spectrum", desc: "Sesin frekansları canlı: log ölçekli çubuklar, düşen tepe başlıkları; ayna, halka, çizgi.", group: "Ses" },
  { slug: "waveform", title: "Ses dalgası", name: "Waveform", desc: "Bir sesin çubukları: sesli mesaj, podcast; çalınan kısım renkli, bölümler, basıp atlama.", group: "Ses" },
  { slug: "audio-reactive", title: "Sese tepki veren", name: "AudioReactive", desc: "Sesle hareket eden sarmalayıcı: düzey ve bant CSS değişkenleri, hazır halka, nabız, ışıltı efektleri.", group: "Ses" },
];
