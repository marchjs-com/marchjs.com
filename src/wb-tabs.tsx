// The tabs under a component's workbench: Özellikler (its props table: the row of the prop an option just changed
// lights up), Erişilebilirlik (keyboard, screen reader, focus) and Parçalar ve ilgili (the components it is built from
// and the ones built from it). The text comes from the folder's docs.md (March publishes one JSON per
// category under public/comp/<category>.json), fetched when a tab first opens.
import { signal, effect, untrack, onCleanup } from "march";
import { Link, type Href } from "march/router";
import { Tabs } from "march/ui";
import { appUrl } from "march/base";
import type { PlaygroundOption, PlaygroundSpec } from "./catalog/spec.ts";
import { cards, type CardEntry } from "./catalog/cards.gen.ts";
import { demoId } from "./component-demo.tsx";

interface FolderDocs { props: [string, string, string, string][]; notes: string; a11y: string }
const cache = new Map<string, Promise<Record<string, FolderDocs>>>()
const docsOf = (folder: string): Promise<FolderDocs | null> => {
  const cat = folder.split("/")[0]!
  let p = cache.get(cat)
  if (!p) { p = fetch(appUrl(`comp/${cat}.json`)).then((r) => (r.ok ? r.json() : {})).catch(() => ({})) as Promise<Record<string, FolderDocs>>; cache.set(cat, p) }
  return p.then((all) => all[folder] ?? null)
}

/** `code` spans and paragraphs of a docs.md text (no other markdown is used in these sections). */
function Text(props: { md: string }) {
  return <>{props.md.split(/\n{2,}/).filter((x) => x.trim()).map((para) =>
    <p class="sc-wbt-p">{para.replace(/\n/g, " ").split("`").map((bit, i) => (i % 2 ? <code>{bit}</code> : bit))}</p>)}</>
}
const inline = (md: string): unknown => md.split("`").map((bit, i) => (i % 2 ? <code>{bit}</code> : bit))
/** The bare prop names of a table cell (`icon` / `iconEnd` → icon, iconEnd). */
const namesOf = (cell: string): string[] => [...cell.matchAll(/`([^`]+)`/g)].map((m) => m[1]!.replace(/[=(].*$/, "").trim())

function Wait(props: { load: Promise<unknown>; children: () => unknown }) {
  const ready = signal(false)
  void props.load.then(() => ready.set(true))
  return <>{() => (ready() ? untrack(props.children) : <p class="sc-wbt-empty">Yükleniyor…</p>)}</>
}

export function WorkbenchTabs(props: { entry: CardEntry; spec: PlaygroundSpec; values: () => Record<string, unknown> }) {
  const docs = signal<FolderDocs | null>(null)
  const load = docsOf(props.entry.f).then((d) => docs.set(d))
  // the prop an option just changed: its row lights up for a moment (the option's prop name, else its key)
  const lit = signal<string | null>(null)
  let last = untrack(props.values), timer: ReturnType<typeof setTimeout> | undefined
  effect(() => {
    const now = props.values()
    const o = props.spec.options.find((x: PlaygroundOption) => now[x.key] !== last[x.key])
    last = now
    if (!o) return
    const name = typeof o.prop === "string" ? o.prop : o.prop === false ? null : o.key
    lit.set(name); clearTimeout(timer); timer = setTimeout(() => lit.set(null), 1600)
  })
  onCleanup(() => clearTimeout(timer))
  const used = cards.filter((c) => c.p?.includes(props.entry.n))
  const own = (props.entry.p ?? []).map((n) => cards.find((c) => c.n === n) ?? ({ n, s: "" } as Partial<CardEntry> & { n: string }))
  const href = (c: Partial<CardEntry>): Href | null => (c.w && c.f ? `${c.w}#${demoId(c.f)}` as Href : null)
  // the Turkish title and one sentence of a component: its topic page (topics.ts) where it has one
  // (wb-topics.ts: the topic tables, ~18 KB, load when the Parçalar tab first opens, not with every component page)
  let topicOf: typeof import("./wb-topics.ts").topicOf = () => undefined
  const PartCard = (c: Partial<CardEntry> & { n: string }) => {
    const to = href(c), topic = topicOf(c.w, c.n)
    const body = <><span class="sc-wbt-ptitle">{topic?.title ?? c.n}</span><span class="sc-wbt-pname">{c.n}</span>{topic?.desc ? <span class="sc-wbt-psum">{topic.desc}</span> : null}</>
    return to ? <Link class="sc-wbt-part sc-card" href={to}>{body}</Link> : <div class="sc-wbt-part sc-card">{body}</div>
  }

  const propsTab = () => <Wait load={load}>{() => {
    const d = docs()
    if (!d?.props.length) return <p class="sc-wbt-empty">Bu bileşenin özellik tablosu yok.</p>
    return <div class="sc-wbt-props">
      <table class="sc-wbt-table">
        <thead><tr><th scope="col">Özellik</th><th scope="col">Tür</th><th scope="col">Varsayılan</th><th scope="col">Açıklama</th></tr></thead>
        <tbody>{d.props.map(([name, type, def, about]) => {
          const names = namesOf(name)
          return <tr class={() => (lit() && names.includes(lit()!) ? "is-changed" : null)}>
            <th scope="row">{inline(name)}</th><td>{inline(type)}</td><td>{inline(def || "—")}</td><td>{inline(about)}</td>
          </tr>
        })}</tbody>
      </table>
      {d.notes ? <div class="sc-wbt-notes"><Text md={d.notes} /></div> : null}
      {props.entry.a ? <p class="sc-wbt-more"><Link href={`/api/${props.entry.a}` as Href}>API başvurusunda tam imza ve türler →</Link></p> : null}
    </div>
  }}</Wait>
  const a11yTab = () => <Wait load={load}>{() => {
    const d = docs()
    return d?.a11y ? <div class="sc-wbt-text"><Text md={d.a11y} /></div> : <p class="sc-wbt-empty">Bu bileşen için erişilebilirlik notu yok.</p>
  }}</Wait>
  const partsTab = () => <Wait load={import("./wb-topics.ts").then((m) => { topicOf = m.topicOf })}>{() => <div class="sc-wbt-rel">
    <section><h3 class="sc-wbt-h">Şunlardan oluşur</h3>
      {own.length ? <div class="sc-wbt-grid">{own.map(PartCard)}</div> : <p class="sc-wbt-empty">Başka bir bileşen kullanmaz: kendi başına bir yapı taşı.</p>}</section>
    <section><h3 class="sc-wbt-h">Bunu kullananlar</h3>
      {used.length ? <div class="sc-wbt-grid">{used.map(PartCard)}</div> : <p class="sc-wbt-empty">Henüz başka bir bileşen bunun üstüne kurulmuyor.</p>}</section>
  </div>}</Wait>

  return <div class="sc-wbt">
    <Tabs label="Bileşen ayrıntıları" tabs={[
      { id: "props", label: "Özellikler", content: propsTab },
      { id: "a11y", label: "Erişilebilirlik", content: a11yTab },
      { id: "parts", label: "Parçalar ve ilgili", badge: own.length + used.length || null, content: partsTab },
    ]} />
  </div>
}
