import { definePlayground } from "../../spec.ts";

interface Values { value: string; length: number; align: string; flapTime: number; stagger: number; size: string; color: string; frame: boolean; motion: boolean; label: string }

export default definePlayground<Values>({
  stage: "center",
  options: [
    // value is required: the bare SplitFlap in MarchIDE shows this text
    { key: "value", label: "Yazı (value)", default: "İSTANBUL", kind: "text" },
    // 0 = as many cells as the text (the prop left out)
    { key: "length", label: "Hücre (length; 0 = yazı kadar)", default: 10, min: 0, max: 20, step: 1, toCode: (x) => (x ? `{${x}}` : null), toProp: (x) => (x ? x : undefined) },
    { key: "align", label: "Hizalama (align)", default: "start", options: [{ value: "start", label: "baş" }, { value: "center", label: "orta" }, { value: "end", label: "son" }], visibleWhen: (v) => v.length > 0 },
    { key: "flapTime", label: "Kanat süresi (flapTime)", default: 70, min: 20, max: 200, step: 5, unit: "ms", toCode: (x) => (x === 70 ? null : `{${x}}`) },
    { key: "stagger", label: "Hücre gecikmesi (stagger)", default: 45, min: 0, max: 200, step: 5, unit: "ms", toCode: (x) => (x === 45 ? null : `{${x}}`) },
    { key: "size", label: "Boyut (size)", default: "md", options: [{ value: "sm", label: "küçük" }, { value: "md", label: "orta" }, { value: "lg", label: "büyük" }] },
    { key: "color", label: "Renk (color)", default: "", options: [{ value: "", label: "beyaz" }, { value: "warning", label: "sarı" }, { value: "success", label: "yeşil" }, { value: "danger", label: "kırmızı" }],
      toCode: (x) => (x ? JSON.stringify(x) : null), toProp: (x) => (x || undefined) },
    { key: "frame", label: "Tablo çerçevesi (frame)", default: true, toCode: (x) => (x ? null : "{false}") },
    { key: "motion", label: "Hareket (motion)", default: true, toCode: (x) => (x ? null : "{false}") },
    { key: "label", label: "Erişilebilir ad (label)", default: "Varış", kind: "text" },
  ],
});
