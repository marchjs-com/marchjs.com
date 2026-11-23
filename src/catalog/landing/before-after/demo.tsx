// Showcase stage for BeforeAfter: the same HADİ screen, before (grey, flat) and after (the new design).
import { BeforeAfter } from "march/landing";
import { MockApp } from "../demo-kit.tsx";
import { heart, Icon } from "march/icons";

export const code = `<BeforeAfter before={<img src="eski.png" alt="" />} after={<img src="yeni.png" alt="" />}
  beforeLabel="Önce" afterLabel="Sonra" />
<BeforeAfter orientation="vertical" follow before={…} after={…} />   // the divider follows the pointer
<BeforeAfter grip={<Icon of={heart} />} step={5} hint={false} before={…} after={…} />   // own grip; grip={false}: the line only`

export default function BeforeAfterDemo(props: { values: { before: string; after: string; orientation: string; follow: boolean; beforeLabel: string; afterLabel: string; grip: string; hint: boolean; value: number } }) {
  return <div class="sc-ba-stage">
    {() => {
      const v = { ...props.values }
      // the layers: the HADİ screen mock, or the text typed into the before / after options (a filled panel)
      return <BeforeAfter class="sc-ba" orientation={v.orientation as "horizontal" | "vertical"} follow={v.follow}
        grip={v.grip === "off" ? false : v.grip === "own" ? <Icon of={heart} /> as Node : true} hint={v.hint}
        value={() => props.values.value} beforeLabel={v.beforeLabel || undefined} afterLabel={v.afterLabel || undefined}
        before={v.before && v.before !== "Eski tasarım" ? v.before : <MockApp class="sc-ba-old" /> as Node}
        after={v.after && v.after !== "Yeni tasarım ✨" ? v.after : <MockApp /> as Node} />
    }}
  </div>
}
