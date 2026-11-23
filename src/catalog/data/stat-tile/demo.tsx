// Showcase stage for StatTile: the three numbers of a profile. A click on a tile adds to its number (the Counter rolls),
// so the button, the node value and every look option show at once.
import { StatTile } from "march/data";
import { Counter } from "march/landing";
import type { ColorToken } from "march/theme";

export const code = `<StatTile value="128" label="Gönderi" />
<StatTile value={<Counter value={$followers} mode="roll" />} label="Takipçi" variant="tile" onClick={openFollowers} />
<StatTile value="₺4.250" label="Bu ay" hint="geçen aydan %12 fazla" align="start" size="lg" m:color="success" />
<dl><StatTile term value="42" label="Etkinlik" /></dl>            // dt + dd`

const ITEMS = [{ id: "posts", label: "Gönderi", hint: "bu yıl 31" }, { id: "followers", label: "Takipçi", hint: "son 30 günde +212" }, { id: "following", label: "Takip", hint: "12 ortak" }]

export default function StatDemo(props: { values: { value: string; label: string; variant: string; size: string; align: string; order: string; color: string; hint: boolean; clickable: boolean; counter: boolean } }) {
  let $n: Record<string, number> = { posts: 128, followers: 12480, following: 342 }
  let $last = ""
  return <div class="sc-col">
    {() => {
      const v = { ...props.values }
      const color = (v.color || undefined) as ColorToken | undefined
      return <div class="sc-row">
        {ITEMS.map((it, i) => {
          const own = i === 0 && v.value && v.value !== "128" ? v.value : null
          const value = own != null ? own : v.counter ? <Counter value={() => $n[it.id] ?? 0} mode="roll" start="now" /> : () => ($n[it.id] ?? 0).toLocaleString("tr")
          const onClick = v.clickable ? () => { $n = { ...$n, [it.id]: ($n[it.id] ?? 0) + 1 }; $last = it.label } : undefined
          return <StatTile value={value} label={i === 0 && v.label ? v.label : it.label} hint={v.hint ? it.hint : undefined} variant={v.variant as "tile"} size={v.size as "md"}
            align={v.align as "center"} order={v.order as "value"} m:color={color} onClick={onClick} />
        })}
      </div>
    }}
    <p class="m-muted">{() => ($last ? `onClick: ${$last} +1` : props.values.clickable ? "Bir karoya bas: sayı artar." : "Düz karo (div): tıklanmaz.")}</p>
  </div>
}
