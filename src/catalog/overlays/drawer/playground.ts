import { definePlayground } from "../../spec.ts";
import { el } from "../../playground-el.ts";

interface Values { side: string; modal: boolean; snap: string; size: string; dragToClose: boolean; content: string; handle: boolean; closeButton: boolean; motion: string; open: boolean; title: string }

export default definePlayground<Values>({
  options: [
    // MarchIDE: the bare Drawer shows while open is on (in the preview's box)
    { key: "open", label: "Açık (open)", default: true },
    { key: "title", label: "Başlık (title)", default: "Çekmece", kind: "text" },
    { key: "side", label: "Kenar", default: "bottom", kind: "cards", options: [{ value: "start", label: "başlangıç" }, { value: "end", label: "bitiş" }, { value: "top", label: "üst" }, { value: "bottom", label: "alt" }] },
    { key: "content", label: "İçerik", default: "long", options: [{ value: "short", label: "kısa" }, { value: "long", label: "uzun" }], prop: "children", toProp: (x) => el("ul", "", ...Array.from({ length: x === "short" ? 3 : 40 }, (_, i) => el("li", "", `Satır ${i + 1}`))), toCode: { short: "{<Short />}", long: "{<Long />}" } },
    { key: "modal", label: "Modal (perde, odak kilidi)", default: true },
    { key: "dragToClose", label: "Sürükleyerek kapat", default: true },
    { key: "motion", label: "Hareket", default: "default", options: [{ value: "default", label: "hazır (0,3 sn)" }, { value: "bouncy", label: "kendi ayarım (yavaş, yaylı)" }, { value: "off", label: "yok" }], toProp: (x) => (x === "off" ? false : x === "bouncy" ? { duration: 620, exit: 380, easing: "easeOutBack" } : true), toCode: { default: null, bouncy: '{{ duration: 620, exit: 380, easing: "easeOutBack" }}', off: "{false}" } },
    // a handle is drawn on top / bottom sheets and with snap points
    { key: "handle", label: "Tutamaç", default: true, visibleWhen: (v) => v.side === "top" || v.side === "bottom" || v.snap !== "none" },
    { key: "closeButton", label: "Kapat (×) düğmesi", default: true },
    { key: "snap", label: "Durma noktaları", default: "two", options: [{ value: "none", label: "yok" }, { value: "two", label: "%40 · %90" }, { value: "three", label: "%25 · %55 · %90" }], prop: "snapPoints", toProp: (x) => (x === "two" ? [0.4, 0.9] : x === "three" ? [0.25, 0.55, 0.9] : undefined), toCode: { none: null, two: "{[0.4, 0.9]}", three: "{[0.25, 0.55, 0.9]}" } },
    // size has an effect only without snap points (the largest snap point sets the size), and on a top / bottom sheet
    // only when the content is taller than it (a short sheet is as tall as its content)
    { key: "size", label: "Boyut", default: "md", options: ["sm", "md", "lg", "full"], visibleWhen: (v) => v.snap === "none" && (v.content === "long" || v.side === "start" || v.side === "end") },
  ],
});
