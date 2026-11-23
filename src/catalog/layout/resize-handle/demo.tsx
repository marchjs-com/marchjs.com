// Showcase stage for ResizeHandle: a box resized from the edge (or the corner) the Playground picks.
import { ResizeHandle } from "march/layout";
import { pointerDrag } from "march/behaviors/drag";
import { moreVertical, Icon } from "march/icons";

export const code = `<aside class="panel">   {/* position: relative */}
  …
  <ResizeHandle value={() => $w} set={(w) => $w = w} min={160} max={480} reset={() => $w = 240} label="Panel genişliği" />
</aside>
<ResizeHandle edge="bottom-end" onPointerDown={startResize} onStep={(dx, dy) => resizeBy(dx, dy)} />   // köşe: kendi hareketin`

interface Values { edge: string; line: string; grip: string; color: string; disabled: boolean }

export default function ResizeHandleDemo(props: { values: Values }) {
  let $w = 260
  let $h = 150
  const fit = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v))
  const corner = (e: PointerEvent): void => {
    const w0 = $w, h0 = $h
    pointerDrag(e, { threshold: 0, onMove: (p) => { $w = fit(w0 + p.di, 160, 480); $h = fit(h0 + p.dy, 100, 260) } })
  }
  return <div class="sc-a6-rz-stage" class:sc-a6-rz-stage-end={props.values.edge === "start"}>
    <div class="sc-a6-rz" style={{ "inline-size": `${$w}px`, "block-size": `${$h}px` }}>
      <strong>Panel</strong>
      <p class="m-muted">Tutamacı sürükle ya da odaklayıp ok tuşlarını kullan; Enter başa döndürür.</p>
      <p class="sc-demo-call">{() => `${Math.round($w)} × ${Math.round($h)} px`}</p>
      {() => {
        const v = { ...props.values }
        const shared = {
          line: v.line as "hover", disabled: v.disabled,
          grip: v.grip === "off" ? false : v.grip === "own" ? <Icon of={moreVertical} /> as Node : true,
        }
        if (v.edge === "bottom-end") return <ResizeHandle m:color={v.color === "default" ? undefined : v.color} edge="bottom-end" {...shared} label="Paneli boyutlandır" onPointerDown={corner}
          onStep={(dx, dy) => { $w = fit($w + dx, 160, 480); $h = fit($h + dy, 100, 260) }} />
        if (v.edge === "bottom") return <ResizeHandle m:color={v.color === "default" ? undefined : v.color} edge="bottom" {...shared} label="Panel yüksekliği" value={() => $h} set={(x) => $h = x} min={100} max={260} reset={() => $h = 150} />
        return <ResizeHandle m:color={v.color === "default" ? undefined : v.color} edge={v.edge as "end"} {...shared} label="Panel genişliği" value={() => $w} set={(x) => $w = x} min={160} max={480} reset={() => $w = 260} />
      }}
    </div>
  </div>
}
