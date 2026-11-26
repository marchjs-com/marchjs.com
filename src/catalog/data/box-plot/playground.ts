import { definePlayground } from "../../spec.ts";

interface Values { mode: string; horizontal: boolean; showPoints: boolean; whisker: string; mean: boolean; outliers: boolean; marks: boolean; animate: string; height: number; title: string }

export default definePlayground<Values>({
  options: [
    { key: "mode", label: "Biçim (mode)", default: "both", options: [{ value: "box", label: "kutu" }, { value: "violin", label: "keman" }, { value: "both", label: "ikisi" }],
      toCode: { box: null } },
    { key: "horizontal", label: "Yatay (horizontal)", default: false },
    { key: "showPoints", label: "Ham noktalar (showPoints)", default: true },
    { key: "whisker", label: "Bıyıklar (whisker)", default: "iqr", options: [{ value: "iqr", label: "1,5 × IQR" }, { value: "minmax", label: "en küçük–en büyük" }],
      visibleWhen: (v) => v.mode !== "violin", toCode: { iqr: null } },
    { key: "mean", label: "Ortalama (mean)", default: true, toCode: (v) => (v ? null : "{false}") },
    { key: "outliers", label: "Aykırı değerler (outliers)", default: true, visibleWhen: (v) => v.whisker !== "minmax", toCode: (v) => (v ? null : "{false}") },
    { key: "marks", label: "Hedef çizgisi (marks)", default: true, toProp: (v) => (v ? [{ y: 30, label: "Hedef 30 dk", color: "danger" }] : []),
      toCode: (v) => (v ? '{[{ y: 30, label: "Hedef 30 dk", color: "danger" }]}' : null) },
    { key: "animate", label: "Animasyon (animate)", default: "spring", options: [{ value: "spring", label: "yay" }, { value: "out", label: "yumuşak" }, { value: "stagger", label: "sırayla" }, { value: "off", label: "kapalı" }],
      toProp: (v) => (v === "spring" ? true : v === "off" ? false : v === "stagger" ? { stagger: 60 } : v), toCode: { spring: null, off: "{false}", stagger: "{{ stagger: 60 }}" } },
    { key: "height", label: "Yükseklik (height)", default: 320, min: 220, max: 480, step: 20, unit: "px" },
    { key: "title", label: "Başlık (title)", default: "Acil serviste bekleme", kind: "text" },
  ],
});
