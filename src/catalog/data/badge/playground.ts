import { definePlayground } from "../../spec.ts";

/** The sample label of each tone (the generated code writes it when the text is left as it is). */
export const LABEL: Record<string, string> = { neutral: "Taslak", primary: "Yeni", info: "Davetli", success: "Etkin", warn: "Bekliyor", danger: "Askıda" }

interface Values { mode: string; text: string; tone: string; variant: string; size: string; dot: string; dotColor: string; pulse: string; clickable: boolean; count: number; max: number; label: string; showZero: boolean; format: string }

export default definePlayground<Values>({
  stage: "center",
  code: {},
  options: [
    // the kind writes no prop of its own (null): it only shows the options of that kind (MarchIDE too)
    { key: "mode", label: "Tür", default: "label", options: [{ value: "label", label: "etiket" }, { value: "dot", label: "noktalı" }, { value: "count", label: "sayı" }], toCode: { label: null, dot: null, count: null },
      fromCode: (a) => ("count" in a ? "count" : "dot" in a ? "dot" : "label") },
    { key: "text", label: "Metin (children)", default: "Etkin", kind: "text", prop: "children", visibleWhen: (v) => v.mode !== "count" },
    { key: "tone", label: "Ton", default: "success", options: ["neutral", "primary", "info", "success", "warn", "danger"], toCode: (t) => (t === "neutral" ? null : JSON.stringify(t)) },
    { key: "variant", label: "Dolgu", default: "soft", kind: "segmented", options: [{ value: "soft", label: "hafif" }, { value: "solid", label: "tam renk" }], toCode: { soft: null } },
    { key: "size", label: "Boyut", default: "md", kind: "segmented", options: [{ value: "md", label: "md" }, { value: "xs", label: "xs (köşe rozeti)" }], toCode: { md: null } },
    { key: "dot", label: "Nokta", default: "tone", options: [{ value: "tone", label: "hazır nokta" }, { value: "own", label: "kendi işaretim" }], visibleWhen: (v) => v.mode === "dot",
      toCode: { tone: "{true}", own: "{<Icon of={heart} />}" } },
    { key: "dotColor", label: "Nokta rengi", default: "", options: [{ value: "", label: "ton rengi" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-purple", label: "mor" }], visibleWhen: (v) => v.mode === "dot" && v.dot !== "own" && v.pulse === "off" },
    { key: "pulse", label: "Nokta hareketi", default: "off", kind: "segmented", options: [{ value: "off", label: "durgun" }, { value: "ring", label: "halka" }, { value: "blink", label: "yanıp sönme" }], visibleWhen: (v) => v.mode === "dot" && v.dot !== "own", toCode: { off: null } },
    { key: "count", label: "Sayı", default: 7, min: 0, max: 150, visibleWhen: (v) => v.mode === "count", toCode: (n) => `{${String(n)}}` },
    { key: "max", label: "En büyük sayı (max)", default: 99, options: [9, 99, 999], visibleWhen: (v) => v.mode === "count" && v.format !== "own", toCode: (n) => (n === 99 ? null : `{${String(n)}}`) },
    { key: "format", label: "Sayı metni", default: "cap", options: [{ value: "cap", label: "99+" }, { value: "own", label: "kendi metnim (7 yeni)" }], visibleWhen: (v) => v.mode === "count" && v.count > 0, toCode: { cap: null, own: "{(n) => `${n} yeni`}" } },
    { key: "label", label: "Okunan ek (label)", default: "okunmamış", kind: "text", visibleWhen: (v) => v.mode === "count" },
    { key: "showZero", label: "0 iken göster", default: false, visibleWhen: (v) => v.mode === "count" && v.count === 0 },
    // the showcase card's own: a pressable badge (in MarchIDE: onClick in Events, pressed in the code)
    { key: "clickable", label: "Tıklanır (düğme olarak çizilir)", default: false, prop: false },
  ],
});
