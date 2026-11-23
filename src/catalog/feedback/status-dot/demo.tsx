// Showcase stage for StatusDot: the dot alone, next to text and in a list of states, drawn for the Playground values (tone, colour, pulse, size, label, hollow).
import { StatusDot, type StatusDotTone } from "march/components/feedback/status-dot";
import type { ColorToken } from "march/theme";

export const code = `<StatusDot tone="success" pulse label="Canlı" />        // role="img", read as "Canlı"
<StatusDot m:color="brand-orange" size="xs" />            // decorative (aria-hidden)
<StatusDot tone="warn" pulse="blink" /> Kaydedilmedi`

const STATES: [StatusDotTone, string][] = [["success", "Çevrimiçi"], ["warn", "Meşgul"], ["danger", "Bağlantı yok"], ["neutral", "Çevrimdışı"]]

export default function StatusDotDemo(props: { values: { tone: string; color: string; pulse: string; size: string; label: string; hollow: boolean } }) {
  return <div class="sc-col">
    {() => {
      const v = { ...props.values }
      const color = (v.color || undefined) as ColorToken | undefined, size = v.size as "md", tone = v.tone as StatusDotTone
      const pulse = v.pulse === "off" ? false : v.pulse as "ring"
      const label = v.label || undefined
      const note = v.label ? `role="img" aria-label="${v.label}"` : `aria-hidden="true" (süs)`
      return <>
        <div class="sc-row">
          <StatusDot tone={tone} m:color={color} pulse={pulse} size={size} label={label} hollow={v.hollow} />
          <span>Canlı yayın</span>
          <span class="m-muted">{note}</span>
        </div>
        <div class="sc-row">
          {STATES.map(([t, text]) => <span class="sc-row"><StatusDot tone={t} size={size} hollow={v.hollow} pulse={t === "success" ? pulse : false} />{text}</span>)}
        </div>
      </>
    }}
  </div>
}
