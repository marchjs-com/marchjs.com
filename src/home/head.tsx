// The head of a home page section (the sections below the hero share it): a small coloured kicker, the title built
// word by word as it scrolls into view, an optional lead.
import { inView, reducedMotion } from "march/motion";
import { tilt } from "march/motion/text";
import { SectionHead } from "march/components/landing/index.ts";
import type { ColorToken } from "march/theme/colors.ts";

/** Action on a heading: its words tilt in one after another when it scrolls into view (the text is there at once with reduced motion). */
function words(el: Element): () => void {
  if (reducedMotion() || el.ownerDocument?.documentElement.hasAttribute("data-m-hydrating")) return () => {}
  const h = el as HTMLElement
  h.style.setProperty("opacity", "0")
  return inView(el, { once: true, enter: () => { h.style.removeProperty("opacity"); tilt(h, { by: "word", stagger: 70, duration: 700 }) } })
}

/** The head of a section: a small colored kicker, the title built word by word, an optional lead. */
export function Head(props: { kicker: string; title: string; lead?: string; color: ColorToken; id: string }) {
  return <SectionHead class="sc-sec-head" align="start" width="full" size="lg" m:color={props.color} eyebrow={props.kicker} titleId={props.id}
    title={<span use:words>{props.title}</span>} lead={props.lead} reveal={{ effect: "up", stagger: 90 }} />
}
