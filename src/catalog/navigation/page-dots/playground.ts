import { definePlayground } from "../../spec.ts";

interface Values { count: number; interactive: boolean; variant: string; size: string; color: string; dot: string; orientation: string }

export default definePlayground<Values>({
  options: [
    { key: "count", label: "Sayfa sayısı", default: 5, min: 2, max: 10, step: 1 },
    // options of the stage (they choose a callback and a function), not props: as values they would reach the component
    // as `interactive` (unknown) and `dot="default"` (not a function: drawing a dot would throw). MarchIDE leaves them
    // out, so variant and size check `!== "own"` (there `dot` is undefined)
    { key: "interactive", label: "Tıklanabilir (onChange)", default: true, prop: false },
    { key: "variant", label: "Görünüm", default: "pill", options: [{ value: "pill", label: "etkin olan uzun" }, { value: "dot", label: "eşit noktalar" }], visibleWhen: (v) => v.dot !== "own" },
    { key: "size", label: "Boyut", default: "md", options: ["sm", "md", "lg"], visibleWhen: (v) => v.dot !== "own" },
    { key: "color", label: "Renk", default: "primary", options: [{ value: "primary", label: "ana renk" }, { value: "brand-blue", label: "mavi" }, { value: "brand-green", label: "yeşil" }, { value: "neutral", label: "nötr" }], prop: "m:color" },
    { key: "dot", label: "Nokta içeriği", default: "default", options: [{ value: "default", label: "nokta" }, { value: "own", label: "kendi içeriğim (sayı)" }], prop: false },
    { key: "orientation", label: "Yön", default: "horizontal", options: [{ value: "horizontal", label: "yatay" }, { value: "vertical", label: "dikey" }] },
  ],
});
