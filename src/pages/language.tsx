// The March language: $ variables, derived values, <For>/<If>/<Switch>, bind:, on:…|prevent, class:, pipes, sx, async components.
import "hadi-march/motion/install"; // <For animate> (FLIP) on this page
import { Card, Button, TextInput, Field, Toggle, Badge, Stack, Segmented, Widget, codeView } from "hadi-march/ui";
import type { CodeViewInput } from "hadi-march/ui";
import { onCleanup, effect, untrack } from "hadi-march";

/** A stand-in for a live editor: plain text, no colours. Registered only while the switch is on. */
function PlainProvider(input: CodeViewInput) {
  return <div class="sc-plain-code"><p class="m-muted">Sahte sağlayıcı ({input.lang}): renksiz düz metin</p><pre>{input.source}</pre></div>
}
import { Demo } from "../demo.tsx";
import { Hub } from "../hub.tsx";

interface Todo { id: number; text: string; done: boolean }

export default function Language(props: { params?: { rest?: string } }) {
  let $todos: Todo[] = [{ id: 1, text: "Temayı seç", done: true }, { id: 2, text: "Tabloyu kaydır", done: false }, { id: 3, text: "Ctrl+K'ye bas", done: false }]
  let $draft = ""
  let $filter = "hepsi"
  const $left = $todos.filter((x) => !x.done).length
  const $shown = $filter === "hepsi" ? $todos : $todos.filter((x) => (x.done ? $filter === "bitti" : $filter === "açık"))
  let nextId = 4
  const add = () => { const v = $draft.trim(); if (!v) return; $todos = [...$todos, { id: nextId++, text: v, done: false }]; $draft = "" }
  const toggle = (id: number) => { $todos = $todos.map((x) => (x.id === id ? { ...x, done: !x.done } : x)) }

  let $price = 1499.9
  let $when = Date.now() - 3 * 3600_000
  let $name = "zeynep kaya"
  let $big = false
  let $plain = false
  let $locked = true
  let $partTone = "success"
  let $partSmall = true
  let $mColor = "brand-blue"
  let $mTheme = "night"
  let $mRtl = false
  let $mCan = "yes"
  let $mRun = 0
  let $sample = "Girdiye yazılan yazı seçilebilir"
  let offPlain: (() => void) | null = null
  const setPlain = (on: boolean) => untrack(() => { offPlain?.(); offPlain = on ? codeView.provide({ id: "plain", order: 1, render: (input) => PlainProvider(input) }) : null })
  effect(() => setPlain($plain))
  onCleanup(() => offPlain?.())
  const RENDER: Record<string, () => unknown> = {
    "todos": () => <Demo wide title="Yapılacaklar: $, türetme, <For>, bind:, on:submit|prevent" desc="Bileşen bir kez çalışır; yalnız değişen satır güncellenir."
    code={`let $todos = [...]
let $draft = ""
const $left = $todos.filter((x) => !x.done).length   // derived (computed)
<form on:submit|prevent={add}>
<TextInput bind:value={$draft} />
</form>
<For each={$shown} key="id" animate>{(t) =>
<li class:done={t().done} on:click={() => toggle(t().id)}>{t().text}</li>}
</For>
<p>{$left} iş kaldı</p>`}>
    <Card>
      <Stack gap={3}>
        <form class="sc-row" on:submit|prevent={add}>
          <div class="sc-grow"><TextInput bind:value={$draft} placeholder="Yeni iş ekle ve Enter" aria-label="Yeni iş" /></div>
          <Button type="submit" variant="primary">Ekle</Button>
        </form>
        <Segmented bind:value={$filter} aria-label="Süzgeç" options={[{ value: "hepsi", label: "Hepsi" }, { value: "açık", label: "Açık" }, { value: "bitti", label: "Bitti" }]} />
        <ul class="sc-todos">
          <For each={$shown} key="id" animate>{(t: () => Todo) =>
            <li class="sc-todo" class:is-done={t().done}>
              <button type="button" class="sc-todo-hit" on:click={() => toggle(t().id)} aria-pressed={String(t().done)}><span class="sc-check" />{t().text}</button>
            </li>}
          </For>
        </ul>
        <p class="m-muted"><If when={$left > 0}>{$left} iş kaldı<Else>Hepsi bitti 🎉</Else></If></p>
      </Stack>
    </Card>
  </Demo>,
    "pipes": () => <Demo title="Borular (pipes)" desc="{değer | boru(arg)}: Intl tabanlı, dile duyarlı biçimleme."
    code={`{$price | money("TRY")}
{$time | relative}
{$name | title}
{1234567 | compact}`}>
    <Stack gap={2}>
      <div class="sc-kv"><code>money("TRY")</code><strong>{$price | money("TRY")}</strong></div>
      <div class="sc-kv"><code>relative</code><strong>{$when | relative}</strong></div>
      <div class="sc-kv"><code>title</code><strong>{$name | title}</strong></div>
      <div class="sc-kv"><code>compact</code><strong>{2410000 | compact}</strong></div>
      <div class="sc-kv"><code>bytes</code><strong>{48256 | bytes}</strong></div>
      <Field label="Fiyat"><TextInput bind:value={$price} inputmode="decimal" /></Field>
    </Stack>
  </Demo>,
    "sx-class": () => <Demo title="sx ve class:" desc="sx derlemede statik sınıflara döner (satır içi stil üretmez); class:ad={koşul} sınıfı açar/kapatır."
    code={`<div sx={{ p: 3, radius: 3, shadow: 2 }}>…</div>   // → class="m-p-3 m-radius-3 m-shadow-2"
<div class="box" class:is-hot={$big}>…</div>         // $big true → class="box is-hot"`}>
    <div class="sc-options"><Toggle bind:value={$big} label="Vurgula (class:is-hot)" /></div>
    <div sx={{ cols: 3, gap: 2 }}>
      <div class="sc-sx" class:is-hot={$big} sx={{ p: 3, radius: 2 }}><code>{"sx={{ p: 3, radius: 2 }}"}</code><span>→ .m-p-3 .m-radius-2</span></div>
      <div class="sc-sx" class:is-hot={$big} sx={{ p: 3, radius: 3, shadow: 2 }}><code>{"sx={{ p: 3, shadow: 2 }}"}</code><span>→ .m-p-3 .m-shadow-2</span></div>
      <div class="sc-sx" class:is-hot={$big} sx={{ p: 3, radius: 4, shadow: 3 }}><code>{"sx={{ p: 3, shadow: 3 }}"}</code><span>→ .m-p-3 .m-shadow-3</span></div>
    </div>
    <div class="sc-row"><Badge tone="danger" dot class:sc-pulse={$big}>Canlı</Badge><span class="m-muted">{() => ($big ? "class:is-hot açık: vurgu kenarlığı, yumuşak zemin, hafif büyütme" : "class:is-hot kapalı")}</span></div>
  </Demo>,
    "common-props": () => <><Demo wide title="Ortak prop'lar: m:no-select" desc="m: ile başlayan prop'lar her yerel öğede ve her bileşende çalışır. m:no-select açıkken öğenin kendisi ve içindeki her şey seçilemez (girdiye yazılan yazı seçilebilir kalır); içerideki m:no-select={false} o parçada seçimi geri açar."
    code={`<section m:no-select>…</section>            // sabit değer: derlemede tek bir özniteliğe döner
<Card m:no-select={$locked}>…</Card>         // bileşen: kök öğesine uygulanır; değer canlı olabilir
<code m:no-select={false}>HADI2026</code>    // kapalı alanın içinde: bu parça yine seçilebilir`}>
    <div class="sc-options"><Toggle bind:value={$locked} label="Seçimi kapat (m:no-select)" /></div>
    <div sx={{ cols: 2, gap: 3 }}>
      <section class="sc-sx" sx={{ p: 3, radius: 3 }} m:no-select={$locked || null}>
        <strong>Yerel öğe</strong>
        <span>Bu yazıyı fareyle sürükleyerek ya da çift tıklayarak seçmeyi dene.</span>
        <TextInput bind:value={$sample} aria-label="Örnek girdi" />
        <span>Kupon kodu: <code m:no-select={false}>HADI2026</code> (her zaman seçilebilir)</span>
      </section>
      <Card title="Bileşen (Card)" m:no-select={$locked || null}>
        <Stack gap={2}>
          <span>Aynı prop bileşende de çalışır: kartın kökü ve içindeki her şey.</span>
          <div class="sc-row"><Badge tone="info">Rozet</Badge><Button variant="secondary">Düğme</Button></div>
        </Stack>
      </Card>
    </div>
    <p class="m-muted">{() => ($locked ? "Kapalı: iki kutuda da yazılar seçilemiyor; yalnız girdinin içindeki yazı ve kupon kodu seçilebilir." : "Açık: her şey her zamanki gibi seçilebilir.")}</p>
  </Demo>
  <Demo wide title="Ortak prop'lar: m:parts" desc="m:parts, bir öğenin ya da bileşenin İÇİNDE çizilen bileşenlere türüne göre özellik verir: kartı yazan kişi bunun için ayrı bir prop açmak zorunda kalmaz. Anahtarlar bileşen adlarıdır; verdiğin değer içerideki bileşenin kendi aldığını ezer, en yakın kapsam kazanır, değer canlı kalır."
    code={`<MemberCard m:parts={{ Badge: { tone: $tone }, Button: { size: "sm", variant: "secondary" } }} />
<section m:parts={{ Button: { size: "sm" } }}>…bölümdeki bütün düğmeler…</section>
withParts(new Map([[Badge, { tone: "warn" }]]), () => h(MemberCard, props))   // elle yazım (hadi-march/props)`}>
    <div class="sc-options"><Field label="Rozet tonu (Badge)" group><Segmented aria-label="Rozet tonu" bind:value={$partTone} options={[{ value: "success", label: "başarı" }, { value: "warn", label: "uyarı" }, { value: "danger", label: "tehlike" }]} /></Field>
      <Toggle bind:value={$partSmall} label="Düğmeler küçük ve ikincil (Button)" /></div>
    <div sx={{ cols: 2, gap: 3 }}>
      <Card title="m:parts ile" m:parts={{ Badge: { tone: $partTone }, Button: $partSmall ? { size: "sm", variant: "secondary" } : {} }}>
        <Stack gap={2}>
          <div class="sc-row"><Badge tone="info">Etkin</Badge><Badge tone="info">Yönetici</Badge></div>
          <div class="sc-row"><Button>Mesaj gönder</Button><Button>Profil</Button></div>
        </Stack>
      </Card>
      <Card title="m:parts olmadan">
        <Stack gap={2}>
          <div class="sc-row"><Badge tone="info">Etkin</Badge><Badge tone="info">Yönetici</Badge></div>
          <div class="sc-row"><Button>Mesaj gönder</Button><Button>Profil</Button></div>
        </Stack>
      </Card>
    </div>
    <p class="m-muted">İki kartın içi aynı kodla yazıldı; soldakinin rozetleri ve düğmeleri dışarıdan, kartın m:parts'ı ile değişiyor.</p>
  </Demo>
  <Demo wide title="Ortak prop'lar: renk, tema, yön, ipucu, giriş, yetki, test" desc="Her bileşende aynı işi yapan özellikler tek bir yerde: m:color alt ağacın rengini, m:theme başka bir renk temasını, m:dir ve m:lang yazım yönünü ve dilini verir; m:tip sarmalayıcısız ipucu, m:reveal görünür alana girince giriş hareketi, m:can yetkisi olmayana gizler ya da devre dışı gösterir, m:test testler için sabit bir tutamak bırakır. Hepsi yerel öğede ve her bileşende çalışır; sabit değer yerel öğede derlemede özniteliğe döner."
    code={`<Card m:color="brand-blue" m:theme="night" m:dir="rtl" m:lang="ar">   // renk, tema, yön, dil
  <Button m:tip="Bağlantıyı kopyalar">Kopyala</Button>                  // sarmalayıcısız ipucu
  <Button m:can={canDelete} m:test="delete">Sil</Button>               // yetki yoksa gizli; testte data-testid
  <Button m:can={{ allow: canDelete, else: "disable" }}>Sil</Button>   // yetki yoksa devre dışı
  <section m:reveal={120}>…</section>                                  // görünür alana girince belirir
</Card>`}>
    <div class="sc-options">
      <Field label="Renk (m:color)" group><Segmented aria-label="Renk" bind:value={$mColor} options={[{ value: "brand-blue", label: "mavi" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-green", label: "yeşil" }, { value: "brand-purple", label: "mor" }]} /></Field>
      <Field label="Tema (m:theme)" group><Segmented aria-label="Tema" bind:value={$mTheme} options={[{ value: "night", label: "Gece mavisi" }, { value: "cream", label: "Krem" }, { value: "neon", label: "Neon" }, { value: "", label: "sayfanınki" }]} /></Field>
      <Toggle bind:value={$mRtl} label="Sağdan sola (m:dir, m:lang)" />
      <Field label="Yetki (m:can)" group><Segmented aria-label="Yetki" bind:value={$mCan} options={[{ value: "yes", label: "var" }, { value: "hide", label: "yok: gizle" }, { value: "disable", label: "yok: devre dışı" }]} /></Field>
    </div>
    <Card title={() => ($mRtl ? "بطاقة العضو" : "Üye kartı")} m:color={$mColor} m:theme={$mTheme || null} m:dir={$mRtl ? "rtl" : null} m:lang={$mRtl ? "ar" : null}>
      <Stack gap={3}>
        <span>{() => ($mRtl ? "النص يتدفق من اليمين إلى اليسار." : "Kartın rengi, teması ve yönü dışarıdan, ortak prop'larla geliyor.")}</span>
        <div class="sc-row">
          <Button variant="primary" m:tip="Bağlantıyı panoya kopyalar">Kopyala</Button>
          <Button variant="secondary" m:can={$mCan === "yes" ? true : $mCan === "hide" ? false : { allow: false, else: "disable" }} m:test="delete">Sil</Button>
          <Badge tone="info" m:tip="m:tip her öğede çalışır">Rozet</Badge>
        </div>
        <div class="sc-row">{() => { $mRun; return untrack(() => <section class="sc-sx" sx={{ p: 3, radius: 3 }} m:reveal={120}>Görünür alana girince bir kez belirir (m:reveal).</section>) }}
          <Button size="sm" variant="ghost" on:click={() => { $mRun++ }}>Yeniden oynat</Button></div>
      </Stack>
    </Card>
    <p class="m-muted">Kopyala düğmesinin ya da rozetin üstüne gel, ya da Sekme ile odaklan: ipucu çıkar. "Sil" düğmesinin test tutamağı: data-testid="delete".</p>
  </Demo></>,
    "code-widget": () => <Demo wide title="Kod sekmesi bir widget noktası" desc="Bütün Kod sekmeleri <Widget sources={[codeView]} /> ile çizilir. Varsayılan sağlayıcı CodeViewer (renkli, salt okunur); Kopyala ve Tam ekran ayrı widget'lardır. Anahtarı açınca ikinci bir sağlayıcı kaydedilir ve vitrindeki bütün Kod sekmeleri onu gösterir. Bir canlı kod editörü aynı noktaya sağlayıcı olarak eklenebilir."
    code={`import { codeView } from "hadi-march/ui"
const off = codeView.provide({
id: "plain",
order: 1,                                  // higher than the default viewer (0)
render: (input, ctx) => <pre>{input.source}</pre>,
})
off()                                        // back to CodeViewer`}>
    <Toggle bind:value={$plain} label="Sahte sağlayıcıyı kaydet" />
    <Widget sources={[codeView]} input={{ lang: "tsx", source: 'export const Hello = () => <p class="hi">Merhaba</p>', files: [{ name: "hello.css", lang: "css", source: ".hi { color: var(--m-primary-text); }" }, { name: "data.json", lang: "json", source: '{ "name": "March", "fast": true, "size": 15 }' }] }} />
  </Demo>,
  }
  return <Hub section="/language" kicker="Hareket" title="March dili" lead="JSX ve birkaç küçük derleyici kolaylığı: $ önekli değişkenler sinyaldir, onlara bağlı const'lar türetilir. Çıktı düz JavaScript; eval yok, innerHTML yok." render={RENDER} params={props.params} />
}
