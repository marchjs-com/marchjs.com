// İlk Adımlar: install, the first component, the march CLI, the project layout and where to go next.
import { Button, LinkCard, Grid, KeyValue } from "hadi-march/ui";
import { arrowRight } from "hadi-march/icons";
import { Link, type Href } from "hadi-march/router";
import { Demo, Section } from "../demo.tsx";

// every export of every subpath, generated from the JSDoc of the sources (tools/api-coverage.js)

function Counter() {
  let $n = 0
  const $double = $n * 2
  return <div class="sc-row">
    <Button variant="primary" on:click={() => $n++}>Artır</Button>
    <span>Sayaç: <strong>{$n}</strong> · iki katı: <strong>{$double}</strong></span>
  </div>
}

const NEXT = [
  { href: "/language", title: "March dili", desc: "$ değişkenler, bind:, class:, borular, sx" },
  { href: "/themes", title: "Temalar ve tokenlar", desc: "Hazır temalar ve kendi temanı yazmak" },
  { href: "/forms", title: "Formlar", desc: "Şemadan form, doğrulama, seçiciler" },
  { href: "/data", title: "Veri", desc: "Tablo, ağaç, pano" },
  { href: "/speed", title: "Hız", desc: "Tembel yükleme, parça bütçeleri, önbellek" },
  { href: "/managers", title: "Yöneticiler", desc: "Viewport, rıza, komutlar" },
]

export default function Start() {
  return <Section kicker="İlk Adımlar" title="HADI March ile başla"
    lead="HADI March, sinyallerle çalışan, sıfır bağımlılıklı bir TypeScript çatısıdır: bileşenler bir kez çalışır, değişen yalnız ilgili DOM düğümüdür. Tek derleme aracı esbuild.">
    <Demo wide title="1. Kurulum" desc="Paketi bir commit'e sabitleyerek kur; esbuild derleyici, TypeScript ise tür denetimi için."
      lang="bash" code={`npm i github:tlghn/hadimarch#<commit-sha>
npm i -D esbuild typescript
npx march dev       # index.html + src/main.tsx, live reload, error overlay
npx march build     # dist/`}>
      <KeyValue items={[
        { label: "Gereken", value: "Node 22.18 ya da üstü" },
        { label: "Derleyici", value: "esbuild (JSX ve March dili bir eklentiyle)" },
        { label: "Çalışma zamanı bağımlılığı", value: "yok" },
      ]} />
    </Demo>

    <Demo wide title="2. İlk bileşen" desc="$ ile başlayan değişken bir sinyaldir; $n++ onu günceller, {$n} canlı metindir. Bileşen bir kez çalışır."
      code={`// src/components/Counter.tsx
export function Counter() {
  let $n = 0
  const $double = $n * 2          // derived value
  return <button on:click={() => $n++}>Sayaç: {$n} · iki katı: {$double}</button>
}

// src/main.tsx
import { render } from "hadi-march"
render(() => <Counter />, document.getElementById("app")!)`}>
      <Counter />
    </Demo>

    <Demo wide title="3. march CLI" desc="Geliştirme sunucusu, derleme, üreteçler ve denetim tek komutta."
      lang="bash" code={`march dev [--port 5173] [--mock openapi.json]
march build [--no-minify]
march gen routes | page | component | crud | api <name>
march i18n
march check`}>
      <KeyValue items={[
        { label: "march dev", value: "Canlı yenileme, hata katmanı, istenirse sahte API" },
        { label: "march build", value: "Rota başına parçalar, boyut bütçeleri, rapor" },
        { label: "march gen", value: "Sayfa, bileşen, CRUD ve API iskeletleri" },
        { label: "march check", value: "March sözdizimi dahil tür denetimi" },
      ]} />
    </Demo>

    <Demo wide title="4. Proje yapısı" desc="Dosya tabanlı yönlendirme: pages/ altındaki her dosya bir rota; src/components/ altındakiler kendiliğinden içe aktarılır."
      lang="text" code={`index.html
march.config.js        budgets, routes, chunk rules
src/
  main.tsx             entry: createRouter + render
  pages/               a file is a route (_layout.tsx nests layouts)
  components/          auto-imported components
  i18n/                message files
public/                copied as is`}>
      <KeyValue items={[
        { label: "pages/users/[id].tsx", value: "/users/:id rotası" },
        { label: "pages/_layout.tsx", value: "bütün sayfaları saran yerleşim" },
        { label: "march.config.js", value: "giriş ve rota boyut bütçeleri" },
      ]} />
    </Demo>

    <Demo wide title="5. Sonraki adımlar" desc="Vitrindeki sayfalar canlı örneklerdir; her kartın Kod sekmesi kopyalanabilir.">
      <Grid cols={3} gap={3}>{NEXT.map((n) => <LinkCard href={n.href} title={n.title} description={n.desc} />)}</Grid>
      <div class="sc-row"><Button variant="primary" href="/language" iconEnd={arrowRight}>March diline geç</Button></div>
    </Demo>

    <Demo wide title="6. API başvurusu" desc="Her alt yolun her dışa aktarımı kendi sayfasında: imza, parametreler, açıklama, örnekler ve canlı demo."
      code={`import { createRouter, Link, navigate } from "hadi-march/router"
import { lazy } from "hadi-march/lazy"
import { Chip } from "hadi-march/actions"      // bileşenler kategorisinin alt yolundan
import { Button, toast } from "hadi-march/ui"  // ya da hepsi tek yerden`}>
      <p><Link href={"/api" as Href}>API başvurusunu aç →</Link></p>
    </Demo>
  </Section>
}
