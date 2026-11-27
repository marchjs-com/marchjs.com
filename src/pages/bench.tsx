// Speed › Comparison: the same table app written for several UI libraries, measured live in the visitor's own
// browser. Each library's app is a lazy chunk (src/bench/apps/*) fetched only when its test runs; all of them run one
// after another on the same page, each in its own host element (no iframe: the CSP has no frame-src).
// Tabs (kept in ?tab=): basic tests · realistic scenarios · download size · method. A test tab is a sticky settings
// panel beside a live result area (src/bench/ui.tsx); only the presentation lives here, the measurement is in src/bench.
import { Button, Tabs, Disclosure, toast } from "march/ui"
import { ChoicePicker } from "march/forms"
import { lazy } from "march/lazy"
import { t, untrack } from "march"
import { query, setQuery } from "march/router"
import { appUrl } from "march/base"
import { play, x as stopIcon, copy as copyIcon, download as downloadIcon, link as linkIcon } from "march/icons"
import { OPS, TIMEOUT, stats, factor, rank, places, unreliable, encodeResult, decodeResult, type RunResult, type Stats } from "../bench/core.ts"
import { LIBS, BASELINE, libById, type Bundled } from "../bench/libs.ts"
import { runBench, type Progress as RunProgress } from "../bench/runner.ts"
import { busy, Split, Group, Toggles, AllNone, Bars, Unsure, Preview, Status, Kind, libItems, ms, kb, type BarRow } from "../bench/ui.tsx"
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
  const lines = [`${t("Hız karşılaştırması")} · ${r.date.slice(0, 10)} · ${r.env.ua}`, t("Tekrar: {0}, değer: medyan ms (saf JavaScript'e göre katsayı)", { 0: r.reps })]
  for (const op of OPS) {
    const list = rank(Object.keys(r.samples).filter((l) => r.samples[l]?.[op.id]?.length).map((l) => ({ l, stats: stats(r.samples[l]![op.id]!) })))
    if (!list.length) continue
    const base = r.samples[BASELINE]?.[op.id]
    const b = base?.length ? stats(base).median : NaN
    lines.push(`${t(op.label)}: ${list.map((x) => `${libName(x.l)} ${ms(x.stats.median)}${Number.isFinite(b) ? ` (×${factor(x.stats.median, b).toFixed(2)})` : ""}`).join(", ")}`)
  }
  return lines.join("\n")
}

/** The columns of the "what comes with it" table. */
const HAS: [keyof Bundled, string][] = [["router", "Yönlendirme"], ["store", "Paylaşılan durum"], ["ui", "Hazır arayüz bileşenleri"], ["i18n", "Çeviri (i18n)"]]

/** The method, as short cards (title + one paragraph) instead of one long list. */
const METHOD: { title: string; text: string }[] = [
  { title: "Uygulama", text: "4 sütunlu tablo (kimlik, etiket, seçme ve silme bağlantısı). Satırlar her kitaplık için aynıdır: her kitaplıkta ve her işlemde veri kaynağı baştan başlar (aynı tohum, kimlikler 1'den), yani her kitaplık aynı tekrarda aynı kimlik ve etiketleri çizer. Kitaplık kodları kendi önerilen kalıbıyla yazıldı (anahtarlı liste, satır başına bağlama); Kod bölümünde hepsi görünür." },
  { title: "Süre", text: "Süre = tekrarın bitişi − tekrarın başlangıcı. Bir tekrar şunları kapsar: tabloyu hazırlamak (ör. güncellenecek 1.000 satırı kurmak) ve boyamak, işlemi yapmak ve boyamak, sonucu kontrol etmek, tabloyu boşaltmak ve boyamak. Kitaplığın yaptığı hiçbir iş ölçüm dışında kalmaz; yalnız çöp toplama molası tekrar başlamadan önce verilir. Ayrıntı tablosundaki \"Yalnız işlem\" sütunu, işlemin tek başına süresini (çağrıdan boyamasına) gösterir. Boyama, bir requestAnimationFrame ve onun içinden gönderilen bir mesajla beklenir; mesaj, boyamanın hemen ardından gelir. Satır seç ve sil, satırdaki bağlantıya gerçek bir tıklama olayıyla yapılır." },
  { title: "Hazırlık ve kontrol", text: "Her tekrardan önce, tarayıcı izin veriyorsa çöp toplama istenir, 20 ms beklenir ve bir boyama beklenir (ölçüm dışı mola; kitaplık bu sırada iş yapmaz). Hazırlık (ör. 1.000 satır kurmak) tekrarın içindedir ve ölçülür. İşlemden sonra tablo kontrol edilir; işi atlayan bir uygulama hata alır, kazanmaz." },
  { title: "İstatistik", text: "Isınma turu yok: test hemen başlar ve her tur ölçülür. Seçilen sayıda tekrar; medyan, ortalama, örnek standart sapması ve ortalamanın %95 güven aralığı (Student t) verilir. Sapma ya da güven aralığının yarısı medyanın %15'ini aşarsa sonuç güvenilir sayılmaz ve uyarı çıkar." },
  { title: "Sıra ve yalıtım", text: "Her işlemde kitaplıklar sırayla çalışır: biri bütün tekrarlarını bitirince sıradakine geçilir; March ilk çalışır. Sayfanın ilk ölçümleri (JIT, ilk yerleşim) daha yavaş olabilir: bu bedeli rakipler değil March öder. Her kitaplık bu sayfada ayrı bir kapsayıcıda çalışır. Aralarında uygulama kaldırılır, tarayıcı izin veriyorsa çöp toplama istenir, sayfa boşta kalana kadar beklenir. Sekme gizlenirse test durur; gizliyken başlayan ölçüm atılıp yeniden yapılır." },
  { title: "Beklenen süre", text: "Her işlemin bir tekrarı için tahmini bir üst sınırı var: 1.000 satırlık işlemlerde 1 sn, 10.000 satırlık işlemlerde 5 sn. Bir kitaplığın tek bir tekrarı bu sınırı ya da tekrarlarının toplamı sınır × tekrar sayısını aşarsa kitaplık o işlemde durdurulur ve \"süre aşıldı: beklenen sürede bitiremedi\" yazar; sıralamaya girmez. Tarayıcıda çalışan bir çağrı yarıda kesilemez: denetim her tekrarın sonunda yapılır." },
  { title: "Sıra ve beraberlik", text: "Kitaplıklar medyana göre dizilir, ama sıra numarası yalnız açık farkları sayar: bir kitaplığın sırası, %95 güven aralığı tümüyle onunkinin altında kalan kitaplık sayısı + 1'dir. Aralıkları çakışanlar gürültü içinde berabere sayılır, aynı sırayı paylaşır; birinci sıradakilerin hepsi taç alır." },
  { title: "Görünüm ve çatı", text: "Görünüm kitaplıkları (React, Preact, Vue, Svelte, Solid, Lit, Marko, Inferno, ivi, Alpine.js) yalnız arayüzü çizer; yönlendirme, durum, hazır bileşenler ve çeviri ayrı paketlerden gelir. Çatılar (March, Angular, Mithril) yönlendirme ve daha fazlasını kendi içinde getirir. Sonuçlar altındaki \"Pakette ne var\" tablosu hangi kitaplıkta neyin hazır geldiğini gösterir; bu test yalnız tablo çizme hızını ölçer." },
  { title: "En çok bellek ve işlemci", text: "Her test ve kitaplık için tek değer, tekrarların en kötüsü. En çok bellek: bir tekrarın başında ve her boyamasından sonra JS yığını okunur; tekrarlar boyunca başlangıca göre görülen en büyük artış. Yalnız performance.memory veren tarayıcılarda (Chrome, Edge) ve kabadır (tarayıcı değeri yuvarlar, çöp toplama zamanı etkiler). En çok işlemci: tarayıcılar bir sayfanın işlemci yüzdesini vermez; en yakını, sayfanın ana iş parçacığının meşgul olduğu oran. Meşgul süre: her çağrı mikro görevleriyle birlikte görevin sonuna kadar, ve her kare başlangıcından boyamanın bitişine kadar (stil, yerleşim, boyama); geri kalanı sonraki kareyi beklemektir. Tekrarın süresine oranı, tekrarlar boyunca en yüksek değer. Tarayıcının başka iş parçacıklarındaki işi (ör. rasterleme) sayılmaz." },
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
    // the runner measures March first, then the others in the list's order
    $running = true; $shared = false; $live = {}; $result = null; $follow = true; $order = [...libs.filter((l) => l.id === "march"), ...libs.filter((l) => l.id !== "march")].map((l) => l.id)
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
  const placeOf = () => places(ranked().filter((x) => !x.error), BASELINE)
  // one bar per library of this run (or of the result): waiting, being measured, or its median so far
  const barRows = (): BarRow[] => {
    const ids = $running ? $order : libsIn()
    const at = $progress ? $order.indexOf($progress.lib) : -1
    const rows = ids.map((id, i) => {
      const s = statOf(id, $view), err = $result?.errors[id]?.[$view] ?? $result?.errors[id]?.load
      const state: BarRow["state"] = !$running ? "done" : i < at ? "done" : i === at ? "run" : "wait"
      // the library being measured says so under its bar, with how many of its samples are in
      const note = state === "run" ? t("Şu an ölçülüyor · {0}/{1} tekrar", { 0: s?.n ?? 0, 1: $reps }) : undefined
      return { id, name: libName(id), value: s ? s.median : NaN, text: s ? `${ms(s.median)} ms` : "—", factor: s ? factor(s.median, base($view)) : undefined, warn: s ? state === "done" && !err && unreliable(s) : false, error: err, state, note, s }
    })
    // places among the finished libraries only (one being measured has too few samples)
    const at1 = places(rows.filter((r) => r.state === "done" && r.s && !r.error).map((r) => ({ id: r.id, stats: r.s as Stats })), BASELINE)
    return rows.map(({ s: _s, ...r }) => ({ ...r, place: at1.get(r.id) }))
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
        <p class="bt-live-sub">{t("Medyan süre; kısa çubuk daha hızlı. Süre, tekrarın başından sonuna kadardır: hazırlık, işlem ve ardından tablonun boşaltılması dahil. Katsayı saf JavaScript'e (çerçevesiz, kıyas çizgisi) göre: ×1.00 aynı süre, ×2.00 iki katı. Taç, birinci sıradaki her kitaplıkta: %95 güven aralıkları çakışanlar gürültü içinde berabere sayılır.")}</p>
      </header>
      {() => opsIn().length > 1 ? <ChoicePicker aria-label={t("Gösterilen işlem")} kind="chips" value={$view} onChange={(v: unknown) => { $view = String(v); $follow = false }} options={opsIn().map((o) => ({ value: o.id, label: t(o.label) }))} /> : null}
      <Unsure names={unsure} />
      <Bars ids={LIB_IDS} rows={barRows} label={() => t("{0}: medyan süre", { 0: opLabel($view) })} />
      {() => (!barRows().length ? <p class="bt-empty">{t("Henüz sonuç yok. Testi başlatınca kitaplıklar burada canlı olarak sıralanır.")}</p> : null)}
      <Preview stage={(el) => { stage = el }} running={() => $running} caption={() => ($progress ? t("Ölçülüyor: {0} · {1}", { 0: libName($progress.lib), 1: opLabel($progress.op) }) : t("bekliyor"))} />
      {() => ranked().length ? <div class="bt-table-wrap">
        <table class="m-table bt-table">
          <caption class="bt-caption">{t("{0}: ayrıntı", { 0: opLabel($view) })}</caption>
          <thead><tr><th scope="col">{t("Sıra")}</th><th scope="col">{t("Kitaplık")}</th><th scope="col">{t("Medyan")}</th><th scope="col">{t("Ortalama ± sapma")}</th><th scope="col">{t("%95 güven aralığı")}</th><th scope="col">n</th><th scope="col">{t("Katsayı")}</th><th scope="col" title={t("Temizleme hariç: çağrıdan işlemin boyanmasına kadar")}>{t("Yalnız işlem")}</th><th scope="col" title={t("Bu testin tekrarlarında JS yığınının ulaştığı en büyük artış")}>{t("En çok bellek")}</th><th scope="col" title={t("Bu testin tekrarlarında sayfanın ana iş parçacığının en meşgul olduğu oran")}>{t("En çok işlemci")}</th></tr></thead>
          <tbody>{ranked().map((x) => <tr>
            <td title={t("Aralığı tümüyle daha hızlı olan kitaplık sayısı + 1; aralıkları çakışanlar aynı sırada")}>{x.id === BASELINE ? t("kıyas") : placeOf().get(x.id) ?? "—"}</td>
            <th scope="row">{libName(x.id)} <Kind id={x.id} /></th>
            <td>{ms(x.stats.median)} ms</td>
            <td>{ms(x.stats.mean)} ± {ms(x.stats.sd)}</td>
            <td>{ms(x.stats.ci[0])}–{ms(x.stats.ci[1])}</td>
            <td>{x.stats.n}</td>
            <td>{Number.isFinite(base($view)) ? `×${factor(x.stats.median, base($view)).toFixed(2)}` : "—"}</td>
            <td>{(() => { const a = $result?.act?.[x.id]?.[$view]; return a?.length ? `${ms(stats(a).median)} ms` : "—" })()}</td>
            <td>{(() => { const h = $result?.heapMax?.[x.id]?.[$view]; return h !== undefined ? `${h.toFixed(2)} MB` : "—" })()}</td>
            <td>{(() => { const c = $result?.cpuMax?.[x.id]?.[$view]; return c !== undefined ? `%${c}` : "—" })()}</td>
          </tr>)}</tbody>
        </table>
      </div> : null}
      {() => libsIn().length ? <Disclosure class="bt-more" title={t("Tüm işlemler, ilk çizim, bellek ve indirme boyutu")}>
        <div class="bt-table-wrap">
          <table class="m-table bt-table">
            <thead><tr><th scope="col">{t("Kitaplık")}</th>{opsIn().map((o) => <th scope="col">{t(o.label)}</th>)}<th scope="col">{t("İlk çizim")}</th><th scope="col">{t("Bellek (1.000 satır)")}</th><th scope="col">{t("İndirilen (gzip)")}</th></tr></thead>
            <tbody>{libsIn().map((id) => <tr>
              <th scope="row">{libName(id)}</th>
              {opsIn().map((o) => { const s = statOf(id, o.id), err = $result?.errors[id]?.[o.id]; return <td title={err ?? undefined}>{err ? (err.startsWith(TIMEOUT) ? t("süre aşıldı") : t("hata")) : s ? `${ms(s.median)} ms` : "—"}{s && Number.isFinite(base(o.id)) ? <span class="bt-sub"> ×{factor(s.median, base(o.id)).toFixed(2)}</span> : null}</td> })}
              <td>{$result?.firstPaint[id] !== undefined ? `${ms($result.firstPaint[id]!)} ms` : "—"}</td>
              <td>{$result?.memory[id] !== undefined ? `${$result.memory[id]!.toFixed(1)} MB` : "—"}</td>
              <td>{$sizes[id] ? kb($sizes[id]!.gzip) : "—"}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </Disclosure> : null}
      <Disclosure class="bt-more" title={t("Pakette ne var: yönlendirme, durum, bileşenler, çeviri")}>
        <div class="bt-table-wrap">
          <table class="m-table bt-table">
            <caption class="bt-caption">{t("✓ kitaplığın içinde · resmî: kendi ekibinin ayrı paketi · —: yok (topluluk paketleri sayılmadı)")}</caption>
            <thead><tr><th scope="col">{t("Kitaplık")}</th>{HAS.map(([, label]) => <th scope="col">{t(label)}</th>)}</tr></thead>
            <tbody>{LIBS.filter((l) => l.kind !== "baseline").map((l) => <tr>
              <th scope="row">{l.name} <Kind id={l.id} /></th>
              {HAS.map(([k]) => <td>{l.has[k] === 1 ? "✓" : l.has[k] === 2 ? t("resmî") : "—"}</td>)}
            </tr>)}</tbody>
          </table>
        </div>
      </Disclosure>
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
      <p class="sc-lead">{t("March'ı React, Vue, Angular, Svelte, Solid, Preact, Lit, Inferno, Marko, ivi, Mithril ve Alpine.js ile, kıyas çizgisi olarak da saf JavaScript (çerçevesiz, elle yazılmış DOM kodu) ile senin tarayıcında, canlı ölçer; sonuçlar bu cihaza özgüdür.")}</p>
    </header>
    <Tabs class="bt-tabs" query="tab" label={t("Karşılaştırma bölümleri")} tabs={[
      { id: "basic", label: t("Temel testler"), disabled: lock("basic"), content: basic },
      { id: "scenarios", label: t("Gerçekçi senaryolar"), disabled: lock("scenarios"), content: () => <Scenarios /> },
      { id: "size", label: t("Boyut"), disabled: lock("size"), content: size },
      { id: "method", label: t("Yöntem"), disabled: lock("method"), content: method },
    ]} />
  </div>
}
