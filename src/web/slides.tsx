// Sample page: a presentation. The slide number lives in the URL (?slide=, through setQuery), ?presenter=1 shows the speaker view; both
// windows stay in step.
import { query, setQuery, hrefOf } from "march/router";
import { Presentation } from "march/components/landing/presentation";
import { DemoSlides } from "../catalog/landing/presentation/demo.tsx";

export default function SlidesSample() {
  const slide = () => String(query()["slide"] ?? "1")
  const presenter = () => String(query()["presenter"] ?? "")
  return <div class="sc-sample-slides">
    <h1 class="sc-slides-title">March tanıtım sunumu</h1>
    <Presentation label="March tanıtım sunumu" transition="slide" sync="showcase"
      index={() => Math.max(0, Number(slide()) - 1 || 0)} setIndex={(i) => void setQuery({ slide: String(i + 1) })}
      presenter={presenter() === "1"} presenterUrl={hrefOf("/sites/slides?presenter=1")}>
      <DemoSlides />
    </Presentation>
    <p class="sc-slides-help m-muted">← → ya da boşluk: ilerle · F: tam ekran · P: konuşmacı penceresi · Yazdır: her slayt bir sayfa</p>
  </div>
}
