import { definePlayground } from "../../spec.ts";

interface Values { label: string; mode: string; tone: string; size: string; icon: string; color: string; selectedIcon: string }

export default definePlayground<Values>({
  options: [
    // the label (children) is required: the raw component in MarchIDE gets this default
    { key: "label", label: "Yazı", default: "Tasarım", kind: "text", prop: "children" },
    // a filter chip is a Chip with `selected`: the raw component gets selected={true} for it ("remove" needs onRemove:
    // a function, written in code, demo.tsx draws it)
    { key: "mode", label: "Tür", default: "toggle", prop: "selected", options: [{ value: "static", label: "düz" }, { value: "toggle", label: "süzgeç" }, { value: "remove", label: "kaldırılabilir" }],
      toCode: { static: null, toggle: "{true}", remove: null },
      // MarchIDE: "remove" gives the chip a no-op onRemove, so its × shows on the raw component and on an instance
      toProps: (x) => (x === "toggle" ? { selected: true } : x === "remove" ? { onRemove: () => undefined } : {}) },
    { key: "tone", label: "Ton", default: "neutral", options: ["neutral", "primary", "success", "warn", "danger", "info"] },
    { key: "size", label: "Boyut", default: "md", options: ["sm", "md"] },
    // icon names (MarchIDE's icon picker passes the name on to the raw component); empty: no icon
    { key: "icon", label: "İkon", default: "", options: [{ value: "", label: "yok" }, { value: "tag", label: "etiket" }, { value: "star", label: "yıldız" }] },
    // color (data-m-color) changes the accent: a selected filter chip and the primary tone
    { key: "color", label: "Renk (seçiliyken)", default: "", options: [{ value: "", label: "tema" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-blue", label: "mavi" }, { value: "brand-green", label: "yeşil" }, { value: "brand-purple", label: "mor" }], visibleWhen: (v) => v.mode === "toggle" || v.tone === "primary", prop: "m:color" },
    { key: "selectedIcon", label: "Seçili işareti", default: "check", options: [{ value: "check", label: "tik" }, { value: "heart", label: "kalp" }, { value: "off", label: "yok" }], visibleWhen: (v) => v.mode === "toggle" },
  ],
});
