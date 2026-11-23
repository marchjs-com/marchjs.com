// Showcase stage for Button: variant, size, shape, pressed, icon, loading (and its spinner), disabled and block follow the Playground values; the second
// row is an ActionButton (an action() with confirm and toasts).
import { Button, ActionButton } from "march/actions";
import { action } from "march/ui";
import { plus, trash, arrowRight, refresh, rotateCw, hourglass, sparkles, star, sun } from "march/icons";

const MARKS: Record<string, unknown> = { refresh, rotateCw, hourglass, sparkles, star, sun }

export const code = `<Button variant="primary" icon={plus}>Yeni proje</Button>
<Button size="sm" loading={$saving} on:click={save}>Kaydet</Button>
<Button href="/docs" iconEnd={arrowRight}>Belgeler</Button>    // a router link
const remove = action("Sil", api.remove, { icon: trash, danger: true, confirm: "Silinsin mi?", success: "Silindi" })
<ActionButton action={remove} args={[row]} />                  // hidden / disabled / busy from the action
<Button loading={$saving} spinner={false} icon={plus}>Kaydet</Button>   // spinner: false | your own node / icon (it turns)
<Button weight="strong">Kaydet</Button>                                  // light | regular | medium | strong
<Button variant="link" on:click={showAll}>Tümünü gör</Button>           // inline text button
<Button variant="ghost" pressed={$wrap} shape="pill">Kaydır</Button>    // toggle: aria-pressed + pressed look`

export default function ButtonDemo(props: { values: { label: string; variant: string; size: string; shape: string; weight: string; pressed: boolean; icon: boolean; loading: boolean; spinner: string; spinnerIcon: string; disabled: boolean; block: boolean } }) {
  let $clicks = 0
  const remove = action("Taslağı sil", async () => { await new Promise((r) => setTimeout(r, 600)) }, { icon: trash, danger: true, confirm: "Taslak silinsin mi?", success: "Taslak silindi" })
  return <div class="sc-col">
    {() => {
      const v = props.values
      const spinner = v.spinner === "off" ? false : v.spinner === "own" ? MARKS[v.spinnerIcon] ?? refresh : true
      const shape = v.shape === "pill" ? "pill" as const : undefined
      const pressed = v.pressed ? true : undefined
      return <div class="sc-row">
        <Button variant={v.variant as "primary"} size={v.size as "md"} shape={shape} weight={v.weight as "medium"} pressed={pressed} icon={v.icon ? plus : undefined} loading={v.loading} spinner={spinner} disabled={v.disabled} block={v.block}
          on:click={() => { $clicks++ }}>{() => ($clicks ? `${v.label} (${$clicks})` : v.label)}</Button>
        {v.block ? null : <Button variant="ghost" size={v.size as "md"} shape={shape} pressed={pressed} iconEnd={arrowRight}>Devam</Button>}
      </div>
    }}
    <div class="sc-row"><ActionButton action={remove} size="sm" /></div>
  </div>
}
