// Showcase stage for Secret: an API key and a card number, hidden as the Playground says (playground.ts); the eye
// shows them, the copy button copies the real value.
import { Secret, type SecretRegion } from "march/typography";

export const code = `<Secret value={$key} />                                 // sk_l••••••••••••••••d05a
<Secret value={card} regions={[[4, 12]]} mask="*" />     // 4111********1111
<Secret value={$key} regions={[[8]]} maskLength={6} copy bind:revealed={$open} />`

const REGIONS: Record<string, readonly SecretRegion[] | undefined> = { ends: undefined, last4: [[0, -4]], middle: [[4, 12], [16]], all: [[0]] };

export default function SecretDemo(props: { values: { value: string; regions: string; mask: string; maskLength: number; revealed: boolean; toggle: boolean; copy: boolean; mono: boolean; size: string } }) {
  return <div class="sc-col">
    {() => {
      const v = props.values
      return <Secret value={v.value} regions={REGIONS[v.regions]} mask={v.mask} maskLength={v.maskLength || undefined} revealed={v.revealed}
        toggle={v.toggle} copy={v.copy} mono={v.mono} size={v.size as "md"} />
    }}
    <div class="sc-row"><span class="m-muted">Kart:</span><Secret value="4111111111111111" regions={[[4, 12]]} mask="*" /></div>
  </div>
}
