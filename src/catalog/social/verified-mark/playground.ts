import { definePlayground } from "../../spec.ts";

interface Values { size: string; color: string; icon: string; label: string }

export default definePlayground<Values>({
  stage: "center",
  code: {},
  options: [
    { key: "size", label: "Boyut", default: "md", options: ["sm", "md", "lg"] },
    { key: "color", label: "Renk", default: "", options: [{ value: "", label: "marka mavisi" }, { value: "brand-green", label: "yeşil" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-gold", label: "altın" }, { value: "neutral", label: "nötr" }], prop: "m:color" },
    { key: "icon", label: "İkon", default: "default", options: [{ value: "default", label: "hazır rozet" }, { value: "shield", label: "kalkan" }, { value: "text", label: "metin (✔)" }], toCode: { default: null, shield: "{shieldCheck}", text: '"✔"' }, toProp: (x) => (x === "shield" ? "icon:shieldCheck" : x === "text" ? "✔" : undefined) },
    { key: "label", label: "Erişilebilir ad", default: "default", options: [{ value: "default", label: "hazır metin" }, { value: "own", label: "kendi metnim" }, { value: "off", label: "yok (süs)" }], toCode: { default: null, own: '"Onaylı işletme"', off: "{false}" } },
  ],
});
