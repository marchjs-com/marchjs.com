// Home page section (a lazy part): made for AI agents. A request is typed to an agent, the agent writes the MarchJS
// code line by line into a read-only editor, and the app appears, built from real components. MarchJS ships what an
// agent reads first: AI_INSTRUCTIONS.md, llms.txt and AGENTS.md.
import "./more.css";
import { onCleanup } from "march";
import { inView, reducedMotion } from "march/motion";
import { Badge, Checkbox, Progress } from "march/ui";
import { CodeEditor } from "march/components/composite/code-editor/index.ts";
import { Reveal } from "march/components/landing/index.ts";
import { Icon, sparkles, check } from "march/icons";
import { REPO } from "../../repo.ts";
import { Head } from "../head.tsx";

/** The request, the code the agent writes for it, and the tasks of the app it makes. */
const ASK = "Bana koyu temalı bir yapılacaklar listesi yap, ilerlemesi görünsün."
const CODE = `import { signal } from "march"
import { Checkbox, Progress, Badge } from "march/ui"

let $tasks = [
  { text: "Tasarımı bitir", done: true },
  { text: "Testleri yaz", done: false },
  { text: "Yayınla", done: false },
]
const done = () => $tasks.filter((t) => t.done).length

export const Todo = () => <div m:theme="night">
  <Badge>{done()} / {$tasks.length}</Badge>
  <Progress value={done() / $tasks.length * 100} />
  {$tasks.map((t) => <Checkbox bind:value={t.done}>{t.text}</Checkbox>)}
</div>`
const TASKS = ["Tasarımı bitir", "Testleri yaz", "Yayınla"]
/** The agent's pace (ms): a letter of the request, a line of code, the wait before it starts over. */
const KEY_MS = 32, LINE_MS = 110, THINK_MS = 700, HOLD_MS = 6000
const FILES: readonly { name: string; text: string }[] = [
  { name: "AI_INSTRUCTIONS.md", text: "kavramlar, sözdizimi, yapılır ve yapılmazlar" },
  { name: "llms.txt", text: "belgelerin ajanlar için kısa haritası" },
  { name: "AGENTS.md", text: "depoda çalışan ajan için kurallar" },
]

export default function Ai() {
  let $typed = 0
  let $phase: "ask" | "think" | "code" | "app" = "ask"
  let $lines = 0
  let $done = [true, false, false]
  const lines = CODE.split("\n")
  const run = (box: Element) => {
    let timer: ReturnType<typeof setTimeout> | undefined, on = false
    const at = (ms: number, fn: () => void): void => { timer = setTimeout(() => { if (on) fn() }, ms) }
    const step = (): void => {
      if ($phase === "ask") {
        if ($typed < ASK.length) { $typed++; at(KEY_MS, step) } else { $phase = "think"; at(THINK_MS, step) }
      } else if ($phase === "think") { $phase = "code"; at(LINE_MS, step) }
      else if ($phase === "code") {
        if ($lines < lines.length) { $lines++; at(LINE_MS, step) } else { $phase = "app"; at(HOLD_MS, step) }
      } else { $phase = "ask"; $typed = 0; $lines = 0; $done = [true, false, false]; at(KEY_MS, step) }
    }
    const off = inView(box, { once: false, rootMargin: "0px", threshold: 0.3,
      enter: () => {
        if (reducedMotion()) { $typed = ASK.length; $lines = lines.length; $phase = "app"; return }
        on = true; clearTimeout(timer); step()
      },
      leave: () => { on = false; clearTimeout(timer) } })
    onCleanup(() => { off(); on = false; clearTimeout(timer) })
  }
  const count = () => $done.filter(Boolean).length
  return <section class="sc-sec" aria-labelledby="sc-ai-h">
    <Head id="sc-ai-h" kicker="Yapay zekâ" color="brand-purple" title="Yapay zekâ ajanları için hazır"
      lead="Ajanlar MarchJS'i tanır: kurallarını, bileşenlerini ve sözdizimini depodaki yönergelerden okur. Ne istediğini yaz; uygulaman saniyeler içinde hazır olsun." />
    <Reveal class="sc-ai" effect="up" stagger={110}>
      <div class="sc-ai-chat sc-card" ref={run}>
        <div class="sc-ai-ask"><span class="sc-ai-who">Sen</span><p>{ASK.slice(0, $typed)}<span class="sc-ai-caret" hidden={$phase !== "ask"} aria-hidden="true">▍</span></p></div>
        <div class="sc-ai-agent">
          <span class="sc-ai-who"><Icon of={sparkles} size="sm" /> Ajan</span>
          <span class="sc-ai-state">{() => ($phase === "ask" ? "dinliyor" : $phase === "think" ? "düşünüyor…" : $phase === "code" ? "MarchJS yazıyor…" : "hazır")}</span>
        </div>
        <CodeEditor value={lines.slice(0, $lines).join("\n")} lang="tsx" readonly shortcuts={false} label="Ajanın yazdığı kod" class="sc-ai-code" />
      </div>
      <div class="sc-ai-side">
        <div class={() => `sc-ai-app sc-card${$phase === "app" ? " is-on" : ""}`} data-theme="dark" data-m-theme="night">
          <div class="sc-ai-app-top"><b>Yapılacaklar</b><Badge tone="info">{() => `${count()} / ${TASKS.length}`}</Badge></div>
          <Progress value={(count() / TASKS.length) * 100} label="İlerleme" />
          {TASKS.map((t, i) => <Checkbox value={$done[i]} onChange={(v: boolean) => { $done = $done.map((d, k) => (k === i ? v : d)) }}>{t}</Checkbox>)}
        </div>
        <ul class="sc-ai-files">
          {FILES.map((f) => <li><Icon of={check} size="md" /><a href={`${REPO}/blob/main/${f.name}`} target="_blank" rel="noopener"><code>{f.name}</code></a><span>{f.text}</span></li>)}
        </ul>
      </div>
    </Reveal>
  </section>
}
