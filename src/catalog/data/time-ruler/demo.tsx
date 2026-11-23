// Showcase stage for TimeRuler: a ruler over two sample tracks. Drag the ruler or the playhead (or use the arrow
// keys on it); "Oynat" moves the time on the motion clock. The bars under it use the same scale (timePercent).
import { TimeRuler, timePercent } from "march/components/data/time-ruler";
import { Button } from "march/components/actions/button";
import { onFrame } from "march/motion";
import { onCleanup } from "march";

export const code = `<TimeRuler duration={2000} value={$now} onSeek={(ms) => playback.seek(ms)} onSeekStart={pause} snap={(ms) => Math.round(ms / 50) * 50} />
<TimeRuler duration={() => span()} value={() => runner.elapsed()} minor={false} m:color="brand-orange" />   // read-only
<span style={{ "inset-inline-start": timePercent(entry.start, span()) }} />                             // rows share the scale`

const clock = (ms: number): string => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` }

export default function TimeRulerDemo(props: { values: { duration: number; value: number; seekable: boolean; minor: boolean; major: string; head: string; color: string; format: string } }) {
  let $now = props.values.value ?? 1200
  let $playing = false
  let stop: (() => void) | null = null
  const play = (on: boolean): void => {
    stop?.(); stop = null; $playing = on
    if (on) stop = onFrame((_t, dt) => { const d = props.values.duration; $now = $now + dt >= d ? 0 : $now + dt })
  }
  onCleanup(() => stop?.())
  // a new playhead value from the Playground moves the playhead there (dragging and playing move it too)
  let given = props.values.value
  return <div class="sc-col">
    {() => {
      const v = { ...props.values }
      if (v.value != null && v.value !== given) { given = v.value; queueMicrotask(() => { $now = v.value }) }
      const color = v.color === "primary" ? undefined : v.color as "brand-blue"
      const head = v.head === "off" ? false : v.head === "own" ? <span class="sc-ruler-own" aria-hidden="true">▼</span> as Node : true
      const onSeek = v.seekable ? (ms: number) => { $now = ms } : undefined
      return <div class="sc-ruler-box">
        <TimeRuler duration={v.duration} value={() => Math.min($now, v.duration)} onSeek={onSeek} onSeekStart={() => play(false)} minor={v.minor}
          major={v.major === "auto" ? undefined : Number(v.major)} head={head} m:color={color} format={v.format === "clock" ? clock : undefined}
          snap={(ms: number) => Math.round(ms / 50) * 50} />
        <div class="sc-ruler-row"><span class="sc-ruler-bar" style={{ "inset-inline-start": timePercent(v.duration * 0.1, v.duration), "inline-size": "35%" }} /></div>
        <div class="sc-ruler-row"><span class="sc-ruler-bar" style={{ "inset-inline-start": timePercent(v.duration * 0.5, v.duration), "inline-size": "40%" }} /></div>
      </div>
    }}
    <div class="sc-row">
      <Button size="sm" on:click={() => play(!$playing)}>{() => ($playing ? "Duraklat" : "Oynat")}</Button>
      <span class="sc-demo-call">{() => `value: ${Math.round($now)} ms · ${props.values.seekable ? "cetveli ya da başı sürükleyin" : "yalnız gösterge"}`}</span>
    </div>
  </div>
}
