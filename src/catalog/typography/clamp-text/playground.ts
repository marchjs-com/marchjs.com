import { definePlayground } from "../../spec.ts";

interface Values { text: string; lines: number; expandable: boolean; collapsible: boolean; labels: string; color: string }

const LONG = "Cumartesi sabahı Moda sahilinde buluşuyoruz: önce on dakikalık ısınma, ardından sahil boyunca beş kilometrelik rahat tempolu koşu. Bitişte çay ocağında kahvaltı var, yeni katılanlarla tanışmak için en iyi an. Yağmur yağarsa rota değişmez, yalnızca yanınıza ince bir yağmurluk alın. Köpeğiyle gelmek isteyenler için kısa bir yürüyüş grubu da olacak."
const SHORT = "Cumartesi 09.00, Moda sahili."

export default definePlayground<Values>({
  options: [
    // the text is what the component folds: MarchIDE's raw component gets it as `text`
    { key: "text", label: "Metin", default: LONG, options: [{ value: LONG, label: "uzun" }, { value: SHORT, label: "kısa (sığar, düğme çıkmaz)" }] },
    { key: "lines", label: "Satır", default: 3, min: 1, max: 6, step: 1 },
    // default true: false is written as {false} (left out, the component would keep its default true)
    { key: "expandable", label: "\"devamı\" düğmesi", default: true, toCode: { true: null, false: "{false}" } },
    { key: "collapsible", label: "Açılınca \"daha az\"", default: true, visibleWhen: (v) => v.expandable, toCode: { true: null, false: "{false}" } },
    { key: "labels", label: "Düğme metni", default: "default", options: [{ value: "default", label: "devamı / daha az" }, { value: "own", label: "kendi metnim" }], visibleWhen: (v) => v.expandable, toCode: { default: null, own: '{{ more: "tamamını oku", less: "kısalt" }}' } },
    { key: "color", label: "Düğme rengi", default: "primary", options: [{ value: "primary", label: "tema" }, { value: "brand-blue", label: "mavi" }, { value: "brand-purple", label: "mor" }, { value: "neutral", label: "nötr" }], visibleWhen: (v) => v.expandable , prop: "m:color"},
  ],
});
