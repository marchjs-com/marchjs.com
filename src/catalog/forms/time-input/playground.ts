import { definePlayground } from "../../spec.ts";

// every option writes a real prop of TimeInput: "Saniye" is step={1} (the field then shows and keeps seconds)
export default definePlayground<{ picker: string; hour12: string; seconds: boolean; min: string; max: string; disabled: boolean }>({
  options: [
    { key: "picker", label: "Seçici (picker)", default: "clock", options: [{ value: "clock", label: "saat kadranı" }, { value: "native", label: "tarayıcının" }], toCode: { native: null, clock: "\"clock\"" } },
    { key: "hour12", label: "Saat düzeni (hour12)", default: "", options: [{ value: "", label: "dile göre" }, { value: "24", label: "24 saat" }, { value: "12", label: "12 saat (ÖÖ / ÖS)" }],
      visibleWhen: (v) => v.picker === "clock", toProp: (v) => (v === "12" ? true : v === "24" ? false : undefined), toCode: { "": null, "24": "{false}", "12": "" } },
    { key: "seconds", label: "Saniye", default: false, prop: "step", toCode: { true: "{1}", false: null } },
    { key: "min", label: "En erken (min)", default: "", kind: "text" },
    { key: "max", label: "En geç (max)", default: "", kind: "text" },
    { key: "disabled", label: "Devre dışı", default: false },
  ],
});
