import { definePlayground } from "../../spec.ts";

interface Values { size: string; variant: string; icon: string; clear: string; debounce: number; shortcut: boolean; shortcutHint: boolean; placeholder: string }

export default definePlayground<Values>({
  options: [
    { key: "size", label: "Boyut", default: "md", options: ["sm", "md"] },
    { key: "variant", label: "Görünüm", default: "field", options: [{ value: "field", label: "alan" }, { value: "plain", label: "kenarsız" }] },
    // the values are the component's: on (default, nothing written), an own icon, off ({false})
    { key: "icon", label: "İkon", default: "on", options: [{ value: "on", label: "büyüteç" }, { value: "own", label: "kendi ikonum" }, { value: "off", label: "yok" }],
      toCode: { on: null, own: "{filter}", off: "{false}" } },
    { key: "clear", label: "Temizle düğmesi", default: "on", options: [{ value: "on", label: "var" }, { value: "own", label: "kendi ikonum" }, { value: "off", label: "yok" }],
      toCode: { on: null, own: "{trash}", off: "{false}" } },
    { key: "shortcut", label: "Kısayol ( / )", default: true },
    { key: "shortcutHint", label: "Kısayol ipucu", default: true, visibleWhen: (v) => v.shortcut, toCode: { true: null, false: "{false}" } },
    { key: "placeholder", label: "Yer tutucu", default: "Şehir ara…", kind: "text" },
    { key: "debounce", label: "Gecikme", default: 250, min: 0, max: 1000, step: 50, unit: "ms" },
  ],
});
