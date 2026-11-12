// The March language: $ variables, derived values, <For>/<If>/<Switch>, bind:, on:…|prevent, class:, pipes, sx, async components.
import { Card, Button, TextInput, Field, Toggle, Badge, Stack, Segmented } from "hadi-march/ui";
import { Demo, Section } from "../demo.tsx";

interface Todo { id: number; text: string; done: boolean }

export default function Language() {
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
  return <Section kicker="Hareket" title="March dili" lead="JSX ve birkaç küçük derleyici kolaylığı: $ önekli değişkenler sinyaldir, onlara bağlı const'lar türetilir. Çıktı düz JavaScript; eval yok, innerHTML yok.">
    <Demo wide title="Yapılacaklar: $, türetme, <For>, bind:, on:submit|prevent" desc="Bileşen bir kez çalışır; yalnız değişen satır güncellenir."
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
          <p class="hm-muted"><If when={$left > 0}>{$left} iş kaldı<Else>Hepsi bitti 🎉</Else></If></p>
        </Stack>
      </Card>
    </Demo>

    <Demo title="Borular (pipes)" desc="{değer | boru(arg)}: Intl tabanlı, dile duyarlı biçimleme."
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
    </Demo>

    <Demo title="sx ve class:" desc="sx derlemede statik sınıflara döner (satır içi stil üretmez); class:ad={koşul} sınıfı açar/kapatır."
      code={`<div sx={{ p: 4, gap: 2, cols: 3, radius: 3, shadow: 2 }}>…</div>
<Badge class:sc-pulse={$big}>Canlı</Badge>`}>
      <Toggle bind:value={$big} label="Vurgula" />
      <div sx={{ cols: 3, gap: 2 }}>
        <div class="sc-sx" sx={{ p: 3, radius: 2 }}>p-3</div>
        <div class="sc-sx" sx={{ p: 3, radius: 3, shadow: 2 }}>shadow-2</div>
        <div class="sc-sx" sx={{ p: 3, radius: 4, shadow: 3 }}>shadow-3</div>
      </div>
      <Badge tone="danger" dot class:sc-pulse={$big}>Canlı</Badge>
    </Demo>
  </Section>
}
