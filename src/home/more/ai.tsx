// Home page section (a lazy part): made for AI agents. Five requests, one at a time (Önceki / Sonraki): the request is
// typed, the agent writes the MarchJS code line by line into a read-only editor, the preview frame waits ("Ajan
// bekleniyor…") and then shows the app it made, built from real components ("Ajan talebinizi tamamladı"). The first one
// plays by itself when the section comes into view, once; the others play when picked. MarchJS ships what an agent
// reads first: AI_INSTRUCTIONS.md, llms.txt and AGENTS.md.
import "./more.css";
import { onCleanup } from "march";
import { inView, reducedMotion } from "march/motion";
import { Badge, Button, Checkbox, Progress, Select, Spinner } from "march/ui";
import { CodeEditor } from "march/composite";
import { Reveal } from "march/landing";
import { Icon, arrowLeft, arrowRight, check, sparkles } from "march/icons";
import { REPO } from "../../repo.ts";
import { Head } from "../head.tsx";
import { every } from "../clock.ts";

// ── what each request makes ─────────────────────────────────────────────────────────────────────────────────────

const CITIES = [
  { value: "istanbul", label: "İstanbul", temp: 17, sky: "⛅", note: "Parçalı bulutlu" },
  { value: "ankara", label: "Ankara", temp: 11, sky: "☀️", note: "Açık ve serin" },
  { value: "izmir", label: "İzmir", temp: 21, sky: "🌤️", note: "Güneşli" },
  { value: "trabzon", label: "Trabzon", temp: 14, sky: "🌧️", note: "Yağmurlu" },
]
function Weather() {
  let $city = "istanbul"
  const c = () => CITIES.find((x) => x.value === $city)!
  return <div class="sc-ai-app-in">
    <Select bind:value={$city} options={CITIES.map((x) => ({ value: x.value, label: x.label }))} aria-label="Şehir" />
    <div class="sc-ai-weather"><span class="sc-ai-sky">{() => c().sky}</span><b>{() => `${c().temp}°`}</b><span>{() => c().note}</span></div>
  </div>
}

const FOCUS_MS = 1000, FOCUS_STEPS = 25
function Pomodoro() {
  let $left = FOCUS_STEPS
  let $run = false
  let stop: (() => void) | undefined
  const toggle = (): void => {
    $run = !$run
    if ($run) stop = every(FOCUS_MS, () => { $left = $left > 0 ? $left - 1 : FOCUS_STEPS })
    else { stop?.(); stop = undefined }
  }
  onCleanup(() => stop?.())
  return <div class="sc-ai-app-in">
    <div class="sc-ai-timer"><b>{() => `${$left} dk`}</b><span>{() => ($run ? "odaklan" : "hazır")}</span></div>
    <Progress value={(1 - $left / FOCUS_STEPS) * 100} label="Kalan süre" />
    <div class="sc-ai-row"><Button variant="primary" on:click={toggle}>{() => ($run ? "Duraklat" : "Başlat")}</Button><Button on:click={() => { $left = FOCUS_STEPS }}>Sıfırla</Button></div>
  </div>
}

const hue = (): string => `hsl(${Math.floor(Math.random() * 360)} ${55 + Math.floor(Math.random() * 30)}% ${45 + Math.floor(Math.random() * 20)}%)`
function Palette() {
  let $colors = Array.from({ length: 5 }, hue)
  return <div class="sc-ai-app-in">
    <div class="sc-ai-palette">{() => $colors.map((c) => <span class="sc-ai-chip-color" style={{ "--sc-ai-c": c }} title={c} />)}</div>
    <Button variant="primary" icon={sparkles} on:click={() => { $colors = Array.from({ length: 5 }, hue) }}>Yeni palet</Button>
  </div>
}

const TASKS = ["Tasarımı bitir", "Testleri yaz", "Yayınla"]
function Todo() {
  let $done = [true, false, false]
  const count = () => $done.filter(Boolean).length
  return <div class="sc-ai-app-in">
    <div class="sc-ai-row"><b>Yapılacaklar</b><Badge tone="info">{() => `${count()} / ${TASKS.length}`}</Badge></div>
    <Progress value={(count() / TASKS.length) * 100} label="İlerleme" />
    {TASKS.map((t, i) => <Checkbox value={$done[i]} onChange={(v: boolean) => { $done = $done.map((d, k) => (k === i ? v : d)) }}>{t}</Checkbox>)}
  </div>
}

const VOTES = [{ emoji: "😍", name: "Bayıldım" }, { emoji: "🙂", name: "Güzel" }, { emoji: "🤔", name: "Emin değilim" }]
function Poll() {
  let $votes = [7, 4, 1]
  const total = () => $votes.reduce((a, b) => a + b, 0)
  return <div class="sc-ai-app-in">
    <b>MarchJS nasıl?</b>
    {VOTES.map((v, i) => <button type="button" class="sc-ai-vote" on:click={() => { $votes = $votes.map((n, k) => (k === i ? n + 1 : n)) }}>
      <span>{v.emoji} {v.name}</span><Progress value={(($votes[i] ?? 0) / total()) * 100} label={v.name} /><small>{() => `${$votes[i]}`}</small>
    </button>)}
  </div>
}

/** The requests: what is asked, the code the agent writes for it, the app it makes. */
const EXAMPLES: readonly { ask: string; code: string; app: () => unknown }[] = [
  { ask: "Şehir seçince havası değişen bir hava durumu kartı yap.", app: Weather, code: `import { Select } from "march/ui"

const CITIES = [
  { value: "istanbul", label: "İstanbul", temp: 17, sky: "⛅" },
  { value: "ankara", label: "Ankara", temp: 11, sky: "☀️" },
]

export const Weather = () => {
  let $city = "istanbul"
  const c = () => CITIES.find((x) => x.value === $city)
  return <div>
    <Select bind:value={$city} options={CITIES} />
    <b>{c().sky} {c().temp}°</b>
  </div>
}` },
  { ask: "Başlatıp duraklatabildiğim bir odak (pomodoro) sayacı istiyorum.", app: Pomodoro, code: `import { Button, Progress } from "march/ui"
import { every } from "./clock"

export const Pomodoro = () => {
  let $left = 25
  let $run = false
  let stop
  const toggle = () => {
    $run = !$run
    if ($run) stop = every(1000, () => $left--)
    else stop()
  }
  return <div>
    <b>{$left} dk</b>
    <Progress value={(1 - $left / 25) * 100} />
    <Button on:click={toggle}>{$run ? "Duraklat" : "Başlat"}</Button>
  </div>
}` },
  { ask: "Her basışta rastgele beş renklik bir palet üreten bir araç yap.", app: Palette, code: `import { Button } from "march/ui"

const hue = () => \`hsl(\${Math.random() * 360} 70% 55%)\`

export const Palette = () => {
  let $colors = Array.from({ length: 5 }, hue)
  return <div>
    {$colors.map((c) => <span class="swatch" style={{ "--c": c }} />)}
    <Button on:click={() => $colors = Array.from({ length: 5 }, hue)}>
      Yeni palet
    </Button>
  </div>
}` },
  { ask: "Bana bir yapılacaklar listesi yap, ilerlemesi görünsün.", app: Todo, code: `import { Checkbox, Progress, Badge } from "march/ui"

let $tasks = [
  { text: "Tasarımı bitir", done: true },
  { text: "Testleri yaz", done: false },
  { text: "Yayınla", done: false },
]
const done = () => $tasks.filter((t) => t.done).length

export const Todo = () => <div>
  <Badge>{done()} / {$tasks.length}</Badge>
  <Progress value={done() / $tasks.length * 100} />
  {$tasks.map((t) => <Checkbox bind:value={t.done}>{t.text}</Checkbox>)}
</div>` },
  { ask: "Emojiyle oy verilen, sonuçları çubukla gösteren bir anket kur.", app: Poll, code: `import { Progress } from "march/ui"

const CHOICES = ["😍 Bayıldım", "🙂 Güzel", "🤔 Emin değilim"]

export const Poll = () => {
  let $votes = [0, 0, 0]
  const total = () => $votes.reduce((a, b) => a + b, 0) || 1
  return <div>
    {CHOICES.map((c, i) => <button on:click={() => $votes[i]++}>
      {c} <Progress value={$votes[i] / total() * 100} />
    </button>)}
  </div>
}` },
]
/** The agent's pace (ms): a letter of the request, a line of code, the pause before it starts writing. */
const KEY_MS = 26, LINE_MS = 90, THINK_MS = 700
const FILES: readonly { name: string; text: string }[] = [
  { name: "AI_INSTRUCTIONS.md", text: "kavramlar, sözdizimi, yapılır ve yapılmazlar" },
  { name: "llms.txt", text: "belgelerin ajanlar için kısa haritası" },
  { name: "AGENTS.md", text: "depoda çalışan ajan için kurallar" },
]

export default function Ai() {
  let $at = 0
  let $typed = 0
  let $lines = 0
  let $phase: "idle" | "ask" | "think" | "code" | "done" = "idle"
  const ex = () => EXAMPLES[$at]!
  let timer: ReturnType<typeof setTimeout> | undefined
  const later = (ms: number, fn: () => void): void => { clearTimeout(timer); timer = setTimeout(fn, ms) }
  onCleanup(() => clearTimeout(timer))
  /** Play request `i` once: type it, think, write the code, show the app. */
  const play = (i: number): void => {
    clearTimeout(timer)
    $at = i; $typed = 0; $lines = 0
    const e = EXAMPLES[i]!, lines = e.code.split("\n").length
    if (reducedMotion()) { $typed = e.ask.length; $lines = lines; $phase = "done"; return }
    $phase = "ask"
    const step = (): void => {
      if ($phase === "ask") { if ($typed < e.ask.length) { $typed++; later(KEY_MS, step) } else { $phase = "think"; later(THINK_MS, step) } }
      else if ($phase === "think") { $phase = "code"; later(LINE_MS, step) }
      else if ($phase === "code") { if ($lines < lines) { $lines++; later(LINE_MS, step) } else $phase = "done" }
    }
    step()
  }
  // the first request plays by itself the first time the section is in view
  const start = (box: Element) => onCleanup(inView(box, { once: true, rootMargin: "0px", threshold: 0.35, enter: () => { if ($phase === "idle") play(0) } }))
  const go = (d: number): void => play((($at + d) % EXAMPLES.length + EXAMPLES.length) % EXAMPLES.length)
  return <section class="sc-sec" aria-labelledby="sc-ai-h">
    <Head id="sc-ai-h" kicker="Yapay zekâ" color="brand-purple" title="Yapay zekâ ajanları MarchJS'i tanır" example="Bir istek yaz, ajan uygulamayı saniyeler içinde kursun"
      lead="Ajanlar MarchJS'i tanır: kurallarını, bileşenlerini ve sözdizimini depodaki yönergelerden okur. Ne istediğini yaz; uygulaman saniyeler içinde hazır olsun." />
    <Reveal class="sc-ai" effect="up" stagger={110}>
      <div class="sc-ai-chat sc-card" ref={start}>
        <div class="sc-ai-nav">
          <Button size="sm" variant="ghost" icon={arrowLeft} on:click={() => go(-1)}>Önceki</Button>
          <span class="sc-ai-step">{() => `${$at + 1} / ${EXAMPLES.length}`}</span>
          <Button size="sm" variant="ghost" iconEnd={arrowRight} on:click={() => go(1)}>Sonraki</Button>
        </div>
        <div class="sc-ai-ask"><span class="sc-ai-who">Sen</span><p>{() => ex().ask.slice(0, $typed)}</p></div>
        <div class="sc-ai-agent">
          <span class="sc-ai-who"><Icon of={sparkles} size="sm" /> Ajan</span>
          <span class="sc-ai-state">{() => ($phase === "idle" || $phase === "ask" ? "dinliyor" : $phase === "think" ? "düşünüyor…" : $phase === "code" ? "MarchJS yazıyor…" : "bitti")}</span>
        </div>
        <CodeEditor value={ex().code.split("\n").slice(0, $lines).join("\n")} lang="tsx" readonly shortcuts={false} label="Ajanın yazdığı kod" class="sc-ai-code" />
      </div>
      <div class="sc-ai-side">
        <div class="sc-ai-frame sc-card">
          <div class="sc-ai-frame-bar" aria-hidden="true"><i /><i /><i /><span>önizleme</span></div>
          <div class="sc-ai-frame-body" aria-live="polite">
            {() => ($phase === "done"
              ? <div class="sc-ai-result">
                  <span class="sc-ai-ok"><Icon of={check} size="sm" /> Ajan talebinizi tamamladı</span>
                  {ex().app()}
                </div>
              : <div class="sc-ai-wait"><Spinner size="sm" label="Ajan bekleniyor" /><span>Ajan bekleniyor…</span></div>)}
          </div>
        </div>
        <ul class="sc-ai-files">
          {FILES.map((f) => <li><Icon of={check} size="md" /><a href={`${REPO}/blob/main/${f.name}`} target="_blank" rel="noopener"><code>{f.name}</code></a><span>{f.text}</span></li>)}
        </ul>
      </div>
    </Reveal>
  </section>
}
