// Showcase stage for LedMatrix: the art from the Options panel, and a small "life" screen next to it whose picture
// changes on every step (only the changed LEDs are repainted).
import { LedMatrix, ledFrame, setLed } from "march/components/media/led-matrix";
import { Button } from "march/components/actions/button";
import type { LedLookValues } from "../../led-look.ts";

export const code = `<LedMatrix frame={["..rr.rr..", ".rrrrrrr.", "..rrrrr..", "....r...."]} palette={{ r: "#ff3355" }} pitch={18} />`

type V = LedLookValues & { art: string; pitch: number };

// a glider on a 16 × 8 torus: one generation per step
const W = 16, H = 8
const start = () => { const f = ledFrame(W, H); for (const [x, y] of [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]]) setLed(f, x!, y!); return f }
const step = (f: ReturnType<typeof ledFrame>) => {
  const n = ledFrame(W, H)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let c = 0
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) if (i || j) c += f.lit[((y + j + H) % H) * W + ((x + i + W) % W)] ? 1 : 0
    const on = !!f.lit[y * W + x]
    if (c === 3 || (on && c === 2)) setLed(n, x, y)
  }
  return n
}

export default function LedMatrixDemo(props: { values: V }) {
  let $life = start()
  return <div class="sc-row" sx={{ gap: 4 }}>
    {() => {
      const v = props.values
      return <LedMatrix frame={v.art.split("\n")} palette={{ r: "#ff3355", y: "#ffd23f", g: "#3ddc84", b: "#4aa8ff" }} pitch={v.pitch} label="Kalp"
        color={v.color as "rgb"} shape={v.shape as "round"} gap={v.gap} bloom={v.bloom || false} ghost={v.ghost} scanlines={v.scanlines} panel={v.panel as "dark"} />
    }}
    <div class="sc-col">
      <LedMatrix frame={() => $life} pitch={12} color="green" label="Hayat oyunu" />
      <Button size="sm" on:click={() => { $life = step($life) }}>Bir adım</Button>
    </div>
  </div>
}
