// Neutral demo content shared by the landing demos and the showcase sample pages: a product UI mock (pure markup, no
// image request), wordmark logos, and sample data. Not exported from march/landing.

/** A product screen drawn with markup: sidebar, KPI tiles, an area chart and a list. Sized by its container. */
export function MockApp(props: { class?: string }) {
  const bars = [38, 52, 44, 61, 58, 72, 66, 81, 77, 92, 86, 98]
  return <div class={`sc-mock ${props.class ?? ""}`} aria-hidden="true">
    <div class="sc-mock-side">
      <i class="sc-mock-logo" />
      {[1, 2, 3, 4, 5].map((n) => <i class={n === 2 ? "sc-mock-nav is-on" : "sc-mock-nav"} />)}
    </div>
    <div class="sc-mock-main">
      <div class="sc-mock-top"><i class="sc-mock-search" /><i class="sc-mock-avatar" /></div>
      <div class="sc-mock-kpis">
        {["c1", "c2", "c3"].map((c) => <div class="sc-mock-kpi"><i class="sc-mock-line" /><b class={`sc-mock-num ${c}`} /><i class="sc-mock-spark" /></div>)}
      </div>
      <div class="sc-mock-chart">{bars.map((b) => <i style={{ "--h": `${b}%` }} />)}</div>
      <div class="sc-mock-rows">{[0, 1, 2].map(() => <div class="sc-mock-row"><i class="sc-mock-dot" /><i class="sc-mock-line" /><i class="sc-mock-pill" /></div>)}</div>
    </div>
  </div>
}

const MARKS: Record<string, string> = {
  "HADİ": "M4 20 L12 4 L20 20 Z",
  Northwind: "M4 12 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 M12 4 v16",
  Lumen: "M12 3 v4 M12 17 v4 M3 12 h4 M17 12 h4 M12 8 a4 4 0 1 0 0.01 0",
  Orbit: "M3 12 a9 4 0 1 0 18 0 a9 4 0 1 0 -18 0 M12 9 a3 3 0 1 0 0.01 0",
  Kite: "M12 2 L20 12 L12 22 L4 12 Z",
  Pinecrest: "M12 3 L19 14 H5 Z M12 9 L20 21 H4 Z",
  Quanta: "M5 5 h14 v14 h-14 Z M9 9 h6 v6 h-6 Z",
  Helix: "M6 3 C 18 8 6 16 18 21 M18 3 C 6 8 18 16 6 21",
}
/** Neutral wordmark logo (SVG mark + name). */
export function Wordmark(props: { name: string }) {
  return <span class="sc-wordmark" role="img" aria-label={props.name}>
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d={MARKS[props.name] ?? MARKS["HADİ"]} /></svg>
    <span aria-hidden="true">{props.name}</span>
  </span>
}
export const LOGO_NAMES = Object.keys(MARKS)
