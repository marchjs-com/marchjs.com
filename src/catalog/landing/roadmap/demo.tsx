// Showcase stage for Roadmap.
import { Roadmap, type RoadmapItem } from "march/components/landing/roadmap";

export const code = `<Roadmap items={[
  { time: "Bahar", title: "Tanışma yemekleri", body: "…", status: "done" },
  { time: "Yaz", title: "Bilet satışı", body: "…", status: "now" },
  { time: "Sonbahar", title: "Yeni şehirler", body: "…", status: "next" },
]} />`

export const ROADMAP: RoadmapItem[] = [
  { time: "1. adım", title: "Etkinlik keşfi", body: "Yakınındaki etkinlikler, haritada ve takvimde.", status: "done" },
  { time: "2. adım", title: "Sohbet ve görüntülü görüşme", body: "Birebir, grup ve etkinlik sohbetleri.", status: "done" },
  { time: "3. adım", title: "Akış ve hikâyeler", body: "Anıları paylaş, beğen, keşfet.", status: "done" },
  { time: "Şimdi", title: "Tanışma yemekleri", body: "Ortak ilgi alanı olanlarla aynı masada.", status: "now" },
  { time: "Sırada", title: "Yeni şehirler", body: "Etkinlikler her ilde, her hafta.", status: "next" },
]

export default function RoadmapDemo(props: { values: { sample: number; badges: boolean; scroll: boolean; rail: boolean; color: string; labels: boolean } }) {
  return <div class="sc-rm-demo">
    {() => {
      const v = { ...props.values }
      return <Roadmap items={[...ROADMAP, { time: "Sonra", title: "Topluluk ödülleri", body: "En canlı topluluklar öne çıkar.", status: "next" as const }].slice(0, v.sample)} badges={v.badges} scroll={v.scroll} rail={v.rail} m:color={v.color === "default" ? undefined : v.color as "brand-purple"}
        labels={v.labels ? { done: "Yayında", now: "Yapılıyor", next: "Sırada" } : undefined} />
    }}
  </div>
}
