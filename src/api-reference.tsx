// API başvurusu: every runtime export of every subpath with its kind and summary. Generated from the JSDoc of the
// sources (tools/api-coverage.js → api.gen.ts); a lazy part of the İlk Adımlar page. Summaries follow the active
// language: Turkish from docs/api.tr.json, English (the JSDoc) for every other language. Code names never change.
// A click on a card opens it: signature, example code and the live example (with a Playground when it has options),
// from the lazy example file of its subpath (api-examples/<group>.tsx, tools/api-examples.js).
import { SearchBox, Badge } from "hadi-march/ui";
import { Segmented } from "hadi-march/forms";
import { fold } from "hadi-march/ui";
import { Link, type Href } from "hadi-march/router";
import { locale, effect, Try } from "hadi-march";
import { lazy } from "hadi-march/lazy";
import { loadExamples } from "./api-examples.gen.ts";
import type { ApiExampleModule } from "./api-examples/types.ts";
import { LitePlayground } from "./play-lite.tsx";
import "./api-reference.css";

// the code view of an open card: the same lazy part as a demo card's Code tab
const DemoCode = lazy(() => import("./demo-code.tsx"), { placeholder: "text", height: "6rem" })
import { loadApi, type ApiItem, type ApiGroup } from "./api.gen.ts";

type Kind = ApiItem[1] | "all"
/** The view's own texts: Turkish, and English for every other language (like the summaries). */
const TEXT = {
  tr: { kinds: ["Tümü", "Bileşen", "İşlev", "Sınıf", "Değer", "İkon"], search: "Ad ya da açıklama ara: createRouter, lazy, toast…",
    label: "API ara", exports: "dışa aktarım", icons: "ikon", iconsPage: "İkonlar sayfasında", also: "Ayrıca", empty: "Eşleşen dışa aktarım yok.", icon: "İkon",
    sig: "İmza", example: "Örnek", result: "Sonuç", loading: "Örnek yükleniyor…", noExample: "Bu dışa aktarımın örneği hazırlanıyor.", failed: "Örnek çalışırken hata oluştu", retry: "Yeniden dene", open: "Örneği aç", close: "Kapat" },
  en: { kinds: ["All", "Component", "Function", "Class", "Value", "Icon"], search: "Search name or summary: createRouter, lazy, toast…",
    label: "Search the API", exports: "exports", icons: "icons", iconsPage: "on the Icons page", also: "Also in", empty: "No export matches.", icon: "Icon",
    sig: "Signature", example: "Example", result: "Result", loading: "Loading the example…", noExample: "The example of this export is on its way.", failed: "The example failed", retry: "Retry", open: "Open the example", close: "Close" },
}
type Lang = keyof typeof TEXT
const langOf = (loc: string): Lang => (loc.split("-")[0] === "tr" ? "tr" : "en")
const KIND_VALUES: Kind[] = ["all", "component", "function", "class", "const", "icon"]
const KIND_TONE: Record<ApiItem[1], string> = { component: "primary", function: "info", class: "warn", const: "neutral", icon: "neutral" }
/** The data parts (of the active language) and this view, loaded together (the page shows a placeholder until then). */
export async function load(): Promise<{ default: () => unknown }> {
  const lang = langOf(locale.peek())
  const raw = await loadApi(lang)
  return { default: () => <ApiReference api={raw} lang={lang} /> }
}

function ApiReference(props: { api: ApiGroup[]; lang: Lang }) {
  let $api = props.api
  let $lang: Lang = props.lang
  // another language: load its summaries (only the parts of that language)
  effect(() => {
    const want = langOf(locale())
    if (want !== $lang) void loadApi(want).then((raw) => { $api = raw; $lang = want })
  })
  const T = () => TEXT[$lang]
  const KINDS = () => KIND_VALUES.map((value, i) => ({ value, label: T().kinds[i] as string }))
  const KIND_TEXT = (k: ApiItem[1]) => (T().kinds[KIND_VALUES.indexOf(k)] as string).toLocaleLowerCase($lang)
  // single icons arrive as a name list; each becomes an icon row
  const API = () => $api.map((a) => ({ subpath: a.subpath, items: [...a.items, ...(a.icons ? a.icons.split(" ").map((n): ApiItem => [n, "icon", `${T().icon}: ${n}`, []]) : [])] }))
  const TOTAL = () => API().reduce((s, a) => s + a.items.length, 0)
  const ICONS = () => API().reduce((s, a) => s + a.items.filter((i) => i[1] === "icon").length, 0)
  // open cards ("subpath#name"); each open card loads its subpath's example file once
  let $open = new Set<string>()
  const toggle = (key: string) => { const n = new Set($open); n.has(key) ? n.delete(key) : n.add(key); $open = n }
  let $q = ""
  let $kind: Kind = "all"
  const groups = () => {
    const q = fold($q.trim())
    return API().map((a) => ({
      subpath: a.subpath,
      items: a.items.filter((i) => ($kind === "all" ? i[1] !== "icon" || !!q : i[1] === $kind) &&
        (!q || fold(i[0]).includes(q) || fold(i[2]).includes(q) || fold(a.subpath).includes(q))),
    })).filter((g) => g.items.length)
  }
  const shown = () => groups().reduce((s, g) => s + g.items.length, 0)
  return <div class="sc-api">
    <div class="sc-api-bar">
      <SearchBox bind:value={$q} placeholder={T().search} label={T().label} class="sc-api-search" />
      <Segmented bind:value={$kind} options={KINDS()} />
    </div>
    <p class="sc-api-count">{() => `${shown()} / ${TOTAL()} ${T().exports}`}{() => ($kind === "all" && !$q ? ` · ${ICONS()} ${T().icons} `: "")}
      {() => ($kind === "all" && !$q ? <Link href={"/icons" as Href}>{T().iconsPage}</Link> : null)}</p>
    {() => groups().map((g) => <section class="sc-api-group">
      <h4 class="sc-api-sub"><code>{g.subpath}</code><span class="sc-api-n">{g.items.length}</span></h4>
      <ul class="sc-api-list">
        {g.items.map(([name, kind, summary, also]) => {
          const key = `${g.subpath}#${name}`
          const head = <><span class="sc-api-head"><code class="sc-api-name">{name}</code><Badge tone={KIND_TONE[kind] as "neutral"}>{KIND_TEXT(kind)}</Badge></span>
            <span class="sc-api-sum">{summary}</span>
            {also.length ? <span class="sc-api-also">{T().also}: {also.join(", ")}</span> : null}</>
          // single icons have no example card: the Icons page shows them
          if (kind === "icon") return <li class="sc-api-row">{head}</li>
          return <li class={() => ($open.has(key) ? "sc-api-row sc-api-row-open" : "sc-api-row")}>
            <button type="button" class="sc-api-toggle" aria-expanded={() => String($open.has(key))} title={() => ($open.has(key) ? T().close : T().open)} onClick={() => toggle(key)}>{head}</button>
            {() => ($open.has(key) ? <ApiDetail subpath={g.subpath} name={name} text={T()} /> : null)}
          </li>
        })}
      </ul>
    </section>)}
    {() => (shown() ? null : <p class="sc-api-empty">{T().empty}</p>)}
  </div>
}

type Text = (typeof TEXT)[Lang]

/** An open card: signature, example code and the live example (Playground when it has options). */
function ApiDetail(props: { subpath: string; name: string; text: Text }) {
  const T = props.text
  let $mod: ApiExampleModule | null = null
  let $none = false
  let $failed = false
  // the example file of this export (a lazy part; the browser keeps a loaded one)
  const p = loadExamples(props.subpath, props.name)
  if (!p) $none = true
  else p.then((m) => { $mod = m }, () => { $failed = true })
  return <div class="sc-api-detail">
    {() => {
      if ($failed) return <p class="sc-api-note">{T.failed}</p>
      if ($none) return <p class="sc-api-note">{T.noExample}</p>
      const m = $mod
      if (!m) return <p class="sc-api-note" aria-live="polite">{T.loading}</p>
      const ex = m.default[props.subpath]?.[props.name]
      const sig = m.SIG[props.subpath]?.[props.name]
      return <>
        {sig ? <div class="sc-api-block"><h5 class="sc-api-label">{T.sig}</h5><pre class="sc-api-sig"><code>{sig}</code></pre></div> : null}
        {ex ? <div class="sc-api-block"><h5 class="sc-api-label">{T.example}</h5><DemoCode source={ex.code.trim()} lang="tsx" /></div> : <p class="sc-api-note">{T.noExample}</p>}
        {ex ? <div class="sc-api-block"><h5 class="sc-api-label">{T.result}</h5>
          <Try fallback={(e: unknown, reset: () => void) => <p class="sc-api-note" role="alert">{T.failed}: {String((e as Error)?.message ?? e)} <button type="button" class="sc-api-retry" onClick={reset}>{T.retry}</button></p>}>
            {ex.play ? <LitePlayground spec={ex.play} view={ex.run} label={props.name} /> : <div class="sc-stage sc-api-stage">{ex.run({ values: {} })}</div>}
          </Try></div> : null}
      </>
    }}
  </div>
}
