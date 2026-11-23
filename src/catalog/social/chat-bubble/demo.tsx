// Showcase stage for ChatBubble: a short run of bubbles; chips toggle your reaction, drag a bubble sideways to reply.
import { ChatBubble, type Reaction, type MessageStatus } from "march/social";
import { minutesAgo } from "../demo-data.ts";
import type { ColorToken } from "march/theme";

export const code = `<ChatBubble mine text="Yarın 7'de sahilde!" time={m.at} status="read" position="last"
  reactions={[{ emoji: "❤️", count: 2, mine: true }]} onReact={toggle} onReply={() => $replyTo = m} />`

const OWN_TICK: Record<MessageStatus, string> = { sending: "gidiyor…", sent: "gitti", delivered: "ulaştı", read: "okundu", failed: "gitmedi" }

export default function ChatBubbleDemo(props: { values: { mine: boolean; status: string; reply: boolean; reactions: boolean; group: boolean; color: string; ticks: string; tools: boolean; text: string } }) {
  let $reacts: Reaction[] = [{ emoji: "❤️", count: 2, mine: true }, { emoji: "😂", count: 1 }]
  let $log = "Bir balonu yana sürükleyin: yanıt"
  const toggle = (e: string) => {
    const r = $reacts.find((x) => x.emoji === e)
    $reacts = r ? $reacts.map((x) => (x.emoji === e ? { ...x, mine: !x.mine, count: x.count + (x.mine ? -1 : 1) } : x)).filter((x) => x.count > 0) : [...$reacts, { emoji: e, count: 1, mine: true }]
  }
  return <div class="sc-social-bubbles">
    {() => {
      const mine = props.values.mine, v = props.values
      // the same choices on every bubble of the run: color, the delivery mark (ticks, own text, none), the hover buttons
      const own = {
        tools: v.tools,
        ticks: v.ticks === "off" ? false : v.ticks === "own" ? (s: MessageStatus) => <span>{OWN_TICK[s]}</span> : true,
      }
      return [
        <ChatBubble {...own} m:color={v.color as ColorToken} mine={mine} position="first" text="Pazar sabahı rotayı değiştirdik 🌲" time={minutesAgo(12)} status={v.status as MessageStatus} sender={v.group ? "HADİ Koşu Kulübü" : undefined} senderColor={0} onReply={() => { $log = "Yanıt: 1. mesaj" }} />,
        <ChatBubble {...own} m:color={v.color as ColorToken} mine={mine} position="middle" text="Orman yolu 8 km, tempo herkes için uygun." time={minutesAgo(11)} status={v.status as MessageStatus} onReply={() => { $log = "Yanıt: 2. mesaj" }} />,
        <ChatBubble {...own} m:color={v.color as ColorToken} mine={mine} position="last" text={v.text} time={minutesAgo(10)} status={v.status as MessageStatus}
          reply={v.reply ? { name: "Kitap Kulübü", text: "Bu hafta rota nerede olacak?" } : undefined}
          reactions={v.reactions ? () => $reacts : undefined} onReact={toggle} onRetry={() => { $log = "Yeniden gönderiliyor" }} onReply={() => { $log = "Yanıt: 3. mesaj" }} />,
        <ChatBubble mine={!mine} text="🏃‍♀️🔥" time={minutesAgo(9)} position="single" />,
      ]
    }}
    <p class="sc-strip-label" aria-live="polite">{() => $log}</p>
  </div>
}
