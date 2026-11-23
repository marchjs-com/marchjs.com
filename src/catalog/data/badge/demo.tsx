// Showcase stage for Badge: kind, text, tone, fill, size, dot (mark, colour, motion), the clickable form and the count (max, label) follow the Playground values (playground.ts).
import { Badge } from "march/data";
import { LABEL } from "./playground.ts";
import { Icon, heart } from "march/icons";

export const code = `<Badge tone="success">Etkin</Badge>
<Badge tone="warn" dot>Bekliyor</Badge>
<Badge dot dotColor="brand-orange">Canlı</Badge>      // dot={<Icon of={heart} />}: your own mark
<Badge tone="danger" pulse>Canlı</Badge>              // the dot pulses: pulse="ring" | "blink"
<Badge count={$unread} label="okunmamış" />          // hidden at 0, 120 → "99+"
<Badge size="xs" count={$unread} />                  // the mini badge on a corner
<Badge onClick={() => open()} pressed={$on}>v2</Badge> // clickable: a <button>`


export default function BadgeDemo(props: { values: { mode: string; text: string; tone: string; variant: string; size: string; dot: string; dotColor: string; pulse: string; clickable: boolean; count: number; max: number; label: string; showZero: boolean; format: string } }) {
  let $clicks = 0
  let $on = false
  return <div class="sc-col">
    <div class="sc-row">
      {() => {
        const v = { ...props.values }
        const size = v.size as "md", variant = v.variant === "solid" ? "solid" as const : undefined
        const click = v.clickable ? () => { $clicks++; $on = !$on } : undefined
        const pressed = v.clickable ? () => $on : undefined
        if (v.mode === "count") return [<span class="m-muted">Gelen kutusu</span>, <Badge count={v.count} tone={v.tone} size={size} variant={variant} max={v.max || 99} showZero={v.showZero} label={v.label || "okunmamış"} onClick={click} pressed={pressed} format={v.format === "own" ? (n: number) => `${n} yeni` : undefined} />]
        const dot = () => (v.mode !== "dot" ? false : v.dot === "own" ? <Icon of={heart} /> as Node : true)
        const dotColor = v.dot === "own" || !v.dotColor ? undefined : v.dotColor as "brand-orange"
        const pulse = v.mode === "dot" && v.dot !== "own" && v.pulse !== "off" ? (v.pulse as "ring") : undefined
        return ["HADİ", "Globex", "Initech"].map((n) => <span class="sc-row">{n}<Badge tone={v.tone} size={size} variant={variant} dot={dot()} dotColor={dotColor} pulse={pulse} onClick={click} pressed={pressed}>{v.text || LABEL[v.tone]}</Badge></span>)
      }}
    </div>
    {() => (props.values.clickable ? <span class="m-muted">{`Rozet bir düğme: Tab ile gelin, Enter ile basın. Basıldı: ${$clicks} · ${$on ? "basılı" : "basılı değil"}`}</span> : null)}
  </div>
}
