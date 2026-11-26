import { definePlayground } from "../../spec.ts";

interface Values { data: string; progress: number; seekable: boolean; regions: boolean; regionLabels: boolean; playhead: boolean; align: string;
  bars: number; barWidth: number; gap: number; rounded: boolean; height: number; color: string; progressColor: string; motion: boolean; label: string }

const PEAKS = "[0.2, 0.6, 0.9, 0.5, 0.3, 0.8, 0.7, 0.4, 0.95, 0.6, 0.3, 0.5]";

export default definePlayground<Values>({
  options: [
    // where the bars come from: peaks (a podcast episode on the stage), the live demo music, or decorative recording bars
    { key: "data", label: "Veri", default: "peaks", options: [{ value: "peaks", label: "tepeler (peaks)" }, { value: "source", label: "canlı ses (source)" }, { value: "live", label: "süs (live)" }],
      prop: "peaks", toCode: { peaks: `{${PEAKS}}`, source: { peaks: null, source: '{audioSource("demo")}' }, live: { peaks: null, live: "" } },
      toProps: (x) => (x === "peaks" ? { peaks: JSON.parse(PEAKS) } : x === "source" ? { source: 0.6 } : { live: true }) },
    { key: "progress", label: "Konum (progress)", default: 35, min: 0, max: 100, step: 1, unit: "%", visibleWhen: (v) => v.data === "peaks",
      toCode: (x) => `{${Number(x) / 100}}`, toProp: (x) => Number(x) / 100 },
    { key: "seekable", label: "Basıp atlama (seekable)", default: true, visibleWhen: (v) => v.data === "peaks" },
    { key: "regions", label: "Bölümler (regions)", default: false, visibleWhen: (v) => v.data === "peaks",
      toCode: (x) => (x ? '{[{"start":0,"end":0.3,"label":"Giriş"},{"start":0.3,"end":1,"label":"Söyleşi","color":"brand-orange"}]}' : null),
      // off: an empty list (undefined would leave the regions written in the code in place)
      toProp: (x) => (x ? [{ start: 0, end: 0.3, label: "Giriş" }, { start: 0.3, end: 1, label: "Söyleşi", color: "brand-orange" }] : []) },
    { key: "regionLabels", label: "Bölüm adları (regionLabels)", default: true, visibleWhen: (v) => v.data === "peaks" && v.regions, toCode: (x) => (x ? null : "{false}") },
    { key: "playhead", label: "Oynatma çizgisi (playhead)", default: true, visibleWhen: (v) => v.data === "peaks", toCode: (x) => (x ? null : "{false}") },
    { key: "align", label: "Hizalama (align)", default: "mirror", options: [{ value: "mirror", label: "ortalı" }, { value: "bottom", label: "tabanda" }], toCode: { mirror: null } },
    { key: "bars", label: "Çubuk sayısı (bars; 0 = sığdığı kadar)", default: 0, min: 0, max: 120, step: 4, visibleWhen: (v) => v.data !== "live",
      toCode: (x) => (x ? `{${x}}` : null), toProp: (x) => (x ? x : undefined) },
    { key: "barWidth", label: "Çubuk genişliği (barWidth)", default: 3, min: 1, max: 10, step: 1, unit: "px", visibleWhen: (v) => !v.bars || v.data === "live", toCode: (x) => (x === 3 ? null : `{${x}}`) },
    { key: "gap", label: "Aralık (gap)", default: 2, min: 0, max: 8, step: 1, unit: "px", toCode: (x) => (x === 2 ? null : `{${x}}`) },
    { key: "rounded", label: "Yuvarlak uçlar (rounded)", default: true, toCode: (x) => (x ? null : "{false}") },
    { key: "height", label: "Yükseklik (height)", default: 64, min: 16, max: 160, step: 8, unit: "px", toCode: (x) => (x === 48 ? null : `{${x}}`) },
    { key: "color", label: "Çubuk rengi (color)", default: "", options: [{ value: "", label: "varsayılan" }, { value: "neutral", label: "nötr" }, { value: "brand-blue", label: "mavi" }, { value: "brand-pink", label: "pembe" }],
      toProp: (x) => (x || undefined), toCode: (x) => (x ? JSON.stringify(x) : null) },
    { key: "progressColor", label: "Çalınan renk (progressColor)", default: "", options: [{ value: "", label: "vurgu" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-green", label: "yeşil" }, { value: "brand-purple", label: "mor" }],
      visibleWhen: (v) => v.data === "peaks", toProp: (x) => (x || undefined), toCode: (x) => (x ? JSON.stringify(x) : null) },
    { key: "motion", label: "Hareket (motion)", default: true, toCode: (x) => (x ? null : "{false}") },
    { key: "label", label: "Erişilebilir ad (label)", default: "Bölüm konumu", kind: "text", visibleWhen: (v) => v.data !== "live" },
  ],
});
