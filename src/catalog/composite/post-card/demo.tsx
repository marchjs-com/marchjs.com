// Showcase stage for PostCard: one post driven by the Playground options; like / comment / share are optimistic.
// "Fotoğrafa çift dokun" does the double tap for keyboard users (and shows what the double-tap option changes).
import { computed, effect, untrack } from "march";
import { PostCard, type Post } from "march/composite";
import { Button } from "march/actions";
import { PHOTOS, user, minutesAgo } from "../../social/demo-data.ts";
import { flag, link, eyeOff, zap, star, settings } from "march/icons";
import type { ColorToken } from "march/theme";

export const code = `<PostCard post={post}
  onLike={(on) => update({ liked: on, likes: post.likes + (on ? 1 : -1) })}
  onComment={() => openComments(post)}
  onOpenMedia={(i, el) => openLightbox(post.media, i, el)}
  menu={[{ label: "Bağlantıyı kopyala", icon: link, onSelect: copy }, { label: "Bildir", icon: flag, danger: true, onSelect: report }]} />`

const TEXT = "Pazar sabahı sahil koşusu tamamlandı! 🧡 Yeni katılan herkese hoş geldiniz; tempo grubu 6:30'da, yürüyüş grubu 7:00'de buluşuyor. Gelecek hafta rota orman yoluna taşınıyor, ayrıntılar etkinlik sayfasında."

export default function PostCardDemo(props: { values: { photos: number; variant: string; clamp: number; menu: boolean; doubleTapLike: boolean; place: boolean; avatar: boolean; time: string; icons: boolean; likeColor: string } }) {
  let $post: Post = { id: "p1", author: { ...user("u1") }, time: minutesAgo(18), place: "Sahil yolu", text: TEXT, media: PHOTOS.slice(0, 3), likes: 1284, liked: false, comments: 46, shares: 12 }
  let $log = ""
  let wrap!: HTMLElement
  const post = (): Post => ({ ...$post, media: PHOTOS.slice(0, props.values.photos), place: props.values.place ? "Sahil yolu" : undefined })
  // the heart color shows only while the post is liked: a new color likes it, so the choice is seen at once
  const colorOf = computed(() => props.values.likeColor), iconsOf = computed(() => props.values.icons), menuOf = computed(() => props.values.menu)
  let colored = false
  effect(() => {
    colorOf()
    if (colored) untrack(() => { if (!$post.liked) $post = { ...$post, liked: true, likes: $post.likes + 1 } })
    colored = true
  })
  // two quick taps on the first photo (what a double tap is to the card)
  const doubleTap = (): void => { const tile = wrap.querySelector(".m-mgrid-tile"); for (let i = 0; i < 2; i++) tile?.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 })) }
  return <div class="sc-social-post" ref={(x: Element) => { wrap = x as HTMLElement }}>
    {() => {
      // own icons, the ⋯ menu and the heart color are read once by the card: a new choice of these builds it again (the post lives here)
      const icons = iconsOf(), menu = menuOf(), likeColor = colorOf() as ColorToken
      return <PostCard post={post} variant={props.values.variant as "card"} clamp={props.values.clamp} doubleTapLike={props.values.doubleTapLike}
        avatar={props.values.avatar} likeColor={likeColor}
        time={props.values.time === "off" ? false : props.values.time === "own" ? (t) => new Date(t).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : true}
        commentIcon={icons ? zap : undefined} shareIcon={icons ? star : undefined} menuIcon={icons ? settings : undefined}
        onLike={(on) => { $post = { ...$post, liked: on, likes: $post.likes + (on ? 1 : -1) }; $log = on ? "Beğenildi" : "Beğeni geri alındı" }}
        onComment={() => { $log = "Yorumlar açılır" }} onShare={() => { $post = { ...$post, shares: ($post.shares ?? 0) + 1 }; $log = "Paylaşıldı" }}
        onOpenMedia={(i) => { $log = `${i + 1}. fotoğraf açılır` }} onAuthor={() => { $log = "Profil açılır" }}
        menu={menu ? [{ label: "Bağlantıyı kopyala", icon: link, onSelect: () => { $log = "Bağlantı kopyalandı" } }, { label: "Gizle", icon: eyeOff, onSelect: () => { $log = "Gönderi gizlendi" } }, "-", { label: "Bildir", icon: flag, danger: true, onSelect: () => { $log = "Bildirildi" } }] : undefined} />
    }}
    {() => (props.values.photos > 0 ? <div class="sc-row"><Button size="sm" variant="ghost" data-audit-try onClick={doubleTap}>Fotoğrafa çift dokun</Button>
      <span class="sc-strip-label">{() => (props.values.doubleTapLike ? "çift dokunuş beğenir" : "her dokunuş fotoğrafı açar")}</span></div> : null)}
    <p class="sc-strip-label" aria-live="polite">{() => $log}</p>
  </div>
}
