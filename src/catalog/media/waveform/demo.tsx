// Showcase stage for Waveform: a podcast episode with three chapters. "Çal" moves the playhead (the stage's own clock,
// no audio); pressing or dragging the bars seeks. The "Veri" option switches to the live demo music (bars rolling in
// after "Müziği başlat") or to the decorative recording bars of ChatComposer. Every other option goes to the one Waveform.
import { Waveform } from "march/components/media/waveform";
import { Button } from "march/components/actions/button";
import { audioSource } from "march/audio";
import { onFrame } from "march/motion";
import { onCleanup } from "march";
import type { ColorToken } from "march/theme";

export const code = `<Waveform peaks={episode.peaks} currentTime={$t} duration={episode.seconds} seekable
  regions={[{ start: 0, end: 95, label: "Giriş" }, { start: 95, end: 610, label: "Söyleşi" }]}
  onSeek={(p, s) => ($t = s)} />
<Waveform source={audioSource("mic")} height={32} />
<Waveform live bars={24} height={24} />`

type V = { data: string; progress: number; seekable: boolean; regions: boolean; regionLabels: boolean; playhead: boolean; align: string;
  bars: number; barWidth: number; gap: number; rounded: boolean; height: number; color: string; progressColor: string; motion: boolean; label: string }

const LENGTH = 14 * 60 + 20;
const CHAPTERS = [
  { start: 0, end: 95, label: "Giriş" },
  { start: 95, end: 610, label: "Söyleşi", color: "brand-orange" as ColorToken },
  { start: 610, end: LENGTH, label: "Sorular", color: "brand-purple" as ColorToken },
];
// speech: phrases with short pauses between them
const PEAKS = Array.from({ length: 300 }, (_, i) => (i % 19 < 2 ? 0.06 : 0.3 + 0.65 * Math.abs(Math.sin(i * 0.83) * Math.sin(i * 0.11 + 0.7))));

export default function WaveformDemo(props: { values: V }) {
  const song = audioSource("demo")
  onCleanup(() => song.stop())
  // a seek or the play clock wins until the Konum option is moved again
  let $seek: { at: number; from: number } | null = null
  let $playing = false
  let $live = false
  let stop: (() => void) | null = null
  const pos = () => ($seek && $seek.from === props.values.progress ? $seek.at : props.values.progress / 100)
  const halt = () => { stop?.(); stop = null; $playing = false }
  const toggle = () => {
    if ($playing) return halt()
    $playing = true
    stop = onFrame((_t: number, dt: number) => {
      const at = Math.min(1, pos() + (dt / 1000) * (30 / LENGTH))
      $seek = { at, from: props.values.progress }
      if (at >= 1) halt()
    })
  }
  onCleanup(() => stop?.())
  async function music() {
    if ($live) song.stop()
    else await song.start()
    $live = song.active()
  }
  const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`
  return <div class="sc-col">
    <div class="sc-row">
      {() => (props.values.data === "peaks"
        ? <><Button size="sm" on:click={toggle}>{() => ($playing ? "⏸ Duraklat" : "▶ Çal")}</Button><span>{() => `${clock(pos() * LENGTH)} / ${clock(LENGTH)}`}</span></>
        : props.values.data === "source" ? <Button size="sm" on:click={music}>{() => ($live ? "⏹ Durdur" : "▶ Müziği başlat")}</Button> : null)}
    </div>
    {() => {
      const v = props.values
      const look = {
        align: v.align as "mirror", bars: v.bars || undefined, barWidth: v.barWidth, gap: v.gap, rounded: v.rounded, height: v.height,
        color: (v.color || undefined) as ColorToken | undefined, progressColor: (v.progressColor || undefined) as ColorToken | undefined, motion: v.motion, label: v.label,
      }
      if (v.data === "live") return <div class="sc-col" sx={{ w: "full" }}><Waveform live {...look} /></div>
      if (v.data === "source") return <div class="sc-col" sx={{ w: "full" }}><Waveform source={song} {...look} /></div>
      return <div class="sc-col" sx={{ w: "full" }}>
        <Waveform peaks={PEAKS} progress={pos} duration={LENGTH} seekable={v.seekable} regions={v.regions ? CHAPTERS : undefined}
          regionLabels={v.regionLabels} playhead={v.playhead} {...look}
          onSeek={(p: number) => { $seek = { at: p, from: props.values.progress } }} />
      </div>
    }}
  </div>
}
