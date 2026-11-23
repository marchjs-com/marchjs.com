// Showcase stage for EditorFrame: a small note editor built from the frame, a FormatToolbar in its head and a word
// count in its foot, drawn for the Playground values (playground.ts). The text is kept while the options change.
import { untrack } from "march";
import { EditorFrame, FormatToolbar } from "march/composite";
import { Badge } from "march/data";
import { Button } from "march/actions";
import type { ColorToken } from "march/theme";

export const code = `<EditorFrame head={<FormatToolbar onTool={exec} />} actions={<Badge>{$words} kelime</Badge>}
  foot={<span>Markdown desteklenir</span>} m:color="brand-green">
  <textarea class="m-editor-area" bind:value={$text} />
</EditorFrame>
<EditorFrame showHead={() => $tools.length > 0} headProps={{ sticky: true }} footProps={{ divider: true }} ring={false} … />`

export default function EditorFrameDemo(props: { values: { head: boolean; actions: boolean; foot: boolean; sticky: boolean; ring: boolean; color: string; readonly: boolean; disabled: boolean } }) {
  let $text = "HADİ koşu kulübü cumartesi sabahı sahilde buluşuyor.\nYeni katılanlar için tempo yavaş tutulacak."
  let $last = ""
  const words = () => $text.trim().split(/\s+/).filter(Boolean).length
  let host: HTMLElement | undefined
  // the ring and its colour show only while something inside has focus: the button puts the focus in the note
  const focusNote = () => host?.querySelector<HTMLTextAreaElement>(".m-editor-area")?.focus()
  return <div class="sc-col" ref={(x: Element) => { host = x as HTMLElement }}>
    {() => {
      const v = { ...props.values }
      const color = (v.color || undefined) as ColorToken | undefined
      const off = v.readonly || v.disabled
      return <EditorFrame
        head={v.head ? <FormatToolbar tools={["bold", "italic", "|", "link", "ul"]} disabled={off} onTool={(tool) => { $last = tool }} /> : undefined}
        actions={v.head && v.actions ? <Badge tone="neutral">{() => `${words()} kelime`}</Badge> : undefined}
        headProps={{ sticky: v.sticky }}
        foot={v.foot ? <span>{() => ($last ? `Son araç: ${$last}` : "Çerçevenin içine tıklayın: kenar ve halka odakla renklenir.")}</span> : undefined}
        footProps={{ divider: true }}
        ring={v.ring} m:color={color} disabled={v.disabled} readonly={v.readonly}>
        <textarea class="m-editor-area" rows={4} aria-label="Not" readonly={v.readonly} disabled={v.disabled}
          value={untrack(() => $text)} on:input={(e: Event) => { $text = (e.target as HTMLTextAreaElement).value }} />
      </EditorFrame>
    }}
    {() => (props.values.disabled ? null : <div class="sc-row"><Button size="sm" variant="secondary" data-audit-try on:click={focusNote}>Notu odakla (halkayı göster)</Button></div>)}
  </div>
}
