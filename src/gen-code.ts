// The code under a component's stage, written from its Playground options and read back when it is edited.
// Pure functions (no DOM): the workbench calls them, test/playground-code.test.js round-trips every component folder.
//   genCode(spec, name, values, extras)   → `<Button variant="ghost" icon={plus}>Yeni proje</Button>` (null: no spec.code)
//   parseCode(spec, name, source, values) → { values, extras, errors, changed }
// Rules (src/components/meta.ts › PlaygroundOption.prop / toCode / fromCode, PlaygroundSpec.code): the option's key is
// the prop; its default value is not written; `true` is a bare prop; a string is quoted; anything else is in braces.
import type { PlaygroundOption, PlaygroundSpec, PlaygroundCode, PlaygroundCodeValue } from "../../../src/components/meta.ts";

type Values = Record<string, unknown>
type Option = PlaygroundOption<Values>
/** An attribute the options do not own: a standard HTML attribute, a common prop, an event (`value` as written, "" = bare). */
export interface ExtraAttr { name: string; value: string }
export interface ParsedCode { values: Values; extras: ExtraAttr[]; errors: string[]; changed: string[] }
/** One attribute of the opening tag with its place in the source (the editor marks and completes by it). */
export interface AttrToken { name: string; value: string; from: number; to: number; valueFrom: number }
export interface LexedCode { tag: string; tagFrom: number; attrs: AttrToken[]; children: string | null; closed: boolean; open: boolean; openEnd: number }

const HTML_ATTRS = ["id", "class", "title", "style", "role", "tabindex", "lang", "dir", "hidden", "draggable"]
/** A standard HTML attribute, ARIA / data attribute, a common prop (m:) or an event: known on every component. */
export const isCommonAttr = (name: string): boolean => HTML_ATTRS.includes(name) || /^(aria-|data-|on:|m:)[\w:-]+$/.test(name) || /^on[A-Z]\w*$/.test(name)
/** What the editor offers besides the component's own props. */
export const COMMON_ATTRS: readonly (readonly [name: string, hint: string, value: string])[] = [
  ["m:no-select", "ortak prop · seçilemez", ""], ["title", "HTML · ipucu yazısı", '""'], ["class", "HTML · sınıf", '""'], ["id", "HTML · kimlik", '""'],
  ["style", "HTML · stil", '""'], ["aria-label", "HTML · erişilebilir ad", '""'], ["data-", "HTML · veri özniteliği", ""], ["on:click", "olay", "{() => {}}"],
]

const norm = (s: string): string => s.replace(/\s+/g, " ").trim()
/** A plain value as an attribute value: `true` bare, a string quoted, anything else in braces. */
export const literal = (v: unknown): string => (v === true ? "" : typeof v === "string" ? JSON.stringify(v) : `{${String(v)}}`)
const valueOf = (x: unknown): unknown => (typeof x === "object" && x !== null ? (x as { value: unknown }).value : x)
/** The values an option can take (a choice or a switch); null: free (slider, text). */
export const choices = (o: Option): unknown[] | null => (o.options ? o.options.map(valueOf) : typeof o.default === "boolean" ? [true, false] : null)
const propOf = (o: Option): string => (o.prop === undefined || o.prop === false ? o.key : o.prop)

/** What one option writes for a value: prop → code ("" bare) or null (left out). */
export function optionAttrs(o: Option, value: unknown, values: Values): Record<string, string | null> {
  if (o.prop === false) return {}
  let c: PlaygroundCodeValue | undefined
  if (typeof o.toCode === "function") c = o.toCode(value, values)
  else if (o.toCode && Object.hasOwn(o.toCode, String(value))) c = o.toCode[String(value)]
  if (c === undefined) c = propOf(o) === "children" ? String(value ?? "") : value === o.default ? null : literal(value)
  return c !== null && typeof c === "object" ? { ...c } : { [propOf(o)]: c }
}

const specCode = (spec: PlaygroundSpec<never>): PlaygroundCode<Values> | null => (spec.code && typeof spec.code === "object" ? spec.code as PlaygroundCode<Values> : null)
const tagOf = (code: PlaygroundCode<Values>, name: string, values: Values): string => (typeof code.tag === "function" ? code.tag(values) : code.tag ?? name)
const visible = (o: Option, values: Values): boolean => !o.visibleWhen || o.visibleWhen(values)
const options = (spec: PlaygroundSpec<never>): readonly Option[] => spec.options as unknown as readonly Option[]

/** Every attribute the options write for these values, in order, and the children. */
export function codeAttrs(spec: PlaygroundSpec<never>, values: Values): { attrs: [string, string][]; children: string | null } {
  const code = specCode(spec)!
  const attrs: [string, string][] = Object.entries(code.props ?? {})
  let children = typeof code.children === "function" ? code.children(values) : code.children ?? null
  for (const o of options(spec)) {
    if (!visible(o, values)) continue
    for (const [k, v] of Object.entries(optionAttrs(o, values[o.key], values))) {
      if (v === null) continue
      if (k === "children") children = v; else attrs.push([k, v])
    }
  }
  return { attrs, children }
}

/** The line limit: a longer tag wraps (the props fill each line, continuation lines are indented). */
const WIDTH = 76
/** The code of the component for these option values (null: the folder has no `code` in its playground.ts). */
export function genCode(spec: PlaygroundSpec<never>, name: string, values: Values, extras: readonly ExtraAttr[] = []): string | null {
  if (typeof spec.code === "function") return (spec.code as (v: Values) => string)(values)
  const code = specCode(spec)
  if (!code) return null
  const tag = tagOf(code, name, values), { attrs, children } = codeAttrs(spec, values)
  const all = [...attrs, ...extras.map((x): [string, string] => [x.name, x.value])].map(([k, v]) => (v === "" ? k : `${k}=${v}`))
  const empty = children === null || children === ""
  const one = `<${tag}${all.map((a) => ` ${a}`).join("")}${empty ? " />" : `>${children}</${tag}>`}`
  if (one.length <= WIDTH) return one
  const lines = [`<${tag}`]
  for (const a of all) {
    const last = lines[lines.length - 1]!
    if (last.length + 1 + a.length > WIDTH && last.trim() !== `<${tag}`) lines.push(`  ${a}`); else lines[lines.length - 1] = `${last} ${a}`
  }
  if (empty) return `${lines.join("\n")} />`
  const head = `${lines.join("\n")}>`
  return head.length - head.lastIndexOf("\n") - 1 + children.length + tag.length + 3 <= WIDTH ? `${head}${children}</${tag}>` : `${head}\n  ${children}\n</${tag}>`
}

/** The opening tag as written: tag name, attributes (value as written, "" = bare), children; unfinished code too. */
export function lexCode(src: string): LexedCode | null {
  const m = /^\s*<([A-Za-z][\w.]*)?/.exec(src)
  if (!m) return null
  const out: LexedCode = { tag: m[1] ?? "", tagFrom: m[0].length - (m[1]?.length ?? 0), attrs: [], children: null, closed: false, open: true, openEnd: src.length }
  let i = m[0].length
  const n = src.length
  while (i < n) {
    while (i < n && /\s/.test(src[i]!)) i++
    if (i >= n) break
    if (src.startsWith("/>", i)) { out.closed = true; out.open = false; out.openEnd = i; return out }
    if (src[i] === ">") {
      out.open = false; out.openEnd = i
      const close = src.lastIndexOf("</")
      if (close > i) { out.children = src.slice(i + 1, close); out.closed = new RegExp(`^</${out.tag.replace(/\./g, "\\.")}\\s*>\\s*$`).test(src.slice(close)) }
      else out.children = src.slice(i + 1)
      return out
    }
    const from = i
    while (i < n && !/[\s=>]/.test(src[i]!) && !src.startsWith("/>", i)) i++
    const name = src.slice(from, i)
    if (!name) { i++; continue }
    let value = "", valueFrom = i
    if (src[i] === "=") {
      i++; valueFrom = i
      const q = src[i]
      if (q === '"' || q === "'") { const e = src.indexOf(q, i + 1); i = e < 0 ? n : e + 1 }
      else if (q === "{") {
        let depth = 0, str = ""
        for (; i < n; i++) {
          const ch = src[i]!
          if (str) { if (ch === "\\") i++; else if (ch === str) str = ""; continue }
          if (ch === '"' || ch === "'" || ch === "`") str = ch
          else if (ch === "{") depth++
          else if (ch === "}" && --depth === 0) { i++; break }
        }
      } else while (i < n && !/[\s>]/.test(src[i]!)) i++
      value = src.slice(valueFrom, i)
      if (value === "") value = "="
    }
    out.attrs.push({ name, value, from, to: i, valueFrom })
  }
  return out
}

/** `"x"` → x, `{3}` → 3, `{true}` → true, bare → true; undefined: not a plain value. */
function plain(code: string): unknown {
  if (code === "") return true
  const q = /^(["'])(.*)\1$/s.exec(code)
  if (q) return q[2]
  const b = /^\{\s*([\s\S]*?)\s*\}$/.exec(code)
  if (!b) return undefined
  if (b[1] === "true") return true
  if (b[1] === "false") return false
  if (/^-?\d+(\.\d+)?$/.test(b[1]!)) return Number(b[1])
  const s = /^(["'`])([^"'`$]*)\1$/.exec(b[1]!)
  return s ? s[2] : undefined
}
const show = (code: string): string => (code === "" ? "(yalın)" : code)

/**
 * Read edited code back into option values. What is valid is applied; everything else is reported in Turkish (the
 * first error is shown under the editor). `known`: the component's other prop names (the API reference): they are
 * accepted but the stage does not follow them.
 */
export function parseCode(spec: PlaygroundSpec<never>, name: string, src: string, current: Values, known: readonly string[] = []): ParsedCode {
  const code = specCode(spec)
  const errors: string[] = [], extras: ExtraAttr[] = [], next: Values = { ...current }
  const done = (): ParsedCode => ({ values: next, extras, errors, changed: Object.keys(next).filter((k) => next[k] !== current[k]) })
  const lex = lexCode(src)
  if (!code || !lex || !lex.tag) { errors.push(`<${name} … /> biçiminde yaz`); return done() }
  const attrs: Record<string, string> = {}
  for (const a of lex.attrs) {
    if (Object.hasOwn(attrs, a.name)) errors.push(`${a.name}: iki kez yazılmış`)
    attrs[a.name] = a.value
  }
  const handled = new Set<string>(Object.keys(code.props ?? {}))
  const opts = options(spec)
  // 1. options that read the code themselves
  for (const o of opts) {
    if (!o.fromCode) continue
    const v = o.fromCode(attrs, lex.children)
    if (v !== undefined) next[o.key] = v
  }
  // 2. the usual rule
  for (const o of opts) {
    if (o.prop === false) continue
    const list = choices(o)
    if (list) {
      const recs = list.map((c) => optionAttrs(o, c, next))
      const props = [...new Set(recs.flatMap((r) => Object.keys(r)))]
      for (const p of props) handled.add(p)
      if (o.fromCode && o.fromCode(attrs, lex.children) !== undefined) continue
      const written = props.filter((p) => Object.hasOwn(attrs, p))
      if (!written.length && !visible(o, current)) continue
      const at = recs.findIndex((r) => props.every((p) => norm(r[p] ?? "\0") === norm(Object.hasOwn(attrs, p) ? attrs[p]! : "\0")))
      if (at >= 0) { next[o.key] = list[at]; continue }
      // a plain value the option lists (variant={"ghost"}, loading={true})
      const p = written[0] ?? props[0]!
      const lit = written.length === 1 ? plain(attrs[p]!) : undefined
      if (lit !== undefined && list.includes(lit) && !o.toCode) { next[o.key] = lit; continue }
      const can = [...new Set(recs.map((r) => r[p]).filter((x): x is string => x != null))].map(show)
      errors.push(written.length ? `${p}: ${show(attrs[p]!)} burada yok → ${can.join(", ") || "yazma"}` : `${props.join(" / ")}: birlikte yazılır`)
      continue
    }
    const p = propOf(o)
    handled.add(p)
    if (o.fromCode && o.fromCode(attrs, lex.children) !== undefined) continue
    if (p === "children") { if (!lex.open) next[o.key] = (lex.children ?? "").trim(); continue }
    if (!Object.hasOwn(attrs, p)) { if (visible(o, current)) next[o.key] = o.default; continue }
    const lit = plain(attrs[p]!)
    if (typeof o.default === "number") {
      if (typeof lit !== "number") errors.push(`${p}: bir sayı ver → ${p}={${String(o.default)}}`)
      else if ((o.min != null && lit < o.min) || (o.max != null && lit > o.max)) errors.push(`${p}: ${String(o.min)} ile ${String(o.max)} arasında olmalı`)
      else next[o.key] = lit
    } else if (typeof lit === "string") next[o.key] = lit
    else errors.push(`${p}: tırnak içinde bir metin ver → ${p}="…"`)
  }
  // 3. the tag (an option may choose it)
  if (lex.tag !== tagOf(code, name, next)) {
    let found = false
    for (const o of opts) {
      const list = choices(o)
      if (found || !list) continue
      for (const c of list) if (tagOf(code, name, { ...next, [o.key]: c }) === lex.tag) { next[o.key] = c; found = true; break }
    }
    if (!found) errors.push(`<${lex.tag}> burada çizilmez → <${tagOf(code, name, next)}>`)
  }
  // 4. what the options do not own
  for (const a of lex.attrs) {
    if (handled.has(a.name)) continue
    if (isCommonAttr(a.name)) extras.push({ name: a.name, value: a.value })
    else if (known.includes(a.name)) { extras.push({ name: a.name, value: a.value }); errors.push(`${a.name}: ${name} özelliği; bu sahne onu uygulamıyor`) }
    else errors.push(`${a.name}: ${name} özelliği ya da HTML özniteliği değil`)
  }
  if (lex.open) errors.push("etiket kapanmadı → /> ya da >")
  else if (!lex.closed) errors.push(`etiket kapanmadı → </${lex.tag}>`)
  return done()
}
