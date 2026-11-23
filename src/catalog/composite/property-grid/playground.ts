import { definePlayground } from "../../spec.ts";

interface Values { properties: string; layout: string; search: boolean; save: boolean; historyButtons: boolean; resetButtons: boolean; changeMarks: boolean; footer: boolean; ownLabels: boolean }

// MarchIDE gives the raw PropertyGrid its required `properties` as plain data (toCode: a JSON literal; the card's
// validate / hidden functions left out); the card uses the same rows. Written with a helper: a literal `key:` here
// would read as an option of the panel (test/playground-keys)
const row = (key: string, label: string, group: string, more: Record<string, unknown> = {}) => ({ key, label, group, ...more });
const ALL = [
  row("title", "Başlık", "İçerik", { keywords: "ad isim" }),
  row("body", "Metin", "İçerik", { type: "textarea" }),
  row("width", "Genişlik", "Yerleşim", { type: "number", unit: "px", min: 160, max: 600, description: "160–420 px" }),
  row("align", "Hizalama", "Yerleşim", { type: "select", options: [{ value: "start", label: "Başa" }, { value: "center", label: "Ortaya" }] }),
  row("elevated", "Gölge", "Görünüm", { type: "switch" }),
  row("radius", "Köşe yarıçapı", "Görünüm", { type: "slider", min: 0, max: 24 }),
  row("tone", "Ton", "Görünüm", { type: "segmented", options: [{ value: "light", label: "Açık" }, { value: "accent", label: "Vurgulu" }] }),
  row("accent", "Vurgu rengi", "Görünüm", { type: "color" }),
];
const json = (x: unknown): string => `{${JSON.stringify(x)}}`;

export default definePlayground<Values>({
  options: [
    { key: "properties", label: "Satırlar", default: "all", options: [{ value: "all", label: "hepsi (üç grup)" }, { value: "look", label: "yalnız Görünüm" }], toCode: (x) => json(x === "look" ? ALL.filter((p) => p.group === "Görünüm") : ALL) },
    { key: "layout", label: "Yerleşim", default: "auto", options: [{ value: "auto", label: "yan yana" }, { value: "stacked", label: "üst üste" }] },
    { key: "search", label: "Arama alanı", default: true },
    { key: "save", label: "Kaydet düğmesi (onSave)", default: true, prop: false },
    { key: "historyButtons", label: "Geri al / yinele düğmeleri", default: true },
    { key: "resetButtons", label: "Satırda “kaydedilene dön” düğmesi", default: true },
    { key: "changeMarks", label: "Değişiklik işaretleri", default: true },
    { key: "footer", label: "Alt çubuk", default: true },
    { key: "ownLabels", label: "Kendi metinlerim", default: false, prop: "labels", toCode: { true: '{{"search":"Bir ayar bul","save":"Yayınla","revert":"Vazgeç","noChanges":"Her şey yayında"}}', false: null } },
  ],
});
