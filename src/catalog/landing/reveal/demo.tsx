// Showcase stage for Reveal: a row of cards that enter for the Playground values; "Tekrar oynat" mounts them again.
import { Reveal, type RevealEffect } from "march/components/landing/reveal";
import { Button } from "march/components/actions/button";

export const code = `<Reveal effect="up" stagger={80}>
  <Card>…</Card><Card>…</Card><Card>…</Card>
</Reveal>
<ul use:revealOnScroll={{ effect: "start" }}>…</ul>     // action form
<Reveal effect="blur" scrub>…</Reveal>                  // follows the scroll`

// an own effect: any start and end state (transform / opacity / filter)
const TURN = { from: { opacity: 0, transform: "rotate(-10deg) scale(.6)" }, to: { opacity: 1, transform: "rotate(0deg) scale(1)" } }

export default function RevealDemo(props: { values: { text: string; effect: string; stagger: number; scrub: boolean } }) {
  let $run = 0
  return <div class="sc-web-col">
    <Button size="sm" variant="secondary" onClick={() => $run++}>Tekrar oynat</Button>
    {() => {
      $run
      const v = { ...props.values }
      return <Reveal class="sc-reveal-row" effect={v.effect === "own" ? TURN : v.effect as RevealEffect} stagger={v.stagger} scrub={v.scrub}>
        {["Hızlı", "Erişilebilir", "Temalı", "Küçük"].map((t, i) => <div class="sc-reveal-card"><strong>{t}</strong><span class="m-muted">Kart {i + 1}</span></div>)}
      </Reveal>
    }}
    {() => props.values.text ? <p class="m-muted">{props.values.text}</p> : null}
  </div>
}
