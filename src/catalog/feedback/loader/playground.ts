import { definePlayground } from "../../spec.ts";

interface Values { text: string; overlay: boolean; spinner: string; color: string; fade: boolean }

export default definePlayground<Values>({
  options: [
    // the visible text; empty: "Loading" is read to screen readers only
    { key: "text", label: "Görünür metin (boşsa yok)", default: "Panolar hazırlanıyor…", kind: "text" },
    { key: "spinner", label: "Dönen halka", default: "on", kind: "segmented", options: [{ value: "on", label: "hazır halka" }, { value: "own", label: "kendi işaretim" }, { value: "off", label: "yok" }],
      toCode: { on: null, own: "{<Icon of={hourglass} size=\"xl\" />}", off: "{false}" } },
    { key: "color", label: "Halka rengi", default: "theme", kind: "chips", options: [{ value: "theme", label: "tema" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-purple", label: "mor" }, { value: "success", label: "yeşil" }], visibleWhen: (v) => v.spinner === "on", toCode: { theme: null } },
    { key: "overlay", label: "İçeriğin üstünde (perde)", default: true },
    { key: "fade", label: "Gecikmeli belirme", default: true, toCode: { false: "{false}" } },
  ],
});
