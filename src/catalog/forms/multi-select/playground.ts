import { definePlayground } from "../../spec.ts";

export default definePlayground<{ options: string; readonly: boolean; remove: string }>({
  options: [
    // a comma-separated text (MultiSelect takes it as the list), so the raw component in MarchIDE has options to show
    { key: "options", label: "Seçenekler (virgülle)", default: "Türkçe, İngilizce, Almanca, Arapça, Fransızca, İspanyolca" },
    { key: "remove", label: "Etiketi kaldır düğmesi", default: "x", prop: "removeIcon", options: [{ value: "x", label: "×" }, { value: "icon", label: "çöp kutusu ikonu" }, { value: "off", label: "yok (Backspace ile)" }],
      toCode: { x: null, icon: "{trash}", off: "{false}" } },
    { key: "readonly", label: "Salt okunur", default: false },
  ],
});
