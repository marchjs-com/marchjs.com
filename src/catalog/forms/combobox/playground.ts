import { definePlayground } from "../../spec.ts";

// options: a comma-separated text (Combobox takes it as the list), so the raw component in MarchIDE has options to show
export const TOWNS = "Kadıköy, Beşiktaş, Üsküdar, Şişli, Bakırköy, Ataşehir, Sarıyer, Fatih, Beyoğlu, Maltepe";

export default definePlayground<{ source: string; options: string; disabled: boolean }>({
  options: [
    // an async search is a function: an option of the showcase card only (prop: false), not written on the component
    { key: "source", label: "Kaynak", default: "static", prop: false, options: [{ value: "static", label: "sabit liste" }, { value: "async", label: "eşzamansız arama" }] },
    { key: "options", label: "Seçenekler (virgülle)", default: TOWNS, visibleWhen: (v) => v.source !== "async" },
    { key: "disabled", label: "Devre dışı", default: false },
  ],
});
