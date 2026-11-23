// Showcase stage for Picture: the same slot fed with a picture object (JSON) or with a ready node; fit, loading and
// the fallback follow the Playground. The line under the box shows the attributes the image got.
import { Picture, type PictureSource } from "march/components/media/picture";
import { appUrl } from "march/base";
import { Icon, image } from "march/icons";
import { SOURCE } from "./playground.ts";

const parse = (json: string): Partial<PictureSource> => { try { const x = JSON.parse(json); return x && typeof x === "object" ? x : {} } catch { return {} } }

export const code = `const cover = { src: "/media/dusk.jpg", alt: "Gün batımında tepeler", width: 1200, height: 800 }
<Picture source={cover} fit="cover" />                 // lazy, decoded off the main thread
<Picture source={cover} loading="eager" />             // first screen: high priority
<Picture source={<MyChart />} />                       // a node passes through as it is
<Picture src={url} alt="" fallback="Resim yüklenemedi" />`

export default function PictureDemo(props: { values: { source: string; kind: string; fit: string; loading: string; broken: boolean } }) {
  return <div class="sc-col">
    {() => {
      const v = { ...props.values }
      const own = parse(v.source || SOURCE)
      const cover: PictureSource = { ...own, src: appUrl(v.broken ? "media/missing.jpg" : own.src || "media/dusk.jpg") }
      const node = <div class="sc-pic-own"><Icon of={image} /><span>Kendi düğümüm</span></div> as Node
      const fit = v.fit === "natural" ? undefined : v.fit as "cover"
      const eager = v.loading === "eager"
      const how = v.kind === "node" ? "düğüm olduğu gibi çizildi" : `loading: ${eager ? "yok, fetchpriority: high" : "lazy"} · decoding: async · ${cover.width ?? "?"}×${cover.height ?? "?"}`
      return <>
        <div class="sc-pic-box">
          <Picture source={v.kind === "node" ? node : cover} fit={fit} loading={eager ? "eager" : "lazy"} fallback="Resim yüklenemedi" />
        </div>
        <p class="sc-demo-call">{how}</p>
      </>
    }}
  </div>
}
