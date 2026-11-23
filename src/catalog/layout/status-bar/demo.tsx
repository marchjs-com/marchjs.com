// Showcase stage for StatusBar: change the state and the width (Playground values in playground.ts).
import { signal } from "march";
import { StatusBar, type StatusItem, type StatusTone } from "march/components/layout/status-bar";
import { toast } from "march/components/overlays/toast";
import { gitBranch, alertTriangle, bell } from "march/icons";

export const code = `<StatusBar items={[
  { id: "branch", icon: gitBranch, text: "main", onSelect: pickBranch, priority: 5 },
  { id: "problems", icon: alertTriangle, text: () => $errors + " hata", tone: () => $errors ? "danger" : "neutral" },
  { id: "pos", side: "end", text: () => "Sa " + $line, priority: 4 },
  { id: "save", side: "end", text: () => $state, tone: () => $busy ? "busy" : "success", live: true, priority: 9 },
  { id: "format", side: "end", command: "editor.format" },          // komut: başlık, kısayol, etkinlik
]} dot={(tone) => <b>{() => (tone() === "busy" ? "◌" : "◆")}</b>} pulse={false} />   // dot={false}: noktasız`

const STATES: Record<string, { text: string; tone: "success" | "busy" | "danger" }> = {
  saved: { text: "Kaydedildi", tone: "success" }, busy: { text: "Kaydediliyor…", tone: "busy" }, error: { text: "Kaydedilemedi", tone: "danger" },
}

export default function StatusBarDemo(props: { values: { state: string; width: number; dot: string; pulse: boolean } }) {
  const line = signal(12)
  const st = () => STATES[props.values.state] ?? STATES["saved"]!
  const items: StatusItem[] = [
    { id: "branch", icon: gitBranch, text: "main", title: "Dal değiştir", onSelect: () => { toast("Dal seçici") }, priority: 5 },
    { id: "problems", icon: alertTriangle, text: () => (props.values.state === "error" ? "1 hata" : "0 hata"), tone: () => (props.values.state === "error" ? "danger" : "neutral"), priority: 3 },
    { id: "pos", side: "end", text: () => `Sa ${line()}, Sü 8`, title: "Satıra git", onSelect: () => line.set(line() + 1), priority: 4 },
    { id: "enc", side: "end", text: "UTF-8", priority: 1 },
    { id: "lang", side: "end", text: "TypeScript", priority: 2 },
    { id: "save", side: "end", text: () => st().text, tone: () => st().tone, live: true, priority: 9 },
    { id: "bell", side: "end", icon: bell, text: "2", title: "Bildirimler", onSelect: () => { toast("2 bildirim") }, priority: 6 },
  ]
  return <div class="sc-sbar-stage" style={{ "--sc-sbar-w": `${props.values.width}px` }}>
    {() => {
      const pulse = props.values.pulse
      const dot = props.values.dot === "off" ? false : props.values.dot === "own" ? (tone: () => StatusTone) => <b>{() => (tone() === "busy" ? "◌" : "◆")}</b> : true
      return <StatusBar items={items} label="Editör durumu" dot={dot} pulse={pulse} />
    }}
  </div>
}
