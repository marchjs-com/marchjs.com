// The code editor's helpers inside a component tag's props, without the DOM: where the caret is in the tag (between
// props, in a quoted value, in a prop's braces and how deep in its objects), and the rows offered there: the icons in
// icon={…}, sx's keys and values in sx={{ … }}, the components, their props and values in m:parts={{ … }}, a handler in
// on:click={…}, the file's signals and functions in any other prop. extensions-tab.tsx (withExtensionSuggestions) uses
// them; the data (props of a component, icons, components, the sx table) comes in from the IDE.
import type { OwnProp } from "./prop-suggest.ts";

/** An object (or call / array) the caret is in, inside a prop's braces. `key`: the key whose value is being written
 * (after `key:`), `keys`: the keys written before, `expectKey`: a key comes next (after `{` or `,`). */
export interface Frame { kind: "{" | "(" | "["; key: string; expectKey: boolean; keys: string[] }
/** Where the caret is in a component's tag. */
export type TagPlace =
  | { at: "attr"; comp: string; tag: string; word: string; props: string[] }
  | { at: "quoted"; comp: string; tag: string; prop: string; typed: string }
  | { at: "code"; comp: string; tag: string; prop: string; frames: Frame[]; typed: string; quoted: boolean }

const ID = /[\w$]/
/** Read a tag from `s` (its `<`) to the end of `text`: null when the tag closed before it (or is no tag). */
function scanFrom(text: string, s: number): TagPlace | null {
  const head = /^<([A-Za-z][\w$.-]*)(?=\s)/.exec(text.slice(s))
  if (!head) return null
  const comp = head[1]!, tag = text.slice(s), props: string[] = []
  let i = s + head[0].length
  const n = text.length
  while (i < n) {
    const ch = text[i]!
    if (ch === ">" || ch === "<") return null
    if (ch === "/" && text[i + 1] === ">") return null
    if (!/[\w$:|.-]/.test(ch)) { i++; continue }
    // a prop's name
    let j = i
    while (j < n && /[\w$:|.-]/.test(text[j]!)) j++
    const name = text.slice(i, j)
    if (j >= n) return { at: "attr", comp, tag, word: name, props }
    props.push(name.replace(/\|.*$/, ""))
    let k = j
    while (k < n && /\s/.test(text[k]!)) k++
    if (text[k] !== "=") { i = k; continue }
    k++
    while (k < n && /\s/.test(text[k]!)) k++
    if (k >= n) return { at: "attr", comp, tag, word: "", props }
    const q = text[k]!
    if (q === `"` || q === "'") {
      const end = text.indexOf(q, k + 1)
      if (end < 0) return { at: "quoted", comp, tag, prop: name, typed: text.slice(k + 1) }
      i = end + 1
      continue
    }
    if (q !== "{") { i = k; continue }
    // a prop's braces: the expression, its objects, calls and arrays, its strings
    const frames: Frame[] = [{ kind: "{", key: "", expectKey: false, keys: [] }]
    let p = k + 1, last = "", str = ""
    for (; p < n && frames.length; p++) {
      const c = text[p]!
      const top = frames[frames.length - 1]!
      if (str) { if (c === "\\") p++; else if (c === str) { str = ""; } else last += c; continue }
      if (c === `"` || c === "'" || c === "`") { str = c; last = ""; continue }
      if (ID.test(c)) { if (!ID.test(text[p - 1] ?? "")) last = ""; last += c; continue }
      if (c === "{") frames.push({ kind: "{", key: "", expectKey: true, keys: [] })
      else if (c === "(" || c === "[") frames.push({ kind: c, key: "", expectKey: false, keys: [] })
      else if (c === "}" || c === ")" || c === "]") frames.pop()
      else if (c === ":" && top.kind === "{" && top.expectKey && frames.length > 1) { top.key = last; top.expectKey = false }
      else if (c === "," && top.kind === "{" && frames.length > 1) { if (top.key) top.keys.push(top.key); top.key = ""; top.expectKey = true }
    }
    if (frames.length) {
      const typed = str ? last : (/[\w$]*$/.exec(text.slice(k + 1))?.[0] ?? "")
      return { at: "code", comp, tag, prop: name.replace(/\|.*$/, ""), frames, typed: str ? text.slice(text.lastIndexOf(str) + 1) : typed, quoted: !!str }
    }
    i = p
  }
  return { at: "attr", comp, tag, word: "", props }
}
/** Where the caret (the end of `before`) is in a component's tag; null outside one. Tags nested in a prop's braces
 * (`render={() => <Row>…</Row>}`) are stepped over: the tag the caret is in is found from the last `<Name` back. */
export function tagPlace(before: string): TagPlace | null {
  // a component's tag (<Button …>) or an HTML element's (<div …>, not after a name or a bracket: a generic, a
  // comparison); an element counts only inside a prop's braces (sx={{ … }}, on:click={…}), between its props the
  // language service answers
  const starts = [...before.matchAll(/(?<![\w$)\]])<[A-Za-z]/g)].map((m) => m.index!)
  for (let i = starts.length - 1, tries = 0; i >= 0 && tries < 24; i--, tries++) {
    const r = scanFrom(before, starts[i]!)
    if (r) return /^[A-Z]/.test(r.comp) || r.at === "code" ? r : null
  }
  return null
}

/** A row the editor lists (CodeSuggestion's shape, as extensions-tab returns it). */
export interface HelperRow { label: string; group?: string; hint?: string; insert?: string; back?: number; head?: string; again?: boolean; doc?: { kind: string; signature: string; doc?: string } }
/** An icon pack as the icon list offers it. */
export interface IconPack { id: string; label: string; icons: readonly string[] }
/** How many icons of a pack the list shows (typing narrows it; the whole pack is thousands). */
export const PACK_ROWS = 60

/**
 * The rows inside an icon prop's braces (`icon={|`): the icons the file imports (from march/icons and its packs) first,
 * then March's own, then each pack's (up to PACK_ROWS each, narrowing as the name is typed), then defineIcon. Picking an
 * icon adds it to its module's import line; a pack icon whose name is taken (March's `heart`) comes in renamed
 * (`heart as lucideHeart`).
 */
export function iconRows(prop: string, typed: string, value: string, march: readonly string[], packs: readonly IconPack[]): HelperRow[] {
  const ok = fit(typed)
  const mine = importedFrom(value, (m) => m === "march/icons" || m.startsWith("march/icons/")).filter((n) => n !== "defineIcon" && n !== "Icon")
  const taken = new Set([...mine, ...march])
  const rows: HelperRow[] = [
    ...mine.filter(ok).map((n): HelperRow => ({ label: n, group: "Bu dosyada", hint: "içe aktarıldı", doc: { kind: "simge", signature: `${prop}={${n}}` } })),
    ...march.filter((n) => !mine.includes(n) && ok(n)).map((n): HelperRow => ({ label: n, group: "March", hint: "march/icons", head: `import { ${n} } from "march/icons"`,
      doc: { kind: "simge", signature: `import { ${n} } from "march/icons"`, doc: "Seçince içe aktarma satırına eklenir." } })),
  ]
  for (const pk of packs) {
    const from = `march/icons/${pk.id}`, prefix = pk.id.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
    let n = 0
    for (const exp of pk.icons) {
      if (!ok(exp)) continue
      const local = taken.has(exp) ? `${prefix}${exp[0]!.toUpperCase()}${exp.slice(1)}` : exp
      if (mine.includes(local)) continue
      const spec = local === exp ? exp : `${exp} as ${local}`
      rows.push({ label: exp, group: pk.label, hint: from, ...(local !== exp ? { insert: local } : {}), head: `import { ${spec} } from "${from}"`,
        doc: { kind: `simge · ${pk.label}`, signature: `import { ${spec} } from "${from}"`, doc: "Seçince içe aktarma satırına eklenir." } })
      if (++n >= PACK_ROWS) break
    }
  }
  if (ok("defineIcon")) rows.push({ label: "defineIcon", group: "Kendi ikonun", hint: "(ad, yollar)", insert: `defineIcon("ikon", ["M4 12h16"])`, back: 3, head: `import { defineIcon } from "march/icons"`,
    doc: { kind: "işlev", signature: "defineIcon(name: string, d: string[], fill?: boolean): IconDef", doc: "24×24 ızgarada SVG yollarından bir simge tanımlar." } })
  return rows
}

/** An icon set's names as written in an icon prop: March's ("heart", no prefix) or a pack's ("lucide:heart"). */
export interface IconNames { id: string; label: string; names: readonly string[] }
/**
 * The rows inside an icon prop's quotes (`icon="|"`): March's names, then each pack's `pack:name` (up to PACK_ROWS each,
 * narrowing as it is typed; "lucide:" narrows to Lucide). The compiler turns the name into an import of that one icon.
 */
export function iconNameRows(prop: string, typed: string, sets: readonly IconNames[]): HelperRow[] {
  const t = typed.toLowerCase(), colon = t.indexOf(":")
  const rows: HelperRow[] = []
  for (const s of sets) {
    const march = s.id === "march"
    if (colon >= 0 && !march && !s.id.startsWith(t.slice(0, colon))) continue
    if (colon >= 0 && march && t.slice(0, colon) !== "march") continue
    const want = colon >= 0 ? t.slice(colon + 1) : t
    let n = 0
    for (const name of s.names) {
      if (!name.includes(want)) continue
      const label = march ? name : `${s.id}:${name}`
      rows.push({ label, group: s.label, hint: march ? "march/icons" : `march/icons/${s.id}`,
        doc: { kind: `simge · ${s.label}`, signature: `${prop}="${label}"`, doc: "Derleyici bu adı yalnız bu ikonun içe aktarımına çevirir: pakete yalnız kullanılan ikon girer." } })
      if (!march && ++n >= PACK_ROWS) break
    }
  }
  return rows
}

/** What the helpers read: a component's props, March's icons and components, the sx table. */
export interface HelperData {
  own: (comp: string) => Promise<readonly OwnProp[]>;
  icons?: () => Promise<readonly string[]>;
  /** The icon packs (Lucide, Tabler…): id, name and export names; imported from `march/icons/<id>`. */
  packs?: () => Promise<readonly IconPack[]>;
  /** Every set's icon names (March's first), for `icon="…"`. */
  iconNames?: () => Promise<readonly IconNames[]>;
  components?: () => Promise<readonly string[]>;
  sx?: Readonly<Record<string, readonly (string | number)[]>>;
}

/** The local names a text imports from a module (`import { plus, heart as like } from "march/icons"` → plus, like). */
const importedFrom = (value: string, module: (m: string) => boolean): string[] => {
  const out: string[] = []
  for (const m of value.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']([^"']+)["']/g)) if (module(m[2]!))
    for (const x of m[1]!.split(",")) { const n = x.trim().split(/\s+as\s+/).pop()!.trim(); if (n) out.push(n) }
  return out
}
/** The file's signals (`let $open`, `$count`) and functions (`function save`, `const save = () =>`). */
export function fileNames(value: string): { signals: string[]; fns: string[] } {
  const signals = [...new Set([...value.matchAll(/\b(?:let|const|var)\s+(\$[\w$]+)/g)].map((m) => m[1]!))]
  const fns = [...new Set([
    ...[...value.matchAll(/\bfunction\s+([a-z_$][\w$]*)/g)].map((m) => m[1]!),
    ...[...value.matchAll(/\b(?:const|let)\s+([a-z_][\w$]*)\s*=\s*(?:async\s*)?(?:\([^()]*\)|[\w$]+)\s*=>/g)].map((m) => m[1]!),
  ])]
  return { signals, fns }
}
const fit = (typed: string) => (label: string): boolean => label.toLowerCase().includes(typed.toLowerCase())
const isEvent = (name: string, type?: string): boolean => /^on[A-Z]|^on:/.test(name) || /=>/.test(type ?? "") && !/^(render|children)/.test(name)
const isBool = (p: OwnProp | undefined): boolean => !!p && (p.write === "bare" || /^\s*(MaybeFn<)?\s*boolean/.test(p.type ?? ""))
const valueRows = (p: OwnProp | undefined, typed: string, quoted: boolean, group = "Değerler"): HelperRow[] => {
  if (!p) return []
  const words = p.values ?? []
  if (quoted) return words.filter(fit(typed)).map((w) => ({ label: w, group, hint: p.name, doc: { kind: "değer", signature: `${p.name}: "${w}"` } }))
  if (words.length) return words.filter(fit(typed)).map((w) => ({ label: w, group, hint: p.name, insert: `"${w}"`, doc: { kind: "değer", signature: `${p.name}: "${w}"` } }))
  if (isBool(p)) return ["true", "false"].filter(fit(typed)).map((w) => ({ label: w, group, hint: "boolean" }))
  return []
}

/**
 * The rows inside a prop's braces (`place.at === "code"`): null when there is nothing to help with (the language
 * service answers then). Picked rows that open a place of their own (`sx: {{ | }}`, `Avatar: { | }`) ask again.
 */
export async function codeRows(place: Extract<TagPlace, { at: "code" }>, value: string, data: HelperData): Promise<HelperRow[] | null> {
  const { prop, frames, typed, quoted } = place
  const depth = frames.length - 1, top = frames[depth]!
  const ok = fit(typed)
  const props = await data.own(place.comp).catch(() => [] as readonly OwnProp[])
  const p = props.find((x) => x.name === prop)

  // sx={{ … }}: its keys (with their scales), then a key's values
  if (prop === "sx" && data.sx && depth >= 1 && top.kind === "{") {
    if (depth > 1) return null
    if (top.expectKey) return Object.entries(data.sx).filter(([k]) => !top.keys.includes(k) && ok(k)).map(([k, s]) => ({
      label: k, group: "sx", hint: typeof s[0] === "number" ? `${s[0]}–${s[1]}` : s.slice(0, 4).join(" · "),
      insert: typeof s[0] === "number" ? `${k}: ` : `${k}: ""`, back: typeof s[0] === "number" ? 0 : 1, again: true,
      doc: { kind: "sx", signature: `${k}: ${typeof s[0] === "number" ? `${s[0]}…${s[1]}` : s.map((x) => `"${x}"`).join(" | ")}` },
    }))
    const s = data.sx[top.key]
    if (!s) return null
    const words = typeof s[0] === "number" ? Array.from({ length: (s[1] as number) - (s[0] as number) + 1 }, (_, i) => String((s[0] as number) + i)) : s.map(String)
    return words.filter(ok).map((w) => ({ label: w, group: `sx · ${top.key}`, ...(typeof s[0] === "string" && !quoted ? { insert: `"${w}"` } : {}) }))
  }
  // m:parts={{ Name: { prop: value } }}: the components (the file's first), then a component's props, then its values
  if (prop === "m:parts" && depth >= 1 && top.kind === "{") {
    if (depth === 1) {
      if (!top.expectKey) return null
      const mine = importedFrom(value, (m) => m.startsWith("march")).filter((n) => /^[A-Z]/.test(n))
      const all = data.components ? await data.components().catch(() => [] as readonly string[]) : []
      const row = (n: string, group: string): HelperRow => ({ label: n, group, hint: "bileşen", insert: `${n}: {  }`, back: 2, again: true,
        ...(mine.includes(n) ? {} : { head: `import { ${n} } from "march/ui"` }),
        doc: { kind: "m:parts", signature: `${n}: { özellik: değer }`, doc: `İçeride çizilen her ${n} bu özellikleri alır.` } })
      return [...mine.filter((n) => !top.keys.includes(n) && ok(n)).map((n) => row(n, "Bu dosyada")),
        ...all.filter((n) => !mine.includes(n) && !top.keys.includes(n) && ok(n)).map((n) => row(n, "March bileşenleri"))]
    }
    if (depth === 2) {
      const part = frames[1]!.key
      const list = await data.own(part).catch(() => [] as readonly OwnProp[])
      if (top.expectKey) return list.filter((x) => !top.keys.includes(x.name) && /^[\w$]+$/.test(x.name) && !isEvent(x.name, x.type) && ok(x.name)).map((x) => ({
        label: x.name, group: x.group ?? "March", hint: x.values?.length ? x.values.slice(0, 4).join(" · ") : x.type ?? "",
        insert: x.values?.length ? `${x.name}: ""` : `${x.name}: `, back: x.values?.length ? 1 : 0, again: !!(x.values?.length || isBool(x)),
        doc: { kind: `${part} · özellik`, signature: `${x.name}${x.type ? `: ${x.type}` : ""}`, ...(x.doc ? { doc: x.doc } : {}) },
      }))
      return valueRows(list.find((x) => x.name === top.key), typed, quoted, `${part} · ${top.key}`)
    }
    return null
  }
  // style={{ … }}: nothing of March's to offer (CSS names come from TypeScript)
  if (depth >= 1) return null

  // the prop's braces themselves (prop={|})
  const { signals, fns } = fileNames(value)
  const rows: HelperRow[] = []
  if (prop === "sx" || prop === "m:parts" || prop === "style")
    rows.push({ label: "{ … }", group: "Yaz", hint: "nesne", insert: "{  }", back: 2, again: prop !== "style", doc: { kind: "nesne", signature: `${prop}={{ … }}` } })
  if (prop === "ref") rows.push({ label: "(el) => …", group: "Yaz", hint: "öğeyi al", insert: "(el) => {  }", back: 2, doc: { kind: "işlev", signature: "ref={(el) => { … }}", doc: "Çizilen öğe gelir." } })
  if (prop === "m:extend") rows.push({ label: "false", group: "Yaz", hint: "askı yok" }, { label: `["…"]`, group: "Yaz", hint: "yalnız bunlar", insert: `[""]`, back: 2 })
  if (isEvent(prop, p?.type)) {
    rows.push({ label: "() => …", group: "Yaz", hint: "işleyici", insert: "() => {  }", back: 2, doc: { kind: "işlev", signature: `${prop}={() => { … }}` } },
      { label: "(e) => …", group: "Yaz", hint: "olayla", insert: "(e) => {  }", back: 2, doc: { kind: "işlev", signature: `${prop}={(e) => { … }}` } })
    for (const s of signals) if (ok(s)) rows.push({ label: `() => ${s} = !${s}`, group: "Bu dosyada", hint: "aç / kapa", insert: `() => ${s} = !${s}` })
    for (const f of fns) if (ok(f)) rows.push({ label: f, group: "Bu dosyada", hint: "işlev" })
    return rows.filter((r) => r.group !== "Yaz" || !typed)
  }
  if (rows.length) return rows.filter((r) => !typed || ok(r.label))
  // any other prop: its values, then the file's signals (a live value) and names
  const vals = valueRows(p, typed, false, "Değerler")
  const live = signals.filter(ok).map((s): HelperRow => ({ label: s, group: "Bu dosyada", hint: "sinyal (canlı)" }))
  if (vals.length || live.length) return [...vals, ...live]
  return null
}
