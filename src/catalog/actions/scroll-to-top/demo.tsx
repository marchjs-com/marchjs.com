// Showcase stage for ScrollToTop: a scrolling box with its own inline button (the page itself has one in the corner).
// The icon, the colour and the way the button appears follow the Playground values.
import { ScrollToTop } from "march/actions";
import { chevronUp } from "march/icons";
import { animate } from "march/motion";
import type { ColorToken } from "march/theme";

export const code = `// once in the app shell: shows after scrolling, sits in the page corner
<ScrollToTop />
<ScrollToTop threshold={600} />      // later
<ScrollToTop inline target={box} />  // inside a scrolling box
<ScrollToTop icon={chevronUp} m:color="brand-blue" motion="fade" />   // motion: pop | fade | slide | none | (el, shown) => …`

const MOTIONS: Record<string, string> = { pop: "zıplayarak", fade: "belirerek", slide: "kayarak", own: "dönerek", none: "yok" }

export default function ScrollToTopDemo(props: { values: { inline: boolean; threshold: number; motion: string; icon: string; color: string } }) {
  const lines = Array.from({ length: 24 }, (_, i) => <p>{`HADİ bülteni, bölüm ${i + 1}: aşağı kaydır, düğme belirsin.`}</p>)
  let $top = 0
  const box = (<div class="sc-totop-box" on:scroll={(e: Event) => { $top = Math.round((e.currentTarget as HTMLElement).scrollTop) }}>{lines}</div>) as HTMLElement
  let threshold: number | null = null
  return <div class="sc-totop">
    <p class="sc-strip-label" aria-live="off">{() => `Kaydırma: ${$top} px · eşik: ${props.values.threshold} px · belirme hareketi: ${MOTIONS[props.values.motion] ?? props.values.motion}`}</p>
    {box}
    <div class="sc-totop-slot">{() => {
      // ScrollToTop reads its props once: every choice builds it again. A new icon, colour or motion also scrolls the
      // box past the threshold, so the button comes in (with that motion) and the choice is seen at once
      const v = { ...props.values }
      if (threshold === v.threshold && box.scrollTop <= v.threshold) { box.scrollTop = v.threshold + 40; $top = Math.round(box.scrollTop) }
      threshold = v.threshold
      const spin = (el: HTMLElement, shown: boolean) => animate(el, shown
        ? [{ opacity: 0, transform: "rotate(-180deg) scale(0.6)" }, { opacity: 1, transform: "none" }]
        : [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "rotate(180deg) scale(0.6)" }], { duration: 420, easing: "easeOutCubic", fill: "forwards" })
      return <ScrollToTop inline={v.inline} target={box} threshold={v.threshold} motion={v.motion === "own" ? spin : v.motion as "pop"}
        icon={v.icon === "chevronUp" ? chevronUp : v.icon === "⇧" ? "⇧" : undefined} m:color={(v.color || undefined) as never} />
    }}</div>
  </div>
}
