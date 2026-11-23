// Showcase stage for ReactionPicker: pick a reaction (row) or insert emoji into a line of text (grid).
import { ReactionPicker } from "march/social";
import type { ColorToken } from "march/theme";
import { Icon, smile } from "march/icons";

export const code = `<ReactionPicker selected={msg.myReaction} onPick={(e) => react(msg, e)} onMore={openEmoji} />
<ReactionPicker layout="grid" onPick={(e) => insertAtCaret(e)} />          // the composer's emoji panel`

export default function ReactionPickerDemo(props: { values: { layout: string; more: string; color: string; pop: boolean } }) {
  let $sel = "❤️"
  let $text = "Harika bir gün"
  let $n = 0
  return <div class="sc-social-react">
    {() => { $n; return <ReactionPicker layout={props.values.layout as "row"} selected={() => (props.values.layout === "row" ? $sel : undefined)}
      onMore={props.values.more !== "off" ? () => { $n = $n + 1 } : undefined} moreIcon={props.values.more === "own" ? <Icon of={smile} /> : undefined}
      m:color={props.values.color as ColorToken} pop={props.values.pop}
      onPick={(e) => { if (props.values.layout === "row") $sel = $sel === e ? "" : e; else $text = $text + e }} /> }}
    <p class="sc-strip-label" aria-live="polite">{() => (props.values.layout === "row" ? `Tepkiniz: ${$sel || "yok"}` : `Metin: ${$text}`)}</p>
  </div>
}
