import { definePlayground } from "../../spec.ts";

interface Values { gridShape: string; curve: string; fill: number; levels: number; dots: boolean; scale: string; levelLabels: boolean; axisLabels: boolean;
  animate: string; legend: string; height: number; title: string }

export default definePlayground<Values>({
  options: [
    { key: "gridShape", label: "Izgara (gridShape)", default: "polygon", options: [{ value: "polygon", label: "çokgen" }, { value: "circle", label: "daire" }], toCode: { polygon: null } },
    { key: "curve", label: "Çizgi (curve)", default: "linear", options: [{ value: "linear", label: "köşeli" }, { value: "smooth", label: "yumuşak" }], toCode: { linear: null } },
    { key: "fill", label: "Dolgu (fill; 0 = yalnız çizgi)", default: 0.22, min: 0, max: 0.6, step: 0.02,
      toProp: (v) => (v === 0 ? false : v), toCode: (v) => (v === 0.22 ? null : v === 0 ? "{false}" : `{${v}}`) },
    { key: "levels", label: "Halka sayısı (levels)", default: 4, min: 2, max: 8, step: 1, toCode: (v) => (v === 4 ? null : `{${v}}`) },
    { key: "dots", label: "Noktalar (dots)", default: true, toCode: (v) => (v ? null : "{false}") },
    { key: "scale", label: "Ölçek (scale)", default: "shared", options: [{ value: "shared", label: "ortak (max 100)" }, { value: "axis", label: "her kol kendi" }],
      toProps: (v) => (v === "axis" ? { scale: "axis" } : { max: 100 }), toCode: (v) => (v === "axis" ? { scale: "\"axis\"" } : { max: "{100}" }) },
    { key: "levelLabels", label: "Halka değerleri (levelLabels)", default: false, visibleWhen: (v) => v.scale === "shared" },
    { key: "axisLabels", label: "Kol adları (axisLabels)", default: true, toCode: (v) => (v ? null : "{false}") },
    { key: "animate", label: "Animasyon (animate)", default: "spring", options: [{ value: "spring", label: "yay" }, { value: "out", label: "yumuşak" }, { value: "stagger", label: "sırayla" }, { value: "off", label: "kapalı" }],
      toProp: (v) => (v === "spring" ? true : v === "off" ? false : v === "stagger" ? { stagger: 120 } : v), toCode: { spring: null, off: "{false}", stagger: "{{ stagger: 120 }}" } },
    { key: "legend", label: "Açıklama (legend)", default: "bottom", options: [{ value: "bottom", label: "altta" }, { value: "right", label: "sağda" }, { value: "none", label: "yok" }],
      toProp: (v) => (v === "none" ? false : v), toCode: { bottom: null, none: "{false}" } },
    { key: "height", label: "Yükseklik (height)", default: 320, min: 220, max: 480, step: 20, unit: "px" },
    { key: "title", label: "Başlık (title)", default: "Oyuncu karşılaştırması", kind: "text" },
  ],
});
