// Showcase stage for Timeline: the items (JSON), dot, line, and the card's colours, icons and time format follow the Playground values (playground.ts).
import { Timeline, type TimelineItem } from "march/data";
import { check, truck, creditCard } from "march/icons";
import { ITEMS } from "./playground.ts";

export const code = `<Timeline items={[
  { time: "Bugün 09:12", title: "Sipariş oluşturuldu", body: "#48210 · 3 ürün", tone: "info" },
  { time: new Date(), title: "Ödeme alındı", tone: "success", icon: check },   // Date / epoch / ISO are formatted
]} />
<Timeline items={…} line={false} dot={(item, i) => <b>{i + 1}</b>} formatTime={(v) => …} />  // or dot={false}`

const BASE = Date.UTC(2026, 10, 12, 9, 12)
const ICONS = [check, creditCard, truck]
const BRAND = ["brand-blue", "brand-green", "brand-orange"] as const
const MINUTES = [0, 2, 148]
const parse = (json: string): TimelineItem[] => { try { const x = JSON.parse(json); return Array.isArray(x) ? x : [] } catch { return [] } }

export default function TimelineDemo(props: { values: { items: string; brand: boolean; tones: boolean; icons: boolean; time: string; dot: string; line: boolean } }) {
  return <div class="sc-col">
    {() => {
      const v = props.values
      const items = parse(v.items || ITEMS).map((x, i) => ({
        ...x,
        time: v.time === "none" ? undefined : v.time === "date" || v.time === "own" ? new Date(BASE + (MINUTES[i] ?? i * 60) * 60_000) : x.time,
        tone: v.dot === "on" && v.tones && !v.brand ? x.tone : undefined,
        color: v.dot === "on" && v.brand ? BRAND[i % 3] : x.color,
        icon: v.icons ? ICONS[i % 3] : x.icon,
      }))
      return <Timeline line={v.line} dot={v.dot === "off" ? false : v.dot === "number" ? (_x: unknown, i: number) => <b>{String(i + 1)}</b> : true}
        formatTime={v.time === "own" ? (d: unknown) => `saat ${(d as Date).toISOString().slice(11, 16)}` : undefined} items={items} />
    }}
  </div>
}
