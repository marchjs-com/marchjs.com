import { definePlayground } from "../../spec.ts";

interface Values { device: string; landscape: boolean; controls: boolean; touch: boolean; keyboard: string; statusBar: boolean; homeIndicator: boolean; camera: boolean }

export default definePlayground<Values>({
  options: [
    { key: "device", label: "Cihaz", default: "iphone-15", kind: "combobox", options: [
      { value: "iphone-15", label: "iPhone 15" }, { value: "iphone-se", label: "iPhone SE" }, { value: "iphone-16-pro-max", label: "iPhone 16 Pro Max" }, { value: "pixel-8", label: "Pixel 8" },
      { value: "galaxy-s24-ultra", label: "Galaxy S24 Ultra" }, { value: "galaxy-z-fold-5-open", label: "Galaxy Z Fold 5 (açık)" }, { value: "ipad-mini", label: "iPad mini" }, { value: "ipad", label: "iPad" },
      { value: "laptop-1280", label: "Dizüstü HD" }, { value: "desktop-1920", label: "Full HD" }] },
    { key: "landscape", label: "Yatay", default: false },
    { key: "controls", label: "Kumanda (salla, eğ, pil…)", default: true },
    { key: "touch", label: "Dokunma", default: true },
    { key: "keyboard", label: "Klavye", default: "auto", options: [{ value: "auto", label: "alana dokununca" }, { value: "on", label: "açık" }, { value: "off", label: "kapalı" }], toCode: { auto: null, on: "{true}", off: "{false}" } },
    { key: "statusBar", label: "Durum çubuğu", default: true },
    { key: "homeIndicator", label: "Ana ekran çizgisi", default: true },
    { key: "camera", label: "Kamera", default: true, visibleWhen: (v) => !/iphone-se|ipad|laptop|desktop/.test(v.device) },
  ],
});
