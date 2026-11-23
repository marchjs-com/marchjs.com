import { definePlayground } from "../../spec.ts";

/** The cities the options are taken from (the first `count`). */
export const CITIES = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Konya", "Adana", "Trabzon", "Samsun", "Eskişehir", "Kayseri", "Mersin"];

export default definePlayground<{ count: number; kind: string }>({
  options: [
    // writes `options` as a comma-separated text (ChoicePicker takes it as the list): the count changes the raw component too
    { key: "count", label: "Seçenek sayısı", default: 4, options: [3, 4, 8, 12], prop: "options", toCode: (n) => JSON.stringify(CITIES.slice(0, Number(n)).join(", ")) },
    { key: "kind", label: "Görünüm", default: "auto", options: [{ value: "auto", label: "otomatik" }, { value: "segmented", label: "segmented" }, { value: "chips", label: "çipler" }, { value: "combobox", label: "combobox" }] },
  ],
});
