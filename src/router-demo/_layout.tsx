// Router demo layout: the frame of this demo is built once and stays while its tabs change below it.
// The counter counts how often the frame was built during this visit (it starts again when you leave the demo).
import { Outlet, path } from "march/router";
import { Button } from "march/ui";
import { onCleanup } from "march";
import { TextInput, Field, Badge, Card, Grid } from "march/ui";
import { Section } from "../demo.tsx";

let builds = 0

export default function RouterDemoLayout() {
  builds++
  // leaving the demo (not just switching its tabs) starts a new visit
  onCleanup(() => { setTimeout(() => { if (!path().startsWith("/navigation/router")) builds = 0 }, 0) })
  let $note = ""
  return <Section kicker="Gezinme" title="Yönlendirici" lead="Bu sayfanın çerçevesi bir kez kurulur. Alttaki sekmeler değişince yalnız sekmenin içi değişir.">
    <Card>
      <Field label="Buraya yaz, sonra alttaki sekmeyi değiştir; yazdığın kalır (çerçeve yeniden kurulmaz).">
        <TextInput bind:value={$note} placeholder="Bir şey yaz…" />
      </Field>
      <Badge tone="info">{`Çerçeve kaç kez kuruldu: ${builds}`}</Badge>
    </Card>
    <nav class="sc-row" aria-label="Demo sekmeleri">
      <Button href="/navigation/router" exact size="sm">Liste</Button>
      <Button href="/navigation/router/about" size="sm">Hakkında</Button>
    </nav>
    <div class="sc-router-cols">
      <div class="sc-router-pane"><Outlet /></div>
      <div class="sc-router-pane"><Outlet name="aside" empty={<p class="m-muted">Yan panel boş. Listede "Yanda aç"a bas.</p>} /></div>
    </div>
    <Grid cols={3} gap={3} minCol="14rem">
      <Card title="Yan panel"><p>"Yanda aç" kaydı sağdaki panelde açar; adres de değişir, paylaşınca aynı görünüm gelir.</p></Card>
      <Card title="Pencerede açma"><p>"Pencerede aç" kaydı listenin üstünde açar; tarayıcının geri tuşu pencereyi kapatır.</p></Card>
      <Card title="Üst çubuk düğmeleri"><p>Üst çubuktaki düğmeyi bu sekme koyar; başka sekmede ya da sayfada kalkar.</p></Card>
    </Grid>
  </Section>
}
