// Showcase stage for Tooltip: hover or focus the control; the Playground picks what it describes (playground.ts).
import { Tooltip } from "march/components/overlays/tooltip";
import { Button } from "march/components/actions/button";
import { IconButton } from "march/components/actions/icon-button";
import { sparkles, bell } from "march/icons";
import { later } from "../../demo-util.ts";
import type { ColorToken } from "march/theme";

export const code = `<Tooltip text="Bağlantıyı kopyala" placement="top">
  <Button variant="ghost" icon={link}>Paylaş</Button>
</Tooltip>                                  // hover (after a short delay) or keyboard focus; Esc hides
<Tooltip text="Kaydedildi" color="success" delay={0} motion="fade">…</Tooltip>   // kendi rengin, gecikmen, hareketin`

const MOTIONS: Record<string, string> = { scale: "büyüyerek", fade: "belirerek", none: "hareketsiz" }

export default function TooltipDemo(props: { values: { target: string; color: string; delay: number; motion: string; text: string; placement: string } }) {
  let row!: HTMLElement
  let last: number | null = null
  const fire = (type: string): void => { row.querySelector(".m-tip-anchor")?.dispatchEvent(new Event(type, { bubbles: true })) }
  return <div class="sc-row" ref={(x: Element) => { row = x as HTMLElement }}>
    {() => {
      const color = (props.values.color || undefined) as ColorToken, delay = props.values.delay, motion = props.values.motion as "scale"
      // a new choice shows the hint once, so its colour and motion are seen without hovering: at once, or after the
      // hover delay when the delay is what changed
      if (last !== null) {
        const hover = last !== delay
        later(() => fire(hover ? "mouseenter" : "focusin"), 0)
        later(() => fire("focusout"), (hover ? delay : 0) + 1800)
      }
      last = delay
      return props.values.target === "icon"
        ? <Tooltip text="3 yeni bildirim" placement="bottom" color={color} delay={delay} motion={motion}><IconButton icon={bell} label="Bildirimler" /></Tooltip>
        : <Tooltip text={props.values.text} placement={props.values.placement as "top"} color={color} delay={delay} motion={motion}><Button variant="ghost" icon={sparkles}>Üstüme gel</Button></Tooltip>
    }}
    <span class="sc-strip-label">{() => `Üstüne gelince ${props.values.delay ? `${(props.values.delay / 1000).toLocaleString("tr-TR")} sn sonra` : "hemen"} açılır (odakta hemen) · giriş: ${MOTIONS[props.values.motion] ?? props.values.motion}`}</span>
  </div>
}
