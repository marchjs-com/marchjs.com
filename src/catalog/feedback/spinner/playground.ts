import { definePlayground } from "../../spec.ts";

interface Values { size: string; label: string; decorative: boolean; colors: string; color: string }

export default definePlayground<Values>({
  options: [
    { key: "size", label: "Boyut", default: "lg", kind: "segmented", options: ["sm", "md", "lg", { value: "em", label: "em (metne uyar)" }] },
    { key: "label", label: "Erişilebilir ad (label)", default: "Yükleniyor", kind: "text", visibleWhen: (v) => !v.decorative },
    { key: "decorative", label: "Süs (ekran okuyucudan gizli)", default: false },
    { key: "colors", label: "Renkler", visibleWhen: (v) => v.size !== "em", default: "brand", kind: "cards", options: [{ value: "brand", label: "dört marka rengi" }, { value: "pair", label: "iki renk" }, { value: "single", label: "tek renk" }],
      toCode: { pair: '{["brand-blue", "brand-green"]}' } },
    { key: "color", label: "Tek rengin tonu", default: "theme", kind: "chips", options: [{ value: "theme", label: "tema" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-purple", label: "mor" }, { value: "success", label: "yeşil" }, { value: "danger", label: "kırmızı" }], toCode: { theme: null }, visibleWhen: (v) => v.size !== "em" && v.colors === "single" },
  ],
});
