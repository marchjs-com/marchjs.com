import { definePlayground } from "../../spec.ts";

interface Values { head: boolean; actions: boolean; foot: boolean; sticky: boolean; ring: boolean; color: string; readonly: boolean; disabled: boolean }

export default definePlayground<Values>({
  options: [
    { key: "head", label: "Üst çubuk", default: true, toCode: { true: '"Biçim araçları"', false: null } },
    { key: "actions", label: "Üst çubukta eylem (kelime rozeti)", default: true, visibleWhen: (v) => v.head, toCode: { true: '"12 kelime"', false: null } },
    { key: "sticky", label: "Üst çubuk kaydırırken yapışır", default: false, visibleWhen: (v) => v.head, prop: "headProps", toCode: { true: '{{"sticky":true}}', false: null } },
    { key: "foot", label: "Alt çubuk", default: true, toCode: { true: '"Markdown desteklenir"', false: null } },
    { key: "ring", label: "Odak halkası", default: true, toCode: { false: "{false}" } },
    { key: "color", label: "Renk", default: "", options: [{ value: "", label: "vurgu" }, { value: "brand-blue", label: "mavi" }, { value: "brand-green", label: "yeşil" }, { value: "brand-purple", label: "mor" }], prop: "m:color" },
    { key: "readonly", label: "Salt okunur", default: false },
    { key: "disabled", label: "Devre dışı", default: false },
  ],
});
