// Speed › Comparison: the same table app written for several UI libraries, measured live in the visitor's own
// browser. Each library's app is a lazy chunk (src/bench/apps/*) fetched only when its test runs; all of them run one
// after another on the same page, each in its own host element (no iframe: the CSP has no frame-src).
// Tabs (kept in ?tab=): basic tests · realistic scenarios · download size · method. A test tab is a sticky settings
// panel beside a live result area (src/bench/ui.tsx); only the presentation lives here, the measurement is in src/bench.
import { Button, Tabs, Disclosure, toast } from "hadi-march/ui"
import { ChoicePicker } from "hadi-march/forms"
import { lazy } from "hadi-march/lazy"
import { t, untrack } from "hadi-march"
import { query, setQuery } from "hadi-march/router"
import { appUrl } from "hadi-march/base"
import { play, x as stopIcon, copy as copyIcon, download as downloadIcon, link as linkIcon } from "hadi-march/icons"
import { OPS, stats, factor, rank, unreliable, encodeResult, decodeResult, type RunResult, type Stats } from "../bench/core.ts"
import { LIBS, BASELINE, libById } from "../bench/libs.ts"
import { runBench, type Progress as RunProgress } from "../bench/runner.ts"
import { busy, Split, Group, Toggles, AllNone, Bars, Unsure, Preview, Status, libItems, ms, kb, type BarRow } from "../bench/ui.tsx"
import "./bench.css"

const DemoCode = lazy(() => import("../demo-code.tsx"), { placeholder: "text", height: "16rem" })
// the realistic scenarios: their own lazy part (and every app a chunk of its own)
const Scenarios = lazy(() => import("../bench/scenarios-section.tsx"), { placeholder: "text", height: "24rem" })

interface FileSize { raw: number; gzip: number }
interface License { name: string; version: string; license: string; text: string }

const PHASE: Record<RunProgress["phase"], string> = { load: "yükleniyor", warm: "ısınma", run: "ölçülüyor", cool: "soğuma ve bellek toplama", paused: "duraklatıldı: sekme gizli" }
const LIB_IDS = LIBS.map((l) => l.id)
const opLabel = (id: string): string => t(OPS.find((o) => o.id === id)?.label ?? id)
const libName = (id: string): string => libById(id)?.name ?? id

/** Plain-text summary for the clipboard. */
function summary(r: RunResult): string {
  const lines = [`${t("Hız karşılaştırması")} · ${r.date.slice(0, 10)} · ${r.env.ua}`, t("Tekrar: {0}, değer: medyan ms (vanilla JS'e göre katsayı)", { 0: r.reps })]
  for (const op of OPS) {
    const list = rank(Object.keys(r.samples).filter((l) => r.samples[l]?.[op.id]?.length).map((l) => ({ l, stats: stats(r.samples[l]![op.id]!) })))
    if (!list.length) continue
    const base = r.samples[BASELINE]?.[op.id]
    const b = base?.length ? stats(base).median : NaN
    lines.push(`${t(op.label)}: ${list.map((x) => `${libName(x.l)} ${ms(x.stats.median)}${Number.isFinite(b) ? ` (×${factor(x.stats.median, b).toFixed(2)})` : ""}`).join(", ")}`)
  }
  return lines.join("\n")
}

/** The method, as short cards (title + one paragraph) instead of one long list. */
const METHOD: { title: string; text: string }[] = [
  { title: "Uygulama", text: "4 sütunlu tablo (kimlik, etiket, seçme ve silme bağlantısı). Satırlar her kitaplık için aynı tohumdan üretilir. Kitaplık kodları kendi önerilen kalıbıyla yazıldı (anahtarlı liste, satır başına bağlama); Kod bölümünde hepsi görünür." },
  { title: "Süre", text: "İşlem çağrısından hemen önce saat alınır; sonra bir requestAnimationFrame ve onun içinden gönderilen bir mesaj beklenir. Mesaj, işlemden sonraki ilk boyamanın hemen ardından gelir. Satır seç ve sil, satırdaki bağlantıya gerçek bir tıklama olayıyla yapılır." },
  { title: "Hazırlık ve kontrol", text: "Her ölçümden önce hazırlık (ör. 1.000 satır kurmak) ölçülmeden yapılır ve boyanır; sonra tarayıcı izin veriyorsa çöp toplama istenir, 20 ms beklenir ve bir boyama daha beklenir. İşlemden sonra tablo kontrol edilir; işi atlayan bir uygulama hata alır, kazanmaz." },
  { title: "Isınma ve istatistik", text: "1k işlemlerde 3, 10k işlemlerde 1 ölçülmeyen tur. Sonra seçilen sayıda tekrar; medyan, ortalama, örnek standart sapması ve ortalamanın %95 güven aralığı (Student t) verilir. Sapma ya da güven aralığının yarısı medyanın %15'ini aşarsa sonuç güvenilir sayılmaz ve uyarı çıkar." },
  { title: "Sıra ve yalıtım", text: "Kitaplıklar sırayla, bu sayfada ayrı bir kapsayıcıda çalışır. Aralarında uygulama kaldırılır, tarayıcı izin veriyorsa çöp toplama istenir, sayfa boşta kalana kadar beklenir. Sekme gizlenirse test durur; gizliyken başlayan ölçüm atılıp yeniden yapılır." },
  { title: "İlk çizim, bellek, indirilen", text: "İlk çizim: kitaplık parçasının indirilmesinden boş uygulamanın ilk boyamasına kadar (ikinci çalıştırmada parça önbellektedir). Bellek: 1.000 satır sonrası JS yığını artışı; yalnız performance.memory veren tarayıcılarda ve kabadır. İndirilen: uygulamanın kitaplığıyla birlikte tek başına paketlenmiş, küçültülmüş hâlinin gzip (düzey 9) boyutu." },
  { title: "Gerçekçi senaryolar", text: "Her adım bir karenin başında çağrılır ve o karenin boyamasına kadar ölçülür (işlem + stil + yerleşim + boyama); 16,7 ms'yi aşan kare 60 fps'te düşen karedir. Kurulum: sayfanın kurulup ilk kez boyanması (kitaplık kodu önceden inmiş). Her kitaplık senaryoyu kendi önerilen kalıbıyla yazdı." },
  { title: "Kitaplığa özgü", text: "React çağrıları flushSync içinde yapılır (düğme tıklaması gibi, boyamadan önce çizilir). Svelte ve Solid derlenmiş çıktılarıyla çalışır. Sonuçlar bu cihaza ve tarayıcıya özgüdür." },
]

export default function Bench() {
  let $libs: string[] = [...LIB_IDS]
  let $ops: string[] = ["create1k"]
  let $reps = "20"
  let $running = false
  let $progress: RunProgress | null = null
  let $result: RunResult | null = null
  let $shared = false
  let $view = "create1k"
  let $follow = true
  let $order: string[] = []
  let $code = LIBS[1]!.id
  let $sizes: Record<string, FileSize> = {}
  let $sources: Record<string, string> | null = null
  let $licenses: License[] | null = null
  let $live: Record<string, Record<string, number[]>> = {}
  let stage!: HTMLDivElement
  let ctrl: AbortController | null = null

  // each app bundled alone with its library, minified, gzip -9 (tools/gen-bench.mjs)
  void fetch(appUrl("bench/sizes.json")).then((r) => (r.ok ? r.json() : null)).then((x: Record<string, FileSize> | null) => { if (x) $sizes = x }, () => {})
  // a shared link: bench?r=<deflated result>
  const shared = query().r
  if (shared) void decodeResult(shared).then((r) => { if (r) { $result = r; $shared = true; $view = OPS.find((o) => r.samples[BASELINE]?.[o.id]?.length)?.id ?? $view } else toast(t("Bağlantıdaki sonuç okunamadı"), { kind: "warn" }) })

  const start = async () => {
    if ($running) { ctrl?.abort(); return }
    const libs = LIBS.filter((l) => $libs.includes(l.id)), ops = OPS.filter((o) => $ops.includes(o.id))
    if (!libs.length || !ops.length) { toast(t("En az bir kitaplık ve bir işlem seç"), { kind: "warn" }); return }
    ctrl = new AbortController()
    $running = true; $shared = false; $live = {}; $result = null; $follow = true; $order = libs.map((l) => l.id)
    busy.set("basic")
    if (!ops.some((o) => o.id === $view)) $view = ops[0]!.id
    if (query().r) void setQuery({ r: null })
    try {
      $result = await runBench({
        libs, ops, reps: Number($reps), stage, signal: ctrl.signal,
        onProgress: (p) => { $progress = p; if ($follow && p.op && p.op !== $view && OPS.some((o) => o.id === p.op)) $view = p.op },
        onSample: (lib, op, x) => { const cur = $live[lib] ?? {}; $live = { ...$live, [lib]: { ...cur, [op]: [...(cur[op] ?? []), x] } } },
      })
    } finally { $running = false; $progress = null; ctrl = null; busy.set(null) }
  }
  // what the bars and the tables show: the finished (or shared) result, else the live samples
  const samples = (): Record<string, Record<string, number[]>> => $result?.samples ?? $live
  const libsIn = (): string[] => LIB_IDS.filter((id) => samples()[id] && Object.keys(samples()[id]!).length)
  const opsIn = () => OPS.filter((o) => libsIn().some((l) => samples()[l]?.[o.id]?.length) || ($running && $ops.includes(o.id)))
  const statOf = (lib: string, op: string): Stats | null => { const xs = samples()[lib]?.[op]; return xs?.length ? stats(xs) : null }
  const base = (op: string): number => statOf(BASELINE, op)?.median ?? NaN
  const ranked = () => rank(libsIn().map((id) => ({ id, stats: statOf(id, $view) ?? stats([]), error: $result?.errors[id]?.[$view] ?? $result?.errors[id]?.load })))
    .filter((x) => x.stats.n)
  // one bar per library of this run (or of the result): waiting, being measured, or its median so far
  const barRows = (): BarRow[] => {
    const ids = $running ? $order : libsIn()
    const at = $progress ? $order.indexOf($progress.lib) : -1
    return ids.map((id, i) => {
      const s = statOf(id, $view), err = $result?.errors[id]?.[$view] ?? $result?.errors[id]?.load
      const state: BarRow["state"] = !$running ? "done" : i < at ? "done" : i === at ? "run" : "wait"
      return { id, name: libName(id), value: s ? s.median : NaN, text: s ? `${ms(s.median)} ms` : "—", factor: s ? factor(s.median, base($view)) : undefined, warn: s ? state === "done" && unreliable(s) : false, error: err, state }
    })
  }
  // only finished libraries: a library being measured has too few samples to judge
  const unsure = (): string[] => barRows().filter((r) => r.warn).map((r) => r.name)

  const copy = async (text: string, done: string) => {
    try { await navigator.clipboard.writeText(text); toast(done, { kind: "success" }) } catch { toast(t("Pano kullanılamadı"), { kind: "warn" }) }
  }
  const download = () => {
    if (!$result) return
    const a = document.createElement("a")
    a.href = URL.createObjectURL(new Blob([JSON.stringify($result, null, 2)], { type: "application/json" }))
    a.download = `hiz-karsilastirmasi-${$result.date.slice(0, 10)}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }
  const share = async () => {
    if (!$result) return
    const r = await encodeResult($result)
    const url = `${appUrl("bench")}?r=${r}`
    await copy(url, t("Paylaşılabilir bağlantı kopyalandı"))
    void setQuery({ r })
  }
  const loadSources = () => { if (!$sources) void fetch(appUrl("bench/sources.json")).then((r) => r.json()).then((x: Record<string, string>) => { $sources = x }, () => { $sources = {} }) }
  const loadLicenses = () => { if (!$licenses) void fetch(appUrl("bench/licenses.json")).then((r) => r.json()).then((x: License[]) => { $licenses = x }, () => { $licenses = [] }) }
  const pct = () => ($progress && $progress.total ? Math.round(($progress.done / $progress.total) * 100) : 0)
  const statusText = (): string => $progress
    ? `${libName($progress.lib)} · ${opLabel($progress.op)} · ${t(PHASE[$progress.phase])} · %${pct()}`
    : $result ? ($shared ? t("Paylaşılan bir sonuç gösteriliyor.") : t("Test bitti.")) : t("Hazır. Kitaplıkları ve işlemleri seç, sonra başlat.")

  const panel = () => <>
    <Group title={t("Kitaplıklar")} aside={<AllNone all={() => { $libs = [...LIB_IDS] }} none={() => { $libs = [] }} disabled={() => $running} />}>
      <Toggles items={libItems()} value={() => $libs} set={(v) => { $libs = v }} disabled={() => $running} />
    </Group>
    <Group title={t("İşlemler")} aside={<AllNone all={() => { $ops = OPS.map((o) => o.id) }} none={() => { $ops = [] }} disabled={() => $running} />}>
      <Toggles cols={2} items={OPS.map((o) => ({ id: o.id, label: t(o.label), hint: t(o.desc) }))} value={() => $ops} set={(v) => { $ops = v }} disabled={() => $running} />
    </Group>
    <Group title={t("Tekrar")}>
      <ChoicePicker aria-label={t("Tekrar sayısı")} bind:value={$reps} disabled={$running} options={["10", "20", "30"].map((v) => ({ value: v, label: t("{0} tekrar", { 0: v }) }))} />
    </Group>
    <Button class="bt-go" size="lg" block variant={$running ? "secondary" : "primary"} icon={$running ? stopIcon : play} onClick={start}>{$running ? t("Durdur") : t("Testi başlat")}</Button>
    <Status pct={pct} text={statusText} running={() => $running} />
  </>

  const basic = () => <div class="bt-tab">
    <Split title={t("Test ayarları")} summary={() => t("{0} kitaplık · {1} işlem · {2} tekrar", { 0: $libs.length, 1: $ops.length, 2: $reps })} panel={panel()}>
      <header class="bt-live-head">
        <h2 class="bt-live-title">{t("Sonuçlar")}</h2>
        <p class="bt-live-sub">{t("Medyan süre; kısa çubuk daha hızlı. Katsayı vanilla JS'e göre: ×1.00 aynı süre, ×2.00 iki katı.")}</p>
      </header>
      {() => opsIn().length > 1 ? <ChoicePicker aria-label={t("Gösterilen işlem")} kind="chips" value={$view} onChange={(v: unknown) => { $view = String(v); $follow = false }} options={opsIn().map((o) => ({ value: o.id, label: t(o.label) }))} /> : null}
      <Unsure names={unsure} />
      <Bars ids={LIB_IDS} rows={barRows} label={() => t("{0}: medyan süre", { 0: opLabel($view) })} />
      {() => (!barRows().length ? <p class="bt-empty">{t("Henüz sonuç yok. Testi başlatınca kitaplıklar burada canlı olarak sıralanır.")}</p> : null)}
      <Preview stage={(el) => { stage = el }} running={() => $running} caption={() => ($progress ? `${libName($progress.lib)} · ${opLabel($progress.op)}` : t("bekliyor"))} />
      {() => ranked().length ? <div class="bt-table-wrap">
        <table class="hm-table bt-table">
          <caption class="bt-caption">{t("{0}: ayrıntı", { 0: opLabel($view) })}</caption>
          <thead><tr><th scope="col">{t("Kitaplık")}</th><th scope="col">{t("Medyan")}</th><th scope="col">{t("Ortalama ± sapma")}</th><th scope="col">{t("%95 güven aralığı")}</th><th scope="col">n</th><th scope="col">{t("Katsayı")}</th></tr></thead>
          <tbody>{ranked().map((x) => <tr>
            <th scope="row">{libName(x.id)}</th>
            <td>{ms(x.stats.median)} ms</td>
            <td>{ms(x.stats.mean)} ± {ms(x.stats.sd)}</td>
            <td>{ms(x.stats.ci[0])}–{ms(x.stats.ci[1])}</td>
            <td>{x.stats.n}</td>
            <td>{Number.isFinite(base($view)) ? `×${factor(x.stats.median, base($view)).toFixed(2)}` : "—"}</td>
          </tr>)}</tbody>
        </table>
      </div> : null}
      {() => libsIn().length ? <Disclosure class="bt-more" title={t("Tüm işlemler, ilk çizim, bellek ve indirme boyutu")}>
        <div class="bt-table-wrap">
          <table class="hm-table bt-table">
            <thead><tr><th scope="col">{t("Kitaplık")}</th>{opsIn().map((o) => <th scope="col">{t(o.label)}</th>)}<th scope="col">{t("İlk çizim")}</th><th scope="col">{t("Bellek (1.000 satır)")}</th><th scope="col">{t("İndirilen (gzip)")}</th></tr></thead>
            <tbody>{libsIn().map((id) => <tr>
              <th scope="row">{libName(id)}</th>
              {opsIn().map((o) => { const s = statOf(id, o.id), err = $result?.errors[id]?.[o.id]; return <td title={err ?? undefined}>{err ? t("hata") : s ? `${ms(s.median)} ms` : "—"}{s && Number.isFinite(base(o.id)) ? <span class="bt-sub"> ×{factor(s.median, base(o.id)).toFixed(2)}</span> : null}</td> })}
              <td>{$result?.firstPaint[id] !== undefined ? `${ms($result.firstPaint[id]!)} ms` : "—"}</td>
              <td>{$result?.memory[id] !== undefined ? `${$result.memory[id]!.toFixed(1)} MB` : "—"}</td>
              <td>{$sizes[id] ? kb($sizes[id]!.gzip) : "—"}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </Disclosure> : null}
      {() => $result ? <div class="bt-env">
        <p><strong>{t("Cihaz ve tarayıcı:")}</strong> {$result.env.ua}</p>
        <p>{$result.env.cores ? `${t("{0} çekirdek", { 0: $result.env.cores })} · ` : ""}{$result.env.memory ? `${t("{0} GB bellek", { 0: $result.env.memory })} · ` : ""}{$result.env.screen ?? ""}{$result.env.dpr ? ` · ${t("piksel oranı {0}", { 0: $result.env.dpr })}` : ""} · {new Date($result.date).toLocaleString()}</p>
        <div class="bt-actions">
          <Button variant="secondary" size="sm" icon={copyIcon} onClick={() => copy($result ? summary($result) : "", t("Sonuçlar kopyalandı"))}>{t("Sonuçları kopyala")}</Button>
          <Button variant="secondary" size="sm" icon={downloadIcon} onClick={download}>{t("JSON indir")}</Button>
          <Button variant="secondary" size="sm" icon={linkIcon} onClick={share}>{t("Paylaşılabilir bağlantı")}</Button>
        </div>
      </div> : null}
    </Split>
    <section class="bt-block" aria-labelledby="bt-code-h">
      <header class="bt-block-head"><h2 class="bt-block-title" id="bt-code-h">{t("Kod")}</h2><p class="bt-block-desc">{t("Her kitaplığın test uygulaması; ölçülen kod tam olarak bu.")}</p></header>
      <div class="bt-code" ref={() => loadSources()}>
        <ChoicePicker aria-label={t("Kitaplık")} kind="chips" bind:value={$code} options={LIBS.map((l) => ({ value: l.id, label: l.name }))} />
        {() => {
          // read the choice here: the code view takes its source once, so a new choice draws a new view
          const id = $code, all = $sources
          return all ? untrack(() => <DemoCode source={(all[id] ?? "").trim()} lang={id === "svelte" ? "html" : "tsx"} />) : <p class="bt-empty">{t("Yükleniyor…")}</p>
        }}
      </div>
    </section>
  </div>

  // download size: the same bars, smallest first
  const sizeRows = (): BarRow[] => LIB_IDS.filter((id) => $sizes[id]).map((id) => ({ id, name: libName(id), value: $sizes[id]!.gzip, text: kb($sizes[id]!.gzip), state: "done", note: t("küçültülmüş {0}", { 0: kb($sizes[id]!.raw) }) }))
  const size = () => <div class="bt-tab">
    <section class="bt-block bt-block-card" aria-labelledby="bt-size-h">
      <header class="bt-block-head"><h2 class="bt-block-title" id="bt-size-h">{t("İndirme boyutu")}</h2>
        <p class="bt-block-desc">{t("Her test uygulaması kitaplığıyla birlikte tek başına paketlendi, küçültüldü ve gzip (düzey 9) ile sıkıştırıldı. Kısa çubuk daha az veri demek.")}</p></header>
      <Bars ids={LIB_IDS} rows={sizeRows} label={t("gzip boyutu")} best={t("En küçük")} />
      {() => (!sizeRows().length ? <p class="bt-empty">{t("Yükleniyor…")}</p> : null)}
    </section>
  </div>

  const method = () => <div class="bt-tab">
    <div class="bt-method">{METHOD.map((m) => <article class="bt-method-card"><h3>{t(m.title)}</h3><p>{t(m.text)}</p></article>)}</div>
    <section class="bt-block" aria-labelledby="bt-lic-h">
      <header class="bt-block-head"><h2 class="bt-block-title" id="bt-lic-h">{t("Lisanslar")}</h2><p class="bt-block-desc">{t("Karşılaştırılan kitaplıklar bu sayfa için paketlenir; lisans metinleri aşağıda.")}</p></header>
      <div class="bt-licenses" ref={() => loadLicenses()}>
        {() => ($licenses ?? []).map((l) => <details class="bt-license">
          <summary><span>{l.name} {l.version}</span><span class="bt-license-kind">{l.license}</span></summary>
          <pre>{l.text}</pre>
        </details>)}
      </div>
    </section>
  </div>

  const lock = (id: string) => () => { const b = busy(); return !!b && b !== id }
  return <div class="sc-page bt-page">
    <header class="sc-page-head">
      <span class="sc-kicker">{t("Hız")}</span>
      <h1 class="sc-h1">{t("Karşılaştırma")}</h1>
      <p class="sc-lead">{t("HADI March'ı React, Vue, Svelte, Solid, Preact, Lit ve vanilla JS ile senin tarayıcında, canlı ölçer; sonuçlar bu cihaza özgüdür.")}</p>
    </header>
    <Tabs class="bt-tabs" query="tab" label={t("Karşılaştırma bölümleri")} tabs={[
      { id: "basic", label: t("Temel testler"), disabled: lock("basic"), content: basic },
      { id: "scenarios", label: t("Gerçekçi senaryolar"), disabled: lock("scenarios"), content: () => <Scenarios /> },
      { id: "size", label: t("Boyut"), disabled: lock("size"), content: size },
      { id: "method", label: t("Yöntem"), disabled: lock("method"), content: method },
    ]} />
  </div>
}
