// Showcase stage for ReplyQuote: the quote above a message field (with its cancel button) or inside a coloured
// bubble, drawn for the Playground values (playground.ts).
import { ReplyQuote, ChatBubble } from "march/social";
import { Button } from "march/actions";
import type { ColorToken } from "march/theme";
import { trash } from "march/icons";

export const code = `<ReplyQuote name="Deniz Kaya" text={m.text} />                                  // in a bubble
<ReplyQuote variant="inverse" name="Deniz Kaya" text={m.text} onClick={() => jumpTo(m)} />   // in my coloured bubble
<ReplyQuote name="Deniz Kaya'ya yanıt" text={m.text} lines={1} onClose={() => $replyTo = null} closeLabel="Vazgeç" />`

const TEXT = "Cumartesi sabahı sahil koşusu için buluşma yerini değiştirdik: iskelenin yanındaki çay bahçesinin önü. Yeni katılanlar için tempo yavaş tutulacak, su ve atıştırmalık getirmeyi unutmayın."

export default function ReplyQuoteDemo(props: { values: { name: string; text: string; place: string; lines: number; color: string; bar: boolean; close: string; click: boolean } }) {
  let $shown = true
  let $log = ""
  // a narrow column, as a message field is: the text takes more lines than the limit, so the line count shows
  return <div class="sc-col sc-clamp-box">
    {() => {
      const v = { ...props.values }
      const bubble = v.place === "bubble"
      const color = (v.color || undefined) as ColorToken | undefined
      const jump = v.click ? () => { $log = "Alıntılanan mesaja gidildi" } : undefined
      const quote = () => <ReplyQuote name={bubble ? v.name : `${v.name}'ya yanıt`} text={v.text || TEXT} lines={v.lines} bar={v.bar} m:color={bubble ? undefined : color}
        variant={bubble ? "inverse" : "soft"} onClick={jump}
        onClose={bubble || v.close === "off" ? undefined : () => { $shown = false; $log = "Yanıttan vazgeçildi" }} close={v.close === "own" ? trash : undefined} closeLabel="Yanıttan vazgeç" />
      return bubble
        ? <ChatBubble mine text="Tamam, 7'de oradayım." position="single">{quote()}</ChatBubble>
        : <>{() => ($shown ? quote() : <Button size="sm" on:click={() => { $shown = true; $log = "" }}>Yanıtı yeniden göster</Button>)}</>
    }}
    <p class="m-muted" aria-live="polite">{() => $log}</p>
  </div>
}
