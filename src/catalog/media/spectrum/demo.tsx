// Showcase stage for Spectrum: one spectrum that takes every option. "Müziği başlat" plays the synthesized demo loop
// (silent: only the bars move); "Ton" drives it with a number (a 220 Hz tone whose loudness is the Ses slider), so it
// works without any audio; "Yok" shows the idle state.
import { Spectrum } from "march/components/media/spectrum";
import { Button } from "march/components/actions/button";
import { audioSource } from "march/audio";
import { onCleanup } from "march";
import type { ColorToken } from "march/theme";
import type { MultiColors } from "../../demo-util.ts";

export const code = `const song = audioSource("demo")
<Button on:click={() => song.start()}>Müziği başlat</Button>
<Spectrum source={song} />
<Spectrum source={song} variant="circle" colors="brand" bars={72} />`

type V = { input: string; level: number; variant: string; bars: number; scale: string; minHz: number; maxHz: number; peaks: boolean; peakFall: number; gap: number;
  radius: number; gain: number; colors: string; paint: string; color: string; height: number; motion: boolean; label: string; idleText: string }

export default function SpectrumDemo(props: { values: V }) {
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
        <Spectrum source={source} variant={v.variant as "bars"} bars={v.bars} scale={v.scale as "log"} minHz={v.minHz} maxHz={v.maxHz}
          peaks={v.peaks} peakFall={v.peakFall / 100} gap={v.gap} radius={v.radius} gain={v.gain / 100}
          colors={(v.colors === "theme" ? undefined : v.colors) as MultiColors | undefined} paint={v.paint as "gradient"}
          color={(v.color || undefined) as ColorToken | undefined} height={v.height} motion={v.motion}
          label={v.label} idleText={v.idleText ? v.idleText : false} />
      </div>
    }}
  </div>
}
