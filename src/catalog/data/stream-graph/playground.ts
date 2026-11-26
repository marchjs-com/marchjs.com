import { definePlayground } from "../../spec.ts";

interface Values { offset: string; curve: string; edges: boolean; legend: string; animate: string; format: string; height: number; title: string }

export default definePlayground<Values>({
  options: [
    { key: "offset", label: "Taban (offset)", default: "wiggle", options: [{ value: "wiggle", label: "dalgalı" }, { value: "silhouette", label: "ortalı" }, { value: "expand", label: "%100" }], toCode: { wiggle: null } },
    { key: "curve", label: "Eğri (curve)", default: "smooth", options: [{ value: "smooth", label: "yumuşak" }, { value: "linear", label: "düz" }, { value: "step", label: "basamak" }], toCode: { smooth: null } },
    { key: "edges", label: "Katman kenarları (edges)", default: false },
    { key: "legend", label: "Açıklama (legend)", default: "bottom", options: [{ value: "bottom", label: "altta" }, { value: "right", label: "sağda" }, { value: "none", label: "yok" }],
      toProp: (v) => (v === "none" ? false : v), toCode: { bottom: null, none: "{false}" } },
    { key: "animate", label: "Animasyon (animate)", default: "spring", options: [{ value: "spring", label: "yay" }, { value: "out", label: "yumuşak" }, { value: "stagger", label: "katman katman" }, { value: "off", label: "kapalı" }],
      toProp: (v) => (v === "spring" ? true : v === "off" ? false : v === "stagger" ? { stagger: 110 } : v), toCode: { spring: null, out: "\"out\"", stagger: "{{ stagger: 110 }}", off: "{false}" } },
    { key: "format", label: "Değer biçimi (format)", default: "number", options: [{ value: "number", label: "sayı" }, { value: "hours", label: "saat" }],
      toProp: (v) => (v === "hours" ? (x: unknown) => `${x} sa` : v), toCode: { number: null, hours: "{(x) => `${x} sa`}" } },
    { key: "height", label: "Yükseklik (height)", default: 280, min: 180, max: 420, step: 20, unit: "px" },
    { key: "title", label: "Başlık (title)", default: "Türlere göre dinleme", kind: "text" },
  ],
});
