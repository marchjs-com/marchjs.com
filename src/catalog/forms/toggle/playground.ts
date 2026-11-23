import { definePlayground } from "../../spec.ts";

export default definePlayground<{ label: string; color: string; tristate: boolean; disabled: boolean }>({
  stage: "center",
  code: { props: { "bind:value": "{$notify}" } },
  options: [
    // the text next to the switch: the raw component (MarchIDE) shows it too; written even at its default
    { key: "label", label: "Etiket", default: "Anlık bildirimler", kind: "text", toCode: (x) => (x ? JSON.stringify(x) : null) },
    { key: "color", label: "Renk", default: "", options: [{ value: "", label: "tema" }, { value: "brand-blue", label: "mavi" }, { value: "brand-green", label: "yeşil" }, { value: "brand-purple", label: "mor" }], prop: "m:color" },
    { key: "tristate", label: "Üç durumlu (açık / kapalı / belirsiz)", default: false },
    { key: "disabled", label: "Devre dışı", default: false },
  ],
});
