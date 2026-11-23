// Showcase stage for Kbd: the shortcut (or the plain text) follows the Playground values (playground.ts); mod is ⌘ on
// macOS, Ctrl elsewhere.
import { Kbd } from "march/typography";

export const code = `<Kbd keys="mod+k" />          // Ctrl+K, or ⌘K on macOS
<Kbd keys="shift+enter" />
<Kbd>Esc</Kbd>                   // plain text`

export default function KbdDemo(props: { values: { combo: string; text: string } }) {
  return <div class="sc-row">
    {() => (props.values.combo ? <Kbd keys={props.values.combo} /> : <Kbd>{props.values.text}</Kbd>)}
    <span class="m-muted">{() => (props.values.combo ? `keys="${props.values.combo}"` : "düz metin")}</span>
  </div>
}
