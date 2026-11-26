// Showcase stage for LoudnessGraph: one loudness meter that takes every option. By default a tone drives it (a
// number source whose loudness is the Seviye slider: no permission, no sound, it runs at once), so the readouts and
// the history move as soon as the page opens and every option shows. "demo müzik" plays the synthesized loop from its
// button (silent: only the graph moves).
import { LoudnessGraph } from "march/components/media/loudness-graph";
import { Button } from "march/components/actions/button";
import { audioSource } from "march/audio";
import { onCleanup } from "march";

export const code = `const song = audioSource(audioEl)
<LoudnessGraph source={song} />
<LoudnessGraph source={mic} show={["shortTerm", "integrated"]} targets={[{ value: -16, label: "Podcast" }]} span={60} />
<LoudnessGraph value={$serverMeter} rate={4} parts={{ correlation: false }} />`

type V = { input: string; level: number; show: string; targets: string; span: number; rate: number; range: string; correlation: boolean;
  readouts: boolean; legend: boolean; paused: boolean; motion: boolean; label: string }

const SHOW: Record<string, ("momentary" | "shortTerm" | "integrated")[]> = { ms: ["momentary", "shortTerm"], si: ["shortTerm", "integrated"], all: ["momentary", "shortTerm", "integrated"] };
const TARGETS: Record<string, { value: number; label?: string }[] | false | undefined> = { both: undefined, stream: [{ value: -14, label: "Yayın akışı −14" }], off: false };
const RANGES: Record<string, [number, number]> = { wide: [-40, 0], tight: [-30, -6] };

export default function LoudnessGraphDemo(props: { values: V }) {
  const song = audioSource("demo")
  const tone = audioSource(() => props.values.level / 100)
  onCleanup(() => { song.stop(); tone.stop() })
  let $playing = false
  async function toggle() {
    if ($playing) song.stop()
    else await song.start()
    $playing = song.active()
  }
  const v = () => props.values
  return <div class="sc-col" sx={{ w: "full" }}>
    {() => (v().input === "demo"
      ? <div class="sc-row"><Button size="sm" on:click={toggle}>{() => ($playing ? "⏹ Durdur" : "▶ Müziği başlat")}</Button></div>
      : null)}
    {() => {
      // the input picks the source (a new source starts a new history); the other options are live accessors
      const source = v().input === "demo" ? song : tone
      return <LoudnessGraph source={source} show={() => SHOW[v().show]} targets={() => TARGETS[v().targets]} span={() => v().span} rate={() => v().rate}
        range={() => RANGES[v().range]} paused={() => v().paused} motion={() => v().motion} label={() => v().label}
        parts={() => ({ correlation: v().correlation, readouts: v().readouts, legend: v().legend })} />
    }}
  </div>
}
