import { definePlayground } from "../../spec.ts";

interface Values { title: boolean; today: string; arrows: boolean; icons: string; attached: boolean; size: string; color: string; limit: boolean; labels: string }

export default definePlayground<Values>({
  options: [
    // title and today as values the raw component takes (a month's name; today's own text or false: shown with onToday)
    { key: "title", label: "Aradaki başlık (ay adı)", default: true, toCode: { true: '"Mart 2026"', false: null } },
    { key: "today", label: "Bugün düğmesi", default: "default", options: [{ value: "default", label: "var" }, { value: "own", label: "kendi içeriğim" }, { value: "off", label: "kapalı" }], toCode: { default: null, own: '"● Şimdi"', off: "{false}" } },
    { key: "arrows", label: "Oklar", default: true },
    { key: "icons", label: "Ok ikonları", default: "default", options: [{ value: "default", label: "ok başı" }, { value: "own", label: "kendi ikonlarım" }], visibleWhen: (v) => v.arrows, prop: false },
    { key: "attached", label: "Bitişik düğmeler", default: true, visibleWhen: (v) => !v.title },
    { key: "size", label: "Ok boyutu", default: "md", options: ["sm", "md"], visibleWhen: (v) => v.arrows },
    { key: "color", label: "Renk", default: "primary", options: [{ value: "primary", label: "ana renk" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-green", label: "yeşil" }, { value: "brand-purple", label: "mor" }], prop: "m:color" },
    // options of the stage (two icons, two limits, a set of texts at once), not one prop each
    { key: "limit", label: "Sınır: yalnız bu yıl (uçta ok kapanır)", default: false, visibleWhen: (v) => v.arrows, prop: false },
    { key: "labels", label: "Metinler", default: "default", options: [{ value: "default", label: "hazır" }, { value: "own", label: "kendi metinlerim" }], prop: false },
  ],
});
