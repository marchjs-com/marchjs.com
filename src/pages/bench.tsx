// Speed › Comparison: the same table app written for several UI libraries, measured live in the visitor's own
// browser. Each library's app is a lazy chunk (src/bench/apps/*) fetched only when its test runs; all of them run one
// after another on the same page, each in its own host element (no iframe: the CSP has no frame-src).
import { Button, Chip, Progress, Stack, toast } from "hadi-march/ui";
import { lazy } from "hadi-march/lazy";
import { query, setQuery } from "hadi-march/router";
import { appUrl } from "hadi-march/base";
import { OPS, stats, factor, rank, encodeResult, decodeResult, type RunResult, type Stats } from "../bench/core.ts";
import { LIBS, BASELINE, libById } from "../bench/libs.ts";
import { runBench, type Progress as RunProgress } from "../bench/runner.ts";
import { Demo, Section } from "../demo.tsx";
import "./bench.css";

const BarChart = lazy(() => import("hadi-march/charts/bar.ts"), { pick: "BarChart", when: "visible", placeholder: "chart", height: "16rem" })
const DemoCode = lazy(() => import("../demo-code.tsx"), { placeholder: "text", height: "16rem" })

interface FileSize { raw: number; gzip: number }
interface License { name: string; version: string; license: string; text: string }

const ms = (x: number): string => (Number.isFinite(x) ? (x >= 100 ? x.toFixed(0) : x.toFixed(1)) : "—")
const kb = (n: number): string => `${(n / 1024).toFixed(1)} KB`
const PHASE: Record<RunProgress["phase"], string> = { load: "yükleniyor", warm: "ısınma", run: "ölçülüyor", cool: "soğuma ve bellek toplama", paused: "duraklatıldı: sekme gizli" }

/** Gzip KB each library's chunk downloads (the build report and the chunk manifest; dev mode has neither). */
function chunkSizes(files: Record<string, FileSize>): Record<string, number> {
  let manifest: Record<string, string[]> = {}
  try { manifest = JSON.parse(document.getElementById("march-manifest")?.textContent ?? "{}") as Record<string, string[]> } catch { /* dev mode */ }
  const out: Record<string, number> = {}
  for (const lib of LIBS) {
    const list = manifest[lib.src]
    if (list) out[lib.id] = list.filter((f) => f.endsWith(".js")).reduce((s, f) => s + (files[f.replace(/^\.\//, "")]?.gzip ?? 0), 0)
  }
  return out
}

/** Plain-text summary for the clipboard. */
function summary(r: RunResult): string {
  const lines = [`Hız karşılaştırması · ${r.date.slice(0, 10)} · ${r.env.ua}`, `Tekrar: ${r.reps}, değer: medyan ms (vanilla JS'e göre katsayı)`]
  for (const op of OPS) {
    const list = rank(Object.keys(r.samples).filter((l) => r.samples[l]?.[op.id]?.length).map((l) => ({ l, stats: stats(r.samples[l]![op.id]!) })))
    if (!list.length) continue
    const base = r.samples[BASELINE]?.[op.id]
    const b = base?.length ? stats(base).median : NaN
    lines.push(`${op.label}: ${list.map((x) => `${libById(x.l)?.name ?? x.l} ${ms(x.stats.median)}${Number.isFinite(b) ? ` (×${factor(x.stats.median, b).toFixed(2)})` : ""}`).join(", ")}`)
  }
  return lines.join("\n")
}

/** A small single choice as chips (a few options, always visible). */
function Choice(props: { label: string; value: string; set: (v: string) => void; options: { value: string; label: string }[] }) {
  return <div class="bt-pick" role="group" aria-label={props.label}>{props.options.map((o) => <Chip selected={() => props.value === o.value} onClick={() => props.set(o.value)}>{o.label}</Chip>)}</div>
}

export default function Bench() {
  let $libs: string[] = LIBS.map((l) => l.id)
  let $ops: string[] = ["create1k"]
  let $reps = "5"
  let $running = false
  let $progress: RunProgress | null = null
  let $result: RunResult | null = null
  let $shared = false
  let $view = "create1k"
  let $code = LIBS[1]!.id
  let $sizes: Record<string, number> = {}
  let $sources: Record<string, string> | null = null
  let $licenses: License[] | null = null
  let $live: Record<string, Record<string, number[]>> = {}
  let stage!: HTMLDivElement
  let ctrl: AbortController | null = null

  void fetch(appUrl("march-report.json")).then((r) => (r.ok ? r.json() : null)).then((x: { files?: Record<string, FileSize> } | null) => { if (x?.files) $sizes = chunkSizes(x.files) }, () => {})
  // a shared link: #/bench?r=<deflated result>
  const shared = query().r
  if (shared) void decodeResult(shared).then((r) => { if (r) { $result = r; $shared = true; $view = OPS.find((o) => r.samples[BASELINE]?.[o.id]?.length)?.id ?? $view } else toast("Bağlantıdaki sonuç okunamadı", { kind: "warn" }) })

  const toggle = (list: string[], id: string): string[] => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
  const start = async () => {
    if ($running) { ctrl?.abort(); return }
    const libs = LIBS.filter((l) => $libs.includes(l.id)), ops = OPS.filter((o) => $ops.includes(o.id))
    if (!libs.length || !ops.length) { toast("En az bir kitaplık ve bir işlem seç", { kind: "warn" }); return }
    ctrl = new AbortController()
    $running = true; $shared = false; $live = {}; $result = null
    if (!ops.some((o) => o.id === $view)) $view = ops[0]!.id
    if (query().r) void setQuery({ r: null })
    try {
      $result = await runBench({
        libs, ops, reps: Number($reps), stage, signal: ctrl.signal,
        onProgress: (p) => { $progress = p },
        onSample: (lib, op, x) => { const cur = $live[lib] ?? {}; $live = { ...$live, [lib]: { ...cur, [op]: [...(cur[op] ?? []), x] } } },
      })
    } finally { $running = false; $progress = null; ctrl = null }
  }
  // what the chart and the table show: the finished (or shared) result, else the live samples
  const samples = (): Record<string, Record<string, number[]>> => $result?.samples ?? $live
  const libsIn = (): string[] => LIBS.map((l) => l.id).filter((id) => samples()[id] && Object.keys(samples()[id]!).length)
  const opsIn = () => OPS.filter((o) => libsIn().some((l) => samples()[l]?.[o.id]?.length))
  const statOf = (lib: string, op: string): Stats | null => { const xs = samples()[lib]?.[op]; return xs?.length ? stats(xs) : null }
  const base = (op: string): number => statOf(BASELINE, op)?.median ?? NaN
  const ranked = () => rank(libsIn().map((id) => ({ id, stats: statOf(id, $view) ?? stats([]), error: $result?.errors[id]?.[$view] ?? $result?.errors[id]?.load })))
    .filter((x) => x.stats.n)
  const bars = () => ranked().map((x) => { const f = factor(x.stats.median, base($view)); return { name: `${libById(x.id)?.name ?? x.id}${Number.isFinite(f) ? ` ×${f.toFixed(2)}` : ""}`, median: Math.round(x.stats.median * 10) / 10 } })

  const copy = async (text: string, done: string) => {
    try { await navigator.clipboard.writeText(text); toast(done, { kind: "success" }) } catch { toast("Pano kullanılamadı", { kind: "warn" }) }
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
    await copy(url, "Paylaşılabilir bağlantı kopyalandı")
    void setQuery({ r })
  }
  const loadSources = () => { if (!$sources) void fetch(appUrl("bench/sources.json")).then((r) => r.json()).then((x: Record<string, string>) => { $sources = x }, () => { $sources = {} }) }
  const loadLicenses = () => { if (!$licenses) void fetch(appUrl("bench/licenses.json")).then((r) => r.json()).then((x: License[]) => { $licenses = x }, () => { $licenses = [] }) }
  const pct = () => ($progress && $progress.total ? Math.round(($progress.done / $progress.total) * 100) : 0)

  return <Section kicker="Hız" title="Karşılaştırma" lead="Aynı tablo uygulaması her kitaplıkla ayrı yazıldı ve senin tarayıcında, bu sayfada ölçülüyor. Her kitaplığın kodu yalnız onun testi başlayınca iner; sonuçlar bu cihaza ve tarayıcıya özgüdür. Değerler işlemin başlangıcından sonraki ilk boyamaya kadar geçen süredir; küçük olan daha hızlıdır.">
    <Demo wide title="Testi başlat" desc="Kitaplıkları ve işlemleri seç. Test sırasında sekmeyi açık tut: sekme gizlenince ölçüm durur, geri gelince kaldığı yerden sürer.">
      <div class="bt-controls">
        <div class="bt-pick" role="group" aria-label="Kitaplıklar">
          {LIBS.map((l) => <Chip selected={() => $libs.includes(l.id)} onClick={() => { $libs = toggle($libs, l.id) }}>{l.name}{l.version ? ` ${l.version}` : ""}</Chip>)}
        </div>
        <div class="bt-pick" role="group" aria-label="İşlemler">
          {OPS.map((o) => <Chip selected={() => $ops.includes(o.id)} onClick={() => { $ops = toggle($ops, o.id) }}>{o.label}</Chip>)}
          <Chip tone="info" onClick={() => { $ops = $ops.length === OPS.length ? ["create1k"] : OPS.map((o) => o.id) }}>{$ops.length === OPS.length ? "Yalnız ilki" : "Tümü"}</Chip>
        </div>
        <div class="bt-run">
          <Choice label="Tekrar sayısı" value={$reps} set={(v) => { $reps = v }} options={[{ value: "3", label: "3 tekrar" }, { value: "5", label: "5 tekrar" }, { value: "10", label: "10 tekrar" }]} />
          <Button variant={$running ? "secondary" : "primary"} onClick={start}>{$running ? "Durdur" : "Testi başlat"}</Button>
        </div>
      </div>
      <div class="bt-status" aria-live="polite">
        <Progress value={pct()} max={100} label="Test ilerlemesi" />
        <p class="bt-status-text">{$progress ? `${libById($progress.lib)?.name ?? ""} · ${OPS.find((o) => o.id === $progress!.op)?.label ?? ""} · ${PHASE[$progress.phase]} · %${pct()}` : $result ? ($shared ? "Paylaşılan bir sonuç gösteriliyor." : "Test bitti.") : "Hazır."}</p>
      </div>
      <div class="bt-stage" ref={(el: HTMLDivElement) => { stage = el }} aria-hidden="true" />
    </Demo>

    <Demo wide title="Sonuçlar" desc="Seçili işlem için medyan süre, hızlıdan yavaşa. Katsayı vanilla JS'e göredir: ×1.00 aynı süre, ×2.00 iki katı.">
      {() => opsIn().length ? <div class="bt-results">
        <Choice label="İşlem" value={$view} set={(v) => { $view = v }} options={opsIn().map((o) => ({ value: o.id, label: o.label }))} />
        <BarChart data={bars()} x="name" y="median" series={{ median: "Medyan (ms)" }} horizontal height={Math.max(160, bars().length * 44)} title={OPS.find((o) => o.id === $view)?.label ?? ""} />
        <div class="bt-table-wrap">
          <table class="hm-table bt-table">
            <thead><tr><th scope="col">Kitaplık</th><th scope="col">Medyan</th><th scope="col">Ortalama ± sapma</th><th scope="col">%95 güven aralığı</th><th scope="col">n</th><th scope="col">Katsayı</th></tr></thead>
            <tbody>{ranked().map((x) => <tr>
              <th scope="row">{libById(x.id)?.name ?? x.id}</th>
              <td>{ms(x.stats.median)} ms</td>
              <td>{ms(x.stats.mean)} ± {ms(x.stats.sd)}</td>
              <td>{ms(x.stats.ci[0])}–{ms(x.stats.ci[1])}</td>
              <td>{x.stats.n}</td>
              <td>{Number.isFinite(base($view)) ? `×${factor(x.stats.median, base($view)).toFixed(2)}` : "—"}</td>
            </tr>)}</tbody>
          </table>
        </div>
        <div class="bt-table-wrap">
          <table class="hm-table bt-table">
            <thead><tr><th scope="col">Kitaplık</th>{opsIn().map((o) => <th scope="col">{o.label}</th>)}<th scope="col">İlk çizim</th><th scope="col">Bellek (1.000 satır)</th><th scope="col">İndirilen (gzip)</th></tr></thead>
            <tbody>{libsIn().map((id) => <tr>
              <th scope="row">{libById(id)?.name ?? id}</th>
              {opsIn().map((o) => { const s = statOf(id, o.id), err = $result?.errors[id]?.[o.id]; return <td title={err ?? undefined}>{err ? "hata" : s ? `${ms(s.median)} ms` : "—"}{s && Number.isFinite(base(o.id)) ? <span class="bt-factor"> ×{factor(s.median, base(o.id)).toFixed(2)}</span> : null}</td> })}
              <td>{$result?.firstPaint[id] !== undefined ? `${ms($result.firstPaint[id]!)} ms` : "—"}</td>
              <td>{$result?.memory[id] !== undefined ? `${$result.memory[id]!.toFixed(1)} MB` : "—"}</td>
              <td>{$sizes[id] !== undefined ? kb($sizes[id]!) : "—"}</td>
            </tr>)}</tbody>
          </table>
        </div>
        {() => $result ? <div class="bt-env">
          <p><strong>Cihaz ve tarayıcı:</strong> {$result.env.ua}</p>
          <p>{$result.env.cores ? `${$result.env.cores} çekirdek · ` : ""}{$result.env.memory ? `${$result.env.memory} GB bellek · ` : ""}{$result.env.screen ?? ""}{$result.env.dpr ? ` · piksel oranı ${$result.env.dpr}` : ""} · {new Date($result.date).toLocaleString()}</p>
          <Stack direction="row" gap={2} wrap>
            <Button variant="secondary" onClick={() => copy($result ? summary($result) : "", "Sonuçlar kopyalandı")}>Sonuçları kopyala</Button>
            <Button variant="secondary" onClick={download}>JSON indir</Button>
            <Button variant="secondary" onClick={share}>Paylaşılabilir bağlantı</Button>
          </Stack>
        </div> : null}
      </div> : <p class="bt-empty">Henüz sonuç yok. Testi başlatınca sonuçlar burada canlı olarak sıralanır.</p>}
    </Demo>

    <Demo wide title="Ölçüm yöntemi" desc="Her kitaplık aynı işi yapar; ölçüm ve kontrol kodu ortaktır.">
      <ul class="bt-method">
        <li>Uygulama: 4 sütunlu tablo (kimlik, etiket, seçme ve silme bağlantısı). Satırlar her kitaplık için aynı tohumdan üretilir. Kitaplık kodları kendi önerilen kalıbıyla yazıldı (anahtarlı liste, satır başına bağlama); Kod bölümünde hepsi görünür.</li>
        <li>Süre: işlem çağrısından hemen önce saat alınır; sonra bir requestAnimationFrame ve onun içinden gönderilen bir mesaj beklenir. Mesaj, işlemden sonraki ilk boyamanın hemen ardından gelir. Satır seç ve sil, satırdaki bağlantıya gerçek bir tıklama olayıyla yapılır.</li>
        <li>Her ölçümden önce hazırlık (ör. 1.000 satır kurmak) ölçülmeden yapılır ve boyanır. İşlemden sonra tablo kontrol edilir; işi atlayan bir uygulama hata alır, kazanmaz.</li>
        <li>Isınma: 1k işlemlerde 3, 10k işlemlerde 1 ölçülmeyen tur. Sonra seçilen sayıda tekrar; medyan, ortalama, örnek standart sapması ve ortalamanın %95 güven aralığı (Student t) verilir.</li>
        <li>Kitaplıklar sırayla, bu sayfada ayrı bir kapsayıcıda çalışır. Aralarında uygulama kaldırılır, tarayıcı izin veriyorsa çöp toplama istenir, sayfa boşta kalana kadar beklenir.</li>
        <li>Sekme gizlenirse test durur; gizliyken başlayan ölçüm atılıp yeniden yapılır.</li>
        <li>İlk çizim: kitaplık parçasının indirilmesinden boş uygulamanın ilk boyamasına kadar (ikinci çalıştırmada parça önbellektedir). Bellek: 1.000 satır sonrası JS yığını artışı; yalnız performance.memory veren tarayıcılarda ve kaba bir değerdir. İndirilen: derleme raporundaki gzip boyutu.</li>
        <li>React çağrıları flushSync içinde yapılır (düğme tıklaması gibi, boyamadan önce çizilir). Svelte ve Solid derlenmiş çıktılarıyla çalışır.</li>
      </ul>
    </Demo>

    <Demo wide title="Kod" desc="Her kitaplığın test uygulaması; ölçülen kod tam olarak bu.">
      <div class="bt-code" ref={() => loadSources()}>
        <Choice label="Kitaplık" value={$code} set={(v) => { $code = v }} options={LIBS.map((l) => ({ value: l.id, label: l.name }))} />
        {() => $sources ? <DemoCode source={($sources[$code] ?? "").trim()} lang={$code === "svelte" ? "html" : "tsx"} /> : <p class="bt-empty">Yükleniyor…</p>}
      </div>
    </Demo>

    <Demo wide title="Lisanslar" desc="Karşılaştırılan kitaplıklar bu sayfa için paketlenir; lisans metinleri aşağıda.">
      <div class="bt-licenses" ref={() => loadLicenses()}>
        {() => ($licenses ?? []).map((l) => <details class="bt-license">
          <summary>{l.name} {l.version} · {l.license}</summary>
          <pre>{l.text}</pre>
        </details>)}
      </div>
    </Demo>
  </Section>
}
