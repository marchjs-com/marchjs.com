// Showcase stage for Dialog: a button opens <Dialog open> with the Playground values; the result shows what closed it.
import { Dialog } from "march/overlays";
import { Button } from "march/actions";
import { arrowLeft } from "march/icons";

export const code = `<Dialog open={$open} onClose={() => $open = false} title="Davet gönder" size="md"
  footer={<><Button on:click={() => $open = false}>Vazgeç</Button><Button variant="primary">Gönder</Button></>}>…</Dialog>
const ok = await confirm({ title: "Silinsin mi?", danger: true })
const name = await prompt({ title: "Yeni ad", validate: (v) => (v ? null : "Gerekli"), ok: "Kaydet", cancel: "Vazgeç" })
<Dialog open={$open} onClose={close} title="Davet gönder" closeButton={arrowLeft} closeLabel="Listeye dön" motion="fade">…</Dialog>`

export default function DialogDemo(props: { values: { open: boolean; title: string; size: string; footer: boolean; dismissable: boolean; long: boolean; closeButton: string; motion: string } }) {
  let $open = false
  let $last = ""
  const close = (how: string) => { $open = false; $last = how }
  return <div class="sc-col">
    {() => {
      const v = props.values
      // a miniature of the configured dialog: width by size, the footer, the × when dismissable, scrolling content
      return <div class={`sc-dlg-mini sc-dlg-${v.size}`} aria-hidden="true">
        <div class="sc-dlg-mini-panel">
          <div class="sc-dlg-mini-head"><strong>{v.title}</strong>{v.dismissable && v.closeButton !== "off" ? <span class="sc-dlg-mini-x">{v.closeButton === "own" ? "←" : "×"}</span> : null}</div>
          <div class={v.long ? "sc-dlg-mini-body is-long" : "sc-dlg-mini-body"}><span /><span /><span />{v.long ? [<span />, <span />, <span />] : null}</div>
          {v.footer ? <div class="sc-dlg-mini-foot"><span /><span class="is-primary" /></div> : null}
        </div>
      </div>
    }}
    <code class="sc-call">{() => { const v = props.values; return `<Dialog ${v.open ? "" : "open={false} "}size="${v.size}"${v.footer ? " footer={…}" : ""}${v.dismissable ? "" : " dismissable={false}"}${!v.dismissable || v.closeButton === "x" ? "" : v.closeButton === "own" ? " closeButton={arrowLeft}" : " closeButton={false}"}${v.motion === "scale" ? "" : ` motion="${v.motion}"`}>${v.long ? "uzun içerik" : "…"}</Dialog>` }}</code>
    <div class="sc-row">
    <Button variant="primary" on:click={() => { $open = true }}>Pencereyi aç</Button>
    <span class="sc-strip-label" aria-live="polite">{() => ($last ? `Kapandı: ${$last}` : "")}</span>
    {() => {
      const v = props.values
      return <Dialog open={() => $open} onClose={() => close("Escape / perde / ×")} title={v.title} size={v.size as "md"} dismissable={v.dismissable}
        closeButton={v.closeButton === "off" ? false : v.closeButton === "own" ? arrowLeft : true} closeLabel={v.closeButton === "own" ? "Geri dön" : undefined} motion={v.motion as "scale"}
        footer={v.footer ? [<Button on:click={() => close("Vazgeç")}>Vazgeç</Button>, <Button variant="primary" on:click={() => close("Gönder")}>Gönder</Button>] : undefined}>
        <p>HADİ ekibine katılması için bir davet bağlantısı gönderilecek. Odak pencerenin içinde döner; kapanınca açan düğmeye geri gelir.</p>
        {v.long ? Array.from({ length: 14 }, (_, i) => <p>Ayrıntı {i + 1}: davet 7 gün geçerli, yalnız bir kez kullanılabilir.</p>) : null}
        {!v.footer && !v.dismissable ? <Button on:click={() => close("içerikteki düğme")}>Tamam</Button> : null}
      </Dialog>
    }}
    </div>
  </div>
}
