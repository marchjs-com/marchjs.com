// Showcase stage for ChatComposer: what you send is listed above; the Playground turns parts on and off. A line under
// the composer says what the round button's colour and the motion choice are (both show only while it is used).
import { ChatComposer } from "march/composite";
import { image, fileText, mapPin, arrowUp, radio, heart } from "march/icons";
import type { ColorToken } from "march/theme";

export const code = `<ChatComposer onSend={send} onVoice={(ms) => sendVoice(ms)}
  attachments={[{ label: "Fotoğraf", icon: image, onSelect: pickPhoto }, { label: "Konum", icon: mapPin, onSelect: shareLocation }]}
  replyTo={$replyTo} onCancelReply={() => $replyTo = null} onTyping={() => channel.send("typing")} />`

const COLORS: Record<string, string> = { default: "mikrofon turuncu, gönder mavi", "brand-green": "yeşil", "brand-purple": "mor", primary: "tema vurgusu (uygulamanın vurgu rengini izler)" }

export default function ChatComposerDemo(props: { values: { voice: boolean; attach: boolean; emoji: boolean; reply: boolean; color: string; icons: boolean; motion: boolean } }) {
  let $log: string[] = []
  let $replyOff = false
  const add = (s: string) => { $log = [...$log.slice(-3), s] }
  return <div class="sc-social-composer">
    <ul class="sc-social-sent" aria-live="polite">{() => ($log.length ? $log.map((s) => <li>{s}</li>) : <li class="sc-strip-label">Bir şey yazıp Enter'a basın, ya da mikrofona dokunup kaydı gönderin.</li>)}</ul>
    {() => <ChatComposer emoji={props.values.emoji} motion={props.values.motion}
      sendColor={props.values.color === "default" ? undefined : props.values.color as ColorToken} micColor={props.values.color === "default" ? undefined : props.values.color as ColorToken}
      sendIcon={props.values.icons ? arrowUp : undefined} micIcon={props.values.icons ? radio : undefined} emojiIcon={props.values.icons ? heart : undefined}
      onSend={(text) => add(`Mesaj: ${text}`)}
      onVoice={props.values.voice ? (ms) => add(`Sesli mesaj: ${(ms / 1000).toFixed(1)} sn`) : undefined}
      attachments={props.values.attach ? [{ label: "Fotoğraf", icon: image, onSelect: () => add("Ek: fotoğraf") }, { label: "Dosya", icon: fileText, onSelect: () => add("Ek: dosya") }, { label: "Konum", icon: mapPin, onSelect: () => add("Ek: konum") }] : undefined}
      replyTo={() => (props.values.reply && !$replyOff ? { name: "Kitap Kulübü", text: "Bu hafta rota nerede olacak?" } : null)} onCancelReply={() => { $replyOff = true }} />}
    <p class="sc-strip-label">{() => `Yuvarlak düğme: ${COLORS[props.values.color] ?? props.values.color} · ${props.values.motion ? "hareket açık: düğme dönerek değişir, yanıt önizlemesi kayarak gelir" : "hareket kapalı: geçişler anında olur"}`}</p>
  </div>
}
