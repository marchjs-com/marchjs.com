import { definePlayground } from "../../spec.ts";
import { truck, receipt, shieldCheck, plus } from "march/icons";

interface Values { multiple: boolean; variant: string; icons: boolean; chevron: string; animated: boolean; color: string }

// MarchIDE's bare Accordion: the sections (items is required) with or without their icons
const items = (icons: boolean) => [
  { title: "Kargo", subtitle: "2–3 iş günü", icon: icons ? truck : undefined, content: "Siparişler aynı gün paketlenir; HADİ Kargo ile gönderilir." },
  { title: "İade ve değişim", subtitle: "30 gün", icon: icons ? receipt : undefined, content: "Ürünü 30 gün içinde ücretsiz iade edebilirsiniz." },
  { title: "Garanti", icon: icons ? shieldCheck : undefined, content: "Bütün cihazlar iki yıl garantilidir." },
];

export default definePlayground<Values>({
  options: [
    { key: "multiple", label: "Birden çok açık", default: false },
    { key: "variant", label: "Görünüm", default: "separated", options: [{ value: "separated", label: "ayrık" }, { value: "contained", label: "çerçeveli" }] },
    { key: "icons", label: "İkonlar", default: true, prop: "items", toProp: (x) => items(!!x), toCode: () => "{items}" },
    { key: "chevron", label: "Ok", default: "arrow", options: [{ value: "arrow", label: "ok" }, { value: "plus", label: "artı / eksi (kendi işaretim)" }, { value: "off", label: "yok" }],
      toProp: (x) => (x === "off" ? false : x === "plus" ? plus : true), toCode: { arrow: null, plus: "{plus}", off: "{false}" } },
    { key: "animated", label: "Açılma hareketi", default: true },
    { key: "color", label: "İkon rengi", default: "primary", options: [{ value: "primary", label: "vurgu" }, { value: "brand-blue", label: "mavi" }, { value: "brand-purple", label: "mor" }, { value: "success", label: "yeşil" }], visibleWhen: (v) => v.icons, prop: "m:color" },
  ],
});
