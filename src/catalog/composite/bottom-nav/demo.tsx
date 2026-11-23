// Showcase stage for BottomNav: a phone-width frame with the bar at the bottom, for the Playground values (playground.ts).
import { effect } from "march";
import { BottomNav, type BottomNavItem } from "march/composite";
import { OverlayScope } from "march/layout";
import { home, compass, message, bell, user, calendar, image, film, radio, barChart } from "march/icons";

export const code = `<BottomNav value={$tab} onChange={(id) => $tab = id} onCreate={compose}   // long press: compose at once
  createMenu="fan" createActions={[
    { id: "post", label: "Gönderi", icon: image, run: newPost },
    { id: "story", label: "Hikâye", icon: film, run: newStory },
    { id: "live", label: "Canlı yayın", icon: radio, desc: "Takipçilerine bildirim gider" },
  ]} items={[
  { id: "home", label: "Akış", icon: home },
  { id: "explore", label: "Keşfet", icon: compass },
  { id: "chat", label: "Sohbet", icon: message, badge: () => $unread },
  { id: "me", label: "Profil", icon: user, dot: () => $hasNews },
]} />`

const ACTIONS = [
  { id: "post", label: "Gönderi", icon: image, desc: "Fotoğraf, video ya da yazı paylaş" },
  { id: "story", label: "Hikâye", icon: film, desc: "24 saat görünür" },
  { id: "live", label: "Canlı yayın", icon: radio, desc: "Takipçilerine bildirim gider", badge: "yeni" },
  { id: "event", label: "Etkinlik", icon: calendar, desc: "Tarih, yer ve katılımcılar" },
  { id: "poll", label: "Anket", icon: barChart, desc: "Seçenekler ve süre" },
]

const ALL = [
  { id: "home", label: "Akış", icon: home },
  { id: "explore", label: "Keşfet", icon: compass },
  { id: "chat", label: "Sohbet", icon: message },
  { id: "events", label: "Etkinlikler", icon: calendar },
  { id: "alerts", label: "Bildirimler", icon: bell },
  { id: "me", label: "Profil", icon: user },
]

export default function BottomNavDemo(props: { values: { value: string; count: number; create: boolean; menu: string; labels: boolean; variant: string; tint: string; badges: boolean; bubble: boolean; ring: string; motion: boolean } }) {
  let $tab = "home"
  let $unread = 3
  let $created = 0
  let $last = ""
  // the Playground's active tab (value) picks the tab; a tap on the bar still moves it
  effect(() => { $tab = props.values.value })
  const label = (id: string) => ALL.find((x) => x.id === id)?.label ?? id
  // the frame is an OverlayScope: the Create menu (and its dimmed backdrop) opens inside the phone-sized frame
  return <OverlayScope class="sc-bnav-frame">
    <div class="sc-bnav-page" aria-live="polite">{() => `${label($tab)}${$last ? ` · ${$last} seçildi` : $created ? ` · ${$created} kez oluşturuldu` : ""}`}</div>
    {() => {
      const v = props.values
      const pick = ALL.slice(0, Number(v.count) - 1).concat(ALL.slice(-1))
      const items: BottomNavItem[] = pick.map((it) => ({
        ...it,
        badge: v.badges && it.id === "chat" ? () => $unread : undefined,
        dot: v.badges && it.id === "me" ? true : undefined,
      }))
      return <BottomNav items={items} value={() => $tab} onChange={(id) => { $tab = id; if (id === "chat") $unread = 0 }}
        onCreate={v.create ? () => { $created = $created + 1; $unread = $unread + 1; $last = "" } : undefined}
        createActions={v.create && v.menu !== "none" ? ACTIONS : undefined} createMenu={v.menu as "fan"} createTitle="Oluştur"
        onAction={(id) => { $last = ACTIONS.find((a) => a.id === id)?.label ?? id }}
        labels={v.labels} variant={v.variant as "floating"} tint={v.tint as "brand"}
        bubble={v.bubble} motion={v.motion} ring={v.ring === "off" ? false : v.ring === "accent" ? ["primary", "neutral"] : undefined} />
    }}
  </OverlayScope>
}
