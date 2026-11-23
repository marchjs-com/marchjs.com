// Showcase stage for Toggle: the label, the color token, three states and the disabled state.
import { Toggle } from "march/components/forms/toggle";
import type { ColorToken } from "march/theme";
// unions live outside JSX: the March compiler reads `|` in a JSX expression as a pipe
type Opt<T> = T | undefined
/** An empty choice means "not set". */
const pick = (v: string): string | undefined => v || undefined

export const code = `<Toggle bind:value={$notify} label="Anlık bildirimler" />
<Toggle bind:value={$dark} m:color="brand-purple" label="Koyu tema" />
<Toggle tristate bind:value={$pressed} label="Basılı" />   // null (not set) → true → false → null`

export default function ToggleDemo(props: { values: { label: string; color: string; tristate: boolean; disabled: boolean } }) {
  let $notify = true
  let $digest = false
  let $pressed: boolean | null = null
  const word = (v: boolean | null): string => (v == null ? "belirsiz" : v ? "açık" : "kapalı")
  return <div class="sc-stack">{() => {
    const color = pick(props.values.color) as Opt<ColorToken>
    return [
      <Toggle value={$notify} onChange={(x: boolean) => { $notify = x }} m:color={color} disabled={props.values.disabled} label={props.values.label} />,
      <Toggle value={$digest} onChange={(x: boolean) => { $digest = x }} m:color={color} disabled={props.values.disabled} label="Haftalık özet" />,
      props.values.tristate ? <Toggle tristate value={$pressed} onChange={(x: boolean | null) => { $pressed = x }} m:color={color} disabled={props.values.disabled} label={() => `Basılı: ${word($pressed)}`} /> : null,
    ]
  }}</div>
}
