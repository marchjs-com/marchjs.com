import { definePlayground } from "../../spec.ts";

interface Values { mine: boolean; status: string; reply: boolean; reactions: boolean; group: boolean; color: string; ticks: string; tools: boolean; text: string }

export default definePlayground<Values>({
  options: [
    { key: "text", label: "Metin (text)", default: "Buluşma 7:00'de giriş kapısında. Kim geliyor?", kind: "text" },
    { key: "mine", label: "Benim mesajım", default: true },
    { key: "status", label: "Durum", default: "read", options: [{ value: "sending", label: "gidiyor" }, { value: "sent", label: "gönderildi" }, { value: "delivered", label: "iletildi" }, { value: "read", label: "okundu" }, { value: "failed", label: "gitmedi" }], visibleWhen: (v) => v.mine },
    { key: "color", label: "Balon rengi", default: "brand-blue", options: [{ value: "brand-blue", label: "mavi" }, { value: "brand-purple", label: "mor" }, { value: "brand-green", label: "yeşil" }, { value: "brand-orange", label: "turuncu" }], visibleWhen: (v) => v.mine, prop: "m:color" },
    { key: "ticks", label: "İletim işareti", default: "on", options: [{ value: "on", label: "tikler" }, { value: "own", label: "kendi metnim" }, { value: "off", label: "yok" }], visibleWhen: (v) => v.mine, toProp: (x) => (x === "off" ? false : x === "own" ? (s: string) => s : true), toCode: { on: null, own: "{(s) => <span>{s}</span>}", off: "{false}" } },
    { key: "group", label: "Grup (gönderen adı)", default: true, visibleWhen: (v) => !v.mine, prop: "sender", toProp: (x) => (x ? "HADİ Koşu Kulübü" : undefined), toCode: { true: '"HADİ Koşu Kulübü"', false: null } },
    { key: "reply", label: "Yanıt alıntısı", default: true, toProp: (x) => (x ? { name: "Deniz", text: "Yarın koşu var mı?" } : undefined), toCode: { true: '{{ name: "Deniz", text: "Yarın koşu var mı?" }}', false: null } },
    { key: "reactions", label: "Tepkiler", default: true, toProp: (x) => (x ? [{ emoji: "❤️", count: 2, mine: true }, { emoji: "😂", count: 1 }] : undefined), toCode: { true: "{reactions}", false: null } },
    { key: "tools", label: "Yanıtla düğmesi (üzerine gelince)", default: true },
  ],
});
