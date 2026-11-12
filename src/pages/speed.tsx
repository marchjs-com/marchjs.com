// Speed: a live network panel to see lazy loading and caching (which page fetched which chunk when, from the network or
// the cache), the build's per-route size report and the optional service worker.
import { Button, Badge, Card, Grid, Stack, toast } from "hadi-march/ui";
import { registerServiceWorker, unregisterServiceWorker, swState } from "hadi-march/sw";
import { netLog, clearNetLog, type NetEntry } from "../perflog.ts";
import { Demo, Section } from "../demo.tsx";

interface ReportRow { name: string; js: number; css: number; files?: string[] }
interface Report { entry: ReportRow; routes: ReportRow[]; budget: { entry: number; route: number } | null }

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
  const toggleSw = async () => {
    if (swState() === "ready" || swState() === "update") { await unregisterServiceWorker(); toast("Service worker ve önbelleği kaldırıldı", { kind: "info" }); return }
    await registerServiceWorker({ onUpdate: () => toast("Yeni sürüm hazır", { kind: "info" }) })
  }

  return <Section kicker="Temel" title="Hız" lead="Uygulama tek sayfa ama hepsi açılışta inmez: giriş paketi yalnız kabuk ve yönlendiricidir; her sayfa, ağır bileşen ve tema kendi parçasıdır ve gerektiğinde gelir. Bağlantının üzerine gelince parçalar önceden çekilir, boşta kalınca da sayfadaki bağlantılar. Gelen her şey önbelleğe girer.">
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
          <thead><tr><th scope="col">ms</th><th scope="col">Sayfa</th><th scope="col">Dosya</th><th scope="col">Tür</th><th scope="col">Boyut</th><th scope="col">Kaynak</th></tr></thead>
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

    <Demo wide title="Rota başına boyut (gzip)" desc="march build her derlemede yazar (march-report.json); bütçe aşılınca uyarır, march.config.js › budget.fail ile derlemeyi durdurur."
      code={`// march.config.js
export default { budget: { entry: 15 * 1024, route: 60 * 1024, fail: true } }`}>
      {() => $report ? <div class="sc-speed-scroll" tabindex="0" role="region" aria-label="Boyut raporu">
        <table class="sc-speed-table">
          <thead><tr><th scope="col">Parça</th><th scope="col">JS</th><th scope="col">CSS</th><th scope="col">Dosya</th></tr></thead>
          <tbody>
            {[$report.entry, ...$report.routes].map((r) => <tr>
              <td>{r.name}</td>
              <td class="sc-num">{kb(r.js)}{$report?.budget && r.js > (r === $report.entry ? $report.budget.entry : $report.budget.route) ? <Badge tone="danger">bütçe</Badge> : null}</td>
              <td class="sc-num">{kb(r.css)}</td>
              <td class="sc-num">{r.files?.length ?? ""}</td>
            </tr>)}
          </tbody>
        </table>
      </div> : <p class="hm-muted">{$reportError || "Yükleniyor…"}</p>}
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
