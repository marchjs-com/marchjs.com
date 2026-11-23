// Showcase stage for LiveCounter: sample HADİ numbers that grow while you watch. Every part follows the options: the
// digit animation (any text animation), the dot, the "+N" bubble and the beat. Steps come every 0.4–1.2 s here, so a
// change shows at once.
import { LiveCounter, type LiveCounterEffect } from "march/landing";
import { splitFlap, scramble, decode, odometer, pop, glitch } from "march/motion/text";
import { heart, Icon } from "march/icons";

export const code = `import { splitFlap } from "march/motion/text"
<LiveCounter value={$online} label="kişi şu an HADİ'de" />                        // fed by your server
<LiveCounter from={18420} rate={40} effect={splitFlap} dotColor="brand-orange"
  bubble={(d) => <b>❤ {d}</b>} beat={false} label="kişi bu hafta katıldı" />`

const EFFECTS: Record<string, LiveCounterEffect | "roll" | "none"> = { roll: "roll", none: "none", splitFlap, scramble, decode, odometer, pop, glitch } as never

export default function LiveCounterDemo(props: { values: { from: number; label: string; effect: string; dot: string; bubble: string; beat: boolean; rate: number } }) {
  return <div class="sc-lc-stage">
    {() => {
      const v = { ...props.values }
      const shared = {
        effect: EFFECTS[v.effect] ?? "roll", beat: v.beat, pause: [400, 1200] as [number, number],
        dot: v.dot === "off" ? false : v.dot === "own" ? <Icon of={heart} class="sc-lc-heart" /> as Node : true,
        dotColor: v.dot === "off" || v.dot === "own" ? undefined : v.dot as "success",
        bubble: v.bubble === "off" ? false : v.bubble === "own" ? (d: number) => <span class="sc-lc-own">{`❤ ${d} yeni`}</span> : true,
      }
      return <>
        <LiveCounter from={v.from ?? 18420} rate={v.rate} {...shared} label={v.label || undefined} />
        <LiveCounter from={1264} rate={v.rate / 4} {...shared} label="etkinlik şu an devam ediyor" />
      </>
    }}
  </div>
}
