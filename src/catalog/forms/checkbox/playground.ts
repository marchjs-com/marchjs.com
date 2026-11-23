import { definePlayground } from "../../spec.ts";

export default definePlayground<{ label: string; variant: string; size: string; indeterminate: boolean; grid: boolean }>({
  options: [
    { key: "label", label: "Etiket", default: "Bildirimleri al", visibleWhen: (v) => !v.grid },
    { key: "variant", label: "Görünüm", default: "classic", options: ["classic", "soft", "chip", "card", "toggle"], visibleWhen: (v) => !v.grid },
    { key: "size", label: "Boyut", default: "md", options: ["sm", "md", "lg"] },
    { key: "indeterminate", label: "Kısmi (indeterminate)", default: false, visibleWhen: (v) => !v.grid && (v.variant === "classic" || v.variant === "soft") },
    // a list of label-less rows: an example of the showcase card (prop: false), not a prop of Checkbox
    { key: "grid", label: "Etiketsiz liste seçimi (Shift ile aralık)", default: false, prop: false },
  ],
});
