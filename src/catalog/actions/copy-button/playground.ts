import { definePlayground } from "../../spec.ts";

interface Values { text: string; iconOnly: boolean; icon: string; copiedIcon: string; copiedLabel: string; copiedColor: string }

export default definePlayground<Values>({
  options: [
    // text is required (what is copied): the raw component in MarchIDE gets this default
    { key: "text", label: "Kopyalanan (text)", default: "npm i github:marchjs-com/march", kind: "text" },
    { key: "iconOnly", label: "Yalnız ikon", default: false },
    // icon names (MarchIDE's icon picker passes the name on to the raw component); empty: the component's own
    { key: "icon", label: "İkon", default: "", options: [{ value: "", label: "varsayılan" }, { value: "link", label: "kendi ikonum (bağlantı)" }] },
    { key: "copiedIcon", label: "Kopyalandı ikonu", default: "check", options: [{ value: "check", label: "tik" }, { value: "heart", label: "kalp" }, { value: "off", label: "değişmesin" }], visibleWhen: (v) => v.iconOnly || !!v.icon },
    // empty: the component's own "Copied" (translated)
    { key: "copiedLabel", label: "Kopyalandı metni", default: "", kind: "text", visibleWhen: (v) => !v.iconOnly },
    { key: "copiedColor", label: "Kopyalandı rengi", default: "", options: [{ value: "", label: "yeşil" }, { value: "brand-blue", label: "mavi" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-purple", label: "mor" }] },
  ],
});
