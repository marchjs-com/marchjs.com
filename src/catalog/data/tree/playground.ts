import { definePlayground } from "../../spec.ts";

interface Values { nodes: string; label: string; expanded: string; icons: boolean; meta: boolean; chevron: string; toggle: string; color: string }

// nodes is required: MarchIDE's raw <Tree /> gets this JSON (kind "json"), so it never draws without nodes
export const NODES = JSON.stringify([
  { id: "src", label: "src", children: [
    { id: "ui", label: "ui", meta: "3", children: [{ id: "button", label: "button.ts", meta: "158" }, { id: "menu", label: "menu.ts", meta: "152" }, { id: "long", label: "a-very-long-module-name-that-scrolls.ts", meta: "12" }] },
    { id: "css", label: "css", meta: "2", children: [{ id: "tokens", label: "tokens.css", meta: "120" }, { id: "themes", label: "themes.css", meta: "gen" }] },
  ] },
  { id: "cfg", label: "march.config.js", meta: "1 KB" },
]);

export default definePlayground<Values>({
  options: [
    { key: "nodes", label: "Düğümler (nodes, JSON)", default: NODES, kind: "json", toCode: (x) => `{${String(x)}}` },
    { key: "label", label: "Ad (label)", default: "Dosyalar", kind: "text" },
    { key: "expanded", label: "Başta açık (expanded, JSON)", default: '["src","ui"]', kind: "json", toCode: (x) => `{${String(x)}}` },
    { key: "chevron", label: "Açma oku", default: "on", options: [{ value: "on", label: "ok" }, { value: "own", label: "kendi işaretim (+ / −)" }, { value: "off", label: "yok" }], toCode: { on: null, own: "{(node, open) => <b>{() => (open() ? \"−\" : \"+\")}</b>}", off: "{false}" } },
    { key: "toggle", label: "Açıp kapatan", default: "row", options: [{ value: "row", label: "satır" }, { value: "chevron", label: "yalnız ok" }], visibleWhen: (v) => v.chevron !== "off" },
    { key: "color", label: "Seçili satır rengi", default: "", options: [{ value: "", label: "vurgu rengi" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-purple", label: "mor" }, { value: "success", label: "yeşil" }], prop: "m:color" },
    // the showcase card's own: icons and meta of its nodes (not props of Tree)
    { key: "icons", label: "İkon", default: true, prop: false },
    { key: "meta", label: "Sağdaki bilgi", default: true, prop: false },
  ],
});
