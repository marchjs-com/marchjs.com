import { definePlayground } from "../../spec.ts";
import type { StepItem } from "march/navigation";

interface Values { steps: readonly StepItem[]; current: number; vertical: boolean; clickable: boolean; color: string; done: string; connector: boolean }

// steps and current are required: the raw component in MarchIDE gets these defaults, so it always draws something
const CHECKOUT: readonly StepItem[] = [{ title: "Sepet", description: "3 ürün" }, { title: "Adres", description: "Teslimat" }, { title: "Ödeme", description: "Kart" }, { title: "Onay", description: "Özet" }];
const PLAIN: readonly StepItem[] = [{ title: "Sepet" }, { title: "Adres" }, { title: "Ödeme" }, { title: "Onay" }];
const SHORT: readonly StepItem[] = [{ title: "Hesap" }, { title: "Profil" }, { title: "Bitti" }];

export default definePlayground<Values>({
  options: [
    { key: "steps", label: "Adımlar (steps)", default: CHECKOUT, options: [{ value: CHECKOUT, label: "4, açıklamalı" }, { value: PLAIN, label: "4, yalın" }, { value: SHORT, label: "3 adım" }] },
    { key: "current", label: "Geçerli adım (current)", default: 1, min: 0, max: 4 },
    // a demo option: in MarchIDE onSelect comes from the Events panel
    { key: "clickable", label: "Adımlar tıklanabilir", default: true, prop: false },
    { key: "vertical", label: "Dikey", default: false },
    // a demo option: in MarchIDE doneIcon / renderDot are the API's own props
    { key: "done", label: "Biten adım işareti", default: "check", options: [{ value: "check", label: "onay imi" }, { value: "star", label: "kendi ikonum (yıldız)" }, { value: "number", label: "numara kalsın" }, { value: "own", label: "kendi içeriğim" }], prop: false },
    // on by default: off is written {false} (an unset prop would be the component's default, on)
    { key: "connector", label: "Bağlantı çizgisi", default: true, toCode: { false: "{false}" } },
    { key: "color", label: "Renk", default: "", options: [{ value: "", label: "tema" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-blue", label: "mavi" }, { value: "brand-green", label: "yeşil" }, { value: "brand-purple", label: "mor" }], prop: "m:color" },
  ],
});
