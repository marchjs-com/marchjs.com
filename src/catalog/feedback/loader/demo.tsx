// Showcase stage for Loader: text, spinner, colour and fade from the Playground values; inline, or over a card's content (overlay) until "Bitir".
import { Loader } from "march/feedback";
import { Button } from "march/actions";
import { Icon, hourglass } from "march/icons";

export const code = `<Loader text="Panolar hazırlanıyor…" />
<div class="relative">{content}{() => busy() && <Loader overlay />}</div>
<Loader color="brand-orange" />  <Loader spinner={<Icon of={hourglass} />} label="Açılıyor" />  <Loader spinner={false} text="Bir saniye…" />
bootLoader.done()                            // index.html'deki #m-boot ekranını kaldırır`

export default function LoaderDemo(props: { values: { text: string; overlay: boolean; spinner: string; color: string; fade: boolean } }) {
  let $busy = true
  return <div class="sc-col">
    <div class="sc-row"><Button size="sm" on:click={() => { $busy = !$busy }}>{() => ($busy ? "Bitir" : "Yeniden yükle")}</Button></div>
    {() => {
      const v = props.values
      const text = v.text || undefined
      const part = () => ({
        spinner: v.spinner === "off" ? false : v.spinner === "own" ? <Icon of={hourglass} size="xl" /> as Node : true,
        color: v.color === "theme" || v.spinner !== "on" ? undefined : (v.color as "success"),
        fade: v.fade,
      })
      if (!v.overlay) return $busy ? <Loader text={text} {...part()} /> : <p class="sc-loader-done">Panolar hazır.</p>
      return <div class="sc-loader-box">
        <strong>HADİ satış panosu</strong>
        <p class="m-muted">Bu çeyrekte 1.284 sipariş, ortalama sepet 412 ₺.</p>
        {$busy ? <Loader overlay text={text} {...part()} /> : null}
      </div>
    }}
  </div>
}
