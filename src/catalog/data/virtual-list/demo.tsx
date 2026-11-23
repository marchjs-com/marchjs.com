// Showcase stage for VirtualList (items, label, estimate, gap, overscan from playground.ts): thousands of rows of mixed height in a fixed box; a live count shows how few are in
// the DOM while you scroll.
import { VirtualList } from "march/components/data/virtual-list";
import { onFrame } from "march/motion";
import { onCleanup } from "march";
import { ITEMS } from "./playground.ts";

export const code = `<VirtualList items={$rows} key={(r) => r.id} estimate={64}
  render={(r) => <Row row={r()} />}          // r is an accessor: an updated item updates its row
  onEndReached={loadMore} />                  // infinite scroll`

// the Playground's items (JSON): their titles repeat over the chosen row count
const titles = (json: string): string[] => { try { const x = JSON.parse(json || ITEMS); return Array.isArray(x) && x.length ? x.map((it: { title?: unknown }) => String(it?.title ?? it)) : ["—"] } catch { return ["—"] } }
const LONG = " Uzun açıklamalı satır: yükseklik içeriğe göre ölçülür, tahmin yalnız ölçülene kadar kullanılır."

export default function VirtualListDemo(props: { values: { items: string; label: string; estimate: number; count: number; heights: string; gap: number; overscan: number } }) {
  let $inDom = 0
  let box!: HTMLElement
  const stop = onFrame(() => { const n = box?.querySelectorAll("[role=listitem]").length ?? 0; if (n !== $inDom) $inDom = n }, { essential: true })
  onCleanup(stop)
  const rows = () => { const t = titles(props.values.items); return Array.from({ length: props.values.count }, (_, i) => ({ id: i, title: i < t.length ? t[i]! : `${t[i % t.length]} (${i + 1})`, long: props.values.heights === "mixed" && i % 3 === 1 })) }
  return <div class="sc-social-vlist-wrap">
    <p class="sc-strip-label" aria-live="off">{() => `${props.values.count.toLocaleString("tr-TR")} satır · DOM'da ${$inDom}`}</p>
    <div class="sc-social-vlist" ref={(x: Element) => { box = x as HTMLElement }}>
      {() => {
        // the gap, the overscan and the estimate are read once by the list: a new choice builds it again (as a new row set does)
        const gap = props.values.gap, overscan = props.values.overscan, estimate = props.values.estimate
        return <VirtualList items={rows()} key={(r) => r.id} estimate={estimate} gap={gap} overscan={overscan} label={() => props.values.label || "Buluşmalar"}
          render={(r) => <div class={() => `sc-social-vrow sc-social-vrow-c${(r().id % 4) + 1}`}><b>{() => r().title}</b>{() => (r().long ? <span>{LONG}</span> : null)}</div>} />
      }}
    </div>
  </div>
}
