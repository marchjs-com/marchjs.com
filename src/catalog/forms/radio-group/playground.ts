import { definePlayground } from "../../spec.ts";

export default definePlayground<{ options: string; variant: string; size: string }>({
  options: [
    // the options as a comma-separated text: the raw component (MarchIDE) renders with them; the card look adds hints and prices
    { key: "options", label: "Seçenekler (virgülle)", default: "Ücretsiz, Ekip, Kurumsal", kind: "text" },
    { key: "variant", label: "Görünüm", default: "classic", options: ["classic", "soft", "chip", "card", "segmented"] },
    { key: "size", label: "Boyut", default: "md", options: ["sm", "md", "lg"] },
  ],
});
