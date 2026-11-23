import { definePlayground } from "../../spec.ts";
import { el } from "../../playground-el.ts";

interface Values { kind: string; size: string; icon: boolean; subtitle: boolean; meta: boolean; actions: boolean; close: string; divider: boolean; tone: string; color: string; title: string }

export default definePlayground<Values>({
  options: [
    { key: "title", label: "Başlık (title)", default: "Ayarlar", kind: "text" },
    { key: "kind", label: "Yer", default: "header", options: [{ value: "header", label: "üst çubuk" }, { value: "footer", label: "alt çubuk" }], prop: "as" },
    { key: "size", label: "Boyut", default: "md", options: ["sm", "md", "lg"] },
    { key: "icon", label: "İkon", default: true, toCode: { true: "{settings}", false: null } },
    { key: "color", label: "İkon rengi", default: "none", options: [{ value: "none", label: "soluk" }, { value: "primary", label: "aksan" }, { value: "brand-orange", label: "turuncu" }, { value: "success", label: "yeşil" }], visibleWhen: (v) => v.icon, prop: "m:color", toProp: (x) => (x === "none" ? undefined : x) },
    { key: "subtitle", label: "Alt başlık", default: true, toProp: (x) => (x ? "Çalışma alanı · herkese açık" : false), toCode: { true: '"Çalışma alanı · herkese açık"', false: null } },
    { key: "meta", label: "Sayı rozeti", default: false, toProp: (x) => (x ? el("span", "m-badge", "3") : false), toCode: { true: "{<Badge>3</Badge>}", false: null } },
    { key: "actions", label: "Eylemler", default: true, toProp: (x) => (x ? el("button", "m-btn m-btn-secondary m-btn-sm", "Kaydet") : false), toCode: { true: '{<Button size="sm">Kaydet</Button>}', false: null } },
    { key: "close", label: "Kapat düğmesi", default: "on", options: [{ value: "on", label: "var" }, { value: "own", label: "kendi ikonum" }, { value: "off", label: "yok" }], toProp: (x) => (x === "off" ? false : x === "own" ? el("span", "", "–") : true), toCode: { on: null, own: "{<Icon of={minus} />}", off: "{false}" } },
    { key: "divider", label: "Ayırıcı çizgi", default: true },
    { key: "tone", label: "Zemin", default: "plain", options: [{ value: "plain", label: "düz" }, { value: "muted", label: "soluk (düzenleyici)" }] },
  ],
});
