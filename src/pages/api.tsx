// API: every runtime export of every package subpath. Left: the search ("/"), kind chips with their counts and the
// exports package by package; right: with nothing picked, the most used exports and the packages (exports per path as
// bars, a press filters the list to that path); with an export picked, its page: badges, name, summary, the import
// line (copied), the coloured signature, parameter / props / member tables, the reactivity lab (signal, computed,
// effect, batch, untrack) or the live example, related exports, the component page, and the previous / next bar.
// Deep links: /api/<subpath>/<name> (subpath without "march/", the core entry is "core").
// Data (tools/api-docs.js): public/api/index.<lang>.json (the search index, one file) and public/api/docs-<n>.json (the
// full docs, fetched when one of their exports opens). Nothing of it is part of start-up.
import "./api.css";
import "../hub.css";
import { SearchBox, Badge, Chip, CopyButton, Kbd, Markdown, registerCommands } from "march/ui";
import { Link, navigate, params, query, path, type Href } from "march/router";
import { appUrl } from "march/base";
import { locale, effect, onCleanup, Try, signal, computed, untrack } from "march";
import { fold } from "march/ui";
import { lazy } from "march/lazy";
import { Icon, arrowLeft, arrowRight, copy, list as listIcon } from "march/icons";
import { loadExample } from "../api-examples.gen.ts";
import type { ApiExampleModule } from "../api-examples/types.ts";
import { ReactivityLab, type LabFocus } from "../api-examples/_lab.tsx";
import { LitePlayground } from "../play-lite.tsx";
import { PAGE_META } from "../nav-meta.ts";

const DemoCode = lazy(() => import("../demo-code.tsx"), { placeholder: "text", height: "6rem" })

type Kind = "component" | "function" | "class" | "const"
type Item = [name: string, kind: Kind, summary: string, status: string, file: number]
interface Sub { subpath: string; slug: string; items: Item[] }
interface Index { icons: number; subpaths: Sub[] }
interface Param { name: string; type: string; optional: boolean; rest?: boolean; default?: string; doc?: string }
interface Member { name: string; kind: "method" | "property" | "accessor"; static: boolean; readonly: boolean; signature: string; summary: string }
interface Doc {
  subpath: string; name: string; kind: Kind; doc: string; tr: string; md: string; status: string; since: string; demo: string; see: string[];
  signature: string; params?: Param[]; returns?: { type: string; doc: string }; props?: Param[];
  ctor?: { text: string; params: Param[] }[]; extends?: string[]; members?: Member[]; events?: string[];
  valueType?: string; value?: string;
}

const TEXT = {
  tr: { title: "API başvurusu", lead: (paths: number, n: number) => `${paths} paket yolu, ${n.toLocaleString("tr")} dışa aktarım. Her birinde imza, parametreler ve çalışan bir örnek; aramak için`,
    search: "Ara: signal, createRouter, toast…", label: "API ara", allKinds: "Tümü", kindFilter: "Türe göre süz",
    kinds: { component: "bileşen", function: "işlev", ["class"]: "sınıf", const: "değer" } as Record<Kind, string>,
    status: { stable: "kararlı", experimental: "deneysel", deprecated: "kullanımdan kalkıyor" } as Record<string, string>,
    sig: "İmza", params: "Parametreler", props: "Prop'lar", returns: "Dönüş", name: "Ad", type: "Tür", def: "Varsayılan", desc: "Açıklama",
    ctor: "Yapıcı (constructor)", members: "Üyeler", statics: "Statik üyeler", ext: "Kalıtım", events: "Olaylar", value: "İçerik", valueType: "Tür",
    example: "Örnek", live: "Canlı demo", lab: "Çalışan örnek", labHint: "değeri değiştir, akışı izle", related: "İlgili", demo: "Bileşen sayfası: seçenekler ve canlı kod",
    prev: "Önceki", next: "Sonraki", all: "Tüm API", since: (v: string) => `${v} sürümünden beri`, loading: "Yükleniyor…", none: "Eşleşen dışa aktarım yok.",
    notFound: "Bu dışa aktarım bulunamadı.", icons: "ikon", iconsPage: "İkonlar sayfası", noExample: "Bu dışa aktarımın canlı örneği hazırlanıyor.",
    failed: "Örnek çalışırken hata oluştu", show: "Tamamını göster", optional: "isteğe bağlı", exports: "dışa aktarım", readonly: "salt okunur",
    top: "En çok kullanılanlar", packages: "Paketler", packagesHint: "yalnız içe aktardığın yol derlenir", more: (n: number) => `ve ${n} yol daha`,
    filterSub: (s: string) => `Yalnız ${s}`, clearSub: "Paket süzgecini kaldır", list: "Liste", copied: "Kopyalandı", copyFail: "Panoya kopyalanamadı." },
  en: { title: "API reference", lead: (paths: number, n: number) => `${paths} package paths, ${n.toLocaleString("en")} exports. Each with its signature, parameters and a working example; to search press`,
    search: "Search: signal, createRouter, toast…", label: "Search the API", allKinds: "All", kindFilter: "Filter by kind",
    kinds: { component: "component", function: "function", class: "class", const: "value" } as Record<Kind, string>,
    status: { stable: "stable", experimental: "experimental", deprecated: "deprecated" } as Record<string, string>,
    sig: "Signature", params: "Parameters", props: "Props", returns: "Returns", name: "Name", type: "Type", def: "Default", desc: "Description",
    ctor: "Constructor", members: "Members", statics: "Static members", ext: "Extends", events: "Events", value: "Content", valueType: "Type",
    example: "Example", live: "Live demo", lab: "Working example", labHint: "change the value, watch it flow", related: "Related", demo: "Component page: options and live code",
    prev: "Previous", next: "Next", all: "All of the API", since: (v: string) => `since ${v}`, loading: "Loading…", none: "No export matches.",
    notFound: "This export was not found.", icons: "icons", iconsPage: "Icons page", noExample: "The live example of this export is on its way.",
    failed: "The example failed", show: "Show all", optional: "optional", exports: "exports", readonly: "read-only",
    top: "Most used", packages: "Packages", packagesHint: "only the paths you import are bundled", more: (n: number) => `and ${n} more paths`,
    filterSub: (s: string) => `Only ${s}`, clearSub: "Remove the package filter", list: "List", copied: "Copied", copyFail: "Could not copy." },
}
type Lang = keyof typeof TEXT
type Texts = (typeof TEXT)[Lang]
const langOf = (loc: string): Lang => (loc.split("-")[0] === "tr" ? "tr" : "en")
const TONE: Record<Kind, string> = { component: "primary", function: "info", class: "warn", const: "neutral" }
/** The exports people reach for first: the landing's cards. */
const TOP = ["signal", "computed", "effect", "For", "If", "Button", "toast", "Await"]
/** The exports whose page shows the reactivity lab. */
const LAB = new Set<string>(["signal", "computed", "effect", "batch", "untrack"])
const PACKAGES_SHOWN = 14
// app-root relative (appUrl): on /api/core/batch a page-relative "api/…" would point to /api/core/api/…
const asset = (p: string) => appUrl(`api/${p}`)
const json = <T,>(p: string): Promise<T> => fetch(asset(p)).then((r) => { if (!r.ok) throw new Error(`${r.status} ${p}`); return r.json() as Promise<T> })
const indexes = new Map<Lang, Promise<Index>>()
const docFiles = new Map<number, Promise<Record<string, Doc>>>()
const hrefOf = (slug: string, name: string) => `/api/${slug}/${name}` as Href
/** `code` spans of a one-line summary. */
const inline = (md: string): unknown => md.split("`").map((bit, i) => (i % 2 ? <code>{bit}</code> : bit))
/** The first sentence of a summary. */
const firstSentence = (s: string): string => s.split(/(?<=[.!?])\s/)[0] ?? s
/** A kind's dot (its colour in api.css). */
const Dot = (props: { kind: Kind }) => <i class="sc-apip-dot" data-kind={props.kind} aria-hidden="true" />

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
  // flat order for previous / next
  const flat = computed(() => (index()?.subpaths ?? []).flatMap((s) => s.items.map((i) => ({ s, i }))))
  const total = computed(() => flat().length)
  const q = signal("")
  // kind and subpath filters live in the address (?kind=component&sub=ui): a shared link opens filtered
  const KINDS: Kind[] = ["component", "function", "class", "const"]
  const kind = computed(() => { const k = String(query()["kind"] ?? ""); return (KINDS as string[]).includes(k) ? (k as Kind) : null })
  const sub = computed(() => String(query()["sub"] ?? "") || null)
  // links keep the filters: opening an export does not reset the list
  const filterQs = (): string => { const u = new URLSearchParams(); const k = kind(), su = sub(); if (k) u.set("kind", k); if (su) u.set("sub", su); const s = u.toString(); return s ? `?${s}` : "" }
  const link = (slug: string, name: string): (() => Href) => () => `${hrefOf(slug, name)}${filterQs()}` as Href
  const setFilter = (key: "kind" | "sub", v: string | null): void => {
    const u = new URLSearchParams(globalThis.location?.search ?? "")
    if (v) u.set(key, v); else u.delete(key)
    const qs = u.toString()
    void navigate(`${path()}${qs ? `?${qs}` : ""}` as Href, { replace: true })
  }
  // text first (counts per kind follow the search), then subpath, then kind
  const byText = computed(() => {
    const needle = fold(q().trim())
    return (index()?.subpaths ?? []).filter((s) => !sub() || s.slug === sub()).map((s) => ({ ...s, items: s.items.filter((i) => !needle || fold(i[0]).includes(needle) || fold(i[2]).includes(needle) || fold(s.subpath).includes(needle)) }))
  })
  const counts = computed(() => { const c: Record<string, number> = { all: 0 }; for (const s of byText()) for (const i of s.items) { c[i[1]] = (c[i[1]] ?? 0) + 1; c["all"]!++ } return c })
  const shown = computed(() => byText().map((s) => ({ ...s, items: kind() ? s.items.filter((i) => i[1] === kind()) : s.items })).filter((s) => s.items.length))
  // narrow screens: the list folds above the page (open while searching or with nothing picked)
  const listOpen = signal(false)
  effect(() => { sel(); untrack(() => listOpen.set(false)) })
  let navEl: HTMLElement | undefined
  const searchInput = (): HTMLInputElement | null | undefined => navEl?.querySelector<HTMLInputElement>(".sc-apip-q input")
  // "/" goes to the search box, 1–5 pick a kind (not while typing)
  effect(() => {
    const onKeys = (e: KeyboardEvent): void => {
      const tg = e.target as HTMLElement | null
      if (e.ctrlKey || e.metaKey || e.altKey || (tg instanceof Element && tg.closest("input, textarea, select, [contenteditable]"))) return
      if (e.key === "/") { e.preventDefault(); listOpen.set(true); searchInput()?.focus(); return }
      const n = Number(e.key)
      if (n >= 1 && n <= 5) setFilter("kind", n === 1 ? null : KINDS[n - 2]!)
    }
    globalThis.addEventListener("keydown", onKeys)
    onCleanup(() => globalThis.removeEventListener("keydown", onKeys))
  })
  // Ctrl+K: every export is a command of the palette while this page is open
  effect(() => {
    const ix = index()
    if (!ix) return
    const off = untrack(() => registerCommands(ix.subpaths.flatMap((s) => s.items.map((i) => ({ id: `api-${s.slug}-${i[0]}`, title: `${i[0]} — ${s.subpath}`, group: "API", keywords: i[2], run: () => void navigate(hrefOf(s.slug, i[0])) })))))
    onCleanup(off)
  })
  // arrow keys move through the visible results; Enter opens the first one from the search box
  const onKey = (e: KeyboardEvent) => {
    const links = [...(navEl?.querySelectorAll<HTMLAnchorElement>("a.sc-apip-link") ?? [])]
    if (!links.length) return
    const at = links.indexOf(document.activeElement as HTMLAnchorElement)
    if (e.key === "ArrowDown") { e.preventDefault(); links[Math.min(links.length - 1, at + 1)]?.focus() }
    else if (e.key === "ArrowUp") { e.preventDefault(); if (at <= 0) searchInput()?.focus(); else links[at - 1]?.focus() }
    else if (e.key === "Enter" && at < 0) { e.preventDefault(); links[0]!.click() }
  }
  // the current link stays in view in the list
  effect(() => { const s = sel(); if (s) queueMicrotask(() => navEl?.querySelector('.sc-apip-link[aria-current="page"]')?.scrollIntoView({ block: "nearest" })) })
  const isCur = (s: Sub, i: Item) => () => sel()?.slug === s.slug && sel()?.name === i[0]

  return <div class="sc-page sc-apip">
    <div class="sc-apip-grid">
      <nav class={() => `sc-apip-nav${listOpen() || q() ? " is-open" : ""}`} aria-label={() => T().label} onKeyDown={onKey} ref={(el: HTMLElement) => { navEl = el }}>
        <div class="sc-apip-q">
          <SearchBox value={q} onInput={(v: string) => { q.set(v); if (v) listOpen.set(true) }} debounce={0} placeholder={T().search} label={T().label} />
          <Kbd class="sc-apip-slash">/</Kbd>
        </div>
        <div class="sc-apip-kinds" role="toolbar" aria-label={() => T().kindFilter}>
          {[null, ...KINDS].map((k, n) => <Chip size="sm" selected={() => kind() === k} aria-keyshortcuts={String(n + 1)} onClick={() => setFilter("kind", k)}>
            {k ? <Dot kind={k} /> : null}{() => (k ? T().kinds[k] : T().allKinds)}<span class="sc-apip-n">{() => counts()[k ?? "all"] ?? 0}</span>
          </Chip>)}
        </div>
        {() => { const su = sub(); const s = su && index()?.subpaths.find((x) => x.slug === su); return s ? <div class="sc-apip-subf"><Chip size="sm" tone="primary" onRemove={() => setFilter("sub", null)} removeLabel={T().clearSub}><code>{s.subpath}</code></Chip></div> : null }}
        <button type="button" class="sc-apip-fold" aria-expanded={() => String(listOpen() || !!q())} on:click={() => listOpen.set(!listOpen.peek())}>
          <Icon of={listIcon} /><span>{() => `${T().list} · ${shown().reduce((a, s) => a + s.items.length, 0)} ${T().exports}`}</span>
        </button>
        <div class="sc-apip-tree">
          {() => (index() && !shown().length ? <p class="sc-apip-note">{T().none}</p> : null)}
          {() => shown().map((s) => <details class="sc-apip-group" open={!!q() || !!kind() || !!sub() || untrack(sel)?.slug === s.slug || shown().length < 4}>
            <summary><code>{s.subpath}</code><span class="sc-apip-n">{s.items.length}</span></summary>
            <ul>{s.items.map((i) => <li><Link class={() => (isCur(s, i)() ? "sc-apip-link is-on" : "sc-apip-link")} href={link(s.slug, i[0])}
              aria-current={() => (isCur(s, i)() ? "page" : null)}><Dot kind={i[1]} /><code>{i[0]}</code></Link></li>)}</ul>
          </details>)}
          <p class="sc-apip-count">{() => { const ix = index(); return ix ? `${ix.icons} ${T().icons} › ` : "" }}<Link href={"/icons" as Href}>{() => T().iconsPage}</Link></p>
        </div>
      </nav>
      <section class="sc-apip-main" aria-live="polite">
        {() => {
          const s = sel(), ix = index()
          if (!ix) return <p class="sc-apip-note">{T().loading}</p>
          if (!s) return untrack(() => <Landing index={ix} total={total()} T={T()} pick={(slug) => setFilter("sub", slug)} />)
          const sb = ix.subpaths.find((x) => x.slug === s.slug)
          const item = sb?.items.find((i) => i[0] === s.name)
          if (!sb || !item) return <p class="sc-apip-note">{T().notFound}</p>
          const all = flat(), at = all.findIndex((x) => x.s === sb && x.i === item)
          const prev = all[(at - 1 + all.length) % all.length]!, next = all[(at + 1) % all.length]!
          const findName = (name: string) => all.find((x) => x.i[0] === name)
          return untrack(() => <article class="sc-apip-doc">
            <DocView subpath={sb.subpath} file={item[4]} name={item[0]} lang={lang()} related={(name) => { const f = findName(name); return f ? link(f.s.slug, f.i[0]) : null }} />
            <nav class="sc-topic-pager sc-apip-pager" aria-label={`${T().prev} / ${T().next}`}>
              <Link href={link(prev.s.slug, prev.i[0])} class="sc-topic-step"><Icon of={arrowLeft} /><span><small>{T().prev}</small><code>{prev.i[0]}</code></span></Link>
              <Link href={`/api${filterQs()}` as Href} class="sc-topic-all">{T().all}</Link>
              <Link href={link(next.s.slug, next.i[0])} class="sc-topic-step sc-topic-next"><span><small>{T().next}</small><code>{next.i[0]}</code></span><Icon of={arrowRight} /></Link>
            </nav>
          </article>)
        }}
      </section>
    </div>
  </div>
}

/** With nothing picked: the head, the most used exports and the packages as bars. */
function Landing(props: { index: Index; total: number; T: Texts; pick: (slug: string) => void }) {
  const { index: ix, T } = props
  const top = TOP.map((n) => { for (const s of ix.subpaths) { const i = s.items.find((x) => x[0] === n); if (i) return { s, i } } return null }).filter((x) => x !== null)
  const subs = [...ix.subpaths].sort((a, b) => b.items.length - a.items.length)
  const most = subs[0]?.items.length ?? 1
  const all = signal(false)
  const group = PAGE_META["/api"]?.group
  return <div class="sc-apip-landing">
    <header class="sc-apip-intro">
      {group ? <span class="sc-kicker">{group}</span> : null}
      <h1 class="sc-h1">{T.title}</h1>
      <p class="sc-lead">{T.lead(ix.subpaths.length, props.total)} <Kbd>/</Kbd>.</p>
    </header>
    <h2 class="sc-apip-h2">{T.top}</h2>
    <div class="sc-apip-top">
      {top.map(({ s, i }) => <Link class="sc-apip-card" href={hrefOf(s.slug, i[0])}>
        <span class="sc-apip-card-kind"><Dot kind={i[1]} />{T.kinds[i[1]]}</span>
        <strong><code>{i[0]}</code></strong>
        <code class="sc-apip-card-path">{s.subpath}</code>
        <span class="sc-apip-card-desc">{inline(firstSentence(i[2]))}</span>
      </Link>)}
    </div>
    <h2 class="sc-apip-h2">{T.packages}<small>{T.packagesHint}</small></h2>
    <div class="sc-apip-subs">
      {() => (all() ? subs : subs.slice(0, PACKAGES_SHOWN)).map((s) => <button type="button" class="sc-apip-sub" on:click={() => props.pick(s.slug)} title={T.filterSub(s.subpath)}>
        <code>{s.subpath}</code><i style={{ "--sc-w": `${Math.max(3, Math.round((s.items.length / most) * 100))}%` }} /><b>{s.items.length}</b>
      </button>)}
      {() => (!all() && subs.length > PACKAGES_SHOWN ? <button type="button" class="sc-apip-more" on:click={() => all.set(true)}>{T.more(subs.length - PACKAGES_SHOWN)}</button> : null)}
    </div>
  </div>
}

/** A signature in colour: the export's own name, type names, keywords; the rest as written. */
function Signature(props: { text: string; name: string }) {
  const re = /([A-Za-z_$][\w$]*)|("[^"]*"|'[^']*'|`[^`]*`)|(=>|[(){}<>[\]:?,|&=.]+)/g
  const KW = new Set(["string", "number", "boolean", "void", "undefined", "null", "unknown", "any", "never", "true", "false", "readonly", "keyof", "typeof", "extends", "new", "function", "class", "const"])
  const out: unknown[] = []
  let last = 0
  for (const m of props.text.matchAll(re)) {
    if (m.index > last) out.push(props.text.slice(last, m.index))
    const [all, word, str] = m
    if (word) out.push(word === props.name ? <span class="sc-sig-name">{word}</span> : KW.has(word) ? <span class="sc-sig-kw">{word}</span> : /^[A-Z]/.test(word) ? <span class="sc-sig-type">{word}</span> : word)
    else if (str) out.push(<span class="sc-sig-str">{all}</span>)
    else out.push(<span class="sc-sig-p">{all}</span>)
    last = m.index + all.length
  }
  if (last < props.text.length) out.push(props.text.slice(last))
  return <pre class="sc-apip-sig"><code>{out}</code></pre>
}

/** One export's page (its docs file is fetched once). */
function DocView(props: { subpath: string; name: string; file: number; lang: Lang; related: (name: string) => (() => Href) | null }) {
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
    const line = `import { ${d.name} } from "${d.subpath}"`
    const see = d.see.map((n) => ({ n, href: props.related(n) }))
    return <>
      <header class="sc-apip-head">
        <div class="sc-apip-badges">
          <Badge tone={TONE[d.kind] as "neutral"}><Dot kind={d.kind} />{T.kinds[d.kind]}</Badge>
          <Badge tone={d.status === "stable" ? "success" : d.status === "deprecated" ? "danger" : "warn"}>{T.status[d.status] ?? d.status}</Badge>
          {d.since ? <Badge tone="neutral" class="sc-apip-since">{T.since(d.since)}</Badge> : null}
        </div>
        <h1 class="sc-apip-name">{d.name}</h1>
        <p class="sc-apip-sum">{inline(summary)}</p>
        <div class="sc-apip-acts">
          <CopyButton class="sc-topic-import" text={line} label={line} copiedLabel={T.copied} icon={copy} errorText={T.copyFail} />
          {d.demo ? <Link class="sc-topic-api" href={d.demo as Href}>{T.demo}<Icon of={arrowRight} /></Link> : null}
        </div>
      </header>
      <Block title={T.sig}><Signature text={d.signature} name={d.name} /></Block>
      {d.extends?.length ? <Block title={T.ext}><p><code>{d.extends.join(", ")}</code></p></Block> : null}
      {d.ctor?.length ? <Block title={T.ctor}>{d.ctor.map((c) => <><Signature text={c.text} name={d.name} />{c.params.length ? <ParamTable rows={c.params} T={T} /> : null}</>)}</Block> : null}
      {d.params?.length && d.kind !== "component" ? <Block title={T.params}><ParamTable rows={d.params} T={T} returns={d.kind === "function" ? d.returns : undefined} /></Block> : null}
      {d.props?.length ? <Block title={T.props}><ParamTable rows={d.props} T={T} /></Block> : null}
      {d.returns && d.kind === "function" && !d.params?.length ? <Block title={T.returns}><p><code>{d.returns.type}</code>{d.returns.doc ? <> — {inline(d.returns.doc)}</> : null}</p></Block> : null}
      {statics.length ? <Block title={T.statics}><MemberTable rows={statics} T={T} /></Block> : null}
      {inst.length ? <Block title={T.members}><MemberTable rows={inst} T={T} /></Block> : null}
      {d.events?.length ? <Block title={T.events}><ul>{d.events.map((e) => <li>{e}</li>)}</ul></Block> : null}
      {d.value !== undefined ? <Block title={T.value}><ValueView value={d.value} T={T} /></Block> : null}
      {LAB.has(d.name) && d.subpath === "march" ? <Block title={T.lab} hint={T.labHint}><ReactivityLab focus={d.name as LabFocus} /></Block> : null}
      {d.md ? <div class="sc-apip-md"><Markdown source={d.md} /></div> : null}
      <Example subpath={d.subpath} name={d.name} T={T} />
      {see.length ? <Block title={T.related}><div class="sc-apip-see">{see.map((x) => x.href ? <Link class="sc-apip-chip" href={x.href}><code>{x.n}</code></Link> : <span class="sc-apip-chip"><code>{x.n}</code></span>)}</div></Block> : null}
    </>
  }}</>
}

function Block(props: { title: string; hint?: string; children?: unknown }) {
  return <section class="sc-apip-block"><h2 class="sc-apip-label">{props.title}{props.hint ? <small>{props.hint}</small> : null}</h2>{props.children}</section>
}

function ParamTable(props: { rows: Param[]; T: Texts; returns?: { type: string; doc: string } | undefined }) {
  const T = props.T
  return <div class="sc-apip-table"><table>
    <thead><tr><th>{T.name}</th><th>{T.type}</th><th>{T.def}</th><th>{T.desc}</th></tr></thead>
    <tbody>
      {props.rows.map((r) => <tr><td><code class="sc-apip-pname">{`${r.rest ? "..." : ""}${r.name}`}</code>{r.optional ? <span class="sc-apip-opt"> {T.optional}</span> : null}</td>
        <td><code>{r.type}</code></td><td>{r.default ? <code>{r.default}</code> : "—"}</td><td>{r.doc ? inline(r.doc) : "—"}</td></tr>)}
      {props.returns ? <tr class="sc-apip-ret"><td><b>{T.returns}</b></td><td><code>{props.returns.type}</code></td><td>—</td><td>{props.returns.doc ? inline(props.returns.doc) : "—"}</td></tr> : null}
    </tbody>
  </table></div>
}

function MemberTable(props: { rows: Member[]; T: Texts }) {
  return <div class="sc-apip-table"><table>
    <thead><tr><th>{props.T.name}</th><th>{props.T.sig}</th><th>{props.T.desc}</th></tr></thead>
    <tbody>{props.rows.map((m) => <tr><td><code class="sc-apip-pname">{m.name}</code>{m.readonly ? <span class="sc-apip-opt"> {props.T.readonly}</span> : null}</td><td><code>{m.signature}</code></td><td>{m.summary ? inline(m.summary) : "—"}</td></tr>)}</tbody>
  </table></div>
}

/** A value's content: inline when short, folded when long. */
function ValueView(props: { value: string; T: Texts }) {
  const v = props.value
  if (v.length < 160 && !v.includes("\n")) return <pre class="sc-apip-pre"><code>{v}</code></pre>
  return <details class="sc-apip-value"><summary>{props.T.show} ({v.split("\n").length} satır)</summary><pre class="sc-apip-pre"><code>{v}</code></pre></details>
}

/** The live example of an export (from its lazy part of the examples). */
function Example(props: { subpath: string; name: string; T: Texts }) {
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
