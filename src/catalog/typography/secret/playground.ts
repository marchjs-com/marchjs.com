import { definePlayground } from "../../spec.ts";

/** The regions behind each choice (MarchIDE's raw component gets these). */
const REGIONS: Record<string, readonly (readonly [number, number?])[] | undefined> = { ends: undefined, last4: [[0, -4]], middle: [[4, 12], [16]], all: [[0]] };

interface Values { value: string; regions: string; mask: string; maskLength: number; revealed: boolean; toggle: boolean; copy: boolean; mono: boolean; size: string }

// every option writes a real prop; `value` is required, so it has a sample key
export default definePlayground<Values>({
  options: [
    { key: "value", label: "Değer (value)", default: "sk_live_7f3a9c21e4b8d05a", kind: "text" },
    { key: "regions", label: "Gizli aralıklar", default: "ends", options: [{ value: "ends", label: "ilk ve son 4 görünür" }, { value: "last4", label: "son 4 görünür" }, { value: "middle", label: "4–12 ve 16'dan sonrası" }, { value: "all", label: "hepsi" }],
      toCode: { ends: null, last4: "{[[0, -4]]}", middle: "{[[4, 12], [16]]}", all: "{[[0]]}" }, toProp: (x) => REGIONS[String(x)] },
    { key: "mask", label: "Maske karakteri", default: "•", options: ["•", "*", "✱", "x"], toCode: { "•": null } },
    { key: "maskLength", label: "Maske uzunluğu", default: 0, min: 0, max: 12, step: 1, toCode: (x) => (x ? `{${String(x)}}` : null), toProp: (x) => (x ? x : undefined) },
    { key: "revealed", label: "Açık (revealed)", default: false },
    { key: "toggle", label: "Göz düğmesi", default: true },
    { key: "copy", label: "Kopyala düğmesi", default: false },
    { key: "mono", label: "Eş aralıklı yazı", default: true },
    { key: "size", label: "Boyut", default: "md", options: ["sm", "md"], toCode: { md: null } },
  ],
});
