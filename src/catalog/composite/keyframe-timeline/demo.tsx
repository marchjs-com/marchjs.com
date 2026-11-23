// Showcase stage for KeyframeTimeline: three scenes, for the Playground values (playground.ts).
import { signal } from "march";
import { KeyframeTimeline } from "march/composite";
import { SCENES } from "./playground.ts";

const BAR: Record<string, boolean | ("play" | "time")[]> = { all: true, short: ["play", "time"], none: false }

export default function KeyframeTimelineDemo(props: { values: { scene: string; snap: number; loop: boolean; stage: boolean; readonly: boolean; transport: string; inspector: boolean; curves: boolean; labels: boolean } }) {
  return <div class="sc-ed-one">
    {() => {
      const model = signal(structuredClone(SCENES[props.values.scene] ?? SCENES.intro!))
      // the playback bar, the lane curves and the first loop state are read when the timeline is made: it is made again when they change
      const parts = { transport: BAR[props.values.transport], curves: props.values.curves, loop: props.values.loop }
      return <KeyframeTimeline value={model} snap={props.values.snap} stage={props.values.stage} readonly={props.values.readonly} autoplay
        {...parts} inspector={props.values.inspector}
        labels={props.values.labels ? { hint: "Bir kareye dokun: zamanı, değeri ve eğrisi burada açılır.", time: "Ne zaman (ms)", value: "Kaç" } : undefined} />
    }}
  </div>
}
