import { definePlayground } from "../../spec.ts";
import { LED_LOOK, type LedLookValues } from "../../led-look.ts";

interface Values extends LedLookValues { sprite: string; fps: number; playing: boolean; pitch: number }

export default definePlayground<Values>({
  options: [
    { key: "sprite", label: "Çizim (sprite)", default: "fire", kind: "combobox", options: ["fire", "heartbeat", "rocket", "rain", "sparkle", "coffee", "heart", "smile", "wink", "laugh", "sad", "star", "sun", "moon", "cloud", "bolt", "drop", "note", "bell", "check", "cross", "thumbs-up", "cat", "home", "gift", "flower", "arrow-right"] },
    { key: "fps", label: "Kare hızı (fps)", default: 4, min: 1, max: 12, step: 1, toCode: (v) => (v === 4 ? null : `{${v}}`) },
    { key: "playing", label: "Oynat (playing)", default: true, toCode: { true: null, false: "{false}" } },
    { key: "pitch", label: "LED boyutu (pitch)", default: 14, min: 4, max: 24, step: 1, unit: "px" },
    ...(LED_LOOK as never[]),
  ],
});
