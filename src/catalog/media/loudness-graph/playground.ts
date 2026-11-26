import { definePlayground } from "../../spec.ts";

interface Values { input: string; level: number; show: string; targets: string; span: number; rate: number; range: string; correlation: boolean;
  readouts: boolean; legend: boolean; paused: boolean; motion: boolean; label: string }

export default definePlayground<Values>({
  options: [
    // the input: a tone whose loudness is the Seviye slider (a number source: no permission, it runs at once, so every
    // option shows), or the synthesized loop (it waits for "Müziği başlat")
    { key: "input", label: "Giriş (source)", default: "tone", options: [{ value: "tone", label: "ton" }, { value: "demo", label: "demo müzik" }],
      prop: "source", toCode: { tone: "{() => $level / 100}", demo: "{song}" }, toProp: (x, v) => (x === "demo" ? "demo" : (v.level ?? 40) / 100) },
    { key: "level", label: "Seviye", default: 40, min: 0, max: 100, step: 1, unit: "%", visibleWhen: (v) => v.input !== "demo", prop: "source",
      toCode: () => "{() => $level / 100}", toProp: (x) => Number(x) / 100 },
    { key: "show", label: "Çizgiler (show)", default: "ms", options: [{ value: "ms", label: "anlık + kısa" }, { value: "si", label: "kısa + bütünleşik" }, { value: "all", label: "üçü" }],
      toCode: { ms: null, si: '{["shortTerm", "integrated"]}', all: '{["momentary", "shortTerm", "integrated"]}' },
      toProp: (x) => (x === "si" ? ["shortTerm", "integrated"] : x === "all" ? ["momentary", "shortTerm", "integrated"] : ["momentary", "shortTerm"]) },
    { key: "targets", label: "Hedef çizgileri (targets)", default: "both", options: [{ value: "both", label: "−14 ve −23" }, { value: "stream", label: "yalnız −14" }, { value: "off", label: "yok" }],
      toCode: { both: null, stream: '{[{ value: -14, label: "Yayın akışı −14" }]}', off: "{false}" },
      toProp: (x) => (x === "stream" ? [{ value: -14, label: "Yayın akışı −14" }] : x === "off" ? false : undefined) },
    { key: "span", label: "Geçmiş (span)", default: 30, min: 5, max: 120, step: 5, unit: "sn", toCode: (x) => (x === 30 ? null : `{${x}}`) },
    { key: "rate", label: "Okuma sıklığı (rate)", default: 10, min: 1, max: 30, step: 1, unit: "/sn", toCode: (x) => (x === 10 ? null : `{${x}}`) },
    { key: "range", label: "LUFS ekseni (range)", default: "wide", options: [{ value: "wide", label: "−40 … 0" }, { value: "tight", label: "−30 … −6" }],
      toCode: { wide: null, tight: "{[-30, -6]}" }, toProp: (x) => (x === "tight" ? [-30, -6] : [-40, 0]) },
    // the parts: each switch writes the whole parts object from the three (an instance holds only changed values)
    { key: "correlation", label: "Korelasyon (parts.correlation)", default: true, prop: "parts",
      toCode: (x, v) => (x && v.readouts !== false && v.legend !== false ? null : `{{ correlation: ${!!x}, readouts: ${v.readouts !== false}, legend: ${v.legend !== false} }}`),
      toProp: (x, v) => ({ correlation: !!x, readouts: v.readouts !== false, legend: v.legend !== false }) },
    { key: "readouts", label: "Göstergeler (parts.readouts)", default: true, prop: "parts",
      toCode: (x, v) => (x && v.correlation !== false && v.legend !== false ? null : `{{ correlation: ${v.correlation !== false}, readouts: ${!!x}, legend: ${v.legend !== false} }}`),
      toProp: (x, v) => ({ correlation: v.correlation !== false, readouts: !!x, legend: v.legend !== false }) },
    { key: "legend", label: "Gösterge listesi (parts.legend)", default: true, prop: "parts",
      toCode: (x, v) => (x && v.correlation !== false && v.readouts !== false ? null : `{{ correlation: ${v.correlation !== false}, readouts: ${v.readouts !== false}, legend: ${!!x} }}`),
      toProp: (x, v) => ({ correlation: v.correlation !== false, readouts: v.readouts !== false, legend: !!x }) },
    { key: "paused", label: "Kaydı durdur (paused)", default: false, toCode: (x) => (x ? "" : null) },
    { key: "motion", label: "Hareket (motion)", default: true, toCode: (x) => (x ? null : "{false}") },
    { key: "label", label: "Erişilebilir ad (label)", default: "Program", kind: "text" },
  ],
});
