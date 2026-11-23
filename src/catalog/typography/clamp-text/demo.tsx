// Showcase stage for ClampText: a long caption in a narrow column, folded to the Playground's line count (long or short text: the "Metin" option). The state
// is controlled (`open` / `onOpenChange`): the button under it opens and folds the text from outside, and the line
// shows the state.
import { ClampText } from "march/typography";
import { Button } from "march/actions";

export const code = `<ClampText lines={3}>{post.text}</ClampText>                    // "devamı" appears only when it does not fit
<ClampText text={bio} lines={2} open={$open} onOpenChange={(v) => $open = v} />   // controlled
<ClampText lines={2} expandable={false}>{title}</ClampText>     // the fold only
<ClampText lines={4} collapsible={false} labels={{ more: "tamamını oku" }} m:color="brand-orange">{text}</ClampText>`

export default function ClampTextDemo(props: { values: { lines: number; expandable: boolean; collapsible: boolean; labels: string; color: string; text: string } }) {
  let $open = false
  return <div class="sc-col sc-clamp-box">
    {() => {
      const v = { ...props.values }
      const labels = v.labels === "own" ? { more: "tamamını oku", less: "kısalt" } : undefined
      const color = v.color === "primary" ? undefined : v.color as "neutral"
      return <ClampText lines={v.lines} expandable={v.expandable} collapsible={v.collapsible} labels={labels} m:color={color}
        open={() => $open} onOpenChange={(o: boolean) => { $open = o }} text={v.text} />
    }}
    <div class="sc-row">
      <Button size="sm" variant="secondary" data-audit-try="toggle" on:click={() => { $open = !$open }}>{() => ($open ? "Dışarıdan katla" : "Dışarıdan aç")}</Button>
      <span class="sc-demo-call">{() => `open: ${$open}`}</span>
    </div>
  </div>
}
