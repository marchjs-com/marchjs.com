import { definePlayground } from "../../spec.ts";

interface Values { corner: string; label: string }

export default definePlayground<Values>({
  options: [
    { key: "corner", label: "Köşe", default: "bottom-end", options: [{ value: "top-start", label: "üst baş" }, { value: "top-end", label: "üst son" }, { value: "bottom-start", label: "alt baş" }, { value: "bottom-end", label: "alt son" }], prop: false },
    { key: "label", label: "Erişilebilir ad (label)", default: "Sayfa denetimleri", kind: "text" },
  ],
});
