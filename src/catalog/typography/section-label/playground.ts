import { definePlayground } from "../../spec.ts";

interface Values { label: string; icon: string; count: boolean; actions: boolean; upper: boolean; rule: boolean; size: string; color: string }

export default definePlayground<Values>({
  options: [
    // the text (label) is what the component shows: MarchIDE's raw component gets this default
    { key: "label", label: "Metin (label)", default: "Sık kullanılanlar", kind: "text" },
    // default true: false is written as upper={false} (left out, the component would stay uppercase)
    { key: "upper", label: "Büyük harf", default: true, toCode: { true: null, false: "{false}" } },
    { key: "icon", label: "İkon", default: "", options: [{ value: "", label: "yok" }, { value: "star", label: "yıldız" }, { value: "clock", label: "saat" }] },
    { key: "count", label: "Sayı", default: true, toCode: { true: "{3}", false: null } },
    { key: "actions", label: "Eylem düğmesi", default: true, toCode: { true: "{<IconButton size=\"sm\" icon={plus} label=\"Ekle\" />}", false: null } },
    { key: "rule", label: "Çizgi", default: false },
    { key: "size", label: "Boyut", default: "sm", options: ["sm", "md"] },
    { key: "color", label: "Renk", default: "", options: [{ value: "", label: "soluk" }, { value: "primary", label: "aksan" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-purple", label: "mor" }], prop: "m:color" },
  ],
});
