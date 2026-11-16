// The head of a home page section (the sections below the hero share it): a small coloured kicker, the title that names
// the feature (built word by word as it scrolls into view), the lead, and the example the demo shows.
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

/**
 * The head of a section: a small colored kicker, a title that names the feature (built word by word), the lead that
 * explains it, then the example the demo below shows.
 */
export function Head(props: { kicker: string; title: string; lead?: string; example?: string; color: ColorToken; id: string }) {
  const lead = props.example ? <>{props.lead ? <span class="sc-sec-lead">{props.lead}</span> : null}<span class="sc-sec-example"><b>Örnek</b>{props.example}</span></> : props.lead
  return <SectionHead class="sc-sec-head" align="start" width="full" size="lg" m:color={props.color} eyebrow={props.kicker} titleId={props.id}
    title={<span use:words>{props.title}</span>} lead={lead} reveal={{ effect: "up", stagger: 90 }} />
}
