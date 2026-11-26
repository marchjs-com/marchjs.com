// Showcase stage for SplitFlap: one departure board that takes every option, and buttons that change its text, so
// the reels clatter to a new destination. The status under it is what onSettle reported.
import { SplitFlap } from "march/components/data/split-flap";
import { Button } from "march/components/actions/button";
import type { ColorToken } from "march/theme";

export const code = `<SplitFlap value="İSTANBUL" length={10} />
<SplitFlap value={$gate} length={3} align="end" color="warning" size="lg" />
<SplitFlap value={$status} length={12} flapTime={50} stagger={30} live="polite" label="Durum" />`

type V = { value: string; length: number; align: string; flapTime: number; stagger: number; size: string; color: string; frame: boolean; motion: boolean; label: string }

const CITIES = ["ANKARA", "İZMİR", "BERLİN", "TRABZON", "BAKÜ", "LONDRA"]

export default function SplitFlapDemo(props: { values: V }) {
  let $text: string | null = null
  let $settled = ""
  const v = () => props.values
  return <div class="sc-col">
    <SplitFlap value={() => $text ?? v().value} length={() => v().length || undefined} align={() => v().align as "start"}
      flapTime={() => v().flapTime} stagger={() => v().stagger} size={() => v().size as "md"} color={() => (v().color || undefined) as ColorToken | undefined}
      frame={() => v().frame} motion={() => v().motion} label={() => v().label} onSettle={(t: string) => { $settled = t }} />
    <div class="sc-row">
      <Button size="sm" data-audit-try on:click={() => { $text = CITIES[Math.floor(Math.random() * CITIES.length)]! }}>Yeni varış</Button>
      <Button size="sm" variant="ghost" on:click={() => { $text = null }}>Seçenekteki yazı</Button>
      <span sx={{ text: "sm", color: "muted" }}>{() => ($settled ? `Yerine oturdu: ${$settled}` : "")}</span>
    </div>
  </div>
}
