// Showcase stage for ErrorBox: title, message and the retry button follow the Playground values; the retry button counts attempts; the third one succeeds.
import { ErrorBox } from "march/components/feedback/error-box";
import { Button } from "march/components/actions/button";

export const code = `<ErrorBox title="Veriler alınamadı" error={err} retry={() => refetch()} />
<ErrorBox message="Sunucuya ulaşılamadı (503)." retry={reconnect} retryLabel="Tekrar bağlan" />`

export default function ErrorBoxDemo(props: { values: { title: string; message: string; retry: boolean; retryLabel: string } }) {
  let $tries = 0
  return <div class="sc-col">
    {() => {
      const v = props.values
      if ($tries >= 3) return <p class="sc-ok" role="status">Bağlantı kuruldu, veriler geldi. <Button size="sm" on:click={() => { $tries = 0 }}>Baştan</Button></p>
      const msg = $tries ? `Sunucuya ulaşılamadı (503). ${$tries}. deneme de başarısız.` : v.message || undefined
      return <ErrorBox title={v.title || undefined} message={msg} retry={v.retry ? () => { $tries++ } : undefined} retryLabel={v.retryLabel === "own" ? "Tekrar bağlan" : undefined} />
    }}
  </div>
}
