import { definePlayground } from "../../spec.ts";
import { el } from "../../playground-el.ts";

interface Values { start: string; end: string; orientation: string; initial: number; min: number; handle: string; color: string }

export default definePlayground<Values>({
  options: [
    // start and end are required: the bare Splitter in MarchIDE gets these panes
    { key: "start", label: "Baş bölme (start)", default: "Dosyalar", kind: "text", toProp: (x) => el("div", "sc-split-preview", String(x)) },
    { key: "end", label: "Son bölme (end)", default: "Önizleme", kind: "text", toProp: (x) => el("div", "sc-split-preview", String(x)) },
    { key: "orientation", label: "Yön", default: "horizontal", options: [{ value: "horizontal", label: "yan yana" }, { value: "vertical", label: "alt alta" }] },
    { key: "initial", label: "Başlangıç payı", default: 35, min: 20, max: 80, step: 5, unit: "%", toProp: (x) => Number(x) / 100, toCode: (x) => `{${Number(x) / 100}}` },
    { key: "min", label: "En küçük pay", default: 20, min: 5, max: 40, step: 5, unit: "%", toProp: (x) => Number(x) / 100, toCode: (x) => `{${Number(x) / 100}}` },
    { key: "handle", label: "Tutamaç", default: "line", options: [{ value: "line", label: "çizgi" }, { value: "grip", label: "kendi tutamacım" }, { value: "off", label: "yok (sabit)" }],
      toProp: (x) => (x === "off" ? false : x === "grip" ? el("span", "", "⋮") : true), toCode: { line: null, grip: "{<Icon of={moreVertical} />}", off: "{false}" } },
    { key: "color", label: "Tutamaç rengi", default: "primary", options: [{ value: "primary", label: "vurgu" }, { value: "brand-blue", label: "mavi" }, { value: "brand-purple", label: "mor" }, { value: "success", label: "yeşil" }], visibleWhen: (v) => v.handle !== "off", prop: "m:color" },
  ],
});
