import { definePlayground } from "../../spec.ts";

interface Values { toolbar: string; mentions: boolean; emoji: boolean; counter: boolean; readonly: boolean; rows: number; output: boolean; hint: boolean; ownIcons: boolean; ownLabels: boolean }

// MarchIDE: each option is a prop of the raw component (prop / toCode); ownIcons, ownLabels and output are the card's own
export default definePlayground<Values>({
  options: [
    { key: "toolbar", label: "Araç çubuğu", default: "full", kind: "segmented", options: [{ value: "full", label: "tam" }, { value: "minimal", label: "sade" }, { value: "none", label: "yok" }],
      toCode: { full: null, minimal: '{["bold","italic","link","|","ul","ol","|","undo","redo"]}', none: "{false}" } },
    { key: "mentions", label: "@ bahsetme", default: true, toCode: { true: '{[{"id":"u1","label":"Deniz Kaya","hint":"Tasarım"},{"id":"u2","label":"Ece Demir","hint":"Ürün"}]}', false: null } },
    { key: "emoji", label: ": emoji", default: true, toCode: { false: "{false}" } },
    { key: "counter", label: "Sayaç", default: true, toCode: { false: "{false}" } },
    { key: "hint", label: "Alt ipucu (@ ve :)", default: true, visibleWhen: (v) => v.counter && (v.mentions || v.emoji), toCode: { false: "{false}" } },
    { key: "ownIcons", label: "Kendi ikonlarım (B, I, U)", default: false, visibleWhen: (v) => v.toolbar !== "none", prop: false },
    { key: "ownLabels", label: "Kendi sayaç metnim", default: false, visibleWhen: (v) => v.counter, prop: false },
    { key: "readonly", label: "Salt okunur", default: false },
    { key: "rows", label: "Yükseklik (satır)", default: 7, min: 3, max: 14, step: 1 },
    { key: "output", label: "Markdown çıktısı", default: true, prop: false },
  ],
});
