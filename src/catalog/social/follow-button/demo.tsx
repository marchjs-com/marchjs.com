// Showcase stage for FollowButton: press it to follow (or send a request to a private account), press again to undo.
// Texts, icon, color, burst and the morph follow the Playground.
import { computed, effect, untrack } from "march";
import { FollowButton, type FollowState } from "march/social";
import type { ColorToken } from "march/theme";
import { Icon, star, sparkles } from "march/icons";

export const code = `<FollowButton state={$state} name={user.name} private={user.private}
  onChange={(s) => { $state = s; api.follow(user.id, s) }} />
<FollowButton state={$state} onChange={set} labels={{ follow: "Katıl", following: "Üyesin" }}
  m:color="brand-green" icon={(s) => <Icon of={s === "follow" ? sparkles : star} />} burst={false} />`

type Values = { state: string; private: boolean; size: string; block: boolean; labels: string; icon: string; color: string; burst: boolean; morph: boolean }

export default function FollowButtonDemo(props: { values: Values }) {
  let $state = props.values.state as FollowState
  let button: HTMLElement | null = null
  // the burst and the morph show only while the state changes: a new choice plays one follow, so it is seen at once
  const motion = computed(() => `${props.values.burst} ${props.values.morph}`), iconOf = computed(() => props.values.icon)
  let played = false
  effect(() => {
    motion()
    if (played) untrack(() => { $state = "follow"; queueMicrotask(() => button?.click()) })
    played = true
  })
  return <div class="sc-social-follow">
    {() => {
      // the icon is read once by the button: a new icon choice builds it again (the other props stay live)
      const v = props.values, icon = iconOf()
      button = (<FollowButton state={() => $state} name="HADİ Koşu Kulübü" private={v.private} size={v.size as "md"} block={v.block}
        labels={v.labels === "own" ? { follow: "Katıl", following: "Üyesin", requested: "Onay bekliyor" } : undefined}
        icon={icon === "off" ? false : icon === "own" ? (s: FollowState) => <Icon of={s === "follow" ? sparkles : star} /> : true}
        m:color={v.color as ColorToken} burst={v.burst} morph={v.morph} onChange={(s) => { $state = s }} />) as HTMLElement
      button.setAttribute("data-audit-try", "toggle")
      return button
    }}
    <p class="sc-strip-label" aria-live="polite">{() => ({ follow: "Takip etmiyorsunuz", following: "Takip ediyorsunuz", requested: "İstek bekliyor" })[$state]}</p>
    <p class="sc-strip-label">{() => `Basınca: ${props.values.private ? "istek gönderilir (gizli hesap)" : `takip edilir, ${props.values.burst ? "noktalar patlar" : "patlama yok"}`} · ${props.values.morph ? "genişlik ve ikon yaylanarak değişir" : "geçiş anında olur"}`}</p>
  </div>
}
