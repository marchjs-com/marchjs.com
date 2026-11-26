import { definePlayground } from "../../spec.ts";

interface Values { donut: string; padAngle: number; center: string; labels: string; pop: number; animate: string; legend: string; format: string; size: number; title: string }

export default definePlayground<Values>({
  options: [
    { key: "donut", label: "Halka (donut)", default: "ring", options: [{ value: "ring", label: "halka" }, { value: "thin", label: "ince halka" }, { value: "pie", label: "pasta" }],
      toProp: (v) => (v === "ring" ? true : v === "thin" ? 0.8 : false), toCode: { ring: "", thin: "{0.8}", pie: null } },
    { key: "padAngle", label: "Dilim arası (padAngle)", default: 0.01, min: 0, max: 0.08, step: 0.01, toCode: (v) => (v === 0.01 ? null : `{${v}}`) },
    { key: "center", label: "Ortadaki yazı (center)", default: "", kind: "text", visibleWhen: (v) => v.donut !== "pie", toCode: (v) => (v ? JSON.stringify(v) : null) },
    { key: "labels", label: "Dilim yazısı (labels)", default: "off", options: [{ value: "off", label: "yok" }, { value: "percent", label: "yüzde" }, { value: "value", label: "değer" }, { value: "label", label: "ad" }],
      toProp: (v) => (v === "off" ? false : v), toCode: { off: null } },
    { key: "pop", label: "Etkin dilim dışarı (pop)", default: 6, min: 0, max: 16, step: 1, unit: "px", toCode: (v) => (v === 6 ? null : `{${v}}`) },
    { key: "animate", label: "Animasyon (animate)", default: "spring", options: [{ value: "spring", label: "yay" }, { value: "out", label: "yumuşak" }, { value: "stagger", label: "sırayla" }, { value: "off", label: "kapalı" }],
      toProp: (v) => (v === "spring" ? true : v === "off" ? false : v === "stagger" ? { stagger: 70 } : v), toCode: { spring: null, out: "\"out\"", stagger: "{{ stagger: 70 }}", off: "{false}" } },
    { key: "legend", label: "Açıklama (legend)", default: "right", options: [{ value: "right", label: "sağda" }, { value: "bottom", label: "altta" }, { value: "none", label: "yok" }],
      toProp: (v) => (v === "none" ? false : v), toCode: { none: "{false}" } },
    { key: "format", label: "Değer biçimi (format)", default: "number", options: [{ value: "number", label: "sayı" }, { value: "money", label: "para (TRY)" }, { value: "compact", label: "kısa (1,2 B)" }],
      toProp: (v) => (v === "money" ? ["money", "TRY"] : v), toCode: { number: null, money: "{[\"money\", \"TRY\"]}" } },
    { key: "height", label: "Yükseklik (height)", default: 220, min: 160, max: 360, step: 20, unit: "px" },
    { key: "title", label: "Başlık (title)", default: "Bütçe dağılımı", kind: "text" },
  ],
});
