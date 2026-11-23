import { definePlayground } from "../../spec.ts";

interface Values { value: string; label: string; variant: string; size: string; align: string; order: string; color: string; hint: boolean; clickable: boolean; counter: boolean }

export default definePlayground<Values>({
  options: [
    { key: "value", label: "Değer (value; kartta ilk karo)", default: "128", kind: "text" },
    { key: "label", label: "Etiket (label; kartta ilk karo)", default: "Gönderi", kind: "text" },
    { key: "variant", label: "Görünüm", default: "tile", options: [{ value: "plain", label: "yalın" }, { value: "tile", label: "yumuşak karo" }, { value: "card", label: "kart" }] },
    { key: "size", label: "Boyut", default: "md", options: ["sm", "md", "lg", "xl"], toCode: { md: null } },
    { key: "align", label: "Hizalama", default: "center", options: [{ value: "start", label: "başa" }, { value: "center", label: "ortaya" }, { value: "end", label: "sona" }], toCode: { center: null } },
    { key: "order", label: "Sıra", default: "value", options: [{ value: "value", label: "önce değer" }, { value: "label", label: "önce etiket" }], toCode: { value: null } },
    { key: "color", label: "Değer rengi", default: "", options: [{ value: "", label: "metin rengi" }, { value: "primary", label: "vurgu" }, { value: "brand-blue", label: "mavi" }, { value: "brand-orange", label: "turuncu" }, { value: "success", label: "yeşil" }], prop: "m:color" },
    { key: "hint", label: "Alt not", default: false, toCode: { true: "\"son 30 günde +212\"", false: null } },
    // the showcase card's own: its tiles are buttons and roll a Counter (in MarchIDE: onClick in Events, a node value in the code)
    { key: "clickable", label: "Tıklanabilir (düğme)", default: true, prop: false },
    { key: "counter", label: "Değer: dönen sayaç", default: true, prop: false },
  ],
});
