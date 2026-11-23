// Showcase stage for ScrollStory: four steps with markup media in the four HADİ colours.
import { ScrollStory, type StoryStep, Counter } from "march/landing";
import { MockApp } from "../demo-kit.tsx";
import { animate } from "march/motion";

export const code = `<ScrollStory steps={[
  { title: "Keşfet", body: "…", media: <Map />, color: "brand-orange" },
  { title: "Katıl", body: "…", media: <Count />, color: "brand-blue" },
]} />`

export const STORY: StoryStep[] = [
  { title: "Keşfet", body: "Yakınındaki etkinlikler, ilgi alanına göre: bugün, bu hafta sonu, gelecek ay.", media: <MockApp class="sc-story-mock" />, color: "brand-orange" },
  { title: "Katıl", body: "Tek dokunuşla yerini ayır; gerekiyorsa biletini al. Kimlerin geleceğini önceden gör.", media: <div class="sc-story-num"><Counter value={12} suffix=" kişi" /></div>, color: "brand-blue" },
  { title: "Tanış", body: "Etkinlik sohbetinde merhaba de, istersen görüntülü tanış. Buluşmada kimse yabancı kalmaz.", media: <div class="sc-story-orbs"><i /><i /><i /></div>, color: "brand-green" },
  { title: "Paylaş", body: "Anıları akışta ve hikâyelerde paylaş; yeni arkadaşlarını listene ekle.", media: <div class="sc-story-num"><Counter value={48} suffix=" anı" /></div>, color: "brand-purple" },
]

// an own picture change: the new picture turns in
const turnIn = (incoming: HTMLElement, outgoing: HTMLElement | undefined, dir: 1 | -1): void => {
  animate(incoming, { opacity: [0, 1], transform: [`rotate(${10 * dir}deg) scale(.7)`, "rotate(0deg) scale(1)"] }, { duration: 620, easing: "expo" })
  if (outgoing) animate(outgoing, { opacity: [1, 0] }, { duration: 300, easing: "out" })
}

// the visual changes while the page scrolls past a step: the stage says how it will come in
const TRANSITIONS: Record<string, string> = { rise: "yükselerek gelir", fade: "solarak gelir", own: "dönerek gelir (kendi geçişim)", none: "hareketsiz değişir" }

export default function ScrollStoryDemo(props: { values: { sample: number; side: string; theme: boolean; dots: boolean; numbers: string; transition: string } }) {
  return <div>
    <p class="m-muted">{() => `Sayfayı kaydır: adım değişince görsel ${TRANSITIONS[props.values.transition]}.`}</p>
    {() => {
      const v = { ...props.values }
      return <ScrollStory steps={STORY.slice(0, v.sample)} side={v.side as "end"} theme={v.theme} dots={v.dots}
        numbers={v.numbers === "off" ? false : v.numbers === "own" ? (i: number) => `Adım ${i + 1}` : true}
        transition={v.transition === "own" ? turnIn : v.transition as "rise"} />
    }}
  </div>
}
