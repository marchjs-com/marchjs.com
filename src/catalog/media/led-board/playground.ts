import { definePlayground } from "../../spec.ts";
import { LED_LOOK, type LedLookValues } from "../../led-look.ts";

interface Values extends LedLookValues { preset: string; text: string; direction: string; speed: number; effect: string; transition: string; font: string; scale: string; cols: number; rows: number }

export default definePlayground<Values>({
  options: [
    // the card's own: which scenes the board plays
    { key: "preset", label: "Sahneler", default: "welcome", prop: false, options: [{ value: "welcome", label: "karşılama" }, { value: "match", label: "maç skoru" }, { value: "clock", label: "saat ve geri sayım" }, { value: "eyes", label: "gözler" }, { value: "text", label: "yalnız metin" }] },
    { key: "text", label: "Metin (text)", default: "HADİ'ye hoş geldin :heart:", kind: "text" },
    { key: "direction", label: "Yön (direction)", default: "left", options: [{ value: "left", label: "sola" }, { value: "right", label: "sağa" }, { value: "up", label: "yukarı" }, { value: "down", label: "aşağı" }] },
    { key: "speed", label: "Hız (speed)", default: 30, min: 8, max: 90, step: 2, unit: "LED/sn" },
    { key: "effect", label: "Efekt (effect)", default: "none", options: [{ value: "none", label: "yok" }, { value: "typewriter", label: "daktilo" }, { value: "blink", label: "yanıp sön" }, { value: "wave", label: "dalga" }, { value: "rainbow", label: "gökkuşağı" }] },
    { key: "transition", label: "Geçiş (transition)", default: "wipe", options: [{ value: "wipe", label: "silme" }, { value: "dissolve", label: "çözülme" }, { value: "rain", label: "piksel yağmuru" }, { value: "iris", label: "iris" }, { value: "cut", label: "kesme" }] },
    { key: "font", label: "Yazı tipi (font)", default: "5x7", options: ["5x7", "8x8"] },
    { key: "scale", label: "Boyut (scale)", default: "auto", options: [{ value: "auto", label: "otomatik" }, { value: "1", label: "1×" }, { value: "2", label: "2×" }], toCode: (v) => (v === "auto" ? null : `{${v}}`) },
    { key: "cols", label: "Sütun (cols)", default: 64, min: 24, max: 128, step: 4 },
    { key: "rows", label: "Satır (rows)", default: 16, min: 8, max: 24, step: 1 },
    ...(LED_LOOK as never[]),
  ],
});
