import { definePlayground } from "../../spec.ts";
import { el } from "../../playground-el.ts";

interface Values { edge: string; line: string; grip: string; color: string; disabled: boolean }

export default definePlayground<Values>({
  options: [
    { key: "edge", label: "Kenar", default: "end", options: [{ value: "end", label: "son kenar" }, { value: "start", label: "baş kenar" }, { value: "bottom", label: "alt kenar" }, { value: "bottom-end", label: "köşe" }] },
    { key: "line", label: "Çizgi", default: "always", options: [{ value: "hover", label: "üstüne gelince" }, { value: "always", label: "hep görünür" }, { value: "none", label: "yok" }] },
    { key: "grip", label: "Tutamaç işareti", default: "on", options: [{ value: "off", label: "yok" }, { value: "on", label: "çubuk" }, { value: "own", label: "kendi işaretim" }], visibleWhen: (v) => v.edge !== "bottom-end", toProp: (x) => (x === "off" ? false : x === "own" ? el("span", "", "⋮") : true), toCode: { on: null, own: "{<Icon of={moreVertical} />}", off: "{false}" } },
    { key: "color", label: "Renk", default: "default", options: [{ value: "default", label: "aksan" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-purple", label: "mor" }, { value: "success", label: "yeşil" }], prop: "m:color", toProp: (x) => (x === "default" ? undefined : x) },
    { key: "disabled", label: "Devre dışı", default: false },
  ],
});
