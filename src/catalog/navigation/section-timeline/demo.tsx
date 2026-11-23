// Showcase stage for SectionTimeline: a box of sections that scrolls, the timeline beside it (vertical) or under it
// (horizontal), following the box (root). Point at the dots to magnify them, press one to scroll there; the line shows
// the section being read.
import { SectionTimeline, type SectionTimelineItem } from "march/components/navigation/section-timeline";

export const code = `<SectionTimeline items={sections} hash fixed intro />              // the page: dots at the side, the address follows
<SectionTimeline items={steps} orientation="horizontal" root={() => box} />   // a scrolling box: a row of dots under it
<SectionTimeline items={sections} magnify={false} onChange={(i) => $read = i} />`

export default function SectionTimelineDemo(props: { values: { items: readonly SectionTimelineItem[]; orientation: string; count: number; magnify: boolean; intro: boolean; reach: number; grow: number; wave: number; smooth: boolean; color: string; line: number } }) {
  let $read = -1
  let box: HTMLElement | undefined
  return <div class="sc-col">
    {() => {
      const v = { ...props.values }
      // the chosen list (playground.ts), as many as the count, each dot pointed at its section in the box
      const names = v.items.slice(0, v.count).map((it) => it.label)
      const color = v.color === "primary" ? undefined : v.color as "brand-blue"
      const items: SectionTimelineItem[] = names.map((n, i) => ({ label: n, target: () => box?.querySelector(`[data-sec="${i}"]`) ?? null }))
      const row = v.orientation === "horizontal"
      return <div class={row ? "sc-col" : "sc-row"}>
        <div class="sc-stl-box" ref={(el: Element) => { box = el as HTMLElement }} tabindex="0" aria-label="Bölümler">
          {names.map((n, i) => <section class="sc-stl-sec" data-sec={String(i)}><h3>{`${i + 1}. ${n}`}</h3><p>Bu bölüm kaydırıldıkça okuma çizgisini geçer; zaman çizelgesi onu renklendirir.</p></section>)}
        </div>
        <SectionTimeline items={items} root={() => box} orientation={v.orientation as "vertical"} magnify={v.magnify} intro={v.intro} wave={v.wave || false} reach={v.reach} grow={v.grow}
          line={v.line} smooth={v.smooth} offset={8} m:color={color} onChange={(i: number) => { $read = i }} />
      </div>
    }}
    <p class="sc-demo-call">{() => `onChange: ${$read}`}</p>
  </div>
}
