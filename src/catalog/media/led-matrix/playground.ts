import { definePlayground } from "../../spec.ts";
import { LED_LOOK, type LedLookValues } from "../../led-look.ts";

interface Values extends LedLookValues { art: string; pitch: number }

export default definePlayground<Values>({
  options: [
    // the picture: pixel art as text, one row per line ("." off; r, y, g, b are colored by the palette)
    { key: "art", label: "Resim (frame: satır satır, . sönük)", default: "..rr.rr..\n.rrrrrrr.\n.rrrrrrr.\n..rrrrr..\n...rrr...\n....r....", kind: "text",
      toCode: (x) => `{${JSON.stringify(String(x).split("\n"))}}`, toProp: (x) => String(x).split("\n"), prop: "frame" },
    { key: "pitch", label: "LED boyutu (pitch)", default: 18, min: 6, max: 32, step: 1, unit: "px" },
    ...(LED_LOOK as never[]),
  ],
});
