// Showcase stage for Feed: a phone-sized feed with simulated network delay. Pull down (or Tab to Refresh), scroll to
// the end for the next page, "Yeni gönderi gelsin" queues new posts behind the pill.
import { computed, effect, untrack } from "march";
import { later } from "../../demo-util.ts";
import { Feed } from "march/composite";
import type { Post } from "march/composite";
import { Button } from "march/actions";
import { PHOTOS, USERS, minutesAgo } from "../../social/demo-data.ts";
import type { ColorToken } from "march/theme";

export const code = `<Feed posts={$posts} loading={$first} hasMore={$more}
  onRefresh={() => api.get("/feed").then((p) => $posts = p)}
  onLoadMore={() => api.get("/feed", { after: last }).then((p) => $posts = [...$posts, ...p])}
  newCount={$waiting.length} onShowNew={() => { $posts = [...$waiting, ...$posts]; $waiting = [] }}
  onLike={(on, p) => update(p, { liked: on, likes: p.likes + (on ? 1 : -1) })} />`

const TEXTS = [
  "Bu hafta sonu sahil temizliği var, eldivenler bizden! 🌊",
  "Yeni rota denendi: orman yolu 8 km, herkes için uygun tempo.",
  "Atölyede bugün analog fotoğraf banyosu yaptık; sonuçlar harika çıktı.",
  "Kitap kulübünün ay seçimi oylamaya açıldı. Önerilerinizi yorumlara bırakın.",
  "Masa oyunları gecesi için ikinci salonu da açtık, yer kalmadı diye üzülmeyin.",
  "Akşam bisiklet turu yağmur nedeniyle yarına alındı.",
]
let seq = 0
const make = (n: number, ago = 0): Post[] => Array.from({ length: n }, (_, i) => {
  const k = seq++, u = USERS[k % (USERS.length - 1)]!
  return { id: `f${k}`, author: { name: u.name, handle: u.handle, verified: u.verified }, time: minutesAgo(ago + i * 37 + 3), text: TEXTS[k % TEXTS.length], media: PHOTOS.slice(k % 5, (k % 5) + [1, 2, 3, 0, 4, 1][k % 6]!), likes: 40 + ((k * 137) % 2400), comments: (k * 7) % 90, shares: (k * 3) % 20, liked: false, place: k % 3 ? undefined : "Sahil yolu" }
})
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export default function FeedDemo(props: { values: { variant: string; delay: number; pages: number; empty: boolean; end: string; newColor: string } }) {
  let $posts: Post[] = []
  let $first = true
  let $page = 1
  let $waiting: Post[] = []
  let phone!: HTMLElement
  let load = 0
  // the first page, after the network delay (skeleton posts meanwhile); a newer load wins
  const reload = (): void => {
    const mine = ++load
    $first = true
    void wait(props.values.delay).then(() => { if (mine === load) { seq = 0; $posts = make(6); $page = 1; $first = false } })
  }
  reload()
  // options whose effect shows only in a certain state bring that state: a new delay loads the first page again, a new
  // end mark goes to the end of the last page, a new pill color queues a post so the pill is there
  const onChange = (read: () => unknown, run: () => void): void => { const value = computed(read); let on = false; effect(() => { value(); if (on) untrack(run); on = true }) }
  const toEnd = (): void => { const sc = phone.querySelector(".m-feed-scroll"); if (sc) sc.scrollTop = sc.scrollHeight }
  onChange(() => props.values.delay, reload)
  onChange(() => props.values.end, () => { $page = props.values.pages; later(toEnd, 60); later(toEnd, 400) })
  onChange(() => props.values.newColor, () => { if (!$waiting.length) $waiting = make(1) })
  const update = (p: Post, patch: Partial<Post>) => { $posts = $posts.map((x) => (x.id === p.id ? { ...x, ...patch } : x)) }
  return <div class="sc-social-feed-wrap">
    <div class="sc-row">
      <Button size="sm" variant="ghost" onClick={() => { $waiting = [...make(1), ...$waiting] }}>Yeni gönderi gelsin</Button>
      <span class="sc-strip-label">{() => `${$posts.length} gönderi · sayfa ${Math.min($page, props.values.pages)}/${props.values.pages} · ağ gecikmesi ${(props.values.delay / 1000).toLocaleString("tr-TR")} sn`}</span>
    </div>
    <div class="sc-social-phone" ref={(x: Element) => { phone = x as HTMLElement }}>
      <Feed end={props.values.end === "off" ? false : props.values.end === "own" ? <b>Bugünlük bu kadar 🎉 Yarın yeni etkinlikler var.</b> : true} newColor={props.values.newColor as ColorToken}
        posts={() => (props.values.empty ? [] : $posts)} loading={() => $first} hasMore={() => $page < props.values.pages} variant={() => props.values.variant as "card"}
        newCount={() => $waiting.length} onShowNew={() => { $posts = [...$waiting, ...$posts]; $waiting = [] }}
        onRefresh={() => wait(props.values.delay).then(() => { seq = 0; $posts = make(6); $page = 1 })}
        onLoadMore={() => wait(props.values.delay).then(() => { $posts = [...$posts, ...make(6, $posts.length * 40)]; $page = $page + 1 })}
        onLike={(on, p) => update(p, { liked: on, likes: p.likes + (on ? 1 : -1) })} />
    </div>
  </div>
}
