// Showcase stage for Media: address, kind, alt, poster, size, player options and the fallback text from the Playground
// values; the button opens it in a dialog.
import { Media, openMedia } from "march/media";
import { Button } from "march/actions";
import { appUrl } from "march/base";

export const code = `<Media src="media/dusk.jpg" alt="Gün batımında tepeler" size="md" />
<Media src={url} kind="auto" poster={thumb} />     // video / ses / resim uzantıdan
await openMedia("media/hadi-waves.webm", { title: "Önizleme" })`

export default function MediaDemo(props: { values: { src: string; kind: string; alt: string; poster: string; size: string; controls: boolean; loop: boolean; muted: boolean; fallback: string } }) {
  return <div class="sc-col">
    {() => {
      const v = { ...props.values }
      const url = appUrl(v.src || "media/dusk.jpg")
      const kind = v.kind as "image"
      const poster = v.poster ? appUrl(v.poster) : undefined
      return <div class="sc-col">
        <Media src={url} kind={kind} alt={v.alt} poster={poster} controls={v.controls} muted={v.muted} loop={v.loop} size={v.size === "full" ? undefined : (v.size as "md")} fallback={v.fallback || undefined} />
        <div class="sc-row"><Button size="sm" on:click={() => void openMedia(url, { title: "Önizleme", kind: v.kind as "auto", poster })}>Pencerede aç</Button></div>
      </div>
    }}
  </div>
}
