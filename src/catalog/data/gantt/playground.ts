import { definePlayground } from "../../spec.ts";
import { todayIso, addDays } from "march/forms";

interface Values { tasks: string; label: string; scale: string; arrows: boolean; cascade: boolean; editable: boolean; todayLine: boolean; names: boolean; help: string; barLabel: string; animate: boolean }

// tasks is required: MarchIDE's raw <Gantt /> gets this launch plan (kind "json", dated from today)
const t0 = todayIso();
const task = (id: string, name: string, from: number, days: number, progress: number, deps: string[], color: string, milestone?: boolean) =>
  ({ id, name, start: addDays(t0, from), end: addDays(t0, from + days - 1), progress, deps, color, ...(milestone ? { milestone } : {}) });
export const TASKS = JSON.stringify([
  task("brief", "Kapsam ve hedefler", -12, 4, 1, [], "brand-purple"),
  task("research", "Kullanıcı araştırması", -8, 6, 1, ["brief"], "brand-purple"),
  task("design", "Arayüz tasarımı", -2, 7, 0.6, ["research"], "brand-blue"),
  task("api", "API ve veri modeli", -1, 9, 0.45, ["research"], "brand-green"),
  task("web", "Web uygulaması", 6, 10, 0.1, ["design", "api"], "brand-orange"),
  task("mobile", "Mobil uygulama", 8, 12, 0, ["design", "api"], "brand-orange"),
  task("qa", "Test ve düzeltmeler", 21, 6, 0, ["web", "mobile"], "brand-gold"),
  task("docs", "Belgeler", 18, 7, 0, ["web"], "brand-green"),
  task("beta", "HADİ ile beta", 27, 1, 0, ["qa"], "brand-pink", true),
  task("launch", "Yayın", 30, 1, 0, ["beta", "docs"], "brand-orange", true),
]);

export default definePlayground<Values>({
  options: [
    { key: "tasks", label: "Görevler (tasks, JSON)", default: TASKS, kind: "json", toCode: (x) => `{${String(x)}}` },
    { key: "label", label: "Ad (label)", default: "Ürün yayın planı", kind: "text" },
    { key: "scale", label: "Ölçek", default: "day", options: [{ value: "day", label: "gün" }, { value: "week", label: "hafta" }, { value: "month", label: "ay" }] },
    { key: "arrows", label: "Bağımlılık okları", default: true },
    { key: "editable", label: "Sürüklenebilir", default: true },
    { key: "cascade", label: "Ardılları it", default: true, visibleWhen: (v) => v.editable },
    { key: "todayLine", label: "Bugün çizgisi", default: true },
    { key: "names", label: "Görev adları sütunu", default: true, toCode: { true: null, false: "{false}" } },
    { key: "help", label: "Alt ipucu", default: "on", options: [{ value: "on", label: "hazır metin" }, { value: "own", label: "kendi metnim" }, { value: "off", label: "yok" }], toCode: { on: null, own: "\"Çubuğu sürükleyin; ardıl görevler kendiliğinden kayar.\"", off: "{false}" } },
    { key: "animate", label: "Hareket", default: true },
    // the showcase card's own: its bar text (barLabel is a function)
    { key: "barLabel", label: "Çubuk metni", default: "name", options: [{ value: "name", label: "görev adı" }, { value: "own", label: "ad + yüzde" }], prop: false },
  ],
});
