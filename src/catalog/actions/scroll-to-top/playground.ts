import { definePlayground } from "../../spec.ts";

interface Values { inline: boolean; threshold: number; motion: string; icon: string; color: string }

export default definePlayground<Values>({
  options: [
    // in place (the stage, MarchIDE's preview) rather than in the page corner
    { key: "inline", label: "Yerinde (inline)", default: true },
    // 0: always shown, so the button is seen before anything scrolls
    { key: "threshold", label: "Belirme eşiği", default: 0, min: 0, max: 400, step: 20, unit: "px" },
    // "own" is a function in code (demo.tsx draws it); the raw component in MarchIDE cannot take it from here: it keeps "pop"
    { key: "motion", label: "Belirme hareketi", default: "pop", options: [{ value: "pop", label: "zıplayarak" }, { value: "fade", label: "belirerek" }, { value: "slide", label: "kayarak" }, { value: "own", label: "kendi hareketim (dönerek)" }, { value: "none", label: "yok" }],
      toCode: { own: "{(el, shown) => …}" } },
    // icon names (MarchIDE's icon picker passes the name on to the raw component); "⇧" is a text of your own
    { key: "icon", label: "İkon", default: "arrowUp", options: [{ value: "arrowUp", label: "ok" }, { value: "chevronUp", label: "köşeli ok" }, { value: "⇧", label: "kendi metnim (⇧)" }] },
    { key: "color", label: "Renk", default: "", options: [{ value: "", label: "tema" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-blue", label: "mavi" }, { value: "brand-green", label: "yeşil" }, { value: "brand-purple", label: "mor" }], prop: "m:color" },
  ],
});
