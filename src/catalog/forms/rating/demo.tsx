// Showcase stage for Rating: the value from the Playground (a fraction fills part of a star), editable or read-only.
import { Rating } from "march/forms";
import { heart } from "march/icons";
import { computed, effect, untrack } from "march";

export const code = `<Rating bind:value={$stars} />
<Rating value={4.5} readonly size="sm" />
<Rating bind:value={$n} max={10} m:color="brand-blue" label="Hizmet puanı" />
<Rating bind:value={$n} icon={heart} m:color="danger" animate={false} starLabel={(n, max) => \`\${max} üzerinden \${n}\`} />
<Rating bind:value={$n} icon={(n) => <b>{n}</b>} />`

type Values = { value: number; max: number; size: string; readonly: boolean; color: string; mark: string; animate: boolean }

export default function RatingDemo(props: { values: Values }) {
  let $v = 3.5
  // the Puan option sets the value; a click on a star then changes it
  effect(() => { const x = props.values.value; untrack(() => { $v = x }) })
  // the stars are built once (their count and mark): the Rating is built again only when one of the two changes
  const once = computed(() => [props.values.max, props.values.mark].join("|"))
  return <div class="sc-row">
    {() => {
      once()
      return untrack(() => {
        const mark = props.values.mark, max = props.values.max
        return <Rating value={() => $v} setValue={(n: number) => { $v = n }} max={max} size={props.values.size as "lg"} readonly={props.values.readonly}
        m:color={props.values.color === "primary" ? undefined : (props.values.color as "brand-blue")} label="HADİ hizmet puanı" animate={props.values.animate}
        icon={mark === "heart" ? heart : mark === "number" ? (n: number) => <b>{n}</b> : undefined} starLabel={(n: number, max: number) => `${max} üzerinden ${n}`} />
      })
    }}
    <span class="sc-strip-label" aria-live="polite">{() => `${String($v).replace(".", ",")} / ${props.values.max}` + (props.values.readonly ? " · salt okunur" : props.values.animate ? " · üstüne gelince büyür" : " · hareketsiz")}</span>
  </div>
}
