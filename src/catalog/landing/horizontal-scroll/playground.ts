import { definePlayground } from "../../spec.ts";

interface Values { label: string; panels: number; panel: string; pinned: boolean; progress: boolean }

export default definePlayground<Values>({
  options: [
    { key: "label", label: "Bölge adı (label)", default: "Vaka çalışmaları", kind: "text" },
    // the raw component in MarchIDE (and the card's code) gets this many text panels: its panels are children
    { key: "panels", label: "Panel sayısı", default: 5, min: 3, max: 8, step: 1, prop: "children", toCode: (n) => `{${JSON.stringify(Array.from({ length: Number(n) }, (_, i) => `Vaka ${i + 1}`))}}` },
    { key: "panel", label: "Panel genişliği", default: "26rem", options: [{ value: "18rem", label: "dar" }, { value: "26rem", label: "orta" }, { value: "40rem", label: "geniş" }] },
    { key: "pinned", label: "Sabitle, sayfayla kaydır", default: true, toCode: { true: null, false: "{false}" } },
    { key: "progress", label: "İlerleme çizgisi", default: true, toCode: { true: null, false: "{false}" }, visibleWhen: (v) => v.pinned },
  ],
});
