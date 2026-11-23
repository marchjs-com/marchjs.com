import { definePlayground } from "../../spec.ts";

interface Values { title: string; highlight: string; lead: string; variant: string; size: string; eyebrow: boolean; note: boolean; backdrop: boolean; reveal: string; frameBar: boolean; tilt: boolean }

export default definePlayground<Values>({
  options: [
    // title is required: the raw component in MarchIDE gets these defaults, so it never draws an empty heading
    { key: "title", label: "Başlık (title)", default: "Yakınındaki insanlarla bugün buluş", kind: "text" },
    { key: "highlight", label: "Vurgulu kısım (highlight)", default: "bugün buluş", kind: "text" },
    { key: "lead", label: "Açıklama (lead)", default: "Sosyal ağ, sohbet ve etkinlikler tek uygulamada.", kind: "text" },
    { key: "variant", label: "Varyant", default: "mesh", kind: "cards", options: [{ value: "centered", label: "ortada" }, { value: "split", label: "bölünmüş" }, { value: "video", label: "video" }, { value: "mesh", label: "gradyan ağ" }, { value: "aurora", label: "aurora" }, { value: "product", label: "ürün" }, { value: "parallax", label: "parallax" }] },
    { key: "size", label: "Yükseklik", default: "md", options: [{ value: "md", label: "orta" }, { value: "lg", label: "büyük" }] },
    { key: "eyebrow", label: "Üst etiket", default: true, toCode: (x) => (x ? `"Yeni: tanışma yemekleri"` : null) },
    { key: "note", label: "Alt not", default: true, toCode: (x) => (x ? `"Ücretsiz · telefonda ve tarayıcıda"` : null) },
    { key: "backdrop", label: "Arka plan katmanları", default: true, toCode: { true: null, false: "{false}" }, visibleWhen: (v) => v.variant !== "video" && v.variant !== "parallax" },
    { key: "reveal", label: "Giriş hareketi", default: "up", options: [{ value: "up", label: "aşağıdan" }, { value: "blur", label: "netleşme" }, { value: "flip", label: "dönüş" }, { value: "own", label: "kendi hareketim" }, { value: "none", label: "yok" }], toCode: (x) => (x === "own" ? `{{ from: { opacity: 0, transform: "scale(.8) rotate(-3deg)" }, to: { opacity: 1, transform: "scale(1) rotate(0deg)" } }}` : `"${String(x)}"`) },
    { key: "frameBar", label: "Pencere çubuğu", default: true, toCode: { true: null, false: "{false}" }, visibleWhen: (v) => v.variant === "product" },
    { key: "tilt", label: "Eğik başla, kaydırınca düzel", default: true, toCode: { true: null, false: "{false}" }, visibleWhen: (v) => v.variant === "product" },
  ],
});
