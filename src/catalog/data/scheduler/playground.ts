import { definePlayground } from "../../spec.ts";
import { todayIso, addDays } from "march/forms";
import { startOfWeek } from "../../demo-util.ts";

interface Values { events: string; label: string; view: string; step: number; locale: string; weekends: boolean; editable: boolean; toolbar: boolean; views: boolean; todayButton: boolean; nowLine: boolean; event: string; help: string; animate: boolean }

// events is required: MarchIDE's raw <Scheduler /> gets this week's team calendar (kind "json", dated from today)
const monday = startOfWeek(todayIso(), 1);
const at = (day: number, time: string): string => `${addDays(monday, day)}T${time}`;
export const EVENTS = JSON.stringify([
  { id: "e1", title: "Günlük toplantı", start: at(0, "09:00"), end: at(0, "09:30"), color: "brand-blue", location: "Oda 2" },
  { id: "e2", title: "HADİ ile ürün demosu", start: at(0, "10:00"), end: at(0, "11:30"), color: "brand-orange", location: "Çevrim içi" },
  { id: "e3", title: "Tasarım atölyesi", start: at(1, "13:00"), end: at(1, "15:00"), color: "brand-green", location: "Stüdyo" },
  { id: "e4", title: "Bire bir", start: at(2, "14:00"), end: at(2, "14:45"), color: "brand-purple" },
  { id: "e5", title: "Sürüm planlama", start: at(3, "15:30"), end: at(3, "17:00"), color: "brand-green" },
  { id: "e6", title: "Takım öğle yemeği", start: at(4, "12:00"), end: at(4, "13:00"), color: "brand-gold", location: "Kafe" },
  { id: "trip", title: "Fuar (İzmir)", start: addDays(monday, 2), end: addDays(monday, 4), allDay: true, color: "brand-pink" },
]);

export default definePlayground<Values>({
  options: [
    { key: "events", label: "Etkinlikler (events, JSON)", default: EVENTS, kind: "json", toCode: (x) => `{${String(x)}}` },
    { key: "label", label: "Ad (label)", default: "Takım takvimi", kind: "text" },
    { key: "view", label: "Görünüm", default: "week", options: [{ value: "month", label: "ay" }, { value: "week", label: "hafta" }, { value: "day", label: "gün" }] },
    { key: "locale", label: "Tarih dili", default: "tr", options: [{ value: "tr", label: "Türkçe" }, { value: "en-US", label: "English (US)" }, { value: "ar-EG", label: "العربية" }, { value: "de", label: "Deutsch" }] },
    { key: "step", label: "Adım", default: 15, options: [{ value: 5, label: "5 dk" }, { value: 15, label: "15 dk" }, { value: 30, label: "30 dk" }], visibleWhen: (v) => v.view !== "month" && v.editable },
    { key: "weekends", label: "Hafta sonu", default: true, visibleWhen: (v) => v.view === "week" },
    { key: "editable", label: "Düzenlenebilir", default: true },
    { key: "toolbar", label: "Üst çubuk", default: true, toCode: { true: null, false: "{false}" } },
    { key: "views", label: "Görünüm seçici", default: true, toCode: { true: null, false: "{false}" }, visibleWhen: (v) => v.toolbar },
    { key: "todayButton", label: "Bugün düğmesi", default: true, toCode: { true: null, false: "{false}" }, visibleWhen: (v) => v.toolbar },
    { key: "nowLine", label: "Şimdi çizgisi", default: true, toCode: { true: null, false: "{false}" }, visibleWhen: (v) => v.view !== "month" },
    { key: "help", label: "Alt ipucu", default: "on", options: [{ value: "on", label: "hazır metin" }, { value: "own", label: "kendi metnim" }, { value: "off", label: "yok" }], toCode: { on: null, own: "\"Etkinliği sürükleyin; boş bir saate sürükleyerek yenisini ekleyin.\"", off: "{false}" }, visibleWhen: (v) => v.editable },
    { key: "animate", label: "Hareket", default: true },
    // the showcase card's own: its event content (renderEvent is a function)
    { key: "event", label: "Etkinlik içeriği", default: "default", options: [{ value: "default", label: "hazır" }, { value: "own", label: "kendi içeriğim" }], prop: false },
  ],
});
