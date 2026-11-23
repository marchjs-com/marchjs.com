import { definePlayground } from "../../spec.ts";

interface Values { start: string; presets: boolean; output: boolean; readonly: boolean; preview: boolean; angles: string; hint: boolean; labels: boolean }

// the starting gradients (demo.tsx START): in MarchIDE the choice is the raw component's value
const START: Record<string, string> = {
  hadi: "linear-gradient(120deg, #f2801f 0%, #1d9ad6 35%, #78be3a 65%, #a3338c 100%)",
  radial: "radial-gradient(circle, #ffd27a 0%, #f2801f 55%, #a3338c 100%)",
  conic: "conic-gradient(from 90deg, #1d9ad6 0%, #78be3a 50%, #1d9ad6 100%)",
};
// the card's own texts (demo.tsx): the ones that are plain strings
const OWN = { linear: "Düz", radial: "Halka", conic: "Pasta", position: "Yeri", hint: "Çubuğa tıkla: yeni renk. Aşağı sürükle: sil." };

export default definePlayground<Values>({
  options: [
    { key: "start", label: "Başlangıç", default: "hadi", kind: "segmented", options: [{ value: "hadi", label: "HADİ" }, { value: "radial", label: "dairesel" }, { value: "conic", label: "konik" }],
      prop: "value", toCode: (x) => JSON.stringify(START[String(x)] ?? START["hadi"]) },
    // on: the default presets (the prop left out); a bare true is no list of presets
    { key: "presets", label: "Hazır gradyanlar", default: true, toCode: { true: null, false: "{false}" } },
    { key: "output", label: "CSS çıktısı", default: true },
    { key: "preview", label: "Büyük önizleme", default: true },
    { key: "angles", label: "Hazır açılar", default: "eight", kind: "segmented", options: [{ value: "eight", label: "8 açı" }, { value: "four", label: "4 açı" }, { value: "none", label: "yok" }],
      toCode: { eight: null, four: "{[0,90,180,270]}", none: "{false}" } },
    { key: "hint", label: "İpucu satırı", default: true },
    { key: "labels", label: "Kendi metinlerim", default: false, toCode: { true: `{${JSON.stringify(OWN)}}`, false: null } },
    { key: "readonly", label: "Salt okunur", default: false },
  ],
});
