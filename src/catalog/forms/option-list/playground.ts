import { definePlayground } from "../../spec.ts";

interface Values { field: boolean; mode: string; multiple: boolean; value: string; lead: boolean; hints: boolean; trailing: boolean; groups: boolean; check: string; columns: number; inline: boolean; overflow: string; size: string; color: string }

/** The sample rows (themes), in data the raw component in MarchIDE can take: icons are emoji. */
export const ROWS = [
  { value: "light", label: "Açık", icon: "☀️", hint: "Gündüz için", group: "Hazır", trailing: "⌘1" },
  { value: "dark", label: "Koyu", icon: "🌙", hint: "Gözü yormaz", group: "Hazır", trailing: "⌘2" },
  { value: "system", label: "Sistem", icon: "🖥️", hint: "Cihazı izler", group: "Hazır", trailing: "⌘3" },
  { value: "custom", label: "Özel", icon: "🎨", hint: "Kendi renklerin", group: "Kendi", trailing: "⌘4" },
  { value: "contrast", label: "Yüksek karşıtlık", icon: "◐", hint: "Yakında", group: "Kendi", disabled: true },
];

/** The rows as the options' switches shape them (icons, hints, the trailing part, group headings). */
export const rowsOf = (v: Pick<Values, "lead" | "hints" | "trailing" | "groups">) => ROWS.map((o) => ({
  value: o.value, label: o.label, ...(o.disabled ? { disabled: true } : {}), ...(v.lead ? { icon: o.icon } : {}), ...(v.hints ? { hint: o.hint } : {}),
  ...(v.trailing && o.trailing ? { trailing: o.trailing } : {}), ...(v.groups ? { group: o.group } : {}),
}));

/** `options` as code: the rows the four switches shape, as a JSON list (each of the switches writes the same list). */
const rowsCode = (_x: unknown, v: Values): string => `{${JSON.stringify(rowsOf(v))}}`;

// every option writes a real prop of the raw component: `options` (required) is the sample rows as a JSON list, built
// from the icons / hints / trailing / groups switches; `field` (keysFrom needs a field) is the showcase card's only
export default definePlayground<Values>({
  options: [
    { key: "field", label: "Bir alanın tuşlarıyla (keysFrom)", default: false, prop: false },
    { key: "mode", label: "Tür", default: "radio", options: [{ value: "radio", label: "tek seçim (radyo)" }, { value: "listbox", label: "liste kutusu" }, { value: "menu", label: "komut menüsü" }], visibleWhen: (v) => !v.field, toCode: { radio: null } },
    { key: "multiple", label: "Çoklu seçim", default: false, visibleWhen: (v) => !v.field && v.mode === "listbox" },
    { key: "value", label: "Seçili", default: "dark", options: [{ value: "", label: "yok" }, { value: "light", label: "Açık" }, { value: "dark", label: "Koyu" }, { value: "system", label: "Sistem" }],
      visibleWhen: (v) => v.mode !== "menu" || v.field },
    { key: "lead", label: "İkonlar", default: true, prop: "options", toCode: rowsCode },
    { key: "hints", label: "Açıklama satırı", default: true, prop: "options", toCode: rowsCode },
    { key: "trailing", label: "Sondaki parça (kısayol)", default: false, prop: "options", toCode: rowsCode },
    { key: "groups", label: "Grup başlıkları", default: false, prop: "options", toCode: rowsCode },
    { key: "check", label: "Seçim işareti", default: "on", options: [{ value: "on", label: "tik" }, { value: "own", label: "kendi ikonum" }, { value: "off", label: "yok" }], visibleWhen: (v) => v.field || v.mode !== "menu",
      toCode: { on: null, own: "{star}", off: "{false}" } },
    { key: "columns", label: "Sütun", default: 1, options: [1, 2], visibleWhen: (v) => !v.field },
    { key: "inline", label: "Açıklama yanda (inline)", default: false },
    { key: "overflow", label: "Uzun etiket", default: "ellipsis", options: [{ value: "ellipsis", label: "kes (…)" }, { value: "wrap", label: "alt satıra" }], toCode: { ellipsis: null } },
    { key: "size", label: "Boyut", default: "md", options: ["sm", "md"] },
    { key: "color", label: "Renk", default: "default", options: [{ value: "default", label: "aksan" }, { value: "brand-blue", label: "mavi" }, { value: "brand-purple", label: "mor" }, { value: "success", label: "yeşil" }], visibleWhen: (v) => v.field || v.mode !== "menu", prop: "m:color", toCode: { default: null } },
  ],
});
