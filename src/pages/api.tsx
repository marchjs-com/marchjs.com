// API: every runtime export of every package subpath. Left: a searchable tree grouped by subpath; right: the selected
// export's full documentation — signature with types, parameter / props / member tables, value contents, the long-form
// doc (docs/api/<subpath>/<name>.md), the live example (api-examples/<group>.tsx), related exports, version and stability.
// Deep links: #/api/<subpath>/<name> (subpath without "hadi-march/", the core entry is "core").
// Data (tools/api-docs.js): public/api/index.<lang>.json (the search index, one file) and public/api/docs-<n>.json (the
// full docs, fetched when one of their exports opens). Nothing of it is part of start-up.
import "./api.css";
import { SearchBox, Badge, Markdown, registerCommands } from "hadi-march/ui";
import { Link, navigate, params, type Href } from "hadi-march/router";
import { locale, effect, onCleanup, Try, signal, computed, untrack } from "hadi-march";
import { fold } from "hadi-march/ui";
import { lazy } from "hadi-march/lazy";
import { loadExample } from "../api-examples.gen.ts";
import type { ApiExampleModule } from "../api-examples/types.ts";
import { LitePlayground } from "../play-lite.tsx";

const DemoCode = lazy(() => import("../demo-code.tsx"), { placeholder: "text", height: "6rem" })

type Kind = "component" | "function" | "class" | "const"
type Item = [name: string, kind: Kind, summary: string, status: string, file: number]
interface Index { icons: number; subpaths: { subpath: string; slug: string; items: Item[] }[] }
interface Param { name: string; type: string; optional: boolean; rest?: boolean; default?: string; doc?: string }
interface Member { name: string; kind: "method" | "property" | "accessor"; static: boolean; readonly: boolean; signature: string; summary: string }
interface Doc {
  subpath: string; name: string; kind: Kind; doc: string; tr: string; md: string; status: string; since: string; demo: string; see: string[];
  signature: string; params?: Param[]; returns?: { type: string; doc: string }; props?: Param[];
  ctor?: { text: string; params: Param[] }[]; extends?: string[]; members?: Member[]; events?: string[];
  valueType?: string; value?: string;
}

const TEXT = {
  tr: { title: "API", lead: "Her alt yolun her dışa aktarımı: imza, parametreler, açıklama, örnekler ve canlı demo.", search: "Ara: signal, createRouter, toast…",
    label: "API ara", kinds: { component: "bileşen", function: "işlev", class: "sınıf", const: "değer" } as Record<Kind, string>,
    status: { stable: "kararlı", experimental: "deneysel", deprecated: "kullanımdan kalkıyor" } as Record<string, string>,
    sig: "İmza", params: "Parametreler", props: "Prop'lar", returns: "Dönüş", name: "Ad", type: "Tür", def: "Varsayılan", desc: "Açıklama",
    ctor: "Yapıcı (constructor)", members: "Üyeler", statics: "Statik üyeler", ext: "Kalıtım", events: "Olaylar", value: "İçerik", valueType: "Tür",
    example: "Örnek", live: "Canlı demo", related: "İlgili", demo: "Bu bileşenin demosuna git", prev: "Önceki", next: "Sonraki",
    since: "sürüm", loading: "Yükleniyor…", none: "Eşleşen dışa aktarım yok.", pick: "Soldan bir dışa aktarım seçin.", notFound: "Bu dışa aktarım bulunamadı.",
    icons: "ikon", iconsPage: "İkonlar sayfası", noExample: "Bu dışa aktarımın canlı örneği hazırlanıyor.", failed: "Örnek çalışırken hata oluştu", show: "Tamamını göster",
    optional: "isteğe bağlı", exports: "dışa aktarım", import: "İçe aktarma", readonly: "salt okunur" },
  en: { title: "API", lead: "Every export of every subpath: signature, parameters, description, examples and a live demo.", search: "Search: signal, createRouter, toast…",
    label: "Search the API", kinds: { component: "component", function: "function", class: "class", const: "value" } as Record<Kind, string>,
    status: { stable: "stable", experimental: "experimental", deprecated: "deprecated" } as Record<string, string>,
    sig: "Signature", params: "Parameters", props: "Props", returns: "Returns", name: "Name", type: "Type", def: "Default", desc: "Description",
    ctor: "Constructor", members: "Members", statics: "Static members", ext: "Extends", events: "Events", value: "Content", valueType: "Type",
    example: "Example", live: "Live demo", related: "Related", demo: "Go to this component's demo", prev: "Previous", next: "Next",
    since: "since", loading: "Loading…", none: "No export matches.", pick: "Pick an export on the left.", notFound: "This export was not found.",
    icons: "icons", iconsPage: "Icons page", noExample: "The live example of this export is on its way.", failed: "The example failed", show: "Show all",
    optional: "optional", exports: "exports", import: "Import", readonly: "read-only" },
}
type Lang = keyof typeof TEXT
const langOf = (loc: string): Lang => (loc.split("-")[0] === "tr" ? "tr" : "en")
const TONE: Record<Kind, string> = { component: "primary", function: "info", class: "warn", const: "neutral" }
const asset = (p: string) => new URL(`api/${p}`, document.baseURI).href
const json = <T,>(p: string): Promise<T> => fetch(asset(p)).then((r) => { if (!r.ok) throw new Error(`${r.status} ${p}`); return r.json() as Promise<T> })
const indexes = new Map<Lang, Promise<Index>>()
const docFiles = new Map<number, Promise<Record<string, Doc>>>()
const hrefOf = (slug: string, name: string) => `/api/${slug}/${name}` as Href

export default function ApiPage() {
  const lang = computed(() => langOf(locale()))
  const T = () => TEXT[lang()]
  const index = signal<Index | null>(null)
  effect(() => {
    const l = lang()
    let p = indexes.get(l)
    if (!p) indexes.set(l, (p = json<Index>(`index.${l}.json`)))
    void p.then((x) => index.set(x))
  })
  // the selected export from the URL: /api/<slug…>/<name>
  const sel = computed(() => {
    const rest = (params()["rest"] ?? "").split("/").filter(Boolean)
    if (rest.length < 2) return null
    return { slug: rest.slice(0, -1).join("/"), name: rest[rest.length - 1]! }
  })
  // flat order for previous / next and keyboard moves
  const flat = computed(() => (index()?.subpaths ?? []).flatMap((s) => s.items.map((i) => ({ s, i }))))
  let $q = ""
  const shown = computed(() => {
    const q = fold($q.trim())
    return (index()?.subpaths ?? []).map((s) => ({ ...s, items: s.items.filter((i) => !q || fold(i[0]).includes(q) || fold(i[2]).includes(q) || fold(s.subpath).includes(q)) })).filter((s) => s.items.length)
  })
  // Ctrl+K: every export is a command of the palette while this page is open
  effect(() => {
    const ix = index()
    if (!ix) return
    const off = untrack(() => registerCommands(ix.subpaths.flatMap((s) => s.items.map((i) => ({ id: `api-${s.slug}-${i[0]}`, title: `${i[0]} — ${s.subpath}`, group: "API", keywords: i[2], run: () => void navigate(hrefOf(s.slug, i[0])) })))))
    onCleanup(off)
  })
  let listEl: HTMLElement | undefined
  // arrow keys move through the visible results; Enter opens the first one from the search box
  const onKey = (e: KeyboardEvent) => {
    const links = [...(listEl?.querySelectorAll<HTMLAnchorElement>("a.sc-apip-link") ?? [])]
    if (!links.length) return
    const at = links.indexOf(document.activeElement as HTMLAnchorElement)
    if (e.key === "ArrowDown") { e.preventDefault(); links[Math.min(links.length - 1, at + 1)]?.focus() }
    else if (e.key === "ArrowUp") { e.preventDefault(); if (at <= 0) (listEl?.parentElement?.querySelector("input") as HTMLInputElement | null)?.focus(); else links[at - 1]?.focus() }
    else if (e.key === "Enter" && at < 0) { e.preventDefault(); links[0]!.click() }
  }
  return <div class="sc-page sc-apip">
    <header class="sc-page-head">
      <span class="sc-kicker">{() => T().title}</span>
      <h1 class="sc-h1">{() => `HADI March API`}</h1>
      <p class="sc-lead">{() => T().lead}</p>
    </header>
    <div class="sc-apip-grid">
      <nav class="sc-apip-nav" aria-label={T().label} onKeyDown={onKey}>
        <SearchBox bind:value={$q} placeholder={T().search} label={T().label} />
        <p class="sc-apip-count">{() => { const ix = index(); if (!ix) return T().loading; const n = shown().reduce((a, s) => a + s.items.length, 0); return `${n} ${T().exports} · ${ix.icons} ${T().icons} › ` }}
          <Link href={"/icons" as Href}>{() => T().iconsPage}</Link></p>
        <div class="sc-apip-tree" ref={(el: HTMLElement) => { listEl = el }}>
          {() => (index() && !shown().length ? <p class="sc-apip-note">{T().none}</p> : null)}
          {() => shown().map((s) => <details class="sc-apip-group" open={!!$q || sel()?.slug === s.slug || shown().length < 4}>
            <summary><code>{s.subpath}</code><span class="sc-apip-n">{s.items.length}</span></summary>
            <ul>{s.items.map((i) => <li><Link class={() => (sel()?.slug === s.slug && sel()?.name === i[0] ? "sc-apip-link is-on" : "sc-apip-link")} href={hrefOf(s.slug, i[0])}
              aria-current={() => (sel()?.slug === s.slug && sel()?.name === i[0] ? "page" : null)}><code>{i[0]}</code><span class={`sc-apip-k sc-apip-k-${i[1]}`}>{T().kinds[i[1]]}</span></Link></li>)}</ul>
          </details>)}
        </div>
      </nav>
      <main class="sc-apip-main" aria-live="polite">
        {() => {
          const s = sel(), ix = index()
          if (!ix) return <p class="sc-apip-note">{T().loading}</p>
          if (!s) return <p class="sc-apip-note">{T().pick}</p>
          const sub = ix.subpaths.find((x) => x.slug === s.slug)
          const item = sub?.items.find((i) => i[0] === s.name)
          if (!sub || !item) return <p class="sc-apip-note">{T().notFound}</p>
          const at = flat().findIndex((x) => x.s === sub && x.i === item)
          const prev = flat()[at - 1], next = flat()[at + 1]
          return untrack(() => <article class="sc-apip-doc">
            <DocView subpath={sub.subpath} file={item[4]} name={item[0]} slug={sub.slug} lang={lang()} />
            <nav class="sc-apip-pn" aria-label={`${T().prev} / ${T().next}`}>
              {prev ? <Link href={hrefOf(prev.s.slug, prev.i[0])}>← {T().prev}: <code>{prev.i[0]}</code></Link> : <span />}
              {next ? <Link href={hrefOf(next.s.slug, next.i[0])}>{T().next}: <code>{next.i[0]}</code> →</Link> : <span />}
            </nav>
          </article>)
        }}
      </main>
    </div>
  </div>
}

/** One export's documentation (its docs file is fetched once). */
function DocView(props: { subpath: string; slug: string; name: string; file: number; lang: Lang }) {
  const T = TEXT[props.lang]
  const doc = signal<Doc | null | undefined>(undefined)
  let p = docFiles.get(props.file)
  if (!p) docFiles.set(props.file, (p = json<Record<string, Doc>>(`docs-${props.file}.json`)))
  p.then((all) => doc.set(all[`${props.subpath}#${props.name}`] ?? null), () => { docFiles.delete(props.file); doc.set(null) })
  return <>{() => {
    const d = doc()
    if (d === undefined) return <p class="sc-apip-note">{T.loading}</p>
    if (d === null) return <p class="sc-apip-note">{T.notFound}</p>
    const summary = (props.lang === "tr" && d.tr) || d.doc
    const statics = (d.members ?? []).filter((m) => m.static), inst = (d.members ?? []).filter((m) => !m.static)
    return <>
      <header class="sc-apip-head">
        <h2 class="sc-apip-name"><code>{d.name}</code></h2>
        <Badge tone={TONE[d.kind] as "neutral"}>{T.kinds[d.kind]}</Badge>
        <Badge tone={d.status === "stable" ? "success" : d.status === "deprecated" ? "danger" : "warn"}>{T.status[d.status] ?? d.status}</Badge>
        <span class="sc-apip-since">{T.since} {d.since}</span>
      </header>
      <p class="sc-apip-sum">{summary}</p>
      <Block title={T.import}><pre class="sc-apip-pre"><code>{`import { ${d.name} } from "${d.subpath}"`}</code></pre></Block>
      <Block title={T.sig}><pre class="sc-apip-pre"><code>{d.signature}</code></pre></Block>
      {d.extends?.length ? <Block title={T.ext}><p><code>{d.extends.join(", ")}</code></p></Block> : null}
      {d.ctor?.length ? <Block title={T.ctor}>{d.ctor.map((c) => <><pre class="sc-apip-pre"><code>{c.text}</code></pre>{c.params.length ? <ParamTable rows={c.params} T={T} /> : null}</>)}</Block> : null}
      {d.params?.length && d.kind !== "component" ? <Block title={T.params}><ParamTable rows={d.params} T={T} /></Block> : null}
      {d.props?.length ? <Block title={T.props}><ParamTable rows={d.props} T={T} /></Block> : null}
      {d.returns && d.kind === "function" ? <Block title={T.returns}><p><code>{d.returns.type}</code>{d.returns.doc ? ` — ${d.returns.doc}` : ""}</p></Block> : null}
      {statics.length ? <Block title={T.statics}><MemberTable rows={statics} T={T} /></Block> : null}
      {inst.length ? <Block title={T.members}><MemberTable rows={inst} T={T} /></Block> : null}
      {d.events?.length ? <Block title={T.events}><ul>{d.events.map((e) => <li>{e}</li>)}</ul></Block> : null}
      {d.value !== undefined ? <Block title={T.value}><ValueView value={d.value} T={T} /></Block> : null}
      {d.md ? <div class="sc-apip-md"><Markdown source={d.md} /></div> : null}
      <Example subpath={d.subpath} name={d.name} T={T} />
      {d.see.length ? <Block title={T.related}><p>{d.see.join(", ")}</p></Block> : null}
      {d.demo ? <p class="sc-apip-demo"><Link href={d.demo as Href}>{T.demo} →</Link></p> : null}
    </>
  }}</>
}

function Block(props: { title: string; children?: unknown }) {
  return <section class="sc-apip-block"><h3 class="sc-apip-label">{props.title}</h3>{props.children}</section>
}

function ParamTable(props: { rows: Param[]; T: (typeof TEXT)[Lang] }) {
  const T = props.T
  return <div class="sc-apip-table"><table>
    <thead><tr><th>{T.name}</th><th>{T.type}</th><th>{T.def}</th><th>{T.desc}</th></tr></thead>
    <tbody>{props.rows.map((r) => <tr><td><code>{`${r.rest ? "..." : ""}${r.name}`}</code>{r.optional ? <span class="sc-apip-opt"> {T.optional}</span> : null}</td>
      <td><code>{r.type}</code></td><td>{r.default ? <code>{r.default}</code> : "—"}</td><td>{r.doc || "—"}</td></tr>)}</tbody>
  </table></div>
}

function MemberTable(props: { rows: Member[]; T: (typeof TEXT)[Lang] }) {
  return <div class="sc-apip-table"><table>
    <thead><tr><th>{props.T.name}</th><th>{props.T.sig}</th><th>{props.T.desc}</th></tr></thead>
    <tbody>{props.rows.map((m) => <tr><td><code>{m.name}</code>{m.readonly ? <span class="sc-apip-opt"> {props.T.readonly}</span> : null}</td><td><code>{m.signature}</code></td><td>{m.summary || "—"}</td></tr>)}</tbody>
  </table></div>
}

/** A value's content: inline when short, folded when long. */
function ValueView(props: { value: string; T: (typeof TEXT)[Lang] }) {
  const v = props.value
  if (v.length < 160 && !v.includes("\n")) return <pre class="sc-apip-pre"><code>{v}</code></pre>
  return <details class="sc-apip-value"><summary>{props.T.show} ({v.split("\n").length} satır)</summary><pre class="sc-apip-pre"><code>{v}</code></pre></details>
}

/** The live example of an export (its own lazy module). */
function Example(props: { subpath: string; name: string; T: (typeof TEXT)[Lang] }) {
  const T = props.T
  const mod = signal<ApiExampleModule | null | false>(null)
  const p = loadExample(props.subpath, props.name)
  if (!p) mod.set(false); else p.then((m) => mod.set(m ?? false), () => mod.set(false))
  return <>{() => {
    const m = mod()
    if (m === null) return <p class="sc-apip-note">{T.loading}</p>
    const ex = m ? m.default : undefined
    if (!ex) return <p class="sc-apip-note">{T.noExample}</p>
    return <>
      <Block title={T.example}><DemoCode source={ex.code.trim()} lang="tsx" /></Block>
      <Block title={T.live}>
        <Try log={false} fallback={(e: unknown) => <p class="sc-apip-note" role="alert">{T.failed}: {String((e as Error)?.message ?? e)}</p>}>
          {ex.play ? <LitePlayground spec={ex.play} view={ex.run} label={props.name} /> : <div class="sc-stage sc-apip-stage">{ex.run({ values: {} })}</div>}
        </Try>
      </Block>
    </>
  }}</>
}
