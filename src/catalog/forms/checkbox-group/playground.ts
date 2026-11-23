import { definePlayground } from "../../spec.ts";

export default definePlayground<{ options: string; variant: string; brand: boolean; inline: boolean }>({
  options: [
    // the options as a comma-separated text: the raw component (MarchIDE) renders with them; the card look shows the plans
    { key: "options", label: "Seçenekler (virgülle)", default: "Pzt, Sal, Çar, Per, Cum", kind: "text" },
    { key: "variant", label: "Görünüm", default: "chip", options: ["classic", "soft", "chip", "card", "toggle"] },
    { key: "brand", label: "HADİ renkleri", default: false, prop: "colors", toCode: { true: '"brand"', false: null } },
    { key: "inline", label: "Yan yana", default: true, visibleWhen: (v) => v.variant === "classic" || v.variant === "soft" },
  ],
});
