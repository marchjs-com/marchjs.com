import { definePlayground } from "../../spec.ts";

interface Values { sample: number; sampleCols: number; captionText: string; summary: boolean; caption: boolean; filter: boolean; tags: boolean; cells: string; color: string }

// sample columns and rows for the raw component in MarchIDE (plain JSON: arrays cannot come from a switch)
const COLUMNS = [{ id: "us", name: "HADİ" }, { id: "group", name: "Küçük etkinlik grubu" }, { id: "chat", name: "Mesaj grubu" }];
const SAMPLE = [
  { label: "Yeni etkinlik keşfet", values: { us: true, group: false, chat: false } },
  { label: "Yeni insanlarla tanış", values: { us: true, group: "partial", chat: false } },
  { label: "Planlı etkinlikler ve takvim", values: { us: true, group: "partial", chat: "partial" } },
  { label: "Bilet satışı", values: { us: true, group: false, chat: false } },
  { label: "Herkes birbirini tanır", values: { us: "partial", group: true, chat: true }, note: "Küçük bir grupta herkes tanıdık. HADİ'de de kendi grubunu kurabilirsin, ama kapı yeni insanlara hep açık." },
  { label: "Sade: tek sohbet, başka bir şey yok", values: { us: false, group: true, chat: true }, note: "HADİ çok şey yapar; yalnız beş arkadaşla buluşmak istiyorsan bir mesaj grubu daha sade." },
];

export default definePlayground<Values>({
  options: [
    // the raw component in MarchIDE (and the card's code) gets this many sample rows and columns
    { key: "sample", label: "Örnek satırlar", default: 6, min: 0, max: 6, prop: "rows", toCode: (n) => (Number(n) ? `{${JSON.stringify(SAMPLE.slice(0, Number(n)))}}` : null) },
    { key: "sampleCols", label: "Örnek sütunlar", default: 2, options: [{ value: 2, label: "2" }, { value: 3, label: "3" }], prop: "columns", toCode: (n) => `{${JSON.stringify(COLUMNS.slice(0, Number(n) || 2))}}` },
    { key: "captionText", prop: "caption", label: "Tablo başlığı (caption)", default: "HADİ ve küçük bir etkinlik grubu", kind: "text" },
    { key: "caption", prop: "showCaption", label: "Başlığı göster", default: false },
    { key: "summary", label: "Özet ve süzgeç", default: true, toCode: { true: null, false: "{false}" } },
    { key: "filter", label: "“Yalnız gerideyiz” düğmesi", default: true, toCode: { true: null, false: "{false}" }, visibleWhen: (v) => v.summary },
    { key: "tags", label: "Öndeyiz / Gerideyiz etiketleri", default: true, toCode: { true: null, false: "{false}" } },
    { key: "cells", prop: "renderCell", label: "Hücreler", default: "icons", options: [{ value: "icons", label: "simgeler" }, { value: "words", label: "kendi çizimim (yazı)" }], toCode: { icons: null, words: `{(value) => (value === true ? "Var" : value === false ? "Yok" : value === "partial" ? "Kısmen" : undefined)}` } },
    { key: "color", label: "Kendi sütunumuzun rengi", default: "accent", options: [{ value: "accent", label: "vurgu" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-green", label: "yeşil" }, { value: "brand-purple", label: "mor" }], prop: "m:color", toCode: { accent: null } },
  ],
});
