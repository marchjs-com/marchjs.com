import { definePlayground } from "../../spec.ts";

interface Values { sample: number; cols: number; filters: boolean; arrow: string; color: string; motion: boolean }

// sample projects for the raw component in MarchIDE (plain JSON: image covers of the showcase, size reserved)
const DUSK = { src: "/media/dusk.jpg", width: 1200, height: 800 };
const WAVES = { src: "/media/hadi-waves.jpg", width: 960, height: 540 };
const SAMPLE = [
  { id: "aurora-bank", title: "Aurora Bank", category: "Marka", year: 2026, summary: "Yeni kimlik ve web sitesi.", cover: { ...DUSK, alt: "Gün batımı" } },
  { id: "kite-app", title: "Kite uygulaması", category: "Uygulama", year: 2026, summary: "Seyahat planlayıcı, iOS ve Android.", cover: { ...WAVES, alt: "Renkli dalgalar" } },
  { id: "lumen", title: "Lumen panosu", category: "Web", year: 2025, summary: "Gerçek zamanlı analitik.", cover: { ...WAVES, alt: "Dalgalar" } },
  { id: "orbit", title: "Orbit konferansı", category: "Marka", year: 2025, summary: "Etkinlik kimliği ve hareket.", cover: { ...DUSK, alt: "Akşam ışığı" } },
  { id: "pinecrest", title: "Pinecrest mağaza", category: "Web", year: 2024, summary: "E-ticaret yeniden tasarımı.", cover: { ...DUSK, alt: "Vadi" } },
  { id: "quanta", title: "Quanta sağlık", category: "Uygulama", year: 2024, summary: "Hasta takip uygulaması.", cover: { ...WAVES, alt: "Mavi dalgalar" } },
];

export default definePlayground<Values>({
  options: [
    // the raw component in MarchIDE (and the card's code) gets this many sample projects: a projects array cannot come from a slider
    { key: "sample", label: "Örnek projeler", default: 6, min: 0, max: 6, step: 1, prop: "projects", toCode: (n) => (Number(n) ? `{${JSON.stringify(SAMPLE.slice(0, Number(n)))}}` : null) },
    { key: "cols", label: "Sütun", default: 3, options: [{ value: 2, label: "2" }, { value: 3, label: "3" }] },
    { key: "filters", label: "Süzgeç çipleri", default: true, toCode: { true: null, false: "{false}" } },
    { key: "color", label: "Seçili çip rengi", default: "default", options: [{ value: "default", label: "vurgu rengi" }, { value: "brand-purple", label: "mor" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-green", label: "yeşil" }], visibleWhen: (v) => v.filters, prop: "m:color", toCode: { default: null } },
    { key: "motion", label: "Süzerken hareket", default: true, toCode: { true: null, false: "{false}" }, visibleWhen: (v) => v.filters },
    { key: "arrow", label: "Kapak rozeti (üstüne gelince)", default: "on", options: [{ value: "on", label: "ok" }, { value: "own", label: "kendi içeriğim (yıl)" }, { value: "off", label: "yok" }], toCode: { on: null, off: "{false}", own: "{(p) => <span>{p.year}</span>}" } },
  ],
});
