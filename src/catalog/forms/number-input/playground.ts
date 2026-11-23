import { definePlayground } from "../../spec.ts";

// every option is a real NumberInput prop (the raw component in MarchIDE takes them as they are); the family
// (MoneyInput, PercentInput) shows under the stage
type V = { value: number; decimals: number; grouping: boolean; prefix: string; suffix: string; step: number }

export default definePlayground<V>({
  options: [
    // a starting value: the raw component shows the formatting (decimals, grouping) at once
    { key: "value", label: "Başlangıç değeri", default: 1499.9, options: [{ value: 0, label: "0" }, { value: 1499.9, label: "1499,9" }, { value: 1234567.891, label: "1234567,891" }] },
    { key: "decimals", label: "Ondalık", default: 2, options: [0, 1, 2, 3] },
    { key: "grouping", label: "Binlik ayırıcı", default: true },
    { key: "prefix", label: "Önek", default: "₺", options: [{ value: "", label: "yok" }, "₺", "$", "€"] },
    { key: "suffix", label: "Sonek", default: "", options: [{ value: "", label: "yok" }, "kg", "%", "adet"] },
    { key: "step", label: "Ok tuşu adımı", default: 1, options: [1, 10, 100] },
  ],
});
