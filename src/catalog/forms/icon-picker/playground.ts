import { definePlayground } from "../../spec.ts";

interface Values { inline: boolean; groups: boolean; none: boolean; size: string }

export default definePlayground<Values>({
  stage: "center",
  options: [
    { key: "inline", label: "Satır içi (düğmesiz)", default: true },
    // groups takes a list or false: on → left out (the default chips), off → {false}
    { key: "groups", label: "Süzgeç çipleri", default: true, visibleWhen: (v) => v.inline, toCode: { true: null, false: "{false}" } },
    { key: "none", label: "\"Simge yok\" seçeneği", default: true, visibleWhen: (v) => v.inline, toCode: { true: null, false: "{false}" } },
    { key: "size", label: "Düğme boyutu", default: "sm", options: [{ value: "sm", label: "küçük" }, { value: "md", label: "orta" }], visibleWhen: (v) => !v.inline },
  ],
});
