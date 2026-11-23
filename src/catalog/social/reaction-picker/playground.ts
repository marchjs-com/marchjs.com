import { definePlayground } from "../../spec.ts";

interface Values { layout: string; more: string; color: string; pop: boolean }

export default definePlayground<Values>({
  options: [
    { key: "layout", label: "Düzen", default: "row", options: [{ value: "row", label: "satır (tepki)" }, { value: "grid", label: "ızgara (emoji paneli)" }] },
    { key: "more", label: "+ düğmesi", default: "on", options: [{ value: "on", label: "+" }, { value: "own", label: "kendi ikonum" }, { value: "off", label: "yok" }], visibleWhen: (v) => v.layout === "row", toCode: { on: "{openPanel}", own: "{openPanel}", off: null }, toProps: (x) => (x === "off" ? {} : { onMore: () => undefined, moreIcon: x === "own" ? "icon:smile" : undefined }), prop: "onMore" },
    { key: "color", label: "Seçili tepki rengi", default: "brand-blue", options: [{ value: "brand-blue", label: "mavi" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-pink", label: "pembe" }, { value: "brand-green", label: "yeşil" }], visibleWhen: (v) => v.layout === "row", prop: "m:color" },
    { key: "pop", label: "Açılış hareketi", default: true },
  ],
});
