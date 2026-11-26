// Showcase stage for PixelSprite: the chosen sprite large, then the whole built-in set as small tiles.
import { PixelSprite, LED_SPRITE_NAMES } from "march/led";
import type { LedLookValues } from "../../led-look.ts";

export const code = `<PixelSprite sprite="fire" pitch={14} />
<PixelSprite sprite={{ fps: 6, palette: { g: "#3ddc84" }, frames: [["g.g", ".g."], [".g.", "g.g"]] }} />`

type V = LedLookValues & { sprite: string; fps: number; playing: boolean; pitch: number };

export default function PixelSpriteDemo(props: { values: V }) {
  return <div class="sc-row" sx={{ gap: 4 }}>
    {() => {
      const v = props.values
      return <PixelSprite sprite={v.sprite} fps={v.fps} playing={v.playing} pitch={v.pitch}
        color={v.color as "rgb"} shape={v.shape as "round"} gap={v.gap} bloom={v.bloom || false} ghost={v.ghost} scanlines={v.scanlines} panel={v.panel as "dark"} />
    }}
    <div class="sc-row" sx={{ gap: 2, w: "sm" }}>
      {LED_SPRITE_NAMES.map((n) => <PixelSprite sprite={n} pitch={4} />)}
    </div>
  </div>
}
