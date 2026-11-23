import { definePlayground } from "../../spec.ts";

interface Values { state: string; size: string; add: string; loading: boolean; color: string; name: string }

export default definePlayground<Values>({
  options: [
    // name is required: the bare StoryRing in MarchIDE gets this default
    { key: "name", label: "Ad (name)", default: "Elif Arslan", kind: "text" },
    { key: "state", label: "Durum", default: "new", options: [{ value: "new", label: "yeni" }, { value: "seen", label: "görüldü" }, { value: "close", label: "yakın arkadaş" }, { value: "none", label: "yok" }] },
    { key: "color", label: "Halka rengi", default: "sweep", options: [{ value: "sweep", label: "HADİ renkleri" }, { value: "brand-purple", label: "mor" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-blue", label: "mavi" }], visibleWhen: (v) => v.state === "new" || v.state === "close", prop: "m:color", toProp: (x) => (x === "sweep" ? undefined : x) },
    { key: "size", label: "Boyut", default: "md", options: ["sm", "md", "lg"] },
    { key: "add", label: "Rozet", default: "off", options: [{ value: "off", label: "yok" }, { value: "on", label: "+" }, { value: "own", label: "kendi ikonum" }], toCode: { off: null, on: "", own: "{true} addIcon={star}" }, toProps: (x) => (x === "off" ? {} : { add: true, addIcon: x === "own" ? "icon:star" : undefined }) },
    { key: "loading", label: "Yükleniyor", default: false, visibleWhen: (v) => v.state !== "none" },
  ],
});
