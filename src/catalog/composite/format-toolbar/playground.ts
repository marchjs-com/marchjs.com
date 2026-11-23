import { definePlayground } from "../../spec.ts";

interface Values { tools: string; hints: boolean; size: string; color: string; icons: string; labels: boolean; disabled: boolean }

export default definePlayground<Values>({
  options: [
    { key: "tools", label: "Araçlar", default: "default", options: [{ value: "default", label: "hazır liste" }, { value: "short", label: "kalın, italik, bağlantı" }, { value: "all", label: "tümü (başlık, liste, kod…)" }],
      toCode: { default: null, short: '{["bold","italic","|","link"]}', all: '{["paragraph","h2","h3","|","bold","italic","strike","code","link","emoji","|","ul","ol","task","quote","codeblock","|","undo","redo"]}' } },
    { key: "hints", label: "İpucunda kısayol", default: true },
    { key: "size", label: "Boyut", default: "sm", options: ["xs", "sm", "md"] },
    { key: "color", label: "Basılı işaretin rengi", default: "", options: [{ value: "", label: "tema" }, { value: "brand-blue", label: "mavi" }, { value: "brand-green", label: "yeşil" }, { value: "brand-purple", label: "mor" }] , prop: "m:color"},
    { key: "icons", label: "İkonlar", default: "default", options: [{ value: "default", label: "hazır" }, { value: "letters", label: "harf (B, I, S)" }], prop: false },
    { key: "labels", label: "Kendi adlarım", default: false, toCode: { true: '{{"bold":"Vurgula","italic":"Eğik yaz","link":"Adres ekle"}}', false: null } },
    { key: "disabled", label: "Devre dışı", default: false },
  ],
});
