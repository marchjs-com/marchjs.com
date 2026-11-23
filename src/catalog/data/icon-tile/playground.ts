import { definePlayground } from "../../spec.ts";

interface Values { icon: string; tone: string; size: string; variant: string; shape: string; color: string; label: string }

export default definePlayground<Values>({
  options: [
    { key: "icon", label: "İkon (kartta ilk karo)", default: "users", options: ["users", "bell", "star", "heart", "home"], toCode: (x) => `{${String(x)}}` },
    { key: "tone", label: "Ton (kartta ilk karo)", default: "primary", options: ["primary", "neutral", "success", "warn", "danger", "info", "violet", "pink", "teal"], toCode: { primary: null } },
    { key: "size", label: "Boyut", default: "md", options: ["sm", "md", "lg"], toCode: { md: null } },
    { key: "variant", label: "Görünüm", default: "soft", options: [{ value: "soft", label: "yumuşak" }, { value: "outline", label: "çerçeveli" }, { value: "solid", label: "dolu" }], toCode: { soft: null } },
    { key: "shape", label: "Biçim", default: "square", options: [{ value: "square", label: "kare" }, { value: "round", label: "yuvarlak" }], toCode: { square: null } },
    { key: "color", label: "Renk", default: "tones", options: [{ value: "tones", label: "tonlar" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-blue", label: "mavi" }, { value: "brand-green", label: "yeşil" }, { value: "brand-purple", label: "mor" }, { value: "cat-5", label: "palet 5" }], prop: "m:color", toCode: { tones: null } },
    { key: "label", label: "Erişilebilir ad (label; boş: süs)", default: "", kind: "text" },
  ],
});
