// Showcase stage for LevelMeter: a small studio console. It starts on a steady tone (a number source: no permission,
// it runs at once), so every option shows on the lit LEDs; "demo müzik" plays the synthesized loop after "Müziği
// başlat" (silent: only the lights dance). The first meter takes every option. "Sayı" turns it into a value meter
// driven by the Değer slider. The second meter is always a horizontal value meter (a CPU load) for contrast.
import { LevelMeter } from "march/components/data/level-meter";
import { Button } from "march/components/actions/button";
import { audioSource } from "march/audio";
import { onCleanup } from "march";
import type { ColorToken } from "march/theme";

export const code = `const tone = audioSource(0.6)               // a steady tone (a number is a source): no permission, runs at once
const song = audioSource("demo")
<Button on:click={() => song.start()}>Müziği başlat</Button>
<LevelMeter source={tone} scale="db" ticks />                 // stereo: L / R from the source
<LevelMeter source={song} scale="db" ticks />
<LevelMeter value={$cpu} min={0} max={100} orientation="horizontal" variant="flat" clip={false} />`

type V = { input: string; value: number; channels: number; orientation: string; segments: number; scale: string; floor: number; ticks: boolean;
  peakHold: number; clip: boolean; variant: string; size: string; colors: string; labels: boolean; motion: boolean; label: string }

const PALETTES: Record<string, readonly [ColorToken, ColorToken, ColorToken] | undefined> = {
  zones: undefined, brand: ["brand-blue", "brand-gold", "brand-pink"], cool: ["info", "brand-purple", "danger"],
};

export default function LevelMeterDemo(props: { values: V }) {
  const song = audioSource("demo")
  const tone = audioSource(0.6)
  onCleanup(() => { song.stop(); tone.stop() })
  let $playing = false
  let $clips = 0
  async function toggle() {
    if ($playing) song.stop()
    else await song.start()
    $playing = song.active()
  }
  return <div class="sc-col">
    <div class="sc-row">
      <Button size="sm" on:click={toggle}>{() => ($playing ? "⏹ Durdur" : "▶ Müziği başlat")}</Button>
      <span sx={{ text: "sm", color: "muted" }}>Kırpılma: {() => $clips}</span>
    </div>
    {() => {
      const v = props.values
      const source = v.input === "demo" ? song : v.input === "tone" ? tone : undefined
      return <div class="sc-row">
        <LevelMeter
          source={source} value={source ? undefined : v.value / 100}
          channels={v.channels as 1 | 2} orientation={v.orientation as "vertical"} segments={v.segments}
          scale={v.scale as "db"} floor={v.floor} ticks={v.ticks} peakHold={v.peakHold ? v.peakHold : false} clip={v.clip}
          variant={v.variant as "console"} size={v.size as "md"} colors={PALETTES[v.colors]} labels={v.labels} motion={v.motion}
          label={v.label} length={v.orientation === "horizontal" ? 280 : 180} onClip={() => { $clips++ }} />
        <LevelMeter value={v.value} min={0} max={100} channels={1} orientation="horizontal" variant="flat" size="sm" segments={30}
          clip={false} label="İşlemci" length={220} />
      </div>
    }}
  </div>
}
