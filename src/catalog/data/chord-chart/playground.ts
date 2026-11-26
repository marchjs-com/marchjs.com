import { definePlayground } from "../../spec.ts";

interface Values { directed: boolean; padAngle: number; thickness: number; ribbonColor: string; labels: boolean; ticks: boolean; animate: string; legend: string; height: number; title: string }

export default definePlayground<Values>({
  options: [
    { key: "directed", label: "Yönlü (directed)", default: false, toCode: (v) => (v ? "" : null) },
    { key: "ribbonColor", label: "Şerit rengi (ribbonColor)", default: "source", options: [{ value: "source", label: "kaynak" }, { value: "target", label: "hedef" }, { value: "larger", label: "çok veren" }],
      toCode: { source: null } },
    { key: "padAngle", label: "Grup arası (padAngle)", default: 0.04, min: 0, max: 0.2, step: 0.01, toCode: (v) => (v === 0.04 ? null : `{${v}}`) },
    { key: "thickness", label: "Yay kalınlığı (thickness)", default: 14, min: 4, max: 32, step: 2, unit: "px", toCode: (v) => (v === 14 ? null : `{${v}}`) },
    { key: "labels", label: "Adlar (labels)", default: true, toCode: (v) => (v ? null : "{false}") },
    { key: "ticks", label: "Çentikler (ticks)", default: false, toCode: (v) => (v ? "" : null) },
    { key: "animate", label: "Animasyon (animate)", default: "spring", options: [{ value: "spring", label: "yay" }, { value: "out", label: "yumuşak" }, { value: "stagger", label: "sırayla" }, { value: "off", label: "kapalı" }],
      toProp: (v) => (v === "spring" ? true : v === "off" ? false : v === "stagger" ? { stagger: 40 } : v), toCode: { spring: null, off: "{false}", stagger: "{{ stagger: 40 }}" } },
    { key: "legend", label: "Açıklama (legend)", default: "none", options: [{ value: "none", label: "yok" }, { value: "bottom", label: "altta" }, { value: "right", label: "sağda" }],
      toProp: (v) => (v === "none" ? false : v), toCode: { none: null } },
    { key: "height", label: "Yükseklik (height)", default: 380, min: 260, max: 520, step: 20, unit: "px" },
    { key: "title", label: "Başlık (title)", default: "Şehirler arası göç", kind: "text" },
  ],
});
