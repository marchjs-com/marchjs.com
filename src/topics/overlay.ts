// The topics of /overlay (one page each, /overlay/<slug>): titles, one-line descriptions, groups. The section page loads
// only this file; src/topics.ts gathers every section for the menu, MarchIDE and the start-up titles.
import type { Topic } from "./types.ts";

export const TOPICS: readonly Topic[] = [
  { slug: "overlay", title: "Dekoratif katman", name: "Overlay", desc: "Kartın içinde, içeriğin arkasında ya da önünde; katman tıklama almaz, düğme çalışmaya devam eder.", group: "Medya" },
  { slug: "media", title: "Medya", name: "Media", desc: "Kabına sığar, türü uzantıdan anlar; yüklenemezse yedek metin gösterir.", group: "Medya" },
  { slug: "carousel", title: "Kaydırmalı galeri", name: "Carousel", desc: "Geniş ekranda 1–4 slayt, telefonda bir slayt ve sonrakinin ucu; oklar uçlarda gizlenir, noktalar konumu…", group: "Medya" },
  { slug: "picture", title: "Resim", name: "Picture", desc: "Resim nesnesi ({ src, alt, width, height… }) ya da hazır düğüm: biri img olur, öteki olduğu gibi çizilir.", group: "Medya" },
  { slug: "corner-mark", title: "Köşe işareti", name: "CornerMark", desc: "Resmin, kartın ya da avatarın köşesindeki yuvarlak işaret: video, ok, artı.", group: "Medya" },
  { slug: "led-board", title: "LED pano", name: "LedBoard", desc: "Her yöne kayan yazı, emoji, gözler, saat, skor ve geri sayım sahneleri; silme, piksel yağmuru, iris geçişleri.", group: "LED" },
  { slug: "led-eyes", title: "LED gözler", name: "LedEyes", desc: "Kırpan, etrafa bakan, şaşıran, gülen canlı gözler; işaretçiyi izler, ağız da konuşur.", group: "LED" },
  { slug: "led-matrix", title: "LED matris", name: "LedMatrix", desc: "Canvas üzerinde nokta matris: yalnız değişen LED'ler boyanır; yuvarlak, kare, tüp; ışıma ve tarama çizgisi.", group: "LED" },
  { slug: "pixel-font", title: "Piksel yazı", name: "PixelFont", desc: "Tüm Türkçe harfli 5×7 ve kalın 8×8 piksel yazı tipi, satır içi :emoji: ile.", group: "LED" },
  { slug: "pixel-sprite", title: "Piksel çizim", name: "PixelSprite", desc: "Hazır piksel emoji ve simgeler ya da kendi .led.json çiziminiz; kare kare hareket.", group: "LED" },
];
