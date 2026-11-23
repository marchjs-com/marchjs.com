// Showcase stage for PullToRefresh: a short feed in a fixed-height scroll area (playground.ts sets the text above it, threshold, indicator, icon, colour, settle, keyboard button, delay).
import { PullToRefresh, type PullPhase } from "march/feedback";
import { Button } from "march/actions";
import { Icon, sparkles, arrowDown, arrowUp, hourglass, refresh, rotateCw } from "march/icons";

// the Playground's icon names → their glyphs
const ICONS = { refresh, sparkles, hourglass, rotateCw } as Record<string, typeof refresh>;

export const code = `<PullToRefresh onRefresh={() => api.get("/feed").then((x) => $items = x)} threshold={72}>
  <For each={$items}>{(it) => <FeedRow item={it} />}</For>
</PullToRefresh>
<PullToRefresh onRefresh={load} icon={sparkles} m:color="brand-orange" labels={{ refresh: "Yeni etkinlikleri getir" }} settle={false}>…</PullToRefresh>
<PullToRefresh onRefresh={load} indicator={(phase) => <Icon of={phase === "ready" ? arrowUp : arrowDown} />}>…</PullToRefresh>`

const NAMES = ["Kadıköy koşu grubu", "Moda sahili buluşması", "Akşam yemeği", "Kitap kulübü", "Bisiklet turu", "Fotoğraf yürüyüşü", "Masa oyunları", "Kahve sohbeti"]

export default function PullToRefreshDemo(props: { values: { children: string; threshold: number; delay: number; indicator: string; icon: string; color: string; settle: boolean; refreshButton: boolean; disabled: boolean } }) {
  let $round = 0
  let $phase = "idle"
  const PHASES: Record<string, string> = { idle: "Hazır", pull: "Çekiliyor", ready: "Bırakınca yenilenir", refreshing: "Yenileniyor…" }
  const items = () => Array.from({ length: 14 }, (_, i) => `${NAMES[(i + $round) % NAMES.length]} · ${$round ? `${$round}. yenileme` : "ilk liste"}`)
  let wrap: HTMLElement | undefined
  // a refresh without pulling (the component's own keyboard button): the indicator, its icon and color show while it spins
  const refreshNow = (): void => { wrap?.querySelector<HTMLButtonElement>(".m-ptr-kbd")?.click() }
  return <div class="sc-ptr-wrap" ref={(x: Element) => { wrap = x as HTMLElement }}>
    <span class="sc-strip-label" aria-live="polite">{() => `Durum: ${props.values.disabled ? "kapalı, çekmek yenilemez" : PHASES[$phase]} · eşik ${props.values.threshold}px · yenileme ${props.values.delay} ms · ${props.values.settle ? "bırakınca yaylanarak döner" : "bırakınca anında döner"}`}</span>
    <div class="sc-row"><Button size="sm" data-audit-try disabled={() => props.values.disabled || $phase === "refreshing"} on:click={refreshNow}>Çekmeden yenile</Button></div>
    {() => {
      // threshold, indicator, icon, color and settle are read once by the component: it is drawn again when one changes
      const threshold = props.values.threshold, indicator = props.values.indicator, color = props.values.color, settle = props.values.settle, icon = props.values.icon, button = props.values.refreshButton
      $phase = "idle"
      return <PullToRefresh threshold={threshold} disabled={() => props.values.disabled} onPhase={(p) => { $phase = p }}
        indicator={indicator === "off" ? false : indicator === "own" ? (p: PullPhase) => <Icon of={p === "refreshing" ? hourglass : p === "ready" ? arrowUp : arrowDown} /> : true}
        icon={ICONS[icon] ?? refresh} m:color={color ? (color as "success") : undefined} refreshButton={button}
        settle={settle ? undefined : false} labels={{ refresh: "Listeyi yenile" }}
        onRefresh={() => new Promise((r) => setTimeout(r, props.values.delay)).then(() => { $round = $round + 1 })}
        class="sc-ptr-demo">
        <p class="m-muted">{() => props.values.children}</p>
        <ul class="sc-ptr-list">{() => items().map((x) => <li>{x}</li>)}</ul>
      </PullToRefresh>
    }}
  </div>
}
