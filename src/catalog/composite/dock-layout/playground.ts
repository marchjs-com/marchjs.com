import { definePlayground } from "../../spec.ts";
import { row, col, tabs, type TreeSpec } from "march/composite";

interface Values { panels: string; preset: string; actions: string; collapsed: boolean; icons: boolean; motion: boolean }

// MarchIDE gives the raw DockLayout plain data (toCode: a JSON literal): the panels without content (empty panels), and
// the start layout with "Notlar" collapsed as its `layout` tree (presets and api are functions); the card uses the same names
const PANELS: Record<string, { id: string; title: string }[]> = {
  five: [{ id: "files", title: "Dosyalar" }, { id: "editor", title: "app.ts" }, { id: "notes", title: "Notlar" }, { id: "console", title: "Konsol" }, { id: "props", title: "Özellikler" }],
  three: [{ id: "files", title: "Dosyalar" }, { id: "editor", title: "app.ts" }, { id: "console", title: "Konsol" }],
};
const tree = (preset: unknown, collapsed: unknown): TreeSpec => {
  const ed = tabs(["editor", "notes"], collapsed ? { active: "notes", collapsed: true } : {});
  return preset === "columns" ? row([0.33, tabs("files")], [0.34, ed], [0.33, tabs(["console", "props"])])
    : preset === "single" ? tabs(["editor", "files", "console", "props", "notes"])
    : row([0.28, tabs("files")], [0.72, col([0.62, ed], [0.38, tabs(["console", "props"])])]);
};
const json = (x: unknown): string => `{${JSON.stringify(x)}}`;

export default definePlayground<Values>({
  options: [
    { key: "panels", label: "Paneller", default: "five", options: [{ value: "five", label: "beş" }, { value: "three", label: "üç (dosyalar, app.ts, konsol)" }], toCode: (x) => json(PANELS[String(x)] ?? PANELS["five"]) },
    { key: "preset", label: "Başlangıç yerleşimi", default: "ide", options: [{ value: "ide", label: "IDE" }, { value: "columns", label: "üç sütun" }, { value: "single", label: "tek grup" }], prop: "layout", toCode: (x, v) => json(tree(x, v.collapsed)) },
    { key: "collapsed", label: "Notlar şeritte başlasın", default: false, prop: "layout", toCode: (x, v) => json(tree(v.preset, x)) },
    { key: "actions", label: "Grup düğmeleri", default: "all", kind: "segmented", options: [{ value: "all", label: "tümü" }, { value: "nomenu", label: "menüsüz" }, { value: "max", label: "yalnız büyüt" }, { value: "none", label: "yok" }],
      toCode: { all: null, nomenu: '{["maximize","collapse"]}', max: '{["maximize"]}', none: "{false}" } },
    // own icons and texts are two props at once (and "icons" would get an icon picker): card-only
    { key: "icons", label: "Kendi ikonlarım ve ipucu metinlerim", default: false, prop: false },
    { key: "motion", label: "Hareket (yerleşme kayması)", default: true },
  ],
});
