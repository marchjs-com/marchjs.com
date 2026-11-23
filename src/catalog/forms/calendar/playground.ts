import { definePlayground } from "../../spec.ts";

interface Values { firstDay: string; min: boolean; max: boolean; color: string; weekdays: boolean; nav: boolean; navOwn: boolean; busy: boolean }

// an ISO date `days` from today, as code (a string literal the raw Calendar in MarchIDE takes as min / max)
const shifted = (days: number): string => `"${new Date(Date.now() + days * 864e5).toISOString().slice(0, 10)}"`

// every option but the card's own two (navOwn, busy: a function / own marks, prop: false) writes a real prop, so the
// raw Calendar in MarchIDE follows it; `false` of a default-on part is written as {false}
export default definePlayground<Values>({
  options: [
    { key: "firstDay", label: "Hafta başı", default: "locale", options: [{ value: "locale", label: "dilden" }, { value: "1", label: "Pazartesi" }, { value: "0", label: "Pazar" }, { value: "6", label: "Cumartesi" }], toCode: { locale: null, 1: "{1}", 0: "{0}", 6: "{6}" } },
    { key: "min", label: "En erken: 3 gün önce (min)", default: false, toCode: (on) => (on ? shifted(-3) : null) },
    { key: "max", label: "En geç: 10 gün sonra (max)", default: false, toCode: (on) => (on ? shifted(10) : null) },
    { key: "color", label: "Renk", default: "primary", kind: "chips", options: [{ value: "primary", label: "tema" }, { value: "brand-blue", label: "mavi" }, { value: "brand-green", label: "yeşil" }, { value: "brand-purple", label: "mor" }, { value: "brand-pink", label: "pembe" }] , prop: "m:color"},
    { key: "weekdays", label: "Gün adları satırı", default: true, toCode: { true: null, false: "{false}" } },
    { key: "nav", label: "Ay düğmeleri", default: true, toCode: { true: null, false: "{false}" } },
    { key: "navOwn", label: "Kendi ay işaretlerim (« »)", default: false, visibleWhen: (v) => v.nav !== false, prop: false },
    { key: "busy", label: "Dolu günleri işaretle (kendi gün içeriğim)", default: false, prop: false },
  ],
});
