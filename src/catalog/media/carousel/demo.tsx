// Showcase stage for Carousel: the slides (JSON), label, slides per view, arrows and their icons, dots, colour and
// smooth scrolling and swiping follow the Playground values (playground.ts).
import { Carousel } from "march/media";
import { SLIDES } from "./playground.ts";
import { arrowLeft, arrowRight, skipBack, stepForward } from "march/icons";

export const code = `<Carousel perView={3} label="Özellikler">
  {items.map((x) => <article class="card">{x.title}</article>)}
</Carousel>
<Carousel m:color="brand-orange" prevIcon={arrowLeft} nextIcon={arrowRight} dots={(i) => i + 1}
  labels={{ previous: "Önceki", next: "Sonraki", slide: (n) => n + ". kart" }}>…</Carousel>
<Carousel arrows={false} dots={false}>…</Carousel>
<Carousel swipe>…</Carousel>   // the mouse drags too (swipe={false}: only buttons, dots and keys)
<Carousel>{["Bir", "İki", "Üç"]}</Carousel>   // a text becomes a plain slide box`

const ICONS: Record<string, unknown> = { arrowLeft, arrowRight, skipBack, stepForward }
const parse = (json: string): unknown[] => { try { const x = JSON.parse(json); return Array.isArray(x) ? x : [] } catch { return [] } }

export default function CarouselDemo(props: { values: { children: string; label: string; perView: number; arrows: boolean; prevIcon: string; nextIcon: string; dots: string; color: string; smooth: boolean; swipe: string } }) {
  return <div class="sc-col">
    {() => {
      // every value is read here (a value only passed on as a prop is read once): the carousel is drawn again on a change
      const v = { ...props.values }
      return <Carousel perView={v.perView as 1} label={v.label || "HADİ koleksiyonu"} arrows={v.arrows} prevIcon={ICONS[v.prevIcon]} nextIcon={ICONS[v.nextIcon]} smooth={v.smooth}
        swipe={v.swipe === "all" ? true : v.swipe === "off" ? false : "touch"}
        dots={v.dots === "off" ? false : v.dots === "own" ? (i: number) => String(i + 1) : true} m:color={v.color === "primary" ? undefined : (v.color as "brand-orange")}
        labels={{ slide: (n) => `${n}. kart` }}>
        {parse(v.children || SLIDES).map((x, i) => <article class={`sc-car-slide sc-car-${i % 4}`}><strong>{i + 1}</strong><span>{String(x)}</span></article>)}
      </Carousel>
    }}
  </div>
}
