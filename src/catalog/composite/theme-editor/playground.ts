import { definePlayground } from "../../spec.ts";

interface Values { base: string; preview: boolean; tabs: string; readonly: boolean; presets: boolean; nameField: boolean; historyButtons: boolean; applyButton: boolean; previewControls: boolean; ownLabels: boolean }

export default definePlayground<Values>({
  options: [
    { key: "base", label: "Başlangıç", default: "hadi", kind: "segmented", options: [{ value: "hadi", label: "HADİ" }, { value: "night", label: "Gece" }, { value: "neon", label: "Neon" }, { value: "scratch", label: "Sıfırdan" }] },
    { key: "tabs", label: "Bölümler", default: "all", kind: "segmented", options: [{ value: "all", label: "hepsi" }, { value: "colors", label: "yalnız renk" }, { value: "noexport", label: "çıktısız" }],
      // MarchIDE: the raw ThemeEditor gets the real `tabs` list (all: its own default)
      toCode: { all: null, colors: '{["colors"]}', noexport: '{["colors","type","shape","motion"]}' } },
    { key: "preview", label: "Canlı önizleme", default: true },
    { key: "readonly", label: "Salt okunur", default: false },
    { key: "presets", label: "“Şuradan başla” satırı", default: true },
    { key: "nameField", label: "Tema adı alanı", default: true },
    { key: "historyButtons", label: "Geri al / yinele düğmeleri", default: true },
    { key: "applyButton", label: "“Uygulamaya uygula” düğmesi", default: true },
    { key: "previewControls", label: "Önizleme anahtarları (açık/koyu, yön)", default: true, visibleWhen: (v) => v.preview },
    { key: "ownLabels", label: "Kendi sekme ve düğme metinlerim", default: false, prop: "labels",
      toCode: { true: '{{"tabs":{"colors":"Palet","type":"Yazı","shape":"Biçim","motion":"Devinim","export":"Dışa aktar"},"apply":"Uygulamada dene","applied":"Uygulamada deneniyor","startFrom":"Temel al"}}', false: null } },
  ],
});
