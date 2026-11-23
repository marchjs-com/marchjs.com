import { definePlayground } from "../../spec.ts";

// every option writes a real prop of DateRangePicker: the switches that turn a part off write `{false}`, the sign
// between the dates a text or `{false}`
export default definePlayground<{ presets: boolean; custom: boolean; separator: string; min: string; max: string }>({
  options: [
    { key: "presets", label: "Hazır aralıklar", default: true, toCode: { true: null, false: "{false}" } },
    { key: "custom", label: "“Özel” seçeneği", default: true, visibleWhen: (v) => v.presets, toCode: { true: null, false: "{false}" } },
    { key: "separator", label: "İki tarih arası işaret", default: "dash", options: [{ value: "dash", label: "–" }, { value: "arrow", label: "→" }, { value: "off", label: "yok" }], visibleWhen: (v) => !v.presets || v.custom,
      toCode: { dash: null, arrow: '"→"', off: "{false}" } },
    { key: "min", label: "En erken tarih (min)", default: "", kind: "text" },
    { key: "max", label: "En geç tarih (max)", default: "", kind: "text" },
  ],
});
