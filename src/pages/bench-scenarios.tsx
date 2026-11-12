// Speed › Comparison › "Gerçekçi senaryolar": realistic workloads (small, frequent updates on a large page), kept apart
// from the canonical operations. Its own lazy part of the benchmark page; every library's app is a lazy chunk too.
import { Button, Chip, Progress, toast } from "hadi-march/ui";
import { untrack } from "hadi-march";
import { lazy } from "hadi-march/lazy";
import { factor, rank, unreliable, overlaps } from "../bench/core.ts";
import { LIBS, BASELINE, libById } from "../bench/libs.ts";
import { FRAME_MS } from "../bench/scenarios/core.ts";
import { SCENARIOS, scenarioById } from "../bench/scenarios/list.ts";
import { SCENARIO_LIBS } from "../bench/scenarios/libs.ts";
import { runScenarios, BUSY_MS, type ScenarioRun, type ScenarioProgress } from "../bench/scenarios/runner.ts";
import { Demo } from "../demo.tsx";

const DemoCode = lazy(() => import("../demo-code.tsx"), { placeholder: "text", height: "16rem" })
const ms = (x: number): string => (Number.isFinite(x) ? (x >= 100 ? x.toFixed(0) : x.toFixed(1)) : "—")
const p95 = (xs: number[]): number => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * 0.95))]! : NaN }

function Choice(props: { label: string; value: string; set: (v: string) => void; options: { value: string; label: string }[] }) {
  return <div class="bt-pick" role="group" aria-label={props.label}>{props.options.map((o) => <Chip selected={() => props.value === o.value} onClick={() => props.set(o.value)}>{o.label}</Chip>)}</div>
}

export default function BenchScenarios() {
  let $libs: string[] = LIBS.map((l) => l.id)
  let $scen: string[] = SCENARIOS.map((s) => s.id)
  let $large = false
  let $running = false
  let $progress: ScenarioProgress | null = null
  let $result: ScenarioRun | null = null
  let $view = SCENARIOS[0]!.id
  let $codeScen = SCENARIOS[0]!.id
  let $codeLib = "march"
  let $sources: Record<string, Record<string, string>> | null = null
  let stage!: HTMLDivElement
  let ctrl: AbortController | null = null
  const toggle = (list: string[], id: string): string[] => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id])

  const start = async () => {
    if ($running) { ctrl?.abort(); return }
    const scenarios = SCENARIOS.filter((s) => $scen.includes(s.id))
    if (!scenarios.length || !$libs.length) { toast("En az bir senaryo ve bir kitaplık seç", { kind: "warn" }); return }
    ctrl = new AbortController()
    $running = true; $result = null
    if (!$scen.includes($view)) $view = scenarios[0]!.id
    try { $result = await runScenarios({ scenarios, libs: LIBS.map((l) => l.id).filter((id) => $libs.includes(id)), stage, large: $large, signal: ctrl.signal, onProgress: (p) => { $progress = p } }) }
    finally { $running = false; $progress = null; ctrl = null }
  }
  const pct = () => ($progress && $progress.total ? Math.round(($progress.done / $progress.total) * 100) : 0)
  const rows = () => {
    const per = $result?.results[$view] ?? {}
    return rank(Object.entries(per).map(([id, r]) => ({ id, ...r })))
  }
  const base = () => $result?.results[$view]?.[BASELINE]?.stats.median ?? NaN
  const loadSources = () => { if (!$sources) void fetch("bench/scenario-sources.json").then((r) => r.json()).then((x: Record<string, Record<string, string>>) => { $sources = x }, () => { $sources = {} }) }

  return <>
    <Demo wide title="Gerçekçi senaryolar" desc="Kanonik işlemlerden ayrı: büyük bir sayfada küçük ve sık değişiklikler. Her kitaplık senaryoyu kendi önerilen en iyi kalıbıyla yazdı (React'te memo ve satıra bölünmüş durum, Vue'da satır bileşeni ve reactive, vanilla'da elle önbelleğe alınmış hücreler). Her adım bir karenin başında çağrılır ve o karenin boyamasına kadar ölçülür; 16,7 ms'yi aşan kare düşen karedir.">
      <div class="bt-controls">
        <div class="bt-pick" role="group" aria-label="Senaryolar">
          {SCENARIOS.map((s) => <Chip selected={() => $scen.includes(s.id)} onClick={() => { $scen = toggle($scen, s.id) }}>{s.label}</Chip>)}
        </div>
        <div class="bt-pick" role="group" aria-label="Kitaplıklar">
          {LIBS.map((l) => <Chip selected={() => $libs.includes(l.id)} onClick={() => { $libs = toggle($libs, l.id) }}>{l.name}</Chip>)}
        </div>
        <div class="bt-pick" role="group" aria-label="Boyut">
          <Chip selected={() => !$large} onClick={() => { $large = false }}>Varsayılan boyut</Chip>
          <Chip selected={() => $large} onClick={() => { $large = true }}>Büyük boyut</Chip>
        </div>
        <div class="bt-run"><Button variant={$running ? "secondary" : "primary"} onClick={start}>{$running ? "Durdur" : "Senaryoları başlat"}</Button></div>
      </div>
      <div class="bt-status" aria-live="polite">
        <Progress value={pct()} max={100} label="Senaryo ilerlemesi" />
        <p class="bt-status-text">{$progress ? `${scenarioById($progress.scenario)?.label ?? ""} · ${libById($progress.lib)?.name ?? ""} · %${pct()}` : $result ? "Senaryolar bitti." : "Hazır."}</p>
      </div>
      <ul class="bt-method">{SCENARIOS.map((s) => <li><strong>{s.label}:</strong> {s.desc}{s.large ? <> <em>Büyük boyut ({s.large.label}):</em> {s.large.note}</> : null}</li>)}</ul>
      <p class="bt-empty">Varsayılan boyut kitaplığın kendi işini ölçecek kadar büyüktür; büyük boyutta tarayıcının stil, yerleşim ve boyama işi baskınlaşır.</p>
      <div class="bt-stage" ref={(el: HTMLDivElement) => { stage = el }} aria-hidden="true" />
    </Demo>

    <Demo wide title="Senaryo sonuçları" desc="Kare süresinin medyanı (işlem + stil + yerleşim + boyama), %95'lik dilim ve düşen kare sayısı; katsayı vanilla JS'e göredir. Kurulum: sayfanın kurulup ilk kez boyanması (kitaplık kodu önceden inmiş). Bellek: kurulan sayfanın JS yığını artışı (yalnız performance.memory veren tarayıcılarda, kaba).">
      {() => $result ? <div class="bt-results">
        <Choice label="Senaryo" value={$view} set={(v) => { $view = v }} options={SCENARIOS.filter((s) => $result!.results[s.id]).map((s) => ({ value: s.id, label: s.label }))} />
        {() => $result!.busy.includes($view) ? <p class="bt-warn" role="status">Makine meşgul: bu senaryodan önce boş bir kare bile {BUSY_MS} ms'den uzun sürdü ve beklemek düzeltmedi (başka bir program çalışıyor). Sonuçlar güvenilir değil; diğer uygulamaları kapatıp yeniden çalıştır.</p> : null}
        {() => { const bad = rows().filter((x) => unreliable(x.stats)).map((x) => libById(x.id)?.name ?? x.id); return bad.length ? <p class="bt-warn" role="status">Sonuç güvenilir değil, makine meşgul: {bad.join(", ")} için sapma ya da güven aralığı medyanın %15'inden büyük.</p> : null }}
        <div class="bt-table-wrap">
          <table class="hm-table bt-table">
            <thead><tr><th scope="col">Kitaplık</th><th scope="col">Kare (medyan)</th><th scope="col">%95</th><th scope="col">Düşen kare</th><th scope="col">Katsayı</th><th scope="col">Kurulum</th><th scope="col">Bellek</th></tr></thead>
            <tbody>{rows().map((x) => <tr>
              <th scope="row">{libById(x.id)?.name ?? x.id}</th>
              <td title={x.error ?? undefined}>{x.error ? "hata" : `${ms(x.stats.median)} ms`}</td>
              <td>{ms(p95(x.samples))} ms</td>
              <td>{x.dropped} / {x.samples.length}</td>
              <td>{Number.isFinite(base()) ? `×${factor(x.stats.median, base()).toFixed(2)}` : "—"}{x !== rows()[0] && !x.error && rows()[0] && overlaps(x.stats, rows()[0]!.stats) ? <span class="bt-factor" title="%95 güven aralığı en hızlıyla örtüşüyor"> · fark gürültü içinde</span> : null}</td>
              <td>{x.mountMs !== undefined ? `${ms(x.mountMs)} ms` : "—"}</td>
              <td>{x.heapMB !== undefined ? `${x.heapMB.toFixed(1)} MB` : "—"}</td>
            </tr>)}</tbody>
          </table>
        </div>
        <p class="bt-empty">Bir kare {ms(FRAME_MS)} ms'lik bütçeyi aşarsa 60 fps'te düşer. Ortak tarayıcı işi (stil, yerleşim, boyama) her kitaplıkta aynıdır; farklar kitaplığın kendi işinden gelir.</p>
      </div> : <p class="bt-empty">Henüz sonuç yok.</p>}
    </Demo>

    <Demo wide title="Senaryo kodu" desc="Her kitaplığın senaryo uygulaması; ölçülen kod tam olarak bu.">
      <div class="bt-code" ref={() => loadSources()}>
        <Choice label="Senaryo" value={$codeScen} set={(v) => { $codeScen = v }} options={SCENARIOS.map((s) => ({ value: s.id, label: s.label }))} />
        <Choice label="Kitaplık" value={$codeLib} set={(v) => { $codeLib = v }} options={LIBS.filter((l) => SCENARIO_LIBS[l.id]).map((l) => ({ value: l.id, label: l.name }))} />
        {() => {
          const all = $sources, src = all?.[$codeScen]?.[$codeLib] ?? "", lang = $codeLib === "svelte" ? "html" : "tsx"
          return all ? untrack(() => <DemoCode source={src.trim()} lang={lang} />) : <p class="bt-empty">Yükleniyor…</p>
        }}
      </div>
    </Demo>
  </>
}
