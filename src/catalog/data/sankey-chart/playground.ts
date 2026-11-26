import { definePlayground } from "../../spec.ts";

interface Values { align: string; nodeWidth: number; nodePadding: number; iterations: number; linkColor: string; labels: boolean; valueLabels: boolean;
  animate: string; legend: string; format: string; height: number; title: string }

export default definePlayground<Values>({
  options: [
    { key: "align", label: "Hizalama (align)", default: "justify", options: [{ value: "justify", label: "iki yana" }, { value: "left", label: "sola" }, { value: "right", label: "sağa" }, { value: "center", label: "ortaya" }],
      toCode: { justify: null } },
    { key: "linkColor", label: "Şerit rengi (linkColor)", default: "gradient", options: [{ value: "gradient", label: "geçişli" }, { value: "source", label: "kaynak" }, { value: "target", label: "hedef" }, { value: "neutral", label: "gri" }],
      toCode: { gradient: null } },
    { key: "nodeWidth", label: "Düğüm genişliği (nodeWidth)", default: 14, min: 4, max: 32, step: 2, unit: "px", toCode: (v) => (v === 14 ? null : `{${v}}`) },
    { key: "nodePadding", label: "Dikey boşluk (nodePadding)", default: 14, min: 4, max: 40, step: 2, unit: "px", toCode: (v) => (v === 14 ? null : `{${v}}`) },
    { key: "iterations", label: "Düzeltme turu (iterations)", default: 6, options: [{ value: 0, label: "0 · giriş sırası" }, { value: 2, label: "2" }, { value: 6, label: "6" }, { value: 16, label: "16" }],
      toCode: (v) => (v === 6 ? null : `{${v}}`) },
    { key: "labels", label: "Adlar (labels)", default: true, toCode: (v) => (v ? null : "{false}") },
    { key: "valueLabels", label: "Değerler (valueLabels)", default: true, visibleWhen: (v) => v.labels, toCode: (v) => (v ? null : "{false}") },
    { key: "format", label: "Değer biçimi (format)", default: "money", options: [{ value: "money", label: "para (TRY)" }, { value: "compact", label: "kısa (42 B)" }, { value: "number", label: "sayı" }],
      toProp: (v) => (v === "money" ? ["money", "TRY"] : v), toCode: { number: null, money: "{[\"money\", \"TRY\"]}" } },
    { key: "animate", label: "Animasyon (animate)", default: "spring", options: [{ value: "spring", label: "yay" }, { value: "out", label: "yumuşak" }, { value: "stagger", label: "sırayla" }, { value: "off", label: "kapalı" }],
      toProp: (v) => (v === "spring" ? true : v === "off" ? false : v === "stagger" ? { stagger: 60 } : v), toCode: { spring: null, off: "{false}", stagger: "{{ stagger: 60 }}" } },
    { key: "legend", label: "Açıklama (legend)", default: "none", options: [{ value: "none", label: "yok" }, { value: "bottom", label: "altta" }, { value: "right", label: "sağda" }],
      toProp: (v) => (v === "none" ? false : v), toCode: { none: null } },
    { key: "height", label: "Yükseklik (height)", default: 340, min: 220, max: 520, step: 20, unit: "px" },
    { key: "title", label: "Başlık (title)", default: "Aylık bütçe akışı", kind: "text" },
  ],
});
