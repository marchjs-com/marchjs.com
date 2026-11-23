// Showcase stage for VideoBackground: a short hero over the showcase clip for the Playground values.
import { VideoBackground } from "march/components/landing/video-background";
import { appUrl } from "march/base";

export const code = `<VideoBackground src="/media/clip.webm" poster="/media/clip.jpg" tint="dark">
  <h1>…</h1>
</VideoBackground>`

export default function VideoBackgroundDemo(props: { values: { src: string; poster: string; text: string; tint: string; tintOpacity: number; controls: boolean } }) {
  return <div class="sc-site-frame">
    {() => {
      const v = { ...props.values }
      return <VideoBackground class="sc-vbg-demo" src={appUrl(v.src || "media/hadi-waves.webm")} poster={v.poster ? appUrl(v.poster) : undefined} tint={v.tint as "dark"} tintOpacity={v.tintOpacity} controls={v.controls}>
        <div class="sc-vbg-copy"><strong>{v.text}</strong><span>Görünmüyorken durur, veri tasarrufunda yalnız poster.</span></div>
      </VideoBackground>
    }}
  </div>
}
