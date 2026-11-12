// Helpers shared by the environment manager demos (pages/managers-env.tsx and its lazy parts).
import { onCleanup } from "hadi-march";
import { Badge } from "hadi-march/ui";

export const yes = (v: boolean) => <Badge tone={v ? "success" : "neutral"} dot>{v ? "evet" : "hayır"}</Badge>
export const time = (ms: number | null) => (ms ? new Date(ms).toLocaleTimeString("tr") : "—")
export const secs = (ms: number) => `${Math.ceil(ms / 1000)} sn`
/** A signal of Date.now() that ticks while the demo is on screen. */
export function clock(every = 250) {
  let $now = Date.now()
  const id = setInterval(() => { $now = Date.now() }, every)
  onCleanup(() => clearInterval(id))
  return () => $now
}
export function Signals(props: { rows: [string, () => unknown][] }) {
  return <dl class="sc-mgr-signals">{props.rows.map(([k, v]) => <div class="sc-mgr-signal"><dt><code>{k}</code></dt><dd>{v}</dd></div>)}</dl>
}

export const STATE_TONE: Record<string, string> = { granted: "success", denied: "danger", prompt: "info", unsupported: "neutral" }
export const STATE_TEXT: Record<string, string> = { granted: "izinli", denied: "reddedildi", prompt: "sorulmadı", unsupported: "desteklenmiyor", blocked: "engellendi" }
