import { definePlayground } from "../../spec.ts";

interface Values { bins: number; group: boolean; curve: string; cumulative: boolean; density: boolean; marks: boolean; gap: number; animate: string; legend: string; height: number; title: string }

export default definePlayground<Values>({
  options: [
    { key: "bins", label: "Kutu sayısı (bins)", default: 18, min: 4, max: 40, step: 1 },
    { key: "group", label: "İki şehir üst üste (group)", default: true, toProp: (v) => (v ? "city" : undefined), toCode: (v) => (v ? '"city"' : null) },
    { key: "curve", label: "Eğri (curve)", default: "kde", options: [{ value: "kde", label: "yoğunluk (kde)" }, { value: "normal", label: "çan (normal)" }, { value: "none", label: "yok" }],
      toProp: (v) => (v === "none" ? false : v), toCode: { none: null } },
    { key: "cumulative", label: "Birikimli (cumulative)", default: false },
    { key: "density", label: "Normalleştir (density)", default: false },
    { key: "marks", label: "Ortanca ve hedef (marks)", default: true,
      toProp: (v) => (v ? [{ x: "median", series: "Ankara", label: "Ankara ortancası" }, { x: 45, label: "Söz verilen 45 dk", color: "danger" }] : []),
      toCode: (v) => (v ? '{[{ x: "median", series: "Ankara" }, { x: 45, label: "Söz verilen 45 dk", color: "danger" }]}' : null) },
    { key: "gap", label: "Çubuk arası (gap)", default: 1, min: 0, max: 6, step: 1, unit: "px", toCode: (v) => (v === 1 ? null : `{${v}}`) },
    { key: "animate", label: "Animasyon (animate)", default: "spring", options: [{ value: "spring", label: "yay" }, { value: "out", label: "yumuşak" }, { value: "stagger", label: "sırayla" }, { value: "off", label: "kapalı" }],
      toProp: (v) => (v === "spring" ? true : v === "off" ? false : v === "stagger" ? { stagger: 60 } : v), toCode: { spring: null, off: "{false}", stagger: "{{ stagger: 60 }}" } },
    { key: "legend", label: "Açıklama (legend)", default: "bottom", options: [{ value: "bottom", label: "altta" }, { value: "right", label: "sağda" }, { value: "none", label: "yok" }],
      visibleWhen: (v) => v.group, toProp: (v) => (v === "none" ? false : v), toCode: { bottom: null, none: "{false}" } },
    { key: "height", label: "Yükseklik (height)", default: 280, min: 200, max: 420, step: 20, unit: "px" },
    { key: "title", label: "Başlık (title)", default: "Teslimat süreleri", kind: "text" },
  ],
});
