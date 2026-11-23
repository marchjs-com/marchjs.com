import { definePlayground } from "../../spec.ts";

interface Values { children: string; label: string; perView: number; arrows: boolean; prevIcon: string; nextIcon: string; dots: string; color: string; smooth: boolean; swipe: string }

// the slides: MarchIDE's raw <Carousel /> gets these texts as children (a text becomes a plain slide box)
export const SLIDES = JSON.stringify(["Heyecan", "Aktivite", "Dostluk", "İletişim", "Keşif", "Topluluk"]);

export default definePlayground<Values>({
  options: [
    { key: "children", label: "Slaytlar (children, JSON)", default: SLIDES, kind: "json", prop: "children", toCode: (x) => `{${String(x)}}` },
    { key: "label", label: "Ad (label)", default: "HADİ koleksiyonu", kind: "text" },
    { key: "perView", label: "Görünen", default: 2, kind: "segmented", options: [1, 2, 3, 4] },
    { key: "arrows", label: "Oklar", default: true, toCode: { false: "{false}" } },
    { key: "prevIcon", label: "Önceki ikonu", default: "", options: [{ value: "", label: "hazır ok" }, { value: "arrowLeft", label: "arrowLeft" }, { value: "skipBack", label: "skipBack" }], visibleWhen: (v) => v.arrows, toCode: (x) => (x ? `{${String(x)}}` : null) },
    { key: "nextIcon", label: "Sonraki ikonu", default: "", options: [{ value: "", label: "hazır ok" }, { value: "arrowRight", label: "arrowRight" }, { value: "stepForward", label: "stepForward" }], visibleWhen: (v) => v.arrows, toCode: (x) => (x ? `{${String(x)}}` : null) },
    { key: "dots", label: "Noktalar", default: "on", kind: "segmented", options: [{ value: "on", label: "hazır" }, { value: "own", label: "numaralı" }, { value: "off", label: "yok" }], toCode: { on: null, own: "{(i) => i + 1}", off: "{false}" } },
    { key: "color", label: "Etkin nokta rengi", default: "primary", kind: "chips", options: [{ value: "primary", label: "birincil" }, { value: "brand-blue", label: "mavi" }, { value: "brand-purple", label: "mor" }, { value: "brand-green", label: "yeşil" }], visibleWhen: (v) => v.dots !== "off", prop: "m:color", toCode: { primary: null } },
    { key: "smooth", label: "Yumuşak kaydırma", default: true, toCode: { false: "{false}" } },
    { key: "swipe", label: "Kaydırma (swipe)", default: "touch", kind: "segmented", options: [{ value: "touch", label: "dokunma" }, { value: "all", label: "fare de" }, { value: "off", label: "kapalı" }], toCode: { touch: null, all: "{true}", off: "{false}" } },
  ],
});
