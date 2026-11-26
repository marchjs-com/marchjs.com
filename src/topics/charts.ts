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
  { slug: "analog-clock", title: "Analog saat", name: "AnalogClock", desc: "Akrep, yelkovan ve saniye ibreli saat; saat dilimi ve kendi zaman kaynağı.", group: "Göstergeler" },
  { slug: "stopwatch", title: "Kronometre", name: "Stopwatch", desc: "Başlat, durdur, tur, sıfırla; alt kadran ve tur listesi.", group: "Göstergeler" },
  { slug: "compass", title: "Pusula", name: "Compass", desc: "Dönen gül ya da ibre, yön harfleri, hedef rota.", group: "Göstergeler" },
  { slug: "altimeter", title: "Altimetre", name: "Altimeter", desc: "Üç ibreli irtifa kadranı ve basınç penceresi.", group: "Göstergeler" },
  { slug: "attitude-indicator", title: "Yapay ufuk", name: "AttitudeIndicator", desc: "Yunuslama ve yatış: gök, yer, merdiven, yatış ölçeği.", group: "Göstergeler" },
  { slug: "thermometer", title: "Termometre", name: "Thermometer", desc: "Yaylı sıvı sütunu, °C / °F, renkli bölgeler.", group: "Göstergeler" },
  { slug: "battery-gauge", title: "Pil göstergesi", name: "BatteryGauge", desc: "Dolgu ya da hücreler, düşük / kritik, şarj.", group: "Göstergeler" },
  { slug: "dot-matrix", title: "LED nokta ekran", name: "DotMatrix", desc: "5×7 noktalı LED tabela: metin ve sayılar, kayan yazı, silme / dağılma geçişi, kendi glifleriniz.", group: "Göstergeler" },
  { slug: "split-flap", title: "Yaprak tabela", name: "SplitFlap", desc: "Kalkış panosu gibi: her hücre harf makarasını kanat kanat çevirir; Türkçe büyük harf.", group: "Göstergeler" },
  { slug: "flip-clock", title: "Yaprak saat", name: "FlipClock", desc: "Saat, dakika, saniye kartları; yanıp sönen ayraç, 12 saatte ÖÖ/ÖS, saat dilimi ya da kendi zamanınız.", group: "Göstergeler" },
  { slug: "stereo-vu", title: "Stereo VU", name: "StereoVu", desc: "Tek panelde sol / sağ ibreli VU ölçer, tepe ışıkları; metal, koyu ya da ahşap panel.", group: "Ses" },
  { slug: "loudness-graph", title: "Ses yüksekliği (LUFS)", name: "LoudnessGraph", desc: "LUFS geçmişi −14 / −23 hedef çizgileriyle, stereo korelasyon grafiği ve canlı göstergeler.", group: "Ses" },
];
