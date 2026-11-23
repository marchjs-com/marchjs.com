import { definePlayground } from "../../spec.ts";

interface Values { value: string; label: string; variant: string; size: string; text: boolean; icons: string; color: string; motion: string }

export default definePlayground<Values>({
  options: [
    { key: "value", label: "Değer", default: "yes", options: [{ value: "yes", label: "evet" }, { value: "no", label: "hayır" }, { value: "partial", label: "kısmen" }], toCode: { yes: null, no: "{false}", partial: '"partial"' } },
    // the text read for the value (empty: the labels, Evet / Hayır / Kısmen)
    { key: "label", label: "Okunan metin (label)", default: "", kind: "text" },
    { key: "motion", label: "Geçiş hareketi (değeri değiştir)", default: "flip", options: [{ value: "none", label: "yok" }, { value: "flip", label: "dönerek" }, { value: "fade", label: "belirerek" }, { value: "pop", label: "zıplayarak" }, { value: "draw", label: "çizilerek" }, { value: "own", label: "kendi hareketim (kayarak)" }] },
    { key: "variant", label: "Görünüm", default: "plain", options: [{ value: "plain", label: "yalın" }, { value: "soft", label: "yumuşak disk" }, { value: "solid", label: "dolu disk" }] },
    { key: "size", label: "Boyut", default: "md", options: ["sm", "md", "lg"] },
    { key: "text", label: "Metni göster", default: false },
    // the card's own glyph sets (icons is an object of glyphs: MarchIDE's Properties cannot write it; the Lab shows it)
    { key: "icons", label: "İşaretler", default: "default", options: [{ value: "default", label: "hazır" }, { value: "own", label: "kendi ikonlarım" }, { value: "emoji", label: "metin (👍 👎 ~)" }], prop: false },
    { key: "color", label: "Renk", default: "", options: [{ value: "", label: "değere göre" }, { value: "primary", label: "vurgu" }, { value: "brand-purple", label: "mor" }, { value: "neutral", label: "nötr" }], prop: "m:color" },
  ],
});
