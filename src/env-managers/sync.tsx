// Sync demo of the environment managers page. The manager, net and the mock server come in a lazy part
// (sync-server.ts) when the demo is drawn; the controls here use only components the page already has.
import { onCleanup } from "hadi-march";
import { Button, Card, Badge, Toggle, Segmented, Slider, Field, TextInput } from "hadi-march/ui";
import type { SyncItem } from "hadi-march/managers/sync";
import type { SyncDemoApi, Answer } from "./sync-server.ts";
import { Demo } from "../demo.tsx";
import { time } from "./common.tsx";

const STATUS: Record<string, [string, string]> = { idle: ["success", "eşit"], syncing: ["info", "gönderiliyor"], offline: ["warn", "çevrimdışı, bekliyor"], waiting: ["warn", "yeniden deneyecek"], error: ["danger", "reddedilen var"] }

function SyncBody(props: { api: SyncDemoApi }) {
  const api = props.api
  const sync = api.sync
  let $text = ""
  let $delay = 400
  const add = () => { const t = $text.trim() || `Not ${new Date().toLocaleTimeString("tr")}`; sync().enqueue({ url: "/demo/notes", method: "POST", body: { text: t } }); $text = "" }
  const row = (x: SyncItem) => <li class="sc-mgr-qrow">
    <span><strong>{(x.body as { text: string }).text}</strong> <span class="m-muted">{x.method} {x.url}</span></span>
    <span class="sc-row">
      {x.failed ? <Badge tone="danger">reddedildi</Badge> : x.tries ? <Badge tone="warn">{`${x.tries}. deneme`}</Badge> : <Badge tone="neutral">sırada</Badge>}
      {x.error ? <span class="m-muted">{x.error}</span> : null}
      <Button size="sm" variant="ghost" on:click={() => sync().retry(x.id)}>Şimdi dene</Button>
      <Button size="sm" variant="ghost" on:click={() => sync().remove(x.id)}>Kaldır</Button>
    </span>
  </li>
  return <>
    <div class="sc-row">
      <Toggle value={!api.online()} onChange={(v: boolean) => api.setOnline(!v)} label="Çevrimdışı" />
      {() => { const [tone, label] = STATUS[sync().status()] ?? ["neutral", sync().status()]; return <Badge tone={tone} dot>{label}</Badge> }}
      <span class="m-muted">bekleyen {() => sync().pending()} · son eşitleme {() => time(sync().lastSync())}</span>
    </div>
    <div class="sc-row">
      <TextInput bind:value={$text} placeholder="Not yaz…" on:keydown={(e: KeyboardEvent) => { if (e.key === "Enter") add() }} />
      <Button variant="primary" data-audit-try on:click={add}>Not ekle</Button>
      <Button variant="secondary" disabled={() => !sync().queue().length} on:click={() => sync().retry()}>Hepsini şimdi dene</Button>
    </div>
    <ul class="sc-mgr-queue">{() => sync().queue().length ? sync().queue().map(row) : <li class="m-muted">Kuyruk boş.</li>}</ul>
    <Card title="Sunucuya ulaşanlar" subtitle="mock /demo/notes">
      <ul class="sc-mgr-log">{() => api.received().length ? api.received().map((s) => <li>{s}</li>) : <li>Henüz yok.</li>}</ul>
    </Card>
    <Card title="Seçenekler" subtitle="Sunucu">
      <Field label="Sunucu yanıtı"><Segmented value={api.answer()} onChange={(v: Answer) => api.answer.set(v)} options={[{ value: "ok", label: "200 kaydet" }, { value: "busy", label: "503 meşgul" }, { value: "reject", label: "422 reddet" }]} /></Field>
      <Field label={() => `Gecikme: ${$delay} ms`}><Slider value={$delay} onChange={(v: number) => { $delay = v; api.setDelay(v) }} min={0} max={3000} step={100} /></Field>
    </Card>
  </>
}

export function SyncDemo() {
  let $api: SyncDemoApi | null = null
  let alive = true
  void import("./sync-server.ts").then((m) => { if (alive) $api = m.startSyncDemo() })
  onCleanup(() => { alive = false; $api?.stop() })
  return <Demo wide title="Sync: çevrimdışı kuyruk ve yeniden deneme" desc="Kullanıcının yazdıkları kalıcı bir kuyrukta bekler ve bağlantı gelince net üzerinden sırayla gider. Geçici hata (503) geri çekilerek yeniden denenir; 4xx reddedilir ve elle yeniden denenene kadar kalır. Her kaydın Idempotency-Key'i vardır: tekrar gönderim iki kez uygulanmaz. Çevrimdışı yap, not ekle, sayfayı yenile: kuyruk durur."
    code={`sync().enqueue({ url: "/api/notes", method: "POST", body: note })
sync().pending()  sync().status()  sync().queue()  sync().lastSync()
configureSync({ retry: { delay: 1000, factor: 2, max: 60_000, count: 8 } })`}>
    {() => ($api ? <SyncBody api={$api} /> : <p class="m-muted">Yükleniyor…</p>)}
  </Demo>
}
