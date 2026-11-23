// Showcase stage for Newsletter: a fake server that answers after 900 ms with success or an error.
import { Newsletter } from "march/landing";
import { heart, Icon } from "march/icons";

export const code = `<Newsletter title="Haberdar ol" lead="Ayda bir e-posta, yalnız yenilikler."
  onSubmit={(email) => api.subscribe(email)} note="İstediğin an ayrılabilirsin." />
<Newsletter onSubmit={save} button="Katıl" done="Kaydın alındı." doneIcon={<Icon of={heart} />} motion={false}
  labels={{ email: "E-posta adresin", invalid: "Bu bir e-posta adresine benzemiyor." }} />   // own texts, own mark, no motion`

export default function NewsletterDemo(props: { values: { title: string; lead: string; layout: string; outcome: string; doneIcon: string; motion: boolean; texts: boolean } }) {
  // the answer shows on the next send: the line under the form says what the fake server will do (a rebuild here would
  // drop a typed address); the mark and the motion are read by the form when it needs them, so they stay live
  let wrap: HTMLElement | undefined
  let $sent = false, $run = 0
  let quick = false
  // a send without typing: fills a sample address and submits (answered at once, so the result is there right away);
  // after a success the same button brings the form back
  const sample = (): void => {
    if ($sent) { $sent = false; $run = $run + 1; return }
    const input = wrap?.querySelector("input"), form = wrap?.querySelector("form")
    if (!input || !form) return
    input.value = "ornek@hadi.com"
    input.dispatchEvent(new Event("input", { bubbles: true }))
    quick = true
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))
  }
  return <div class="sc-demo-stack" ref={(x: Element) => { wrap = x as HTMLElement }}>
    {() => {
      const layout = props.values.layout, texts = props.values.texts
      void $run
      $sent = false
      return <Newsletter layout={layout as "inline"} title={props.values.title || undefined} lead={props.values.lead || undefined} note="İstediğin an ayrılabilirsin."
        motion={props.values.motion} doneIcon={props.values.doneIcon === "off" ? false : props.values.doneIcon === "own" ? <Icon of={heart} /> as Node : true}
        button={texts ? "Katıl" : undefined} done={texts ? "Kaydın alındı. Gelen kutuna bak." : undefined} placeholder={texts ? "adın@ornek.com" : undefined}
        labels={texts ? { email: "E-posta adresin", invalid: "Bu bir e-posta adresine benzemiyor." } : undefined}
        onSubmit={() => new Promise((ok, no) => setTimeout(() => { quick = false; if (props.values.outcome === "ok") { $sent = true; ok(true) } else no(new Error("Bu adres zaten kayıtlı.")) }, quick ? 120 : 900))} />
    }}
    <div class="sc-row"><button type="button" class="m-btn m-btn-sm m-btn-secondary" data-audit-try="toggle" on:click={sample}>{() => ($sent ? "Formu yeniden göster" : "Örnek adresle gönder")}</button></div>
    <p class="sc-demo-call">{() => (props.values.outcome === "ok" ? "Gönderince: onSubmit çözülür → form kapanır, onay belirir" : "Gönderince: onSubmit reddedilir → alan sallanır, \"Bu adres zaten kayıtlı.\" okunur") + (props.values.motion ? "" : " (hareketsiz: durum anında değişir)")}</p>
  </div>
}
