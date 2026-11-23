import { definePlayground } from "../../spec.ts";

// sample items: the raw component in MarchIDE starts with them (the rows, their tools and the max show at once)
export const SAMPLES = ["tasarım", "ürün", "yayın", "pazarlama", "destek", "satış"];

export default definePlayground<{ items: number; max: number; readonly: boolean; sortable: boolean; removable: boolean; addable: boolean; placeholder: string; addLabel: string }>({
  options: [
    { key: "items", label: "Başlangıç öğeleri", default: 3, options: [0, 3, 6], prop: "value", toCode: (n) => (n ? `{${JSON.stringify(SAMPLES.slice(0, Number(n)))}}` : null) },
    { key: "max", label: "En fazla", default: 5, options: [3, 5, 10] },
    { key: "sortable", label: "Sıralama düğmeleri", default: true, toCode: { true: null, false: "{false}" } },
    { key: "removable", label: "Kaldır düğmesi", default: true, toCode: { true: null, false: "{false}" } },
    { key: "addable", label: "Ekleme satırı", default: true, toCode: { true: null, false: "{false}" } },
    { key: "readonly", label: "Salt okunur", default: false },
    { key: "placeholder", label: "Yer tutucu", default: "Etiket ekle", kind: "text" },
    { key: "addLabel", label: "Ekle düğmesinin metni", default: "Ekle", kind: "text" },
  ],
});
