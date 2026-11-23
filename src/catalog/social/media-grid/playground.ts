import { definePlayground } from "../../spec.ts";
import { PHOTOS } from "../demo-data.ts";

interface Values { count: number; shape: string; gap: string; max: number; more: string }

export default definePlayground<Values>({
  options: [
    { key: "count", label: "Fotoğraf", default: 3, options: [1, 2, 3, 4, 6].map((n) => ({ value: n, label: String(n) })), prop: "items", toProp: (n) => PHOTOS.slice(0, Number(n)), toCode: (n) => `{photos.slice(0, ${String(n)})}` },
    { key: "shape", label: "Biçim", default: "auto", options: [{ value: "auto", label: "kendi oranı" }, { value: "square", label: "kare" }, { value: "portrait", label: "dikey 4:5" }], visibleWhen: (v) => v.count !== 3 && v.count < 4 },
    { key: "gap", label: "Ara", default: "thin", options: [{ value: "none", label: "yok" }, { value: "thin", label: "ince" }, { value: "gap", label: "boşluklu" }], visibleWhen: (v) => v.count > 1 },
    { key: "max", label: "En çok", default: 4, options: [2, 3, 4], visibleWhen: (v) => v.count > 2 },
    { key: "more", label: "Kalan sayısı (+N)", default: "on", options: [{ value: "on", label: "+N" }, { value: "own", label: "kendi metnim" }, { value: "off", label: "yok" }], visibleWhen: (v) => v.count > v.max, toProp: (x) => (x === "off" ? false : x === "own" ? (n: number) => `+${n} fotoğraf` : true), toCode: { on: null, own: "{(n) => `+${n} fotoğraf`}", off: "{false}" } },
  ],
});
