// Showcase stage for Overlay: one effect layer in a card, behind or in front of its content; colour, opacity, inset and
// blend follow the Playground (playground.ts).
import { Overlay } from "march/media";
import { Button } from "march/actions";

export const code = `<div class="card"><Overlay effect="mesh" /><h3>Başlık</h3></div>
<Overlay src="media/hadi-waves.webm" poster="media/hadi-waves.jpg" />   // sessiz, döngülü, görünürken oynar
<Overlay effect="glass" front inset={4} />
<Overlay effect="spotlight" m:color="brand-orange" />               // spotlight, dots, grid, vignette take a theme colour`

export default function OverlayDemo(props: { values: { effect: string; color: string; front: boolean; opacity: number; inset: number; blend: string } }) {
  return <div class="sc-col">
    {() => {
      const v = props.values
      return <div class="sc-ov-card">
        <Overlay effect={v.effect as "mesh"} m:color={v.color === "theme" ? undefined : (v.color as "brand-orange")} front={v.front} opacity={v.opacity} inset={v.inset} blend={v.blend === "normal" ? "" : v.blend} />
        <strong>HADİ Konferansı</strong>
        <p>Katman tıklamaları almaz: bu düğme çalışır.</p>
        <Button size="sm">Kayıt ol</Button>
      </div>
    }}
  </div>
}
