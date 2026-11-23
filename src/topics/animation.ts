// The topics of /animation (one page each, /animation/<slug>): titles, one-line descriptions, groups. The section page loads
// only this file; src/topics.ts gathers every section for the menu, MarchIDE and the start-up titles.
import type { Topic } from "./types.ts";

export const TOPICS: readonly Topic[] = [
  { slug: "global-control", title: "Global denetim", desc: "motion.config: hız, tümünü durdur, azaltılmış hareket, karakter ve yavaş çekim.", group: "Motor" },
  { slug: "one-engine", title: "Tek motor", desc: "Aynı timeline: bir kart (DOM, WAAPI), bir canvas dalgası ve bir WebGL gradyanı.", group: "Motor" },
  { slug: "presets", title: "Keyframe galerisi", desc: "installPresets(): adla oynat — animate(el, 'pop').", group: "Motor" },
  { slug: "timeline-editor", title: "Zaman çizelgesi düzenleyici", desc: "Çubukları sürükle (ya da oklarla kaydır), oynat, ters çevir; seek kaydırıcısı zamanı doğrudan ayarlar.", group: "Motor" },
  { slug: "curve-editor", title: "Eğri editörü", desc: "Tutamaçları sürükle: cubic-bezier.", group: "Motor" },
  { slug: "stagger-200", title: "200 öğe stagger", desc: "200 nokta, ızgara stagger'ı ortadan.", group: "Motor" },
  { slug: "keyframes-css", title: "Keyframe'ler → tek CSS dosyası", desc: "keyframesCss() (ya da tools/gen-motion-css.js) kayıtlardan @keyframes ve .m-anim-* sınıfları üretir;…", group: "Motor" },
];
