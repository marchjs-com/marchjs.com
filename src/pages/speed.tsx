// Speed: a live network panel to see lazy loading and caching (which page fetched which chunk when, from the network or
// the cache), the build's per-route size report and the optional service worker.
import { Button, Badge, Card, Grid, Stack, Toggle, toast } from "hadi-march/ui";
import { lazy } from "hadi-march/lazy";
import { Link } from "hadi-march/router";
import { slow, SLOW_MS } from "../slow.ts";
import { registerServiceWorker, unregisterServiceWorker, swState } from "hadi-march/sw";
import { netLog, clearNetLog, type NetEntry } from "../perflog.ts";
import { Demo, Section } from "../demo.tsx";

interface ReportRow { name: string; kind?: string; js: number; css: number; limit?: number | null; over?: boolean; files?: string[] }
interface Report { entry: ReportRow; routes: ReportRow[]; parts?: ReportRow[]; budget: { entry: number; route: number; part?: number } | null }
/** "../../src/charts/xy.ts" → "hadi-march/charts/xy.ts" (library parts by their import name) */
const LIB_PATH = /^(?:\.\.\/)+src\//
const shortName = (n: string): string => n.replace(LIB_PATH, "hadi-march/")
type Row = ReportRow & { kind: string; state: "over" | "near" | "ok" }
/** Report rows with their budget state; over first, then near the limit (90%+), then the rest in report order. */
function reportRows(r: Report): Row[] {
  const all = [{ ...r.entry, kind: "entry" }, ...r.routes.map((x) => ({ kind: "route", ...x })), ...(r.parts ?? []).map((x) => ({ kind: "part", ...x }))]
  const rank = { over: 0, near: 1, ok: 2 }
  return all.map((x, i) => ({ ...x, i, state: (x.limit && x.js > x.limit ? "over" : x.limit && x.js >= x.limit * 0.9 ? "near" : "ok") as Row["state"] }))
    .sort((a, b) => rank[a.state] - rank[b.state] || a.i - b.i)
}
const KIND: Record<string, string> = { entry: "giriş", route: "sayfa", layout: "yerleşim", part: "parça" }

// a lazy component for the slow 3G demo: skeleton on its first arrival, instant afterwards (no skeleton when cached)
const PieChart = lazy(() => import("hadi-march/charts/pie.ts"), { pick: "PieChart", when: "immediate", placeholder: "chart", height: "14rem" })
const SHARE = [{ label: "Uygulama", value: 4200 }, { label: "Web", value: 2900 }, { label: "Davet", value: 1800 }, { label: "Diğer", value: 610 }]

/** The build's chunk manifest (the JSON data block in index.html): dynamic import source → its files. */
function readManifest(): Record<string, string[]> {
  try { return JSON.parse(document.getElementById("march-manifest")?.textContent ?? "{}") as Record<string, string[]> } catch { return {} }
}
const fileName = (p: string): string => p.split("/").pop() ?? p
const partName = (key: string): string => shortName(key).replace(PAGE_SRC, "sayfa: $1").replace(APP_SRC, "$1")
const PAGE_SRC = /^src\/pages\/(.*)\.tsx$/
const APP_SRC = /^src\/(.*)\.tsx?$/

const kb = (n: number): string => (n >= 1024 ? `${(n / 1024).toFixed(1)} KB` : `${n} B`);
const SW_TEXT: Record<string, string> = {
  off: "kapalı", unsupported: "bu ortamda yok (http/https gerekir)", installing: "kuruluyor…", ready: "etkin: parçalar önbellekten açılır",
  update: "yeni sürüm hazır", blocked: "CSP izin vermiyor (trusted-types march-sw gerekli)", error: "bu derlemede yok: yayındaki vitrinde kapalı, yalnız yerel önizlemede (build.mjs --serve) var",
}

export default function Speed() {
  let $report: Report | null = null
  let $reportError = ""
  void fetch("march-report.json").then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status))))).then((x: Report) => { $report = x }, () => { $reportError = "Rapor yalnız derlenmiş vitrinde var (march build)." })

  const rows = (): NetEntry[] => netLog().filter((e) => e.kind !== "diğer")
  const totals = () => {
    const list = rows()
    const net = list.filter((e) => e.source === "ağ")
    return { files: list.length, net: net.length, cached: list.length - net.length, bytes: net.reduce((s, e) => s + e.bytes, 0), preload: list.filter((e) => e.preload).length }
  }
  // live chunk list: every lazy unit of the build and whether (and how) it has arrived in this tab
  const manifest = readManifest()
  const parts = () => {
    const seen = new Map<string, NetEntry>()
    for (const e of netLog()) if (e.kind === "js" && !seen.has(e.file)) seen.set(e.file, e)
    return Object.entries(manifest).map(([key, files]) => {
      const own = files.find((x) => x.endsWith(".js"))
      const hit = own ? seen.get(fileName(own)) : undefined
      return { key, name: partName(key), files: files.length, hit }
    }).sort((a, b) => (a.hit ? a.hit.t : Infinity) - (b.hit ? b.hit.t : Infinity) || a.name.localeCompare(b.name))
  }
  let $showPie = false
  let $onlyOver = false
  const toggleSw = async () => {
    if (swState() === "ready" || swState() === "update") { await unregisterServiceWorker(); toast("Service worker ve önbelleği kaldırıldı", { kind: "info" }); return }
    await registerServiceWorker({ onUpdate: () => toast("Yeni sürüm hazır", { kind: "info" }) })
  }

  return <Section kicker="Temel" title="Hız" lead="Uygulama tek sayfa ama hepsi açılışta inmez: giriş paketi yalnız kabuk ve yönlendiricidir; her sayfa, ağır bileşen ve tema kendi parçasıdır ve gerektiğinde gelir. Bağlantının üzerine gelince parçalar önceden çekilir, boşta kalınca da sayfadaki bağlantılar. Gelen her şey önbelleğe girer.">
    <Demo wide title="Yavaş 3G" desc={`Açıkken her tembel parça ve sayfa yüklenmeden önce ${SLOW_MS / 1000} sn bekler (setLoadDelay ile benzetim). Böylece iskelet, ilerleme çizgisi ve yumuşak geliş görünür. Bu sekme boyunca açık kalır; Veri ya da Grafikler sayfasına gidip bak. Aynı parça ikinci kez istendiğinde önbellektedir, iskelet hiç görünmez.`}
      code={`import { setLoadDelay } from "hadi-march/lazy"
setLoadDelay(1600)   // demo / test: every lazy() part and route waits 1.6 s
const Pie = lazy(() => import("hadi-march/charts/pie.ts"), { pick: "PieChart", placeholder: "chart", height: "14rem" })`}>
      <div class="sc-row">
        <Toggle value={slow} label="Yavaş 3G" />
        <Button size="sm" on:click={() => { $showPie = !$showPie }}>{() => ($showPie ? "Grafiği kaldır" : "Grafiği göster")}</Button>
        <span class="hm-muted">{() => (PieChart.loaded ? "Parça önbellekte: iskeletsiz gelir" : "Parça henüz inmedi")}</span>
      </div>
      <div class="sc-speed-lazy">{() => ($showPie ? <PieChart data={SHARE} donut title="Kanal payı" legend="right" width={320} height={200} /> : <p class="hm-muted">Grafik burada, tembel bir parçadan gelir.</p>)}</div>
    </Demo>

    <Demo wide title="Anında geçiş" desc="Menüde bir sayfaya tıklayınca adres, etkin bağlantı ve konum çubuğu hemen değişir. Sayfa 100 ms içinde gelmezse yerini iskeleti alır (kabuk yerinde kalır); 150 ms'den uzun sürerse üstte ince bir çizgi ve tıklanan bağlantıda küçük bir dönen simge görünür. Yeni bir tıklama öncekini iptal eder: yalnız son sayfa açılır. Yavaş 3G'yi açıp iki sayfaya art arda tıkla."
      code={`<Router loading={<Spinner />} skeleton={() => <PageSkeleton />} />   // every page
createRouter({ routes: { "/data": { load: () => import("./data.tsx"), skeleton: () => <TableSkeleton /> } } })   // one route
fetch(url, { signal: navigationSignal() })   // aborted when the user clicks elsewhere`}>
      <div class="sc-row">
        <Toggle value={slow} label="Yavaş 3G" />
        <Link href="/data" class="hm-btn hm-btn-secondary hm-btn-sm">Veri sayfasına git</Link>
        <Link href="/charts" class="hm-btn hm-btn-secondary hm-btn-sm">Grafikler sayfasına git</Link>
      </div>
    </Demo>
    <Demo wide title="Canlı parça listesi" desc="Derlemedeki her tembel birim (sayfalar, lazy bileşenler, kabuk parçaları, dil paketi) ve bu sekmede inip inmediği. Sayfalar arasında gez ya da Yavaş 3G'yi aç: satırlar indikçe güncellenir.">
      <p class="hm-muted">{() => { const l = parts(); return `${l.filter((p) => p.hit).length} / ${l.length} parça indi` }}</p>
      <div class="sc-speed-scroll" role="region" aria-label="Tembel parçalar" tabindex="0">
        <table class="sc-speed-table">
          <thead><tr><th scope="col">Parça</th><th scope="col" class="sc-num">Dosya</th><th scope="col">Durum</th><th scope="col" class="sc-num">ms</th><th scope="col">Sayfa</th></tr></thead>
          <tbody>
            {() => parts().map((p) => <tr>
              <td class="sc-speed-file">{p.name}</td>
              <td class="sc-num">{p.files}</td>
              <td>{p.hit ? <Badge tone={p.hit.source === "ağ" ? "warn" : "success"}>{p.hit.preload ? `önceden · ${p.hit.source}` : p.hit.source}</Badge> : <Badge>inmedi</Badge>}</td>
              <td class="sc-num">{p.hit ? p.hit.t : "—"}</td>
              <td>{p.hit ? p.hit.route : ""}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </Demo>

    <Demo wide title="Canlı ağ paneli" desc="Bu sekme açıldığından beri yüklenen her dosya. Başka bir sayfaya git, sonra geri gel: yeni parçalar o sayfanın adıyla eklenir, ikinci gelişte önbellekten gelir. Kenar menüsündeki bir bağlantının üzerine gelmek ön yükleme satırı ekler."
      code={`// page chunk: the router splits it
createRouter({ routes: { "/report": () => import("./pages/rapor.tsx") } })
// heavy component: arrives on first render, a skeleton meanwhile
const Map = lazy(() => import("./Map.tsx"))
<Link href="/report" prefetch="hover">Rapor</Link>   // default: on hover`}>
      <Grid cols={5} gap={3} minCol="8rem">
        <Card><div class="sc-speed-n">{() => totals().files}</div><div class="hm-muted">dosya</div></Card>
        <Card><div class="sc-speed-n">{() => totals().net}</div><div class="hm-muted">ağdan</div></Card>
        <Card><div class="sc-speed-n">{() => totals().cached}</div><div class="hm-muted">önbellekten</div></Card>
        <Card><div class="sc-speed-n">{() => totals().preload}</div><div class="hm-muted">ön yükleme</div></Card>
        <Card><div class="sc-speed-n">{() => kb(totals().bytes)}</div><div class="hm-muted">aktarılan</div></Card>
      </Grid>
      <div class="sc-row"><Button size="sm" on:click={clearNetLog}>Listeyi temizle</Button></div>
      <div class="sc-speed-scroll" role="region" aria-label="Yüklenen dosyalar" tabindex="0">
        <table class="sc-speed-table">
          <thead><tr><th scope="col" class="sc-num">ms</th><th scope="col">Sayfa</th><th scope="col">Dosya</th><th scope="col">Tür</th><th scope="col" class="sc-num">Boyut</th><th scope="col">Kaynak</th></tr></thead>
          <tbody>
            {() => rows().slice().reverse().slice(0, 200).map((e) => <tr>
              <td class="sc-num">{e.t}</td>
              <td>{e.route}</td>
              <td class="sc-speed-file">{e.file}{e.preload ? <Badge tone="info">önceden</Badge> : null}</td>
              <td>{e.kind}</td>
              <td class="sc-num">{kb(e.bytes)}</td>
              <td><Badge tone={e.source === "ağ" ? "warn" : "success"}>{e.source}</Badge></td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </Demo>

    <Demo wide title="Rota başına boyut (gzip)" desc="march build her derlemede yazar (march-report.json): giriş, her sayfa (yoluyla) ve her tembel parça (lazy bileşen, dil paketi). Bütçe aşılınca derleme durur ve aşan satırı adıyla söyler."
      code={`// march.config.js
export default { budget: { entry: 15 * 1024, route: 60 * 1024, part: 25 * 1024, routes: { "/data": 80 * 1024 }, fail: true } }
// ✖ over budget: /data JS 82.3 KB > 80.0 KB`}>
      {() => {
        if (!$report) return <p class="hm-muted">{$reportError || "Yükleniyor…"}</p>
        const rows = reportRows($report)
        const over = rows.filter((r) => r.state === "over").length, near = rows.filter((r) => r.state === "near").length
        const shown = $onlyOver ? rows.filter((r) => r.state !== "ok") : rows
        return <Stack gap={3}>
          <div class="sc-row">
            <Badge tone={over ? "danger" : "success"}>{over ? `${over} satır bütçeyi aşıyor` : "Hepsi bütçe içinde"}</Badge>
            {near ? <Badge tone="warn">{`${near} satır sınırda (%90+)`}</Badge> : null}
            <Toggle bind:value={$onlyOver} label="Yalnız aşan ve sınırdakiler" />
          </div>
          <p class="hm-muted">Bütçe yalnız JavaScript'in gzip boyutuna uygulanır (her satır kendi sınırıyla, ayrı ayrı); CSS bilgi için gösterilir. İstek: o satır için inen dosya sayısı (JS + CSS).</p>
          <div class="sc-speed-scroll" tabindex="0" role="region" aria-label="Boyut raporu">
            <table class="sc-speed-table">
              <thead><tr>
                <th scope="col">Durum</th><th scope="col">Ad</th><th scope="col">Tür</th>
                <th scope="col" class="sc-num" title="JavaScript, gzip: bütçeyle karşılaştırılan değer">JS (gzip)</th>
                <th scope="col" class="sc-num" title="CSS, gzip: bilgi için, bütçeye girmez">CSS (gzip)</th>
                <th scope="col" class="sc-num" title="Bu satırın JS sınırı">JS bütçesi</th>
                <th scope="col" class="sc-num" title="İndirilen dosya sayısı">İstek</th>
              </tr></thead>
              <tbody>
                {shown.length ? shown.map((r) => <tr class={`sc-budget-${r.state}`}>
                  <td>{r.state === "over" ? <Badge tone="danger">{`aştı +${kb(r.js - (r.limit ?? 0))}`}</Badge> : r.state === "near" ? <Badge tone="warn">{`sınırda %${Math.round((r.js / (r.limit ?? 1)) * 100)}`}</Badge> : <span class="hm-muted">—</span>}</td>
                  <td class="sc-speed-file">{shortName(r.name)}</td>
                  <td>{KIND[r.kind] ?? r.kind}</td>
                  <td class="sc-num sc-budget-value">{kb(r.js)}</td>
                  <td class="sc-num">{kb(r.css)}</td>
                  <td class="sc-num">{r.limit ? kb(r.limit) : "—"}</td>
                  <td class="sc-num">{r.files?.length ?? ""}</td>
                </tr>) : <tr><td colspan="7" class="hm-muted">Aşan ya da sınırda satır yok.</td></tr>}
              </tbody>
            </table>
          </div>
        </Stack>
      }}
    </Demo>

    <Demo title="Çevrimdışı önbellek (service worker)" desc="İsteğe bağlı: march.config.js › sw: true derlemede sw.js yazar. Parçalar ilk gelişte önbelleğe girer; ikinci ziyarette sayfa ağ olmadan açılır; yeni sürümde eski önbellek silinir."
      code={`import { registerServiceWorker, applyUpdate } from "hadi-march/sw"
registerServiceWorker({ onUpdate: () => toast("Yeni sürüm", { action: { label: "Yenile", onClick: applyUpdate } }) })`}>
      <Stack gap={3}>
        <p>Durum: <strong>{() => SW_TEXT[swState()] ?? swState()}</strong></p>
        <div class="sc-row"><Button variant="primary" on:click={toggleSw}>{() => (swState() === "ready" || swState() === "update" ? "Kaldır" : "Etkinleştir")}</Button></div>
      </Stack>
    </Demo>
  </Section>
}
