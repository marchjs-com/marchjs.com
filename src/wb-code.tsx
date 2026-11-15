// The code under a workbench stage. A folder whose playground.ts has `code` gets a CodeEditor: the code is written
// from the options, an edit is read back into them (gen-code.ts), a changed prop flashes, the foot line says in
// Turkish what could not be read. Other folders show the first code block of docs.md, read-only (the code widget).
import { signal, effect, untrack, batch, onCleanup } from "march";
import { scopedMode } from "./stage-mode.ts";
import { Widget, codeView, Kbd } from "march/ui";
import type { PlaygroundOption, PlaygroundSpec, PlaygroundCode } from "march/ui";
import { CodeEditor, jsxCompleter, type CodeMark, type JsxProp } from "march/components/composite/code-editor/index.ts";
import { mProps } from "march/props";
import { genCode, parseCode, lexCode, optionAttrs, choices, COMMON_ATTRS, type ExtraAttr } from "./gen-code.ts";

type Values = Record<string, unknown>
interface Sig<T> { (): T; peek(): T; set(v: T): void }

export interface CodeBoxProps {
  spec: PlaygroundSpec<never>;
  /** The component's name (the tag). */
  name: string;
  values: Sig<Values>;
  extras: Sig<readonly ExtraAttr[]>;
  /** The first code block of docs.md (shown when the folder writes no code). */
  fallback: string;
  /** The stage's frame: attributes the options do not own are written on the component's root inside it. */
  frame: Element;
  /** The component's other props (the API reference), when loaded: the editor accepts and offers them. */
  known?: () => readonly { name: string; type?: string }[];
  /** What else is wrong with the attributes the options do not own (m:parts: an unknown part, prop or value). */
  extraErrors?: (extras: readonly ExtraAttr[]) => string[];
  /** More props for the suggestion list (m:parts on a composite). */
  suggestMore?: () => readonly JsxProp[];
  /** A prop was changed (from the options or the code): the props table lights its row. */
  onChanged?: (props: readonly string[]) => void;
}

/** `"x"` → x, bare → true, `{false}` → false; anything else: undefined. */
const plainAttr = (code: string): string | boolean | undefined => {
  if (code === "") return true
  const q = /^(["'])(.*)\1$/s.exec(code)
  return q ? q[2]! : /^\{\s*false\s*\}$/.test(code) ? false : /^\{\s*true\s*\}$/.test(code) ? true : undefined
}

/** Write the extra attributes on the component's root; returns what undoes it. */
function applyExtras(frame: Element, selector: string | undefined, extras: readonly ExtraAttr[]): () => void {
  const root = frame.querySelector<HTMLElement>(selector ?? '[class^="m-"], [class*=" m-"]')
  if (!root) return () => {}
  const undo: (() => void)[] = []
  for (const x of extras) {
    const v = plainAttr(x.value)
    if (/^on[:A-Z]/.test(x.name) || v === undefined) continue // an event or an expression: recognised, never run
    if (x.name.startsWith("m:")) { const k = x.name.slice(2); mProps(root, { [k]: v !== false }); undo.push(() => { mProps(root, { [k]: null }) }); continue }
    if (x.name === "class") { const list = String(v).split(/\s+/).filter((c) => c && !root.classList.contains(c)); root.classList.add(...list); undo.push(() => root.classList.remove(...list)); continue }
    if (x.name === "style") {
      for (const part of String(v).split(";")) {
        const at = part.indexOf(":"), k = part.slice(0, at).trim(), val = part.slice(at + 1).trim()
        if (at < 1 || !k || !val) continue
        const old = root.style.getPropertyValue(k)
        root.style.setProperty(k, val); undo.push(() => { if (old) root.style.setProperty(k, old); else root.style.removeProperty(k) })
      }
      continue
    }
    if (v === false) continue
    const old = root.getAttribute(x.name)
    try { root.setAttribute(x.name, v === true ? "" : v) } catch { continue }
    undo.push(() => { if (old === null) root.removeAttribute(x.name); else root.setAttribute(x.name, old) })
  }
  return () => { for (const u of undo) u() }
}

export function CodeBox(p: CodeBoxProps) {
  const code = typeof p.spec.code === "object" && p.spec.code !== null ? p.spec.code as PlaygroundCode<Values> & { root?: string } : null
  const gen = (): string | null => genCode(p.spec, p.name, p.values(), p.extras())
  if (!code) return <>{() => { const s = gen() ?? p.fallback; return s ? <div class="sc-wb-code"><Widget sources={[codeView]} input={{ source: s, lang: "tsx" }} /></div> : null }}</>

  const options = p.spec.options as unknown as readonly PlaygroundOption<Values>[]
  const text = signal(untrack(gen)!)
  const errors = signal<readonly string[]>([]), edited = signal(false)
  const marks = signal<readonly CodeMark[]>([])
  const names = (): string[] => (p.known?.() ?? []).map((k) => k.name)
  /** The ranges of these props in the code (the children: the text between the tags). */
  const ranges = (src: string, props: readonly string[], kind: "flash" | "error"): CodeMark[] => {
    const lex = lexCode(src)
    if (!lex) return []
    const out: CodeMark[] = lex.attrs.filter((a) => props.includes(a.name)).map((a) => ({ from: a.from, to: a.to, kind }))
    if (props.includes("children") && lex.children) { const from = src.indexOf(lex.children.trim(), lex.openEnd); if (from >= 0) out.push({ from, to: from + lex.children.trim().length, kind }) }
    return out
  }
  let timer: ReturnType<typeof setTimeout> | undefined
  const flash = (src: string, props: readonly string[]): void => {
    clearTimeout(timer)
    marks.set(ranges(src, props, "flash"))
    timer = setTimeout(() => marks.set(marks.peek().filter((m) => m.kind !== "flash")), 1300)
    if (props.length) p.onChanged?.(props)
  }
  onCleanup(() => clearTimeout(timer))
  /** The props an option writes, for the old and the new value. */
  const propsOf = (keys: readonly string[], before: Values, after: Values): string[] => [...new Set(keys.flatMap((k) => {
    const o = options.find((x) => x.key === k)
    return o ? [...Object.keys(optionAttrs(o, before[k], before)), ...Object.keys(optionAttrs(o, after[k], after))] : []
  }))]

  // options → code (not while the change came from the code itself)
  // (extras are compared by what they say: their owner may hand out a new list for the same attributes)
  const say = (ex: readonly ExtraAttr[]): string => JSON.stringify(ex)
  let seen: Values = untrack(() => p.values()), seenExtras = say(untrack(() => p.extras())), own: Values | null = null, ownExtras: string | null = null
  effect(() => {
    const v = p.values(), ex = say(p.extras())
    if ((v === own || v === seen) && (ex === ownExtras || ex === seenExtras)) { seen = v; seenExtras = ex; return }
    const before = seen, extrasChanged = ex !== seenExtras
    seen = v; seenExtras = ex
    untrack(() => {
      const src = gen()!
      batch(() => { text.set(src); errors.set([]); edited.set(false) })
      flash(src, [...propsOf(Object.keys(v).filter((k) => v[k] !== before[k]), before, v), ...(extrasChanged ? ["m:parts"] : [])])
    })
  })

  // code → options: what is valid applies, the rest is said under the editor
  const onChange = (src: string): void => {
    const now = p.values.peek(), r = parseCode(p.spec, p.name, src, now, names())
    const sameExtras = say(r.extras) === say(p.extras.peek())
    const all = [...r.errors, ...(p.extraErrors?.(r.extras) ?? [])]
    batch(() => {
      text.set(src); errors.set(all); edited.set(true)
      if (r.changed.length) { own = r.values; p.values.set(r.values) }
      // what the owner keeps of them (it may drop what it cannot read) is the state the code now stands for
      if (!sameExtras) { p.extras.set(r.extras); ownExtras = say(p.extras.peek()) }
    })
    clearTimeout(timer)
    marks.set(ranges(src, all.map((e) => (e.startsWith("m:parts") ? "m:parts" : e.slice(0, e.indexOf(":")))), "error"))
    const changed = propsOf(r.changed, now, r.values)
    if (changed.length) p.onChanged?.(changed)
  }
  // leaving the editor with valid code: it is written the way the options write it
  const onBlur = (): void => { if (!errors.peek().length && edited.peek()) { const src = untrack(gen)!; if (src !== text.peek()) { marks.set([]); text.set(src) } } }

  // attributes the options do not own go on the component's root, again after every redraw of the stage
  effect(() => {
    p.values(); const ex = p.extras()
    let undo = (): void => {}
    const id = setTimeout(() => { undo = applyExtras(p.frame, code.root, ex) }, 0)
    onCleanup(() => { clearTimeout(id); undo() })
  })

  // suggestions: the props the options write (with their values), the component's other props, the common ones
  const suggest = (): JsxProp[] => {
    const v = p.values.peek(), found = new Map<string, { hint: string; codes: string[] }>()
    const add = (name: string, hint: string, c: string | null): void => { const e = found.get(name) ?? found.set(name, { hint, codes: [] }).get(name)!; if (c !== null && !e.codes.includes(c)) e.codes.push(c) }
    for (const o of options) {
      if (o.prop === false) continue
      const list = choices(o), hint = o.label.toLocaleLowerCase("tr")
      if (!list) { const name = o.prop ?? o.key; if (name !== "children") add(name, hint, typeof o.default === "number" ? `{${String(o.default)}}` : '""'); continue }
      for (const c of list) for (const [k, c2] of Object.entries(optionAttrs(o, c, v))) add(k, hint, c2)
    }
    const fixed = Object.keys(code.props ?? {})
    const own2 = [...found].filter(([name]) => !fixed.includes(name)).map(([name, e]): JsxProp => {
      const quoted = e.codes.filter((c) => /^"[^"]*"$/.test(c))
      if (quoted.length && quoted.length === e.codes.filter((c) => c !== "").length) return { name, hint: e.hint, values: quoted.map((c) => c.slice(1, -1)) }
      const first = e.codes.find((c) => c !== "")
      return first && !e.codes.includes("") ? { name, hint: e.hint, value: `=${first}` } : { name, hint: e.hint }
    })
    const other = (p.known?.() ?? []).filter((k) => !found.has(k.name) && !fixed.includes(k.name)).map((k): JsxProp => ({ name: k.name, hint: k.type ? `${p.name} · ${k.type}` : p.name }))
    return [...own2, ...(p.suggestMore?.() ?? []), ...COMMON_ATTRS.map(([name, hint, value]): JsxProp => ({ name, hint, ...(value ? { value: `=${value}` } : {}) })), ...other]
  }
  const tag = (): string => lexCode(text.peek())?.tag || p.name
  // the code box is dark in every theme (a terminal strip under the stage)
  const dark = scopedMode(() => "dark")

  return <div class="sc-wb-code sc-wb-edit" style={dark}>
    <CodeEditor value={text()} onChange={onChange} onBlur={onBlur} lang="tsx" marks={marks()} complete={jsxCompleter({ tag, props: suggest })}
      label="Kod: değiştir, sahne ve Seçenekler birlikte güncellenir" suggestionsLabel="Öneriler" copyLabel="Kopyala"
      status={errors().length ? "error" : "ok"}
      message={errors()[0] ?? (edited() ? "Kod, sahne ve Seçenekler eşit." : "Kodu değiştir: sahne ve Seçenekler anında uyar.")}
      hint={<span class="m-ced-hint"><Kbd>Ctrl</Kbd><Kbd>Boşluk</Kbd>öneriler</span>} />
  </div>
}
