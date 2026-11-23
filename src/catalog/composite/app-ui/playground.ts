import { definePlayground } from "../../spec.ts";
import { row, col, tabs, type TreeSpec } from "march/components/composite/dock-layout";

interface Values { panels: string; title: string; description: string; layoutMenu: boolean; groupMenu: boolean; bar: boolean; preset: string; ownIcon: boolean }

// MarchIDE gives the raw AppUI plain data (toCode: a JSON literal): the panels without content (empty panels) and the
// preset as its `layout` tree (presets are functions); the card uses the same names
const PANELS: Record<string, { id: string; title: string }[]> = {
  three: [{ id: "files", title: "Dosyalar" }, { id: "editor", title: "Düzenleyici" }, { id: "console", title: "Konsol" }],
  two: [{ id: "files", title: "Dosyalar" }, { id: "editor", title: "Düzenleyici" }],
};
const TREES: Record<string, TreeSpec> = {
  default: row([0.24, tabs("files")], [0.76, col([0.7, tabs("editor")], [0.3, tabs("console")])]),
  code: row([0.2, tabs("files", { collapsed: true })], [0.8, tabs(["editor", "console"])]),
  design: col([0.8, row([0.3, tabs("files")], [0.7, tabs("editor")])], [0.2, tabs("console", { collapsed: true })]),
};
const json = (x: unknown): string => `{${JSON.stringify(x)}}`;

export default definePlayground<Values>({
  options: [
    { key: "panels", label: "Paneller", default: "three", options: [{ value: "three", label: "üç (dosyalar, düzenleyici, konsol)" }, { value: "two", label: "iki (konsolsuz)" }], toCode: (x) => json(PANELS[String(x)] ?? PANELS["three"]) },
    { key: "title", label: "Başlık", default: "march-app-ui", kind: "text" },
    { key: "description", label: "Açıklama (// …)", default: "paneller, dosyalar, eklentiler", kind: "text" },
    { key: "layoutMenu", label: "Yerleşim menüsü (sağ üst)", default: true },
    { key: "groupMenu", label: "Grupların ⋯ menüsü", default: true, prop: "actions", toCode: { true: null, false: '{["maximize","collapse"]}' } },
    { key: "bar", label: "Üst çubuk", default: true },
    { key: "preset", label: "Varsayılan düzen", default: "default", options: [{ value: "default", label: "Varsayılan" }, { value: "code", label: "Kod" }, { value: "design", label: "Tasarım" }], prop: "layout", toCode: (x) => json(TREES[String(x)] ?? TREES["default"]) },
    { key: "ownIcon", label: "Yerleşim düğmesinde kendi ikonum", default: false, prop: "layoutIcon", toCode: { true: "{grid}", false: null } },
  ],
});
