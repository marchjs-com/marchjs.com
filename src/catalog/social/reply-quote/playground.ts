import { definePlayground } from "../../spec.ts";

interface Values { place: string; lines: number; color: string; bar: boolean; close: string; click: boolean; name: string; text: string }

export default definePlayground<Values>({
  options: [
    { key: "name", label: "Ad (name)", default: "Deniz Kaya", kind: "text" },
    { key: "text", label: "Metin (text)", default: "Cumartesi sabahı sahil koşusu için buluşma yerini değiştirdik: iskelenin yanındaki çay bahçesinin önü.", kind: "text" },
    { key: "place", label: "Yer", default: "field", options: [{ value: "field", label: "mesaj alanının üstü" }, { value: "bubble", label: "renkli balonun içi (inverse)" }], prop: "variant", toProp: (x) => (x === "bubble" ? "inverse" : "soft"), toCode: { field: null, bubble: '"inverse"' } },
    { key: "lines", label: "Metin satırı (0: tümü)", default: 2, min: 0, max: 4, step: 1 },
    { key: "color", label: "Renk", default: "", options: [{ value: "", label: "turuncu (hazır)" }, { value: "brand-blue", label: "mavi" }, { value: "brand-green", label: "yeşil" }, { value: "brand-purple", label: "mor" }], visibleWhen: (v) => v.place === "field", prop: "m:color" },
    { key: "bar", label: "Kenar çubuğu", default: true },
    { key: "close", label: "Vazgeç düğmesi", default: "on", options: [{ value: "on", label: "hazır" }, { value: "own", label: "kendi ikonum" }, { value: "off", label: "yok" }], visibleWhen: (v) => v.place === "field", toCode: { on: "{cancel}", own: "{cancel}", off: null }, toProps: (x) => (x === "off" ? {} : { onClose: () => undefined, close: x === "own" ? "icon:trash" : undefined }), prop: "onClose" },
    { key: "click", label: "Tıklanır (alıntılanan mesaja git)", default: false, prop: "onClick", toProp: (x) => (x ? () => undefined : undefined), toCode: { true: "{jump}", false: null } },
  ],
});
