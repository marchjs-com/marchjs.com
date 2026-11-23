import { definePlayground } from "../../spec.ts";

// MarchIDE: the raw Wizard takes `steps` as a JSON list (titles and descriptions; a schema is not JSON, so no fields)
const STEPS = [
  { title: "Hesap", description: "E-posta ve telefon" },
  { title: "Profil", description: "Görünen ad ve şehir" },
  { title: "Ekip", description: "Ekip adı ve kişi sayısı" },
  { title: "Tercihler", description: "Haber bülteni" },
];
const stepsCode = (n: unknown): string => `{${JSON.stringify(STEPS.slice(0, Number(n) - 1).concat(STEPS[3]!))}}`;

export default definePlayground<{ steps: number; layout: string; color: string; stepper: boolean; progress: boolean; count: boolean; backButton: boolean; ownLabels: boolean }>({
  options: [
    { key: "steps", label: "Adım", default: 3, options: [2, 3, 4], prop: "steps", toCode: stepsCode },
    { key: "layout", label: "Alan düzeni", default: "stack", options: [{ value: "stack", label: "alt alta" }, { value: "grid", label: "ızgara" }], prop: false },
    { key: "color", label: "Renk", default: "primary", options: [{ value: "primary", label: "birincil" }, { value: "brand-blue", label: "mavi" }, { value: "brand-green", label: "yeşil" }, { value: "brand-purple", label: "mor" }], prop: "m:color" },
    { key: "stepper", label: "Aşama listesi", default: true },
    { key: "progress", label: "İlerleme çubuğu", default: true },
    { key: "count", label: "“Adım 2 / 3” yazısı", default: true },
    { key: "backButton", label: "Geri düğmesi", default: true },
    { key: "ownLabels", label: "Kendi düğme metinlerim", default: false, prop: "labels", toCode: { true: '{{"back":"← Önceki","next":"Devam et →"}}', false: null } },
  ],
});
