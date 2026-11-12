// Speed › Comparison › "Gerçekçi senaryolar": realistic workloads (small, frequent updates on a large page), kept apart
// from the canonical operations. Its own lazy part of the benchmark page; every library's app is a lazy chunk too.
// The state lives in this module, so a run's result is still there after a visit to another tab.
import { appUrl } from "hadi-march/base"
import { Button, Disclosure, toast } from "hadi-march/ui"
import { ChoicePicker } from "hadi-march/forms"
import { signal, t, untrack } from "hadi-march"
import { lazy } from "hadi-march/lazy"
import { play, x as stopIcon } from "hadi-march/icons"
import { factor, rank, unreliable, overlaps } from "./core.ts"
import { LIBS, BASELINE, libById } from "./libs.ts"
import { FRAME_MS } from "./scenarios/core.ts"
import { SCENARIOS, scenarioById } from "./scenarios/list.ts"
import { SCENARIO_LIBS } from "./scenarios/libs.ts"
import { runScenarios, BUSY_MS, type ScenarioResult, type ScenarioProgress } from "./scenarios/runner.ts"
import { busy, Split, Group, Toggles, AllNone, Bars, Unsure, Preview, Status, libItems, ms, p95, type BarRow } from "./ui.tsx"

const DemoCode = lazy(() => import("../demo-code.tsx"), { placeholder: "text", height: "16rem" })

/** What a scenario card says in one line, and whether the workload suits HADI March (fine-grained updates) or not. */
type Tilt = "pro" | "con" | "even"
const CARD: Record<string, { summary: string; tilt: Tilt; why: string }> = {
  ticker: { summary: "2.000 satırlık fiyat tablosunda her karede birkaç satırın fiyatı ve rengi değişir.", tilt: "pro", why: "Dar değişiklik: yalnız değişen hücreye dokunulur." },
  tree: { summary: "11.110 düğümlü bir ağaçta her karede en alttaki tek bir yaprak değişir.", tilt: "pro", why: "Dar değişiklik: ağacın geri kalanı yeniden çizilmez." },
  derived: { summary: "Tek bir alan değişince ona bağlı hesaplanan değerler yenilenir.", tilt: "pro", why: "Türetilmiş değerler yalnız bağımlılığı değişince yeniden hesaplanır." },
  counters: { summary: "2.000 bağımsız sayaçtan her karede yaklaşık 500'ü birer artar.", tilt: "pro", why: "Her sayacın kendi durumu var; değişmeyenler hiç çalışmaz." },
  theme: { summary: "En üstte verilen vurgu rengi her karede değişir; yalnız rozetler onu okur.", tilt: "pro", why: "Bileşenler değil, yalnız değeri okuyan düğümler güncellenir." },
  hover: { summary: "10.000 satırlık tabloda vurgulanan satır her karede bir sonrakine geçer.", tilt: "pro", why: "Her karede yalnız iki satır değişir." },
  store: { summary: "Paylaşılan bir depodan beslenen 1.000 hücreden her karede 50'si değişir.", tilt: "con", why: "Depo okuması yol dizisi kurar; yazma sürüm sinyallerini de günceller." },
  deep: { summary: "4 katlı bileşen ağacında en üstteki durum değişir; yalnız birkaç öğe etkilenir.", tilt: "pro", why: "Bileşen sınırı güncellemeyi büyütmez; yalnız değeri okuyan öğe değişir." },
  grid: { summary: "2.000 kayıtlık tabloda arama, süzgeç, sıralama ve seçim yapılır.", tilt: "con", why: "Satır başına seçim sinyalleri kurulum süresini ve belleği artırır." },
  startup: { summary: "Küçük bir uygulama sayfası her karede sıfırdan kurulur ve ilk etkileşimi alır.", tilt: "even", why: "Açılış işi kitaplıklar arasında gürültü içinde; asıl fark indirme boyutu." },
}
const TILT: Record<Tilt, string> = { pro: "March lehine", con: "March aleyhine", even: "Dengeli" }

const ALL_LIBS = LIBS.map((l) => l.id).filter((id) => SCENARIO_LIBS[id])
// module state: survives switching tabs
const libsSig = signal<string[]>(ALL_LIBS)
const scenSig = signal<string[]>(SCENARIOS.map((s) => s.id))
const sizeSig = signal("default")
const runningSig = signal(false)
const progressSig = signal<ScenarioProgress | null>(null)
const resultsSig = signal<Record<string, Record<string, ScenarioResult>>>({})
const orderSig = signal<string[]>([])
// scenarios that ran while the machine stayed busy (an empty frame slower than BUSY_MS, even after waiting)
const busyScenSig = signal<string[]>([])
const viewSig = signal(SCENARIOS[0]!.id)
let follow = true
const codeScenSig = signal(SCENARIOS[0]!.id)
const codeLibSig = signal("march")
const sourcesSig = signal<Record<string, Record<string, string>> | null>(null)
let ctrl: AbortController | null = null
const libName = (id: string): string => libById(id)?.name ?? id
const scenLabel = (id: string): string => t(scenarioById(id)?.label ?? id)

export default function BenchScenarios() {
  let stage!: HTMLDivElement

  const start = async () => {
    if (runningSig()) { ctrl?.abort(); return }
    const scenarios = SCENARIOS.filter((s) => scenSig().includes(s.id)), libs = ALL_LIBS.filter((id) => libsSig().includes(id))
    if (!scenarios.length || !libs.length) { toast(t("En az bir senaryo ve bir kitaplık seç"), { kind: "warn" }); return }
    ctrl = new AbortController()
    follow = true
    runningSig.set(true); resultsSig.set({}); busyScenSig.set([]); orderSig.set(libs); busy.set("scenarios")
    if (!scenSig().includes(viewSig())) viewSig.set(scenarios[0]!.id)
    try {
      const run = await runScenarios({
        scenarios, libs, stage, large: sizeSig() === "large", signal: ctrl.signal,
        onProgress: (p) => { progressSig.set(p); if (follow && p.scenario !== viewSig()) viewSig.set(p.scenario) },
        onResult: (sc, lib, r) => { const all = resultsSig(); resultsSig.set({ ...all, [sc]: { ...all[sc], [lib]: r } }) },
      })
      busyScenSig.set(run.busy)
    } finally { runningSig.set(false); progressSig.set(null); ctrl = null; busy.set(null) }
  }
  const pct = () => { const p = progressSig(); return p && p.total ? Math.round((p.done / p.total) * 100) : 0 }
  const per = (): Record<string, ScenarioResult> => resultsSig()[viewSig()] ?? {}
  const rows = () => rank(Object.entries(per()).map(([id, r]) => ({ id, ...r })))
  const base = (): number => per()[BASELINE]?.stats.median ?? NaN
  const barRows = (): BarRow[] => {
    const p = progressSig(), running = runningSig(), here = per()
    const ids = running ? orderSig() : ALL_LIBS.filter((id) => here[id])
    const runningHere = running && p?.scenario === viewSig()
    return ids.map((id) => {
      const r = here[id]
      const state: BarRow["state"] = r ? "done" : runningHere && p?.lib === id ? "run" : "wait"
      return { id, name: libName(id), value: r ? r.stats.median : NaN, text: r ? `${ms(r.stats.median)} ms` : "—", factor: r ? factor(r.stats.median, base()) : undefined, warn: r ? unreliable(r.stats) : false, error: r?.error, state,
        note: r && !r.error ? t("{0} / {1} kare düştü", { 0: r.dropped, 1: r.samples.length }) : undefined }
    })
  }
  const loadSources = () => { if (!sourcesSig()) void fetch(appUrl("bench/scenario-sources.json")).then((r) => r.json()).then((x: Record<string, Record<string, string>>) => { sourcesSig.set(x) }, () => { sourcesSig.set({}) }) }
  const statusText = (): string => { const p = progressSig(); return p ? `${scenLabel(p.scenario)} · ${libName(p.lib)} · %${pct()}` : Object.keys(resultsSig()).length ? t("Senaryolar bitti.") : t("Hazır. Senaryoları ve kitaplıkları seç, sonra başlat.") }
  const shown = () => SCENARIOS.filter((s) => resultsSig()[s.id] || (runningSig() && scenSig().includes(s.id)))

  const panel = <>
    <Group title={t("Senaryo")} aside={<AllNone all={() => scenSig.set(SCENARIOS.map((s) => s.id))} none={() => scenSig.set([])} disabled={runningSig} />}>
      <Toggles cols={2} items={SCENARIOS.map((s) => ({ id: s.id, label: t(s.label), hint: t(CARD[s.id]?.summary ?? "") }))} value={scenSig} set={(v) => scenSig.set(v)} disabled={runningSig} />
    </Group>
    <Group title={t("Kitaplıklar")} aside={<AllNone all={() => libsSig.set(ALL_LIBS)} none={() => libsSig.set([])} disabled={runningSig} />}>
      <Toggles items={libItems((id) => !!SCENARIO_LIBS[id])} value={libsSig} set={(v) => libsSig.set(v)} disabled={runningSig} />
    </Group>
    <Group title={t("Boyut")}>
      <ChoicePicker aria-label={t("Sayfa boyutu")} kind="segmented" value={sizeSig()} onChange={(v: unknown) => sizeSig.set(String(v))} disabled={runningSig()} options={[{ value: "default", label: t("Varsayılan") }, { value: "large", label: t("Büyük") }]} />
      <p class="bt-hint">{t("Varsayılan boyut kitaplığın kendi işini ölçecek kadar büyüktür; büyük boyutta tarayıcının stil, yerleşim ve boyama işi baskınlaşır.")}</p>
    </Group>
    <Button class="bt-go" size="lg" block variant={runningSig() ? "secondary" : "primary"} icon={runningSig() ? stopIcon : play} onClick={start}>{runningSig() ? t("Durdur") : t("Senaryoları başlat")}</Button>
    <Status pct={pct} text={statusText} running={runningSig} />
  </>

  return <div class="bt-tab">
    <Split title={t("Senaryo ayarları")} summary={() => t("{0} senaryo · {1} kitaplık · {2}", { 0: scenSig().length, 1: libsSig().length, 2: sizeSig() === "large" ? t("büyük") : t("varsayılan") })} panel={panel}>
      <header class="bt-live-head">
        <h2 class="bt-live-title">{t("Senaryo sonuçları")}</h2>
        <p class="bt-live-sub">{t("Kare süresinin medyanı (işlem + stil + yerleşim + boyama); kısa çubuk daha akıcı. {0} ms'yi aşan kare 60 fps'te düşer. Katsayı vanilla JS'e göre.", { 0: ms(FRAME_MS) })}</p>
      </header>
      {() => shown().length > 1 ? <ChoicePicker aria-label={t("Gösterilen senaryo")} kind="chips" value={viewSig()} onChange={(v: unknown) => { viewSig.set(String(v)); follow = false }} options={shown().map((s) => ({ value: s.id, label: t(s.label) }))} /> : null}
      {() => busyScenSig().includes(viewSig()) ? <p class="bt-warn" role="status">{t("Makine meşgul: bu senaryodan önce boş bir kare bile {0} ms'den uzun sürdü ve beklemek düzeltmedi (başka bir program çalışıyor). Sonuçlar güvenilir değil; diğer uygulamaları kapatıp yeniden çalıştır.", { 0: BUSY_MS })}</p> : null}
      <Unsure names={() => rows().filter((x) => unreliable(x.stats)).map((x) => libName(x.id))} />
      <Bars ids={ALL_LIBS} rows={barRows} label={() => t("{0}: kare süresi", { 0: scenLabel(viewSig()) })} best={t("En akıcı")} />
      {() => (!barRows().length ? <p class="bt-empty">{t("Henüz sonuç yok. Senaryoları başlatınca kitaplıklar burada canlı olarak sıralanır.")}</p> : null)}
      <Preview stage={(el) => { stage = el }} running={runningSig} caption={() => { const p = progressSig(); return p ? `${scenLabel(p.scenario)} · ${libName(p.lib)}` : t("bekliyor") }} />
      {() => rows().length ? <div class="bt-table-wrap">
        <table class="hm-table bt-table">
          <caption class="bt-caption">{t("{0}: ayrıntı", { 0: scenLabel(viewSig()) })}</caption>
          <thead><tr><th scope="col">{t("Kitaplık")}</th><th scope="col">{t("Kare (medyan)")}</th><th scope="col">%95</th><th scope="col">{t("Düşen kare")}</th><th scope="col">{t("Katsayı")}</th><th scope="col">{t("Kurulum")}</th><th scope="col">{t("Bellek")}</th></tr></thead>
          <tbody>{rows().map((x) => <tr>
            <th scope="row">{libName(x.id)}</th>
            <td title={x.error ?? undefined}>{x.error ? t("hata") : `${ms(x.stats.median)} ms`}</td>
            <td>{ms(p95(x.samples))} ms</td>
            <td>{x.dropped} / {x.samples.length}</td>
            <td>{Number.isFinite(base()) ? `×${factor(x.stats.median, base()).toFixed(2)}` : "—"}{x !== rows()[0] && !x.error && rows()[0] && overlaps(x.stats, rows()[0]!.stats) ? <span class="bt-factor bt-noise" title={t("%95 güven aralığı en hızlıyla örtüşüyor")}>{t("fark gürültü içinde")}</span> : null}</td>
            <td>{x.mountMs !== undefined ? `${ms(x.mountMs)} ms` : "—"}</td>
            <td>{x.heapMB !== undefined ? `${x.heapMB.toFixed(1)} MB` : "—"}</td>
          </tr>)}</tbody>
        </table>
      </div> : null}
    </Split>

    <section class="bt-block" aria-labelledby="bt-scen-h">
      <header class="bt-block-head"><h2 class="bt-block-title" id="bt-scen-h">{t("Senaryolar")}</h2>
        <p class="bt-block-desc">{t("Büyük bir sayfada küçük ve sık değişiklikler. Her kitaplık senaryoyu kendi önerilen en iyi kalıbıyla yazdı; etiket, iş yükünün HADI March'ın tasarımına uyup uymadığını gösterir.")}</p></header>
      <div class="bt-cards">{SCENARIOS.map((s) => { const c = CARD[s.id] ?? { summary: "", tilt: "even" as Tilt, why: "" }; return <article class="bt-card">
        <header class="bt-card-head"><h3 class="bt-card-title">{t(s.label)}</h3><span class={`bt-tilt bt-tilt-${c.tilt}`}>{t(TILT[c.tilt])}</span></header>
        <p class="bt-card-sum">{t(c.summary)}</p>
        <p class="bt-card-why">{t(c.why)}</p>
        <Disclosure class="bt-card-more" title={t("Ayrıntı")}>
          <p>{t(s.desc)}</p>
          {s.large ? <p><strong>{t("Büyük boyut ({0}):", { 0: t(s.large.label) })}</strong> {t(s.large.note)}</p> : null}
        </Disclosure>
      </article> })}</div>
    </section>

    <section class="bt-block" aria-labelledby="bt-scode-h">
      <header class="bt-block-head"><h2 class="bt-block-title" id="bt-scode-h">{t("Senaryo kodu")}</h2><p class="bt-block-desc">{t("Her kitaplığın senaryo uygulaması; ölçülen kod tam olarak bu.")}</p></header>
      <div class="bt-code" ref={() => loadSources()}>
        <ChoicePicker aria-label={t("Senaryo")} kind="chips" value={codeScenSig()} onChange={(v: unknown) => codeScenSig.set(String(v))} options={SCENARIOS.map((s) => ({ value: s.id, label: t(s.label) }))} />
        <ChoicePicker aria-label={t("Kitaplık")} kind="chips" value={codeLibSig()} onChange={(v: unknown) => codeLibSig.set(String(v))} options={LIBS.filter((l) => SCENARIO_LIBS[l.id]).map((l) => ({ value: l.id, label: l.name }))} />
        {() => {
          const all = sourcesSig(), src = all?.[codeScenSig()]?.[codeLibSig()] ?? "", lang = codeLibSig() === "svelte" ? "html" : "tsx"
          return all ? untrack(() => <DemoCode source={src.trim()} lang={lang} />) : <p class="bt-empty">{t("Yükleniyor…")}</p>
        }}
      </div>
    </section>
  </div>
}
