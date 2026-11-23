import { definePlayground } from "../../spec.ts";

// every option writes a prop of Segmented (the raw component in MarchIDE draws with them); icons, icon-only segments and
// a disabled segment with its tooltip need option objects: SegmentedLab in MarchIDE shows them
export default definePlayground<{ options: string; color: string; indicator: string; size: string }>({
  options: [
    { key: "options", label: "Seçenekler (virgülle)", default: "Gün, Hafta, Ay", kind: "text" },
    { key: "color", label: "Renk", default: "", options: [{ value: "", label: "nötr" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-blue", label: "mavi" }, { value: "brand-purple", label: "mor" }], prop: "m:color" },
    { key: "indicator", label: "Seçili gösterge", default: "fill", options: [{ value: "fill", label: "yerinde" }, { value: "slide", label: "kayan" }] },
    { key: "size", label: "Boyut", default: "md", options: [{ value: "md", label: "orta" }, { value: "sm", label: "küçük" }] },
  ],
});
