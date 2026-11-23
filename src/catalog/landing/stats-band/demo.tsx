// Showcase stage for StatsBand.
import { StatsBand, type StatItem } from "march/components/landing/stats-band";

export const code = `<StatsBand items={[
  { value: 250000, label: "kişi", format: { notation: "compact" }, suffix: "+" },
  { value: 1200, label: "etkinlik her hafta" },
]} />`

export const STATS: StatItem[] = [
  { value: 250000, label: "kişi HADİ'de", format: { notation: "compact" }, suffix: "+" },
  { value: 1200, label: "etkinlik her hafta" },
  { value: 4.8, decimals: 1, label: "uygulama puanı", note: "5 üzerinden" },
  { value: 81, label: "ilde etkinlik" },
]

export default function StatsBandDemo(props: { values: { sample: number; variant: string; mode: string; color: string; reveal: string } }) {
  return <div>
    {() => {
      const v = { ...props.values }
      return <StatsBand variant={v.variant as "plain"} mode={v.mode as "count"} items={STATS.slice(0, v.sample)} m:color={v.color === "default" ? undefined : v.color as "brand-orange"}
        reveal={v.reveal === "off" ? false : { effect: v.reveal as "up" }} />
    }}
  </div>
}
