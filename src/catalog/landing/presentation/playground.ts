import { definePlayground } from "../../spec.ts";

const TITLES = ["Web sitelerini yeniden düşünmek", "Neden yeni bir yol?", "Bloklarla kur", "Daha az JavaScript", "Teşekkürler"];

interface Values { sample: number; transition: string; presenter: boolean; progress: boolean; progressColor: string; counter: string; controls: boolean }

export default definePlayground<Values>({
  options: [
    // the raw component in MarchIDE (and the card's code) gets this many title slides: its slides are children
    { key: "sample", label: "Slayt sayısı", default: 5, min: 1, max: 5, prop: "children", toCode: (n) => `{${JSON.stringify(TITLES.slice(0, Number(n)))}}` },
    { key: "transition", label: "Geçiş", default: "slide", options: [{ value: "slide", label: "kaydır" }, { value: "fade", label: "sol" }, { value: "zoom", label: "yakınlaş" }, { value: "own", label: "kendi geçişim (dönerek)" }, { value: "none", label: "yok" }], toCode: (x) => (x === "own" ? `{(incoming) => animate(incoming, { opacity: [0, 1], transform: ["rotate(8deg) scale(.7)", "rotate(0deg) scale(1)"] })}` : `"${String(x)}"`) },
    { key: "presenter", label: "Konuşmacı görünümü", default: false },
    { key: "progress", label: "İlerleme çizgisi", default: true, toCode: { true: null, false: "{false}" } },
    { key: "progressColor", label: "Çizginin rengi", default: "gradient", options: [{ value: "gradient", label: "marka geçişi" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-purple", label: "mor" }], toCode: { gradient: null }, visibleWhen: (v) => v.progress },
    { key: "controls", label: "Denetim çubuğu", default: true, toCode: { true: null, false: "{false}" } },
    { key: "counter", label: "Slayt sayacı", default: "on", options: [{ value: "on", label: "var" }, { value: "own", label: "kendi metnim (2 / 5)" }, { value: "off", label: "yok" }], toCode: { on: null, off: "{false}", own: "{(i, n) => `${i + 1} / ${n}`}" }, visibleWhen: (v) => v.controls },
  ],
});
