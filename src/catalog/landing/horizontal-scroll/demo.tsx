// Showcase stage for HorizontalScroll: coloured case-study panels.
import { HorizontalScroll } from "march/landing";

export const code = `<HorizontalScroll label="Vaka çalışmaları" panel="26rem">
  {cases.map((c) => <Card>…</Card>)}
</HorizontalScroll>
<HorizontalScroll progress={false}>…</HorizontalScroll>   // no progress line
<HorizontalScroll pinned={false}>…</HorizontalScroll>     // never pins: a sideways scroller with snap points`

const TONES = ["c1", "c2", "c3", "c4"]

export default function HorizontalScrollDemo(props: { values: { label: string; panels: number; panel: string; pinned: boolean; progress: boolean } }) {
  return <div>
    {() => {
      const v = { ...props.values }
      return <HorizontalScroll label={v.label || undefined} panel={v.panel} pinned={v.pinned} progress={v.progress}>
        {Array.from({ length: v.panels }, (_, i) => <article class={`sc-hs-panel ${TONES[i % 4]}`}><span>{String(i + 1).padStart(2, "0")}</span><h3>Vaka {i + 1}</h3><p>Sayfa aşağı kayarken paneller yana akar.</p></article>)}
      </HorizontalScroll>
    }}
  </div>
}
