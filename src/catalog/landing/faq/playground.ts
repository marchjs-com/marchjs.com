import { definePlayground } from "../../spec.ts";

// sample questions in plain JSON (strings, numbers, plain objects): the raw component in MarchIDE receives them as they are
const SAMPLE = [
  { q: "HADİ ücretsiz mi?", a: "Evet. Keşfetmek, katılmak, sohbet ve akış ücretsiz; Premium isteğe bağlı.", keywords: "fiyat premium para" },
  { q: "Telefonda mı, tarayıcıda mı?", a: "İkisinde de; tarayıcıdan hiçbir şey kurmadan kullanabilirsin.", keywords: "uygulama indir web" },
  { q: "Kendi etkinliğimi nasıl kurarım?", a: "Ne, nerede, ne zaman ve kaç kişi: birkaç adımda yayında." },
  { q: "Tanışma yemekleri nedir?", a: "Ortak ilgi alanı olan birkaç kişinin aynı masada buluştuğu yemekler.", keywords: "yemek tanışma masa" },
  { q: "Etkinlik iptal olursa ne olur?", a: "Katılanlara hemen bildirim gider; iade düzenleyicinin koşullarına göre yapılır.", keywords: "iade iptal bilet" },
  { q: "Güvende miyim?", a: "Doğrulama, şikâyet ve engelleme her ekranda bir dokunuş uzağında.", keywords: "güvenlik engelle şikayet" },
];

interface Values { sample: number; title: string; lead: string; layout: string; search: boolean; multiple: boolean; texts: boolean; count: boolean; reveal: string }

export default definePlayground<Values>({
  options: [
    // the raw component in MarchIDE (and the card's code) gets this many sample questions: an array cannot come from a switch
    { key: "sample", label: "Örnek içerik", default: 6, min: 0, max: 6, prop: "items", toCode: (n) => (Number(n) ? `{${JSON.stringify(SAMPLE.slice(0, Number(n)))}}` : null) },
    { key: "title", label: "Başlık (title)", default: "Sık sorulanlar", kind: "text", visibleWhen: (v) => v.layout === "split" },
    { key: "lead", label: "Açıklama (lead)", default: "Aradığını bulamadın mı? Bize yaz, yanıtlayalım.", kind: "text", visibleWhen: (v) => v.layout === "split" },
    { key: "layout", label: "Düzen", default: "split", options: [{ value: "center", label: "ortada" }, { value: "split", label: "iki sütun" }] },
    { key: "search", label: "Arama", default: true },
    { key: "multiple", label: "Birden çok açık", default: false },
    { key: "count", label: "Eşleşme sayısı satırı", default: true, toCode: { true: null, false: "{false}" }, visibleWhen: (v) => v.search },
    { key: "texts", label: "Kendi arama metinlerim", default: false, prop: "labels", toCode: (x) => (x ? `{${JSON.stringify({ search: "Bir kelime yaz: bilet, yemek, iptal…", empty: "Bunu bulamadık. Bize yaz, yanıtlayalım." })}}` : null), visibleWhen: (v) => v.search },
    { key: "reveal", label: "Başlık girişi", default: "up", options: [{ value: "up", label: "aşağıdan" }, { value: "start", label: "yandan" }, { value: "blur", label: "netleşme" }, { value: "none", label: "yok" }], visibleWhen: (v) => v.layout === "split" },
  ],
});
