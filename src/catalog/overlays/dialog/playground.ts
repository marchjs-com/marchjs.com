import { definePlayground } from "../../spec.ts";
import { el } from "../../playground-el.ts";

interface Values { size: string; footer: boolean; dismissable: boolean; long: boolean; closeButton: string; motion: string; open: boolean; title: string }

export default definePlayground<Values>({
  options: [
    // MarchIDE: the bare Dialog shows while open is on (in the preview's box)
    { key: "open", label: "Açık (open)", default: true },
    { key: "title", label: "Başlık", default: "Davet gönder", kind: "text" },
    { key: "size", label: "Boyut", default: "md", kind: "segmented", options: ["sm", "md", "lg", "full"] },
    { key: "footer", label: "Alt çubuk (düğmeler)", default: true, toProp: (x) => (x ? [el("button", "m-btn m-btn-secondary", "Vazgeç"), el("button", "m-btn m-btn-primary", "Gönder")] : undefined), toCode: { true: "{<><Button>Vazgeç</Button><Button variant=\"primary\">Gönder</Button></>}", false: null } },
    { key: "dismissable", label: "Escape ve perde kapatır", default: true },
    { key: "closeButton", label: "Kapat (×) düğmesi", default: "x", options: [{ value: "x", label: "×" }, { value: "own", label: "kendi ikonum (geri oku)" }, { value: "off", label: "yok" }], visibleWhen: (v) => v.dismissable, toProp: (x) => (x === "off" ? false : x === "own" ? "icon:arrowLeft" : true), toCode: { x: null, own: "{arrowLeft}", off: "{false}" } },
    { key: "motion", label: "Giriş hareketi", default: "scale", options: [{ value: "scale", label: "büyüyerek" }, { value: "fade", label: "belirerek" }, { value: "rise", label: "yükselerek" }, { value: "none", label: "yok" }] },
    { key: "long", label: "Uzun içerik (kaydırma)", default: false, prop: "children", toProp: (x) => el("div", "", ...Array.from({ length: x ? 30 : 2 }, (_, i) => el("p", "", `Satır ${i + 1}: davet edilecek kişiler ve notlar.`))), toCode: { true: "{<LongBody />}", false: "{<Body />}" } },
  ],
});
