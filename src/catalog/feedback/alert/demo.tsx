// Showcase stage for Alert: one alert with the Playground values (playground.ts); a dismissed one comes back with "Geri getir".
import { Alert } from "march/components/feedback/alert";
import { TEXT } from "./playground.ts";
import { Button } from "march/components/actions/button";
import { sparkles, check } from "march/icons";

export const code = `<Alert tone="warn" title="Kota" dismissable onDismiss={() => …}>Bu ay depolamanın %90'ı kullanıldı.</Alert>
<Alert tone="success">Domain doğrulandı.</Alert>          // role="status"; warn ve danger role="alert"
<Alert m:color="brand-purple" icon={sparkles} dismissable dismissIcon={check} dismissLabel="Bildirimi kapat">Yeni tema hazır.</Alert>
<Alert tone="danger" action={<Button size="sm">Yeniden dene</Button>} actionPlacement="below">Sunucu yanıt vermedi.</Alert>`


export default function AlertDemo(props: { values: { action: boolean; actionPlacement: string; tone: string; color: string; icon: string; title: boolean; body: string; variant: string; dismissable: boolean; dismissIcon: string } }) {
  let $round = 0
  let $gone = false
  let $tries = 0
  return <div class="sc-col">
    {() => {
      const v = props.values
      void $round
      const [title, body] = TEXT[v.tone] ?? TEXT.info!
      const action = !v.action ? undefined : <Button size="sm" on:click={() => { $tries++ }}>{() => ($tries ? `Yeniden dene (${$tries})` : "Yeniden dene")}</Button>
      return <Alert tone={v.tone} m:color={v.color === "tone" ? undefined : (v.color as "brand-purple")} icon={v.icon === "off" ? null : v.icon === "own" ? sparkles : undefined}
        title={v.title ? title : undefined} action={action} actionPlacement={v.actionPlacement === "below" ? "below" : "end"} variant={v.variant === "raised" ? "raised" : "soft"} dismissable={v.dismissable} dismissIcon={v.dismissIcon === "check" ? check : undefined} dismissLabel="Bildirimi kapat" onDismiss={() => { $gone = true }}>{v.body || body}</Alert>
    }}
    {() => ($gone ? <div class="sc-row"><Button size="sm" on:click={() => { $gone = false; $round++ }}>Geri getir</Button></div> : null)}
  </div>
}
