import { definePlayground } from "../../spec.ts";

interface Values { sort: boolean; limit: number; format: string; color: number; clickable: boolean; title: string; animate: string }

export default definePlayground<Values>({
  options: [
    { key: "sort", label: "Büyükten küçüğe (sort)", default: true, toCode: { true: null, false: "{false}" } },
    { key: "limit", label: "İlk N satır (limit)", default: 0, min: 0, max: 8, step: 1, toProp: (v) => (v ? v : undefined), toCode: (v) => (v ? `{${v}}` : null) },
    { key: "format", label: "Değer biçimi (format)", default: "number", options: [{ value: "number", label: "sayı" }, { value: "compact", label: "kısa (1,2 B)" }, { value: "money", label: "para (TRY)" }],
      toProp: (v) => (v === "money" ? ["money", "TRY"] : v), toCode: { number: null, money: "{[\"money\", \"TRY\"]}" } },
    { key: "color", label: "Palet rengi (color)", default: 0, options: [{ value: 0, label: "1" }, { value: 1, label: "2" }, { value: 2, label: "3" }, { value: 3, label: "4" }, { value: 4, label: "5" }], toCode: (v) => (v ? `{${v}}` : null) },
    // the showcase card's own: rows become buttons (in MarchIDE: onSelect in Events)
    { key: "clickable", label: "Tıklanabilir satırlar (onSelect)", default: true, prop: false },
    { key: "title", label: "Erişilebilir ad (title)", default: "En çok dinlenenler", kind: "text" },
    { key: "animate", label: "Animasyon (animate)", default: "spring", options: [{ value: "spring", label: "yay" }, { value: "out", label: "yumuşak" }, { value: "stagger", label: "sırayla" }, { value: "off", label: "kapalı" }],
      toProp: (v) => (v === "spring" ? true : v === "off" ? false : v === "stagger" ? { stagger: 60 } : v), toCode: { spring: null, off: "{false}", stagger: "{{ stagger: 60 }}" } },
  ],
});
