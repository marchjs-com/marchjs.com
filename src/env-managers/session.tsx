// Session demo of the environment managers page.
import { onCleanup } from "march";
import { Button, Card, Badge, Toggle, Slider, Field, Alert, Progress, toast } from "march/ui";
import { session, configureSession } from "march/managers/session";
import { Demo } from "../demo.tsx";
import { secs } from "./common.tsx";

// ------------------------------------------------------------------ Session
export function SessionDemo() {
  let $duration = 40
  let $warn = 15
  let $activity = true
  const apply = () => configureSession({ duration: $duration * 1000, warnBefore: $warn * 1000, extendOnActivity: $activity, extendEvery: 5000, storageKey: "sc.session.demo", onExpire: () => toast("Süre doldu: kullanıcı çıkışa yönlendirilir", { kind: "warn" }) })
  apply()
  onCleanup(() => { session().end(); configureSession({ duration: 30 * 60_000, warnBefore: 2 * 60_000, extendOnActivity: true, extendEvery: 30_000, storageKey: "m.session", onExpire: null }) })
  const restart = (f: () => void) => { const was = session().active(); f(); apply(); if (was) session().start() }
  return <Demo title="Session: süre ve uyarı" desc="Oturum süresi, bitmeden önce uyarı, etkinlikle uzama ve sekmeler arası tek son tarih: bir sekmede uzatmak hepsini uzatır, çıkış hepsinden çıkarır. Uyarı penceresinde etkinlik uzatmaz; açık onay gerekir."
    code={`configureSession({ duration: 30 * 60_000, warnBefore: 2 * 60_000, onExpire: signOut })
session().start()   session().remaining()   session().warning()   session().extend()   session().end()`}>
    <div class="sc-row">
      {() => (session().active() ? <Badge tone={session().warning() ? "warn" : "success"} dot>{`kalan ${secs(session().remaining())}`}</Badge> : session().expired() ? <Badge tone="danger" dot>süre doldu</Badge> : <Badge tone="neutral" dot>başlamadı</Badge>)}
      <Button variant="primary" on:click={() => session().start()}>{() => (session().active() ? "Yeniden başlat" : "Başlat")}</Button>
      <Button variant="ghost" disabled={() => !session().active()} on:click={() => session().end()}>Çıkış</Button>
    </div>
    <Progress value={() => (session().active() ? (session().remaining() / ($duration * 1000)) * 100 : 0)} tone={() => (session().warning() ? "warn" : "primary")} label="Kalan süre" />
    {() => (session().warning() ? <Alert tone="warn" title="Süre dolmak üzere">
      <div class="sc-row"><span>{secs(session().remaining())} içinde çıkış yapılacak.</span><Button size="sm" variant="primary" on:click={() => session().extend()}>Uzat</Button></div>
    </Alert> : null)}
    <Card title="Seçenekler" subtitle="Session">
      <Field label={() => `Süre: ${$duration} sn`}><Slider value={$duration} onChange={(v: number) => restart(() => { $duration = v; if ($warn >= v) $warn = Math.max(5, v - 5) })} min={15} max={180} step={5} /></Field>
      <Field label={() => `Uyarı: son ${$warn} sn`}><Slider value={$warn} onChange={(v: number) => restart(() => { $warn = Math.min(v, $duration - 5) })} min={5} max={60} step={5} /></Field>
      <Toggle value={$activity} onChange={(v: boolean) => restart(() => { $activity = v })} label="Etkinlik süreyi uzatsın (en çok 5 sn'de bir)" />
    </Card>
  </Demo>
}

