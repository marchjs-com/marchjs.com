// API başvurusu: every runtime export of every subpath with its kind and summary. Generated from the JSDoc of the
// sources (tools/api-coverage.js → api.gen.ts); a lazy part of the İlk Adımlar page.
import { SearchBox, Badge } from "hadi-march/ui";
import { Segmented } from "hadi-march/forms";
import { fold } from "hadi-march/ui";
import { Link, type Href } from "hadi-march/router";
import { loadApi, type ApiItem, type ApiGroup } from "./api.gen.ts";

type Kind = ApiItem[1] | "all"
const KINDS: { value: Kind; label: string }[] = [
  { value: "all", label: "Tümü" }, { value: "component", label: "Bileşen" }, { value: "function", label: "İşlev" },
  { value: "class", label: "Sınıf" }, { value: "const", label: "Değer" }, { value: "icon", label: "İkon" },
]
const KIND_TEXT = Object.fromEntries(KINDS.map((k) => [k.value, k.label.toLocaleLowerCase("tr")])) as Record<ApiItem[1], string>
const KIND_TONE: Record<ApiItem[1], string> = { component: "primary", function: "info", class: "warn", const: "neutral", icon: "neutral" }
/** The data parts and this view, loaded together (the page shows a placeholder until then). */
export async function load(): Promise<{ default: () => unknown }> {
  const raw = await loadApi()
  return { default: () => <ApiReference api={raw} /> }
}

function ApiReference(props: { api: ApiGroup[] }) {
  // single icons arrive as a name list; each becomes an "ikon" row
  const API = props.api.map((a) => ({ subpath: a.subpath, items: [...a.items, ...(a.icons ? a.icons.split(" ").map((n): ApiItem => [n, "icon", `İkon: ${n}`, []]) : [])] }))
  const TOTAL = API.reduce((s, a) => s + a.items.length, 0)
  const ICONS = API.reduce((s, a) => s + a.items.filter((i) => i[1] === "icon").length, 0)
  let $q = ""
  let $kind: Kind = "all"
  const groups = () => {
    const q = fold($q.trim())
    return API.map((a) => ({
      subpath: a.subpath,
      items: a.items.filter((i) => ($kind === "all" ? i[1] !== "icon" || !!q : i[1] === $kind) &&
        (!q || fold(i[0]).includes(q) || fold(i[2]).includes(q) || fold(a.subpath).includes(q))),
    })).filter((g) => g.items.length)
  }
  const shown = () => groups().reduce((s, g) => s + g.items.length, 0)
  return <div class="sc-api">
    <div class="sc-api-bar">
      <SearchBox bind:value={$q} placeholder="Ad ya da açıklama ara: createRouter, lazy, toast…" label="API ara" class="sc-api-search" />
      <Segmented bind:value={$kind} options={KINDS} />
    </div>
    <p class="sc-api-count">{() => `${shown()} / ${TOTAL} dışa aktarım`}{() => ($kind === "all" && !$q ? ` · ${ICONS} ikon `: "")}
      {() => ($kind === "all" && !$q ? <Link href={"/icons" as Href}>İkonlar sayfasında</Link> : null)}</p>
    {() => groups().map((g) => <section class="sc-api-group">
      <h4 class="sc-api-sub"><code>{g.subpath}</code><span class="sc-api-n">{g.items.length}</span></h4>
      <ul class="sc-api-list">
        {g.items.map(([name, kind, summary, also]) => <li class="sc-api-row">
          <div class="sc-api-head"><code class="sc-api-name">{name}</code><Badge tone={KIND_TONE[kind] as "neutral"}>{KIND_TEXT[kind]}</Badge></div>
          <p class="sc-api-sum">{summary}</p>
          {also.length ? <p class="sc-api-also">Ayrıca: {also.join(", ")}</p> : null}
        </li>)}
      </ul>
    </section>)}
    {() => (shown() ? null : <p class="sc-api-empty">Eşleşen dışa aktarım yok.</p>)}
  </div>
}
