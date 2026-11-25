// Showcase stage for Oscilloscope: one scope that takes every option. "Müziği başlat" plays the synthesized demo loop
// (silent: only the trace moves); "Ton" drives it with a number (a 220 Hz tone whose loudness is the Ses slider), so it
// works without any audio; "Yok" shows the idle screen.
import { Oscilloscope } from "march/components/media/oscilloscope";
import { Button } from "march/components/actions/button";
import { audioSource } from "march/audio";
import { onCleanup } from "march";
import type { ColorToken } from "march/theme";

export const code = `const song = audioSource("demo")
<Button on:click={() => song.start()}>Müziği başlat</Button>
<Oscilloscope source={song} />
<Oscilloscope source={song} look="crt" mode="xy" persistence={0.8} />`

type V = { input: string; level: number; mode: string; look: string; trigger: boolean; timebase: number; persistence: number; grid: string;
  color: string; lineWidth: number; glow: number; gain: number; height: number; motion: boolean; label: string; idleText: string }

const GRIDS: Record<string, boolean | { x: number; y: number }> = { on: true, off: false, fine: { x: 16, y: 10 } };

export default function OscilloscopeDemo(props: { values: V }) {
  const song = audioSource("demo")
  onCleanup(() => song.stop())
  const tone = audioSource(() => props.values.level / 100)
  let $playing = false
  async function toggle() {
    if ($playing) song.stop()
    else await song.start()
    $playing = song.active()
  }
  return <div class="sc-col">
    <div class="sc-row">
      <Button size="sm" on:click={toggle}>{() => ($playing ? "⏹ Durdur" : "▶ Müziği başlat")}</Button>
    </div>
    {() => {
      const v = props.values
      const source = v.input === "demo" ? song : v.input === "tone" ? tone : undefined
      return <div class="sc-col" sx={{ w: "full" }}>
        <Oscilloscope source={source} mode={v.mode as "wave"} look={v.look as "modern"} trigger={v.trigger} timebase={v.timebase}
          persistence={v.persistence / 100} grid={GRIDS[v.grid]} color={(v.color || undefined) as ColorToken | undefined}
          lineWidth={v.lineWidth} glow={v.glow ? v.glow : false} gain={v.gain / 100} height={v.height} motion={v.motion}
          label={v.label} idleText={v.idleText ? v.idleText : false} />
      </div>
    }}
  </div>
}
