// Showcase stage for NotForYou: who HADİ is not for (and who it is for); mark the lines that apply.
import { NotForYou, type NotForYouItem } from "march/landing";

export const code = `<NotForYou check items={[{ text: "Hep aynı beş arkadaşla buluşuyorsun", detail: "…" }]}
  forYou={[{ text: "Yeni insanlarla tanışmak istiyorsun" }]} />
<NotForYou check items={…} mark={(state) => (state === "not" ? "🙅" : state === "marked" ? "🎉" : "👍")}
  meLabel={false} hint={false} markedHint={false} verdict={false} />   // own marks; every text can be changed or left out`

export const NOT_FOR_YOU: NotForYouItem[] = [
  { text: "Hep aynı beş arkadaşla buluşuyorsun", detail: "Yeni biri gelmesin istiyorsan bir mesaj grubu sana yeter.", instead: "Yeni yüzlere açıksın: HADİ'de her hafta yeni insanlarla tanışırsın." },
  { text: "Tek bir sade sohbet istiyorsun", detail: "HADİ akış, sohbet, etkinlik, tanışma: hepsi bir arada. Sana fazla gelebilir.", instead: "Hepsi bir arada olsun istiyorsun: sohbet, akış, etkinlik ve tanışma tek uygulamada." },
  { text: "Yeni insanlarla tanışmak istemiyorsun", detail: "HADİ'nin kapısı hep yeni insanlara açık.", instead: "Tanışmak istiyorsun: tanışma yemekleri ve etkinlikler seni bekliyor." },
  { text: "Telefonu az açmak istiyorsun", detail: "Akış, hikâyeler, etkinlik bildirimleri: HADİ'de hep bir şey oluyor.", instead: "Hareketli bir hayat seviyorsun: HADİ'de her gün yeni bir şey var." },
]
export const FOR_YOU: NotForYouItem[] = [
  { text: "Yeni insanlarla tanışmak istiyorsun", detail: "Tanışma yemekleri, ilgi alanına göre gruplar." },
  { text: "Etkinlik bulmak da kurmak da istiyorsun", detail: "Planlı etkinlikler, takvim, gerekirse bilet." },
  { text: "Sohbet, akış ve etkinlik tek yerde olsun", detail: "Ayrı ayrı uygulama yerine tek bir HADİ." },
]

const OWN_MARKS = { not: "🙅", marked: "🎉", for: "👍" }

export default function NotForYouDemo(props: { values: { sample: number; title: string; variant: string; check: boolean; both: boolean; mark: string; me: boolean; verdict: boolean } }) {
  return <div>
    {() => { const v = { ...props.values }; return <NotForYou title={v.title || undefined} variant={v.variant as "cards" | "list"} check={v.check} markedHint={v.me ? "Sen bir HADİ'lisin" : false}
      mark={v.mark === "off" ? false : v.mark === "own" ? (state) => OWN_MARKS[state] : true} meLabel={v.me ? undefined : false} hint={v.me ? undefined : false} verdict={v.verdict ? undefined : false}
      items={NOT_FOR_YOU.slice(0, v.sample ?? 4)} forYou={v.both ? FOR_YOU : undefined} /> }}
  </div>
}
