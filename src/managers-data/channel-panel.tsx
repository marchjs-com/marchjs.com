// The channel panel of the managers pages: every event on "managers.*", newest first.
import { Badge } from "hadi-march/ui";
import { onChannels } from "hadi-march/channel";
import { Demo } from "../demo.tsx";

/** Every manager event on the "managers.*" channels, newest first. */
export function ChannelPanel() {
  let $log: { n: number; name: string; type: string; detail: string }[] = []
  let n = 0
  onChannels("managers.*", (m) => {
    const p = m.payload as { type: string; detail?: unknown }
    let d = ""
    try { d = p.detail === undefined ? "" : JSON.stringify(p.detail) } catch { d = "…" }
    $log = [{ n: ++n, name: m.name.slice(9), type: p.type, detail: d.length > 70 ? d.slice(0, 70) + "…" : d }, ...$log].slice(0, 8)
  })
  return <Demo wide title="Kanal trafiği" desc="Her yönetici olaylarını kendi kanalına yayınlar (managers.clipboard, managers.undo…). Bu panel tek bir onChannels('managers.*') dinleyicisi: aşağıdaki demoları kullandıkça olaylar burada akar."
    code={`import { onChannels, channel } from "hadi-march/channel"
onChannels("managers.*", (m) => devtools.push(m.name, m.payload.type, m.payload.detail))
channel("managers.undo").on(({ type }) => …)   // tek yönetici`}>
    <ol class="sc-md-feed" aria-live="polite">
      {() => ($log.length ? $log.map((e) => <li><Badge tone="info">{e.name}</Badge><code>{e.type}</code><span class="hm-muted">{e.detail}</span></li>) : <li class="hm-muted">Henüz olay yok: bir demoyu kullan.</li>)}
    </ol>
  </Demo>
}

