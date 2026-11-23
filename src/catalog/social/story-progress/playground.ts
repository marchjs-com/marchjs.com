import { definePlayground } from "../../spec.ts";

interface Values { count: number; duration: number; paused: boolean; color: string; index: number }

export default definePlayground<Values>({
  options: [
    { key: "count", label: "Hikâye", default: 5, options: [1, 3, 5, 10] },
    // index is required: the bare StoryProgress in MarchIDE plays this one
    { key: "index", label: "Şimdiki (index)", default: 1, min: 0, max: 9, step: 1 },
    { key: "duration", label: "Süre", default: 3000, options: [{ value: 1500, label: "1,5 sn" }, { value: 3000, label: "3 sn" }, { value: 6000, label: "6 sn" }] },
    { key: "paused", label: "Duraklat", default: false },
    { key: "color", label: "Dolgu rengi", default: "white", options: [{ value: "white", label: "beyaz" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-green", label: "yeşil" }, { value: "brand-pink", label: "pembe" }], toProp: (x) => (x === "white" ? undefined : x) },
  ],
});
