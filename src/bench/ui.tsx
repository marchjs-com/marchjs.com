// Speed › Comparison: the shared presentation of both test tabs (no measurement here). A sticky settings panel with
// labelled groups, the library and option toggles, live result bars that grow with the motion engine as results come
// in, and the small "live preview" window the apps are drawn in while they are measured.
import { effect, signal, t } from "hadi-march"
import { animateEl } from "hadi-march/motion"
import { Progress } from "hadi-march/ui"
import { Icon, check, crown, alertTriangle, sliders, chevronDown } from "hadi-march/icons"
import { LIBS } from "./libs.ts"

/** The tab whose test is running (null: none): the other tabs stay put (the stage the apps are drawn in must stay in the page). */
export const busy = signal<string | null>(null)

// one theme color per library (category tokens; March gets the brand orange, vanilla JS the neutral baseline)
const COLOR: Record<string, string> = { march: "cat-1", react: "cat-2", vue: "cat-3", svelte: "cat-4", solid: "cat-5", preact: "cat-6", lit: "cat-7" }
export const libColor = (id: string): string => (COLOR[id] ? `var(--hm-${COLOR[id]})` : "var(--hm-faint)")

export const ms = (x: number): string => (Number.isFinite(x) ? (x >= 100 ? x.toFixed(0) : x.toFixed(1)) : "—")
export const kb = (n: number): string => `${(n / 1024).toFixed(1)} KB`
export const p95 = (xs: readonly number[]): number => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * 0.95))]! : NaN }

let seq = 0
const nextId = (p: string): string => `${p}-${++seq}`

/** The two-column layout of a test tab: the settings panel (sticky; folds on a phone) and the live result area. */
export function Split(props: { panel: unknown; title: string; summary: () => string; children?: unknown }) {
  let $open = false
  const id = nextId("bt-panel")
  return <div class="bt-split">
    <aside class="bt-panel" class:is-open={$open} aria-label={props.title}>
      <button type="button" class="bt-panel-toggle" aria-expanded={() => String($open)} aria-controls={id} onClick={() => { $open = !$open }}>
        <Icon of={sliders} />
        <span class="bt-panel-toggle-text"><strong>{props.title}</strong><span>{() => props.summary()}</span></span>
        <Icon of={chevronDown} class="bt-panel-chev" />
      </button>
      <div class="bt-panel-body" id={id}>{props.panel}</div>
    </aside>
    <div class="bt-live">{props.children}</div>
  </div>
}

/** A labelled group of the settings panel; `aside` holds small actions (all / none). */
export function Group(props: { title: string; aside?: unknown; children?: unknown }) {
  const id = nextId("bt-group")
  return <div class="bt-group" role="group" aria-labelledby={id}>
    <div class="bt-group-head"><h3 class="bt-group-title" id={id}>{props.title}</h3>{props.aside ? <div class="bt-group-aside">{props.aside}</div> : null}</div>
    {props.children}
  </div>
}

export interface ToggleItem { id: string; label: string; meta?: string | undefined; color?: string | undefined; hint?: string | undefined }
/** A multiple choice as a list of toggle rows (color dot, label, small meta). */
export function Toggles(props: { items: ToggleItem[]; value: () => string[]; set: (v: string[]) => void; disabled?: () => boolean; cols?: 1 | 2 }) {
  const on = (id: string): boolean => props.value().includes(id)
  const flip = (id: string): void => { const v = props.value(); props.set(v.includes(id) ? v.filter((x) => x !== id) : props.items.map((i) => i.id).filter((x) => x === id || v.includes(x))) }
  return <div class={props.cols === 2 ? "bt-toggles bt-toggles-2" : "bt-toggles"}>
    {props.items.map((it) => <button type="button" class="bt-toggle" aria-pressed={() => String(on(it.id))} disabled={() => !!props.disabled?.()} title={it.hint} onClick={() => flip(it.id)}>
      {it.color ? <span class="bt-dot" style={{ "--bt-c": it.color }} aria-hidden="true" /> : null}
      <span class="bt-toggle-label">{it.label}</span>
      {it.meta ? <span class="bt-toggle-meta">{it.meta}</span> : null}
      <span class="bt-toggle-check" aria-hidden="true"><Icon of={check} /></span>
    </button>)}
  </div>
}

/** "All · None" for a group's head. */
export function AllNone(props: { all: () => void; none: () => void; disabled?: () => boolean }) {
  return <>
    <button type="button" class="bt-link" disabled={() => !!props.disabled?.()} onClick={props.all}>{t("Tümü")}</button>
    <button type="button" class="bt-link" disabled={() => !!props.disabled?.()} onClick={props.none}>{t("Hiçbiri")}</button>
  </>
}

export const libItems = (ids?: (id: string) => boolean): ToggleItem[] => LIBS.filter((l) => !ids || ids(l.id)).map((l) => ({ id: l.id, label: l.name, meta: l.version, color: libColor(l.id) }))

/** One bar of the result list. `value` NaN with `state` "run"/"wait": not in yet. */
export interface BarRow { id: string; name: string; value: number; text: string; factor?: number | undefined; warn?: boolean | undefined; error?: string | undefined; state: "wait" | "run" | "done"; note?: string | undefined }

/** Bars of a result, shortest first; each one grows (motion engine) from its last length as samples come in. Rows keep
 * their element across updates (keyed by id), so a bar animates instead of being redrawn. */
export function Bars(props: { ids: string[]; rows: () => BarRow[]; label: string | (() => string); best?: string }) {
  const row = (id: string): BarRow | undefined => props.rows().find((r) => r.id === id)
  const done = (): BarRow[] => props.rows().filter((r) => r.state === "done" && !r.error && Number.isFinite(r.value))
  const max = (): number => Math.max(0, ...props.rows().filter((r) => Number.isFinite(r.value) && !r.error).map((r) => r.value))
  const order = (id: string): number => { const r = row(id); if (!r) return 999; const list = props.rows().filter((x) => Number.isFinite(x.value) && !x.error).sort((a, b) => a.value - b.value); const i = list.findIndex((x) => x.id === id); return i < 0 ? 100 + props.ids.indexOf(id) : i }
  const best = (): string | undefined => { const d = done(); return d.length > 1 ? d.reduce((a, b) => (b.value < a.value ? b : a)).id : undefined }
  const grow = (fill: HTMLElement, id: string): void => {
    let last = 0
    effect(() => {
      const r = row(id), m = max()
      const to = r && !r.error && Number.isFinite(r.value) && m > 0 ? Math.max(0.015, r.value / m) : 0
      if (to === last) return
      animateEl(fill, [{ transform: `scaleX(${last})` }, { transform: `scaleX(${to})` }], { duration: 520, easing: "cubic-bezier(.2,.8,.2,1)" })
      fill.style.setProperty("transform", `scaleX(${to})`)
      last = to
    })
  }
  return <ol class="bt-bars" aria-label={typeof props.label === "function" ? props.label() : props.label}>
    {props.ids.map((id) => <li class="bt-bar" hidden={() => !row(id)} style={() => ({ order: order(id), "--bt-c": libColor(id) })}
      class:is-best={best() === id} class:is-run={row(id)?.state === "run"} class:is-wait={row(id)?.state === "wait"} class:is-error={!!row(id)?.error}>
      <span class="bt-bar-name"><span class="bt-dot" aria-hidden="true" />{() => row(id)?.name ?? ""}
        {() => (best() === id ? <span class="bt-crown" title={props.best ?? t("En hızlı")}><Icon of={crown} label={props.best ?? t("En hızlı")} /></span> : null)}</span>
      <span class="bt-bar-track" aria-hidden="true"><span class="bt-bar-fill" ref={(el: HTMLElement) => grow(el, id)} /></span>
      <span class="bt-bar-value">{() => { const r = row(id); return r ? (r.error ? t("hata") : r.state === "wait" && !Number.isFinite(r.value) ? t("sırada") : r.state === "run" && !Number.isFinite(r.value) ? t("ölçülüyor…") : r.text) : "" }}</span>
      <span class="bt-bar-badges">
        {() => { const f = row(id)?.factor; return f !== undefined && Number.isFinite(f) ? <span class="bt-factor" class:is-base={f > 0.995 && f < 1.005} class:is-fast={f < 0.995} title={t("vanilla JS'e göre katsayı")}>×{f.toFixed(2)}</span> : null }}
        {() => (row(id)?.warn ? <span class="bt-unsure" title={t("Sapma ya da güven aralığı medyanın %15'inden büyük")}><Icon of={alertTriangle} label={t("güvenilir değil")} /></span> : null)}
      </span>
      {() => { const n = row(id)?.note; return n ? <span class="bt-bar-note">{n}</span> : null }}
    </li>)}
  </ol>
}

/** Busy-machine warning (deviation or confidence interval over 15 % of the median). */
export function Unsure(props: { names: () => string[] }) {
  return () => { const n = props.names(); return n.length ? <p class="bt-warn" role="status"><Icon of={alertTriangle} /><span>{t("Sonuç güvenilir değil, makine meşgul: {0} için sapma ya da güven aralığı medyanın %15'inden büyük. Diğer uygulamaları kapatıp testi yeniden çalıştır.", { 0: n.join(", ") })}</span></p> : null }
}

/** The small window the apps are drawn in while measured. Fixed size, so every library's layout work is equal. */
export function Preview(props: { stage: (el: HTMLDivElement) => void; running: () => boolean; caption: () => string }) {
  return <figure class="bt-preview" class:is-on={props.running()}>
    <figcaption class="bt-preview-bar">
      <span class="bt-preview-dots" aria-hidden="true"><i /><i /><i /></span>
      <span class="bt-preview-title">{t("Canlı önizleme")}</span>
      <span class="bt-preview-cap">{() => props.caption()}</span>
      <span class="bt-preview-rec" aria-hidden="true" />
    </figcaption>
    <div class="bt-preview-body">
      <div class="bt-stage" ref={props.stage} aria-hidden="true" />
      <p class="bt-preview-idle" hidden={props.running()}>{t("Test başlayınca ölçülen uygulama burada çizilir.")}</p>
    </div>
  </figure>
}

/** Progress line under the start button. */
export function Status(props: { pct: () => number; text: () => string; running: () => boolean }) {
  return <div class="bt-status" aria-live="polite">
    <div class="bt-meter" hidden={() => !props.running()}><Progress value={props.pct()} max={100} label={t("Test ilerlemesi")} /></div>
    <p class="bt-status-text">{() => props.text()}</p>
  </div>
}
