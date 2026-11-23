import { definePlayground } from "../../spec.ts";
import type { StepItem } from "march/navigation";

interface Values { steps: readonly StepItem[]; current: number; vertical: boolean; morph: boolean; color: string; highlight: boolean; nav: boolean; counter: string; done: string }

// steps and current are required: the raw component in MarchIDE gets these defaults, so it always draws something
const CHECKOUT: readonly StepItem[] = [{ title: "Sepet", description: "3 ürün" }, { title: "Adres", description: "Teslimat" }, { title: "Ödeme", description: "Kart" }, { title: "Onay", description: "Özet" }];
const PLAIN: readonly StepItem[] = [{ title: "Sepet" }, { title: "Adres" }, { title: "Ödeme" }, { title: "Onay" }];

export default definePlayground<Values>({
  options: [
    { key: "steps", label: "Adımlar (steps)", default: CHECKOUT, options: [{ value: CHECKOUT, label: "açıklamalı" }, { value: PLAIN, label: "yalın" }] },
    { key: "current", label: "Geçerli adım (current)", default: 1, min: 0, max: 3 },
    // on by default: off is written {false} (an unset prop would be the component's default, on)
    { key: "morph", label: "Morph geçişi", default: true, toCode: { false: "{false}" } },
    { key: "highlight", label: "Sıvı vurgu", default: true, toCode: { false: "{false}" } },
    // a counter of your own is a function (counter={(i, n) => …}): write it in the code; here it is on or off
    // Back / Next under the steps (with the counter between them); on in MarchIDE too, where there are no panels
    { key: "nav", label: "Geri / İleri çubuğu", default: true },
    { key: "counter", label: "Sayaç", default: "on", visibleWhen: (v) => v.nav, options: [{ value: "on", label: "2 / 4" }, { value: "off", label: "yok" }], toCode: { on: null, off: "{false}" } },
    // a demo option: in MarchIDE doneIcon is the API's own prop
    { key: "done", label: "Biten adım işareti", default: "check", options: [{ value: "check", label: "onay imi" }, { value: "number", label: "numara kalsın" }], prop: false },
    { key: "vertical", label: "Dikey", default: false },
    { key: "color", label: "Renk", default: "", options: [{ value: "", label: "tema" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-blue", label: "mavi" }, { value: "brand-green", label: "yeşil" }, { value: "brand-purple", label: "mor" }], prop: "m:color" },
  ],
});
