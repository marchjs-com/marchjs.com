import { definePlayground } from "../../spec.ts";

interface Values { value: string; columns: number; align: string; scroll: boolean; speed: number; dot: string; size: string; color: string;
  transition: string; duration: number; parts: string; motion: boolean; label: string }

export default definePlayground<Values>({
  stage: "center",
  options: [
    // value is required: the bare DotMatrix in MarchIDE shows this text
    { key: "value", label: "Yazı (value)", default: "MERHABA 21°", kind: "text" },
    // 0 = as wide as the text (the prop left out); a narrower window than the text scrolls it
    { key: "columns", label: "Pencere (columns; 0 = yazı kadar)", default: 0, min: 0, max: 24, step: 1, toCode: (x) => (x ? `{${x}}` : null), toProp: (x) => (x ? x : undefined) },
    { key: "align", label: "Hizalama (align)", default: "start", options: [{ value: "start", label: "baş" }, { value: "center", label: "orta" }, { value: "end", label: "son" }], visibleWhen: (v) => v.columns > 0 },
    { key: "scroll", label: "Uzun yazıyı kaydır (scroll)", default: true, toCode: (x) => (x ? null : "{false}"), toProp: (x) => (x ? "auto" : false) },
    { key: "speed", label: "Kayma hızı (speed)", default: 18, min: 4, max: 60, step: 1, unit: "sütun/sn", visibleWhen: (v) => v.scroll, toCode: (x) => (x === 18 ? null : `{${x}}`) },
    { key: "dot", label: "Nokta (dot)", default: "round", options: [{ value: "round", label: "yuvarlak" }, { value: "square", label: "kare" }] },
    { key: "size", label: "Boyut (size)", default: "md", options: [{ value: "sm", label: "küçük" }, { value: "md", label: "orta" }, { value: "lg", label: "büyük" }] },
    { key: "color", label: "Renk (color)", default: "", options: [{ value: "", label: "amber" }, { value: "danger", label: "kırmızı" }, { value: "success", label: "yeşil" }, { value: "info", label: "mavi" }],
      toCode: (x) => (x ? JSON.stringify(x) : null), toProp: (x) => (x || undefined) },
    { key: "transition", label: "Geçiş (transition)", default: "wipe", options: [{ value: "wipe", label: "silme" }, { value: "dissolve", label: "dağılma" }, { value: "none", label: "yok" }] },
    { key: "duration", label: "Geçiş süresi (duration)", default: 420, min: 100, max: 1500, step: 20, unit: "ms", visibleWhen: (v) => v.transition !== "none", toCode: (x) => (x === 420 ? null : `{${x}}`) },
    { key: "parts", label: "Parçalar (parts)", default: "all", options: [{ value: "all", label: "hepsi" }, { value: "noglow", label: "parıltısız" }, { value: "bare", label: "çıplak" }],
      toCode: { all: null, noglow: "{{ glow: false }}", bare: "{{ bezel: false, off: false }}" },
      toProp: (x) => (x === "noglow" ? { glow: false } : x === "bare" ? { bezel: false, off: false } : undefined) },
    { key: "motion", label: "Hareket (motion)", default: true, toCode: (x) => (x ? null : "{false}") },
    { key: "label", label: "Erişilebilir ad (label)", default: "Tabela", kind: "text" },
  ],
});
