import { definePlayground } from "../../spec.ts";
import { LED_LOOK, type LedLookValues } from "../../led-look.ts";

interface Values extends LedLookValues { text: string; font: string; spacing: number; pitch: number }

export default definePlayground<Values>({
  options: [
    { key: "text", label: "Metin (text)", default: "Çağrı Şükrü :star:", kind: "text" },
    { key: "font", label: "Yazı tipi (font)", default: "5x7", options: ["5x7", "8x8"] },
    { key: "spacing", label: "Harf aralığı (spacing)", default: 1, min: 0, max: 3, step: 1 },
    { key: "pitch", label: "LED boyutu (pitch)", default: 7, min: 3, max: 16, step: 1, unit: "px" },
    ...(LED_LOOK as never[]),
  ],
});
