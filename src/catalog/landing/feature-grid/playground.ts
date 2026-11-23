import { definePlayground } from "../../spec.ts";

// sample features in plain JSON (strings, numbers, plain objects): the raw component in MarchIDE receives them as they are
const SAMPLE = [
  { icon: "📍", title: "Yakınındaki etkinlikler", body: "Bugün, bu hafta sonu ya da gelecek ay: haritada ve takvimde.", span: "big" },
  { icon: "🍽️", title: "Tanışma yemekleri", body: "Ortak ilgi alanı olanlarla aynı sofrada." },
  { icon: "💬", title: "Sohbet ve gruplar", body: "Buluşmadan önce de sonra da." },
  { icon: "🎟️", title: "Bilet sat", body: "Etkinliğini kur, kontenjanı belirle, bileti sat.", span: "wide" },
  { icon: "📹", title: "Görüntülü görüşme", body: "Etkinlik öncesi tanışmak için." },
  { icon: "❤️", title: "Akış ve hikâyeler", body: "Anıları paylaş, beğen, keşfet." },
];

interface Values { sample: number; variant: string; cols: number; spotlight: boolean; reveal: string }

export default definePlayground<Values>({
  options: [
    // the raw component in MarchIDE (and the card's code) gets this many sample features: an array cannot come from a switch
    { key: "sample", label: "Örnek içerik", default: 6, min: 0, max: 6, prop: "items", toCode: (n) => (Number(n) ? `{${JSON.stringify(SAMPLE.slice(0, Number(n)))}}` : null) },
    { key: "variant", label: "Görünüm", default: "bento", options: [{ value: "cards", label: "kartlar" }, { value: "plain", label: "sade" }, { value: "list", label: "liste" }, { value: "bento", label: "bento" }] },
    { key: "cols", label: "Sütun", default: 3, options: [{ value: 2, label: "2" }, { value: 3, label: "3" }, { value: 4, label: "4" }], visibleWhen: (v) => v.variant === "cards" || v.variant === "plain" },
    { key: "spotlight", label: "İmleç ışığı", default: true, toCode: { true: null, false: "{false}" }, visibleWhen: (v) => v.variant === "cards" || v.variant === "bento" },
    { key: "reveal", label: "Giriş hareketi", default: "up", options: [{ value: "up", label: "aşağıdan" }, { value: "scale", label: "büyüme" }, { value: "flip", label: "dönüş" }, { value: "own", label: "kendi hareketim" }, { value: "none", label: "yok" }], toCode: (x) => (x === "own" ? `{${JSON.stringify({ from: { opacity: 0, transform: "rotate(-4deg) scale(.9)" }, to: { opacity: 1, transform: "rotate(0deg) scale(1)" } })}}` : `"${String(x)}"`) },
  ],
});
