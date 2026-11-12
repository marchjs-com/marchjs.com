// Shared helpers of the motion-b / motion-c API examples (hadi-march/motion): held playbacks, a choice control, a
// two-page swap that plays page transition frames, a replay stage.
import "./motion-b.css";
import { signal, onCleanup } from "hadi-march";
import { Button, Segmented } from "hadi-march/ui";
import { animate, nextFrame, type Playback } from "hadi-march/motion";
import { Row } from "./_kit.tsx";

export type Dir = "forward" | "back"
export interface Sig<T> { (): T; set(v: T): unknown }

/** Playbacks of an example: a new one with the same key replaces the old; all end with the example. */
export function hold() {
  const m = new Map<unknown, Playback>()
  onCleanup(() => m.forEach((p) => p.cancel()))
  return (p: Playback, key: unknown = "") => { m.get(key)?.cancel(); m.set(key, p); return p }
}
export const tok = (name: string): string => globalThis.getComputedStyle(globalThis.document.documentElement).getPropertyValue(name).trim()
export const last = (l: string[], s: string, n = 6): string[] => [...l, s].slice(-n)
export const num = (e: Event): number => Number((e.target as HTMLInputElement).value)

/** A small choice of values (shown as a segmented control). */
export function Pick(p: { sig: Sig<string>; options: (string | [string, string])[]; label: string }) {
  return <Segmented value={p.sig} onChange={(v: string) => p.sig.set(v)} aria-label={p.label}
    options={p.options.map((o) => (typeof o === "string" ? { value: o, label: o } : { value: o[0], label: o[1] }))} />
}

/** Two pages swap with the keyframes of a page transition (forward, then back): the same frames the router plays. */
export function Swap(p: { frames: (side: "in" | "out", dir: Dir, rtl: boolean) => Keyframe[]; duration?: number; mirror?: boolean }) {
  const keep = hold()
  const pages: HTMLElement[] = []
  const rtl = signal(false), next = signal<Dir>("forward")
  let at = 0
  const go = () => {
    const dir = next.peek(), old = pages[at]!, now = pages[1 - at]!
    at = 1 - at
    next.set(dir === "forward" ? "back" : "forward")
    now.style.visibility = "visible"
    const o = { duration: p.duration ?? 800, easing: "in-out", fill: "none" as FillMode }
    void keep(animate(old, p.frames("out", dir, rtl.peek()), o), old).finished.then(() => { if (pages[at] !== old) old.style.visibility = "hidden" })
    keep(animate(now, p.frames("in", dir, rtl.peek()), o), now)
  }
  return <div class="sc-ex-motion-b-stack">
    <div class="sc-ex-motion-b-stage">
      <div class="sc-ex-motion-b-pages" dir={() => (rtl() ? "rtl" : "ltr")}>
        <div class="sc-ex-motion-b-pg" ref={(el: HTMLElement) => { pages[0] = el }}>Sayfa 1</div>
        <div class="sc-ex-motion-b-pg sc-ex-motion-b-pg-2" ref={(el: HTMLElement) => { pages[1] = el }}>Sayfa 2</div>
      </div>
    </div>
    <Row>
      <Button variant="primary" onClick={go}>{() => (next() === "forward" ? "İleri git" : "Geri dön")}</Button>
      {p.mirror ? <Button variant="ghost" onClick={() => rtl.update((v) => !v)}>{() => (rtl() ? "Sağdan sola: açık" : "Sağdan sola: kapalı")}</Button> : null}
    </Row>
  </div>
}

/** A box that plays `run(box)` when the example opens and again on the replay button. */
export function Replay(p: { run: (box: HTMLElement, keep: ReturnType<typeof hold>) => void; label?: string; box?: string; children?: unknown }) {
  const keep = hold()
  const box = <div class={"sc-ex-motion-b-box " + (p.box ?? "")} /> as HTMLElement
  const go = () => p.run(box, keep)
  nextFrame(go)
  return <div class="sc-ex-motion-b-stack">
    <div class="sc-ex-motion-b-stage">{box}</div>
    <Row><Button variant="primary" onClick={go}>{p.label ?? "Yeniden oynat"}</Button>{p.children}</Row>
  </div>
}

export const D = {
  star: "M50 6L61 38L95 38L67 58L78 92L50 71L22 92L33 58L5 38L39 38Z",
  circle: "M50 8A42 42 0 1 1 49.9 8Z",
  heart: "M50 90C20 66 6 50 14 30C22 12 44 14 50 32C56 14 78 12 86 30C94 50 80 66 50 90Z",
  route: "M8 60C30 6 60 6 80 40S130 80 152 30",
}

