// API başvurusu: every runtime export of every subpath with its kind and summary. Generated from the JSDoc of the
// sources (tools/api-coverage.js → api.gen.ts); a lazy part of the İlk Adımlar page. Summaries follow the active
// language: Turkish from docs/api.tr.json, English (the JSDoc) for every other language. Code names never change.
import { SearchBox, Badge } from "hadi-march/ui";
import { Segmented } from "hadi-march/forms";
import { fold } from "hadi-march/ui";
import { Link, type Href } from "hadi-march/router";
import { locale, effect } from "hadi-march";
import { loadApi, type ApiItem, type ApiGroup } from "./api.gen.ts";

type Kind = ApiItem[1] | "all"
/** The view's own texts: Turkish, and English for every other language (like the summaries). */
const TEXT = {
  tr: { kinds: ["Tümü", "Bileşen", "İşlev", "Sınıf", "Değer", "İkon"], search: "Ad ya da açıklama ara: createRouter, lazy, toast…",
    label: "API ara", exports: "dışa aktarım", icons: "ikon", iconsPage: "İkonlar sayfasında", also: "Ayrıca", empty: "Eşleşen dışa aktarım yok.", icon: "İkon" },
  en: { kinds: ["All", "Component", "Function", "Class", "Value", "Icon"], search: "Search name or summary: createRouter, lazy, toast…",
    label: "Search the API", exports: "exports", icons: "icons", iconsPage: "on the Icons page", also: "Also in", empty: "No export matches.", icon: "Icon" },
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
        {g.items.map(([name, kind, summary, also]) => <li class="sc-api-row">
          <div class="sc-api-head"><code class="sc-api-name">{name}</code><Badge tone={KIND_TONE[kind] as "neutral"}>{KIND_TEXT(kind)}</Badge></div>
          <p class="sc-api-sum">{summary}</p>
          {also.length ? <p class="sc-api-also">{T().also}: {also.join(", ")}</p> : null}
        </li>)}
      </ul>
    </section>)}
    {() => (shown() ? null : <p class="sc-api-empty">{T().empty}</p>)}
  </div>
}
