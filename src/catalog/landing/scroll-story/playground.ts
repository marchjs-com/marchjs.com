import { definePlayground } from "../../spec.ts";

// sample steps in plain JSON (strings, numbers, plain objects): the raw component in MarchIDE receives them as they are
const SAMPLE = [
  { title: "Keşfet", body: "Yakınındaki etkinlikler, ilgi alanına göre: bugün, bu hafta sonu, gelecek ay.", media: "🗺️", color: "brand-orange" },
  { title: "Katıl", body: "Tek dokunuşla yerini ayır; kimlerin geleceğini önceden gör.", media: "🎟️", color: "brand-blue" },
  { title: "Tanış", body: "Etkinlik sohbetinde merhaba de; buluşmada kimse yabancı kalmaz.", media: "🤝", color: "brand-green" },
  { title: "Paylaş", body: "Anıları akışta ve hikâyelerde paylaş.", media: "📸", color: "brand-purple" },
];

interface Values { sample: number; side: string; theme: boolean; dots: boolean; numbers: string; transition: string }

export default definePlayground<Values>({
  options: [
    // the raw component in MarchIDE (and the card's code) gets this many sample steps: an array cannot come from a switch
    { key: "sample", label: "Örnek içerik", default: 4, min: 0, max: 4, prop: "steps", toCode: (n) => (Number(n) ? `{${JSON.stringify(SAMPLE.slice(0, Number(n)))}}` : null) },
    { key: "side", label: "Görsel tarafı", default: "end", options: [{ value: "start", label: "baş" }, { value: "end", label: "son" }] },
    { key: "theme", label: "Adıma göre renk", default: true, toCode: { true: null, false: "{false}" } },
    { key: "numbers", label: "Adım numarası", default: "on", options: [{ value: "on", label: "01, 02…" }, { value: "own", label: "kendi metnim (Adım 1)" }, { value: "off", label: "yok" }], toCode: { on: null, own: "{(i) => `Adım ${i + 1}`}", off: "{false}" } },
    { key: "dots", label: "Görsel altı noktalar", default: true, toCode: { true: null, false: "{false}" } },
    { key: "transition", label: "Görsel geçişi", default: "rise", options: [{ value: "rise", label: "yükselerek" }, { value: "fade", label: "solarak" }, { value: "own", label: "kendi geçişim (dönerek)" }, { value: "none", label: "yok" }], toCode: (x) => (x === "own" ? "{(incoming, outgoing, dir) => turnIn(incoming, outgoing, dir)}" : x === "rise" ? null : `"${String(x)}"`) },
  ],
});
