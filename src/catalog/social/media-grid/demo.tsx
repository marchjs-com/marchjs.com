// Showcase stage for MediaGrid: the Playground picks how many photos and the layout; taps are logged below.
import { MediaGrid } from "march/social";
import { PHOTOS } from "../demo-data.ts";

export const code = `<MediaGrid items={post.media} onOpen={(i, el) => openLightbox(post.media, i, el)}
  onDoubleTap={() => like(post)} />`

export default function MediaGridDemo(props: { values: { count: number; shape: string; gap: string; max: number; more: string } }) {
  let $log = "Bir fotoğrafa dokunun (açar) ya da çift dokunun (beğenir)."
  return <div class="sc-social-mgrid">
    {() => {
      const more = props.values.more
      return <MediaGrid items={() => PHOTOS.slice(0, props.values.count)} shape={() => props.values.shape as "auto"} gap={() => props.values.gap as "thin"} max={() => props.values.max}
        more={more === "off" ? false : more === "own" ? (rest: number) => `${rest} fotoğraf daha` : true}
        onOpen={(i) => { $log = `Açıldı: ${i + 1}. fotoğraf` }} onDoubleTap={(i) => { $log = `Çift dokunuş: ${i + 1}. fotoğraf beğenildi` }} />
    }}
    <p class="sc-strip-label" aria-live="polite">{() => $log}</p>
  </div>
}
