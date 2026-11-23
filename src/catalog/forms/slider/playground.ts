import { definePlayground } from "../../spec.ts";

// every option writes a prop of Slider (the raw component in MarchIDE draws with them); the props that take a function
// or a node (format, valueText, a track node) cannot come from a panel value: SliderLab in MarchIDE shows them
export default definePlayground<{ step: number; showValue: boolean; track: string; color: string }>({
  options: [
    { key: "step", label: "Adım", default: 5, options: [1, 5, 10, 25] },
    { key: "showValue", label: "Değeri yanında göster", default: true, toCode: { true: null, false: "{false}" } },
    { key: "track", label: "İz", default: "native", options: [{ value: "native", label: "tarayıcının izi" }, { value: "ramp", label: "renk rampası" }], toCode: { native: null, ramp: "{true}" } },
    { key: "color", label: "Renk", default: "", options: [{ value: "", label: "tema" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-blue", label: "mavi" }, { value: "brand-green", label: "yeşil" }], prop: "m:color" },
  ],
});
