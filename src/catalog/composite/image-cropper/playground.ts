import { definePlayground } from "../../spec.ts";

interface Values { src: string; aspect: string; maxZoom: number; preview: boolean; readonly: boolean; grid: boolean; hint: boolean; tools: string; sliders: string; labels: boolean }

// src is required: a small landscape (96 × 64 PNG; an SVG data: URL is blocked as unsafe, and a data: image lets the
// canvas read it back)
export const DEFAULT_SRC = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABACAIAAABqVuVZAAAA60lEQVR42u3YwQkCMRAF0GlELMLbVubRAqzAq31sGRZiBV4FUZZNMtmND/59/jwIJInD7SE/EggAAQIECBAgQIAE0J8CPS/HzwD6SlOXKQbWqWIEaFCghTrlRoAAAQIECBAg9yBA3mJe8/6D/AcBAgQIECABBAgQIECAAAESQIBGA7qfrisyONA6lBysGMalkVSM51JXKnJOcheXKlLR+hhvwaVkwWihvk2UdQvGvpbJD6AGQOd5Wp6+65VXjUbDOmKV93yvGjnzEqRa9DzPUyTPqy7VumHko1TBSmsVfVG2H0CAAAECBGi/eQH6mV7Ll8KySQAAAABJRU5ErkJggg==";
// the card's own texts (demo.tsx)
const OWN = { zoom: "Büyüklük", angle: "Eğim", free: "Dilediğin gibi", hint: "Sürükle, tekerlekle yaklaş; R döndürür, F aynalar." };

export default definePlayground<Values>({
  options: [
    // the card draws its own themed scene while this is the default
    { key: "src", label: "Görsel (src)", default: DEFAULT_SRC, kind: "text" },
    { key: "aspect", label: "Oran", default: "choices", kind: "segmented", options: [{ value: "choices", label: "seçenekli" }, { value: "1", label: "1:1 sabit" }, { value: "1.7778", label: "16:9 sabit" }],
      toCode: { choices: null, "1": "{1}", "1.7778": "{1.7778}" } },
    { key: "maxZoom", label: "En çok yakınlaştırma", default: 4, min: 2, max: 8, step: 1, unit: "×", visibleWhen: (v) => v.sliders !== "none" },
    { key: "preview", label: "Sonuç önizlemesi", default: true },
    { key: "grid", label: "Kılavuz ızgarası", default: true },
    { key: "tools", label: "Düğmeler", default: "all", kind: "segmented", options: [{ value: "all", label: "tümü" }, { value: "rotate", label: "yalnız döndür" }, { value: "none", label: "yok" }],
      toCode: { all: null, rotate: `{["rotateLeft","rotateRight"]}`, none: "{false}" } },
    { key: "sliders", label: "Kaydırıcılar", default: "all", kind: "segmented", options: [{ value: "all", label: "ikisi" }, { value: "zoom", label: "yalnız yakınlaştırma" }, { value: "none", label: "yok" }],
      toCode: { all: null, zoom: `{["zoom"]}`, none: "{false}" } },
    { key: "hint", label: "Klavye ipucu", default: true },
    { key: "labels", label: "Kendi metinlerim", default: false, toCode: { true: `{${JSON.stringify(OWN)}}`, false: null } },
    { key: "readonly", label: "Salt okunur", default: false },
  ],
});
