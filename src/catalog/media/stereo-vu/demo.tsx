// Showcase stage for StereoVu: one meter pair that takes every option. By default a steady tone drives it (a number
// source at 0 VU: no permission, no sound, it runs at once), so every option shows on still needles. "Sayılar" drives
// the left and right needles from the Sol / Sağ sliders; "demo müzik" plays the synthesized loop from its button
// (silent: only the needles move).
import { StereoVu } from "march/components/media/stereo-vu";
import { Button } from "march/components/actions/button";
import { audioSource } from "march/audio";
import { onCleanup } from "march";

export const code = `const song = audioSource(audioEl)
<StereoVu source={song} />
<StereoVu source={mic} reference={0.126} panel="dark" peak={2} />
<StereoVu value={[$left, $right]} peakHold={0} onPeak={(ch) => warn(ch)} />
<StereoVu source={song} panel="wood" size={180} needle="spring" caption="dB" />`

type V = { input: string; left: number; right: number; reference: string; panel: string; peak: number; peakHold: number; needle: string;
  size: number; caption: string; lights: boolean; motion: boolean; label: string }

export default function StereoVuDemo(props: { values: V }) {
  const song = audioSource("demo")
  const tone = audioSource(0.5)
  onCleanup(() => { song.stop(); tone.stop() })
  let $playing = false
  let $peaks = 0
  async function toggle() {
    if ($playing) song.stop()
    else await song.start()
    $playing = song.active()
  }
  const v = () => props.values
  return <div class="sc-col">
    {() => (v().input === "demo"
      ? <div class="sc-row"><Button size="sm" on:click={toggle}>{() => ($playing ? "⏹ Durdur" : "▶ Müziği başlat")}</Button></div>
      : null)}
    {() => {
      // the input picks the source (a new source builds the pair anew); the other options are live accessors
      const source = v().input === "demo" ? song : v().input === "tone" ? tone : undefined
      const needle = v().needle as "vu" | "spring" | "none"
      return <StereoVu source={source} needle={needle}
        value={() => [v().left / 100, v().right / 100]}
        reference={() => Number(v().reference)} panel={() => v().panel as "metal"} peak={() => v().peak} peakHold={() => v().peakHold}
        size={() => v().size} caption={() => (v().caption === "none" ? false : v().caption)} motion={() => v().motion} label={() => v().label}
        parts={() => ({ lights: v().lights })} onPeak={() => { $peaks++ }} />
    }}
    <span sx={{ text: "sm", color: "muted" }}>Tepe ışığı: {() => $peaks}</span>
  </div>
}
