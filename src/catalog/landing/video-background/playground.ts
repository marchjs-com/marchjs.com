import { definePlayground } from "../../spec.ts";

interface Values { src: string; poster: string; text: string; tint: string; tintOpacity: number; controls: boolean }

export default definePlayground<Values>({
  options: [
    // src is required: the raw component in MarchIDE plays the showcase clip by default
    { key: "src", label: "Video (src)", default: "/media/hadi-waves.webm", kind: "text" },
    { key: "poster", label: "Afiş (poster)", default: "/media/hadi-waves.jpg", kind: "text" },
    { key: "text", label: "Üstteki içerik (children)", default: "Hareket, ama sessiz", kind: "text", prop: "children" },
    { key: "tint", label: "Renk katmanı", default: "dark", options: [{ value: "dark", label: "koyu" }, { value: "light", label: "açık" }, { value: "brand", label: "marka" }, { value: "none", label: "yok" }] },
    { key: "tintOpacity", label: "Katman gücü", default: 0.6, min: 0.1, max: 1, step: 0.05, visibleWhen: (v) => v.tint !== "none" },
    { key: "controls", label: "Durdur düğmesi", default: true, toCode: { true: null, false: "{false}" } },
  ],
});
