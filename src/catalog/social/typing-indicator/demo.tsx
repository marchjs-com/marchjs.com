// Showcase stage for TypingIndicator: who is typing comes from the Playground.
import { TypingIndicator } from "march/components/social/typing-indicator";
import type { ColorToken } from "march/theme";

export const code = `<TypingIndicator names={$typing} />                       // dots in a bubble, announced
<TypingIndicator names={["HADİ", "Beta"]} variant="inline" text />`

const PEOPLE = ["HADİ Koşu Kulübü", "Kitap Kulübü", "Fotoğraf Atölyesi", "Masa Oyunları Ekibi"]

export default function TypingIndicatorDemo(props: { values: { people: number; variant: string; text: boolean; motion: string; color: string; label: string } }) {
  return <div class="sc-row sc-social-typing">
    {() => <TypingIndicator names={() => PEOPLE.slice(0, props.values.people)} variant={() => props.values.variant as "bubble"} text={() => props.values.text}
      motion={() => props.values.motion as "lift"} m:color={props.values.color as ColorToken}
      label={props.values.label === "own" ? (n: readonly string[]) => `${n.length} kişi bir şeyler yazıyor ✍️` : undefined} />}
    {() => (props.values.people ? null : <span class="sc-strip-label">Kimse yazmıyor: gösterge gizli</span>)}
  </div>
}
