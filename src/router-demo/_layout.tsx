// Router demo layout: kept alive while its pages change (type in the box, switch tabs: the text stays). A list whose
// rows open in the named outlet "aside" (beside, in the URL) or as a modal route (over the page, back closes it).
import { Outlet, Link } from "hadi-march/router";
import { TextInput, Field, Badge } from "hadi-march/ui";
import { Section } from "../demo.tsx";
import { PEOPLE } from "./data.ts";

let mounts = 0

export default function RouterDemoLayout() {
  mounts++
  let $note = ""
  return <Section kicker="Gezinme" title="Yönlendirici" lead="Kalıcı yerleşim: bu bölümün çerçevesi bir kez kurulur; alttaki sekme değişse de yerinde kalır. Kutuya bir şey yaz, sekme değiştir: metin silinmez. Satırları yanda (adlı outlet, adreste ?~aside=) ya da pencerede (modal rota, geri tuşu kapatır) aç. Üst çubuktaki düğmeleri sayfa kendisi gönderir (Portal), sayfadan çıkınca kalkar.">
    <div class="sc-row">
      <Field label="Not (yerleşimde, sekme değişince kalır)"><TextInput bind:value={$note} placeholder="Bir şey yaz…" /></Field>
      <Badge tone="info">{`yerleşim kurulma sayısı: ${mounts}`}</Badge>
    </div>
    <nav class="hm-tabs-bar sc-row" aria-label="Demo sekmeleri">
      <Link href="/navigation/router" exact class="hm-btn hm-btn-secondary hm-btn-sm">Liste</Link>
      <Link href="/navigation/router/about" class="hm-btn hm-btn-secondary hm-btn-sm">Hakkında</Link>
    </nav>
    <div class="sc-router-cols">
      <div class="sc-router-pane"><Outlet /></div>
      <div class="sc-router-pane"><Outlet name="aside" empty={<p class="hm-muted">Yanda açmak için bir satırdaki "Yanda aç"a bas.</p>} /></div>
    </div>
    <p class="hm-muted">{`${PEOPLE.length} kayıt. Kayıt sayfasını doğrudan açarsan (adres çubuğu, yenile) tam sayfa gelir.`}</p>
  </Section>
}
