// Showcase stage for Presentation: a short deck (title, fragments, split, numbers, closing) for the Playground values.
import { Presentation, Slide, Appear, Counter } from "march/landing";
import { Overlay } from "march/media";
import { MockApp } from "../demo-kit.tsx";
import { effect, untrack } from "march";
import { animate } from "march/motion";

export const code = `let $slide = Number(queryParam("slide")() ?? 0)
<Presentation bind:index={$slide} transition="slide" presenterUrl="#/sites/slides?presenter=1">
  <Slide layout="title" tone="brand" notes="Herkese merhaba">…</Slide>
  <Slide notes="Üç madde, tek tek"><h2>Neden?</h2><Appear><li>Hızlı</li><li>Erişilebilir</li><li>Güzel</li></Appear></Slide>
</Presentation>`

/** The sample deck (also used by the full-page slides sample). */
/** Number of slides in DemoSlides. */
const SLIDES = 5

export function DemoSlides() {
  return [
    <Slide layout="title" tone="brand" notes="Herkese merhaba. Bu sunum tamamen tarayıcıda, March ile.">
      <p class="sc-deck-kicker">March</p>
      <h2 class="sc-deck-title">Web sitelerini yeniden düşünmek</h2>
      <p>Ok tuşları, kaydırma ya da dokunma ile ilerle</p>
    </Slide>,
    <Slide notes="Maddeler tek tek gelir: boşluk ya da sağ ok.">
      <h2>Neden yeni bir yol?</h2>
      <Appear><li>İlk boyama 15 KB'ın altında</li><li>Tek hareket motoru, görünmeyen durur</li><li>Her dilde, her yönde</li></Appear>
    </Slide>,
    <Slide layout="split" notes="Sol tarafta anlatım, sağda ürün.">
      <div><h2>Bloklarla kur</h2><p>Hero, fiyatlar, yorumlar, SSS: hepsi aynı dili konuşur.</p></div>
      <MockApp class="sc-deck-mock" />
    </Slide>,
    <Slide layout="center" tone="inverse" background={<Overlay effect="mesh" opacity={0.35} />} notes="Rakamlar görünce sayar.">
      <h2><Counter value={98.6} decimals={1} suffix="%" start="now" /></h2>
      <p>daha az JavaScript</p>
    </Slide>,
    <Slide layout="title" notes="Teşekkürler, sorular?">
      <h2 class="sc-deck-title">Teşekkürler</h2>
      <p>Sorular?</p>
    </Slide>,
  ]
}

// an own transition: the new slide turns in (any function of the two slides and the direction)
const turnIn = (incoming: HTMLElement, _outgoing: HTMLElement | undefined, dir: 1 | -1): void => {
  animate(incoming, { opacity: [0, 1], transform: [`rotate(${8 * dir}deg) scale(.7)`, "rotate(0deg) scale(1)"] }, { duration: 620, easing: "expo" })
}

export default function PresentationDemo(props: { values: { sample: number; transition: string; presenter: boolean; progress: boolean; progressColor: string; counter: string; controls: boolean } }) {
  // the transition plays when the slide changes: choosing one moves to the next slide, so it is seen at once (the deck
  // reads the transition live, it is not rebuilt for it)
  let $slide = 0
  let first = true
  effect(() => {
    void props.values.transition
    if (first) { first = false; return }
    untrack(() => { $slide = $slide >= Math.min(SLIDES, props.values.sample) - 1 ? 0 : $slide + 1 })
  })
  return <div>
    {() => {
      const count = props.values.sample, presenter = props.values.presenter, progress = props.values.progress, color = props.values.progressColor, counter = props.values.counter, controls = props.values.controls
      return <Presentation bind:index={$slide} transition={props.values.transition === "own" ? turnIn : props.values.transition as "slide"} presenter={presenter} sync="demo" label="Örnek sunum"
        controls={controls} progress={progress} progressColor={color === "gradient" ? undefined : color as "brand-orange"}
        counter={counter === "off" ? false : counter === "own" ? (i: number, n: number) => `${i + 1} / ${n}` : true}>{DemoSlides().slice(0, count)}</Presentation>
    }}
  </div>
}
