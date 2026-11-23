import { definePlayground } from "../../spec.ts";
import { el } from "../../playground-el.ts";

interface Values { chrome: string; snap: boolean; resizable: boolean; color: string; stripe: boolean; icons: boolean; title: string }

export default definePlayground<Values>({
  options: [
    { key: "title", label: "Başlık (title)", default: "Notlar", kind: "text" },
    { key: "chrome", label: "Görünüm", default: "hadi", options: [{ value: "hadi", label: "HADİ" }, { value: "mac", label: "Mac" }, { value: "windows", label: "Windows" }] },
    { key: "snap", label: "Kenara kenetlen", default: true },
    { key: "resizable", label: "Boyutlanabilir", default: true },
    { key: "color", label: "Vurgu rengi", default: "primary", options: [{ value: "primary", label: "vurgu" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-purple", label: "mor" }, { value: "success", label: "yeşil" }], visibleWhen: (v) => v.chrome === "hadi" },
    { key: "stripe", label: "Marka şeridi", default: true, visibleWhen: (v) => v.chrome === "hadi" },
    { key: "icons", label: "Kendi düğme ikonlarım", default: false, toProp: (x) => (x ? { close: "✕", minimize: "–", maximize: "□", restore: "❐" } : undefined), toCode: { true: '{{ close: "✕", minimize: "–", maximize: "□", restore: "❐" }}', false: null } },
  ],
});
