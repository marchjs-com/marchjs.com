// Showcase stage for ChatThread: a working chat in a phone frame. Send a message; the others start typing and answer.
// React from a bubble's smile button, reply by dragging a bubble or its reply button. A new answer speed or motion
// choice sends a sample message, so the choice is seen at once (how the message comes in, when the answer arrives).
import { computed, effect, untrack } from "march";
import { ChatThread, type ChatMessage, ChatComposer } from "march/composite";
import type { Reaction } from "march/social";
import { minutesAgo, PHOTO } from "../../social/demo-data.ts";

export const code = `<ChatThread messages={$messages} typing={$typing} group
  onReact={(m, e) => toggleReaction(m, e)} onReply={(m) => $replyTo = m} />
<ChatComposer onSend={send} replyTo={$replyTo} onCancelReply={() => $replyTo = null} />`

const day = (d: number, h: number, m: number) => { const x = new Date(); x.setDate(x.getDate() - d); x.setHours(h, m, 0, 0); return x }
const START: ChatMessage[] = [
  { id: "m1", senderId: "a", senderName: "HADİ Koşu Kulübü", text: "Herkese günaydın! Pazar rotası belli oldu.", time: day(1, 9, 2) },
  { id: "m2", senderId: "a", senderName: "HADİ Koşu Kulübü", text: "Orman yolu, 8 km 🌲", time: day(1, 9, 3), image: { src: PHOTO("forest"), alt: "Orman yolu" } },
  { id: "m3", mine: true, text: "Süper, ben varım!", time: day(1, 9, 20), status: "read", reactions: [{ emoji: "❤️", count: 2 }] },
  { id: "m4", senderId: "b", senderName: "Kitap Kulübü", text: "Biz de dönüşte kahveye geçeriz ☕", time: day(0, 8, 41) },
  { id: "m5", senderId: "b", senderName: "Kitap Kulübü", text: "Kimler geliyor?", time: day(0, 8, 42) },
  { id: "m6", mine: true, text: "👋", time: minutesAgo(3), status: "delivered" },
]
const ANSWERS = [["a", "HADİ Koşu Kulübü", "Harika, listeye ekledim ✅"], ["b", "Kitap Kulübü", "Ben de geliyorum!"], ["a", "HADİ Koşu Kulübü", "Su ve rahat ayakkabı unutmayın 👟"]] as const

export default function ChatThreadDemo(props: { values: { first: string; group: boolean; replyDelay: number; days: string; motion: boolean } }) {
  let $messages: ChatMessage[] = START
  // the Playground's "İlk mesaj" is the first message's text
  effect(() => { const text = props.values.first; untrack(() => { $messages = $messages.map((m) => (m.id === "m1" ? { ...m, text } : m)) }) })
  let $typing: string[] = []
  let $reply: ChatMessage | null = null
  let n = 0
  const patch = (id: string, p: Partial<ChatMessage>) => { $messages = $messages.map((m) => (m.id === id ? { ...m, ...p } : m)) }
  const react = (m: ChatMessage, e: string) => {
    const rs = [...(m.reactions ?? [])], mineNow = rs.find((r) => r.mine)
    let next: Reaction[] = rs.map((r) => (r.mine ? { ...r, mine: false, count: r.count - 1 } : r)).filter((r) => r.count > 0)
    if (mineNow?.emoji !== e) { const same = next.find((r) => r.emoji === e); next = same ? next.map((r) => (r.emoji === e ? { ...r, mine: true, count: r.count + 1 } : r)) : [...next, { emoji: e, count: 1, mine: true }] }
    patch(m.id, { reactions: next })
  }
  const send = (text: string, voice?: number) => {
    const id = `s${++n}`
    const reply = $reply ? { name: $reply.mine ? "Siz" : $reply.senderName ?? "", text: $reply.text ?? "Fotoğraf" } : undefined
    $messages = [...$messages, { id, mine: true, text: voice ? `🎤 Sesli mesaj · ${Math.round(voice / 1000)} sn` : text, time: new Date(), status: "sending", reply }]
    $reply = null
    setTimeout(() => patch(id, { status: "sent" }), 500)
    setTimeout(() => patch(id, { status: "delivered" }), 1000)
    if (!props.values.replyDelay) return
    const [sid, name, answer] = ANSWERS[n % ANSWERS.length]!
    setTimeout(() => { patch(id, { status: "read" }); $typing = [name] }, 1300)
    setTimeout(() => { $typing = []; $messages = [...$messages, { id: `r${n}`, senderId: sid, senderName: name, text: answer, time: new Date() }] }, 1300 + props.values.replyDelay)
  }
  const sample = computed(() => `${props.values.replyDelay} ${props.values.motion}`), daysOf = computed(() => props.values.days)
  let shown = false
  effect(() => {
    sample()
    const delay = untrack(() => props.values.replyDelay), motion = untrack(() => props.values.motion)
    if (shown) untrack(() => send(`Deneme mesajı: ${delay ? `yanıt ${delay < 1000 ? "hızlı" : "orta hızda"} gelir` : "yanıt gelmez"}, giriş hareketi ${motion ? "açık" : "kapalı"}`))
    shown = true
  })
  return <div class="sc-social-phone sc-social-chat">
    {() => {
      // `days` is read once by the thread: a new choice builds the thread again (the messages live here)
      const d = daysOf()
      return <ChatThread messages={() => $messages} typing={() => $typing} group={() => props.values.group} label="Pazar Koşusu grubu"
        days={d === "off" ? false : d === "own" ? (date: Date) => date.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" }) : true}
        motion={() => props.values.motion}
        onReact={react} onReply={(m) => { $reply = m }} onRetry={(m) => patch(m.id, { status: "sent" })} />
    }}
    <ChatComposer onSend={(t) => send(t)} onVoice={(ms) => send("", ms)} replyTo={() => ($reply ? { name: $reply.mine ? "Siz" : $reply.senderName ?? "", text: $reply.text ?? "Fotoğraf" } : null)}
      onCancelReply={() => { $reply = null }} placeholder="Mesaj yazın" />
  </div>
}
