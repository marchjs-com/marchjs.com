import { definePlayground } from "../../spec.ts";

interface Values { title: string; lead: string; layout: string; outcome: string; doneIcon: string; motion: boolean; texts: boolean }

export default definePlayground<Values>({
  options: [
    { key: "title", label: "Başlık (title)", default: "Haberdar ol", kind: "text" },
    { key: "lead", label: "Açıklama (lead)", default: "Ayda bir e-posta, yalnız yenilikler.", kind: "text" },
    { key: "layout", label: "Düzen", default: "inline", options: [{ value: "inline", label: "tek satır" }, { value: "stacked", label: "alt alta" }] },
    // what the demo's fake server answers: not a prop
    { key: "outcome", label: "Sunucu yanıtı", default: "ok", options: [{ value: "ok", label: "başarılı" }, { value: "fail", label: "hata" }], toCode: () => null },
    { key: "doneIcon", label: "Onay simgesi", default: "check", options: [{ value: "check", label: "tik" }, { value: "own", label: "kendi simgem" }, { value: "off", label: "yok" }], toCode: { check: null, off: "{false}", own: "{<Icon of={heart} />}" } },
    { key: "motion", label: "Hareket (sallanma, kapanma)", default: true, toCode: { true: null, false: "{false}" } },
    // own texts: the demo changes every text; the raw component (one prop per option) gets the button's
    { key: "texts", label: "Kendi metinlerim", default: false, prop: "button", toCode: (x) => (x ? `"Katıl"` : null) },
  ],
});
