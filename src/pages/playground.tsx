// Playground: the workspace of a component's page on march-app-ui (AppUI). The top bar: the component's name on the
// left, the command palette and the Layout button on the right. Preview over Properties and Dependencies /
// Accessibility on the left; the component's files over Console / Debugger / Terminal / lang.json on the right. The
// .tsx tabs are files: the code editor plugin opens them, the March language plugin suggests March's exports. Button.tsx exports
// the component under work; Properties shows its options, and the build renders it with them (PreviewControl.tsx). Every
// change is built in the page (playground/build.ts): the Console shows each step with its time and the errors,
// lang.json the texts the build found. No tab has a close mark (groups still collapse to strips).
import "./playground.css";
import { h, render as mount, createRoot, signal, computed, effect, untrack, onCleanup } from "hadi-march";
import { registry } from "hadi-march/components/registry.gen.ts";
import type { PlaygroundOption } from "hadi-march/components/meta.ts";
import { appUrl } from "hadi-march/base";
import { PaletteButton, JsonView, Terminal, PropertyGrid, IconPicker, Combobox, Toggle, Select, Badge, Button, IconButton, Dropdown, toast, colorThemes, Tree, CodeView, Alert, type TerminalApi, type TerminalCommand, type TerminalIO, type PropertySpec } from "hadi-march/ui";
import { AppUI, AppPreview, codeEditorPlugin, marchLanguagePlugin, typeScriptPlugin, debuggerPlugin, groups, type DebuggerService, type AppKit, type DockApi, row, col, tabs, type AppPanel, type Preset, type MarchCatalog } from "hadi-march/app-ui";
import { x as xIcon, plus, database, zap, monitor, sliders, packageBox, users, code, terminal, fileText, globe } from "hadi-march/icons";
import { KeyValueEditor, TextInput, JsonEditor } from "hadi-march/forms"
import { COLOR_TOKENS } from "hadi-march/theme"
import { createBuilder } from "../playground/build.ts";
import { findRoots, exportRoots, viewRoots, type JsxRoot } from "../playground/roots.ts";
import { iconPickerPacks, packRef } from "../icon-packs.ts";


// the component's files (kept for this visit)
const SOURCES: Record<string, string> = {
  "Button.tsx": `export { Button } from "hadi-march/ui"
`,
  "Component2.tsx": `import { Card, Badge } from "hadi-march/ui"

export function Component2(props: { title: string; count: number }) {
  return <Card title={props.title}>
    <Badge tone="info">{props.count} yeni</Badge>
  </Card>
}
`,
  "Component3.tsx": `import { signal, computed } from "hadi-march"

const items = signal(["elma", "armut"])
const total = computed(() => items().length)

export const Component3 = () => <p>{total()} öğe</p>
`,
}
// every file's text, made first: what reads them (the exported name, the build) finds them all
const files = new Map(Object.entries(SOURCES).map(([p, text]) => [p, signal(text)] as const))
const fileTab = (id: string, path: string): AppPanel => {
  const text = files.get(path) ?? signal("")
  return { id, title: path, icon: fileText, file: { path, text, set: (v: string) => text.set(v) } }
}

// the component under work: the first name Button.tsx exports; its Properties are the options of its showcase card
// (its playground.ts); the preview entry renders it with the values chosen there
// a playground, not a project: the code tab in front (of the files' group) is the one built, previewed, translated
// (lang.json) and whose Properties show; the others wait
const ENTRY = "PreviewControl.tsx"
const FILE_OF: Record<string, string> = { c1: "Button.tsx", c2: "Component2.tsx", c3: "Component3.tsx" }
const active = signal("Button.tsx")
let dock: DockApi | null = null
const followTabs = (api: DockApi) => {
  dock = api

  effect(() => {
    const L = api.layout()
    if (!L) return
    // the files' group: the group that holds a file tab; its front tab is the file in work
    const g = groups(L.root).find((x) => x.panels.some((id) => id in FILE_OF))
    const file = g?.active ? FILE_OF[g.active] : undefined
    if (file && file !== untrack(active)) { active.set(file); print(`[${stamp()}] ${file} sekmesi etkin`, "info") }
  })
}
// the components the file in front exports (names with a capital letter): each has a cell of the preview and a root
// in the Dependencies tree
// the elements the file writes at its top level, assigned to nothing (<CodeEditor … />): components of their own,
// named by their tag (CodeEditor_1); their props are the written ones, Properties go over them
const jsxRoots = computed((): JsxRoot[] => findRoots(files.get(active())?.() ?? ""), { equals: (a, b) => !!a && !!b && a.map((r) => r.name + r.tag).join() === b.map((r) => r.name + r.tag).join() })
/** The tag a top-level element's name stands for (CodeEditor_1 → CodeEditor); undefined for a name the file exports. */
const rootTag = (name: string): string | undefined => jsxRoots().find((r) => r.name === name)?.tag
/** The code built: the top-level elements written as exports. */
const forBuild = (src: string): string => exportRoots(src)
const exportedNames = computed((): string[] => {
  const src = files.get(active())?.() ?? "", out: string[] = []
  for (const m of src.matchAll(/export\s*\{([^}]*)\}/g)) for (const part of (m[1] ?? "").split(",")) { const n = part.trim().replace(/^type\s+/, "").split(/\s+as\s+/).pop()?.trim(); if (n) out.push(n) }
  for (const m of src.matchAll(/export\s+(?:async\s+)?(?:function\*?|const|let|class)\s+([A-Za-z_$][\w$]*)/g)) out.push(m[1]!)
  for (const r of jsxRoots()) out.push(r.name)
  return [...new Set(out)].filter((n) => /^[A-Z]/.test(n))
}, { equals: (a, b) => !!a && !!b && a.join() === b.join() })
const isRoot = (name: string): boolean => exportedNames().includes(name)
// the components of the work: the exported one and, in the Dependencies tree, the ones it is built from (their
// composedOf, recursively). Each has its options (its showcase card's playground.ts) and its values; the exported one
// takes its values as props, the others as m:parts of it (only what was changed from their defaults)
const metaOf = (name: string) => { const tag = rootTag(name) ?? name; return registry.find((e) => e.meta.name === tag) }
// a component written in the file in front (not one of March's): its props read from its type (`props: { … }`, or
// an interface / type of the file), its parts from its JSX (the March components and the file's own ones it draws)
interface LocalComp { props: ApiProp[]; uses: string[] }
const typeFields = (body: string): ApiProp[] => body.split(/[;\n]/).map((line) => /^\s*(?:readonly\s+)?([\w$]+)(\?)?\s*:\s*(.+?)\s*,?\s*$/.exec(line))
  .filter((m): m is RegExpExecArray => !!m).map((m) => ({ name: m[1]!, type: `${m[3]!}${m[2] ? " | undefined" : ""}`, doc: "" }))
const localComps = computed((): Record<string, LocalComp> => {
  const src = files.get(active())?.() ?? "", out: Record<string, LocalComp> = {}
  const starts = [...src.matchAll(/(?:function\s+([A-Z][\w$]*)\s*(?:<[^>]*>)?\s*\(|(?:const|let)\s+([A-Z][\w$]*)\s*=\s*(?:async\s*)?\()/g)]
  starts.forEach((m, i) => {
    const name = (m[1] ?? m[2])!, body = src.slice(m.index!, starts[i + 1]?.index ?? src.length)
    // the first parameter's type: written in place, or a name the file declares
    const t = /\(\s*(?:[\w$]+|\{[^}]*\})\s*:\s*(\{[^{}]*\}|[A-Z][\w$]*)/.exec(body)?.[1] ?? ""
    const decl = t.startsWith("{") ? t.slice(1, -1) : t ? (new RegExp(`(?:interface\\s+${t}\\b[^{]*|type\\s+${t}\\s*=\\s*)\\{([^}]*)\\}`).exec(src)?.[1] ?? "") : ""
    out[name] = { props: typeFields(decl), uses: [...new Set([...body.matchAll(/<([A-Za-z][\w$-]*)/g)].map((x) => (/^[a-z]/.test(x[1]!) ? `<${x[1]}>` : x[1]!)))].filter((n) => n !== name) }
  })
  for (const c of Object.values(out)) c.uses = c.uses.filter((n) => n.startsWith("<") || metaOf(n) || n in out)
  return out
})
// Data: what the file declares at its top (signals, computed values, constants): the Data tab shows them; a signal is
// set (or pushed to) in the running preview at once, a constant's value is written into the code (and built again)
interface DataItem { name: string; kind: "signal" | "computed" | "const" | "let"; init: string; from: number; to: number }
const dataItems = computed((): DataItem[] => {
  const src = files.get(active())?.() ?? "", out: DataItem[] = []
  for (const m of src.matchAll(/^(?:export\s+)?(const|let)\s+([a-z_$][\w$]*)\s*(?::[^=\n]+)?=\s*(.+)$/gm)) {
    const [, decl, name, rest] = m as unknown as [string, "const" | "let", string, string]
    const kind = /^signal\s*[<(]/.test(rest) ? "signal" : /^computed\s*[<(]/.test(rest) ? "computed" : decl
    // a constant: only a literal written on its line (a number, text, yes / no, a list or an object) can be edited
    if ((kind === "const" || kind === "let") && !/^(-?\d[\d_.]*|"[^"]*"|'[^']*'|true|false|null|\[.*\]|\{.*\})\s*;?\s*$/.test(rest)) continue
    const at = m.index! + m[0].length - rest.length
    out.push({ name, kind, init: rest.replace(/;?\s*$/, ""), from: at, to: at + rest.replace(/;?\s*$/, "").length })
  }
  return out
}, { equals: (a, b) => !!a && !!b && JSON.stringify(a) === JSON.stringify(b) })
/** The props a component exports: the file's own component's from its type, March's from the API reference. */
const exportedProps = (name: string): ApiProp[] => localComps()[name]?.props ?? apiPropsBy()[name] ?? []
interface DepNode { id: string; label: string; children?: DepNode[] }
const depTree = computed((): DepNode[] => {
  const roots = exportedNames()
  if (!roots.length) return []
  const walk = (name: string, path: string, seen: Set<string>): DepNode => {
    const local = localComps()[name]
    const kids = seen.has(name) ? [] : (local ? local.uses : (metaOf(name)?.meta.composedOf ?? []).filter((k) => metaOf(k)))
    const next = new Set(seen).add(name)
    return { id: path, label: name, ...(kids.length ? { children: kids.map((k) => walk(k, `${path}/${k}`, next)) } : {}) }
  }
  return roots.map((r) => walk(r, r, new Set()))
})
const inTree = computed((): string[] => { const out = new Set<string>(); const go = (n: DepNode): void => { out.add(n.label); n.children?.forEach(go) }; depTree().forEach(go); return [...out] })
/** The component whose Properties show (chosen in the Dependencies tree; the exported one by default). */
const selected = signal("")
const optionsBy = signal<Record<string, readonly PlaygroundOption[]>>({})
const valuesBy = signal<Record<string, Record<string, unknown>>>({})
interface ApiProp { name: string; type: string; doc: string }
/** Every prop a component exports (the API reference): its events and its accessibility props are read from it. */
const apiPropsBy = signal<Record<string, ApiProp[]>>({})
// an option that takes an icon (icon, iconEnd…): chosen with an IconPicker, kept as the icon's name. A yes / no icon
// option of the card (Button's "İkon" with toCode {plus}) starts at the icon its code names.
const isIcon = (o: PlaygroundOption): boolean => /icon/i.test(o.key) || /icon/i.test(String(o.prop || ""))
const iconDefault = (o: PlaygroundOption): string | null => {
  if (typeof o.default === "string") return o.default || null
  if (o.default !== true) return null
  const code = typeof o.toCode === "object" ? (o.toCode as Record<string, unknown>)["true"] : null
  return typeof code === "string" ? (/^\{([A-Za-z_$][\w$]*)\}$/.exec(code)?.[1] ?? null) : null
}
// a yes / no prop that is off by default has three states: not set (null: left out, the component's own default),
// on, and off (written as {false}: for a prop where unset and false differ, Button's pressed)
const isTri = (o: PlaygroundOption): boolean => o.default === false && (!isHtml(o) || o.key.startsWith("api:"))
const defaultOf = (o: PlaygroundOption): unknown => (isIcon(o) ? iconDefault(o) : isTri(o) ? null : o.default)
// the first exported component is chosen at first, and again when the chosen one is no longer in the tree
effect(() => { const names = inTree(); if (!names.includes(untrack(selected))) selected.set(exportedNames()[0] ?? "") })
// every component of the tree gets its options and default values once
effect(() => {
  for (const name of inTree()) {
    if (untrack(optionsBy)[name]) continue
    const entry = metaOf(name)
    // the file's own component: no card; its props come from its type (exportedProps)
    if (!entry || untrack(localComps)[name]) { optionsBy.set({ ...optionsBy.peek(), [name]: [] }); continue }
    void entry.playground().then((m) => {
      const list = (m.default as { options: readonly PlaygroundOption[] }).options.filter((o) => o.prop !== false)
      optionsBy.set({ ...optionsBy.peek(), [name]: list })
      if (!valuesBy.peek()[name]) valuesBy.set({ ...valuesBy.peek(), [name]: Object.fromEntries(list.map((o) => [o.key, defaultOf(o)])) })
    })
  }
})
// besides its card's options (March's, on top), a component takes HTML attributes: class (March's own classes to
// choose, or any typed one), the global attributes and those of the element it draws (the root's tag, read from the
// preview). What the component sets itself (its own props: disabled, type…) is not listed again.
const GLOBAL_ATTRS = ["dir", "id", "lang", "title", "translate"]
// the Accessibility tab: the attributes of accessibility, and the props a component exports for it (its accessible
// name, its texts for screen readers: from the API reference)
const A11Y_ATTRS = ["accesskey", "aria-describedby", "aria-description", "aria-hidden", "aria-label", "aria-labelledby", "role", "tabindex"]
const A11Y_GROUP = "Erişilebilirlik", COMMON_GROUP = "Ortak (m:)"
// March's common props (hadi-march/props): every component takes them
const COMMON_PROPS = ["m:color", "m:dir", "m:lang", "m:no-select", "m:reveal", "m:test", "m:theme", "m:tip"]
const COMMON_BOOL = new Set(["m:no-select", "m:reveal"])
// the values an attribute (or an exported prop) takes: one of a list (a select), one of a list or your own (`own`:
// an editable select), several (`multi`: chips, written space-separated)
interface ValueSet { list: readonly string[]; own?: boolean; multi?: boolean }
const ROLES = ["alert", "alertdialog", "button", "checkbox", "dialog", "group", "heading", "img", "link", "list", "listbox", "listitem", "log", "menu", "menubar", "menuitem", "menuitemcheckbox", "menuitemradio", "navigation", "none", "note", "option", "presentation", "progressbar", "radio", "radiogroup", "region", "search", "separator", "slider", "spinbutton", "status", "switch", "tab", "tablist", "tabpanel", "textbox", "timer", "toolbar", "tooltip", "tree", "treeitem"]
const TARGETS = ["_self", "_blank", "_parent", "_top"]
const ATTR_VALUES: Record<string, ValueSet> = {
  dir: { list: ["ltr", "rtl", "auto"] },
  translate: { list: ["yes", "no"] },
  spellcheck: { list: ["true", "false"] },
  "aria-hidden": { list: ["true", "false"] },
  "m:color": { list: COLOR_TOKENS },
  "m:dir": { list: ["ltr", "rtl"] },
  "m:lang": { list: ["tr", "en", "de", "fr", "es", "ar", "ru", "ja"], own: true },
  role: { list: ROLES, own: true },
  tabindex: { list: ["0", "-1"], own: true },
  lang: { list: ["tr", "en", "de", "fr", "es", "ar", "ru", "ja"], own: true },
  "aria-describedby": { list: [], own: true, multi: true },
  "aria-labelledby": { list: [], own: true, multi: true },
  formmethod: { list: ["get", "post", "dialog"] },
  formtarget: { list: TARGETS, own: true },
  target: { list: TARGETS, own: true },
  rel: { list: ["alternate", "author", "bookmark", "external", "help", "license", "me", "next", "nofollow", "noopener", "noreferrer", "prev", "search", "tag"], own: true, multi: true },
  referrerpolicy: { list: ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin", "unsafe-url"] },
  autocomplete: { list: ["on", "off", "name", "email", "username", "current-password", "new-password", "one-time-code", "tel", "url", "street-address", "postal-code", "country"], own: true, multi: true },
  inputmode: { list: ["none", "text", "decimal", "numeric", "tel", "search", "email", "url"] },
  wrap: { list: ["hard", "soft", "off"] },
  decoding: { list: ["sync", "async", "auto"] },
  fetchpriority: { list: ["high", "low", "auto"] },
  loading: { list: ["eager", "lazy"] },
}
/** The values of an exported prop from its type: `"polite" | "assertive"` a list; with `string` too, your own as well. */
const typeValues = (type: string): ValueSet | undefined => {
  const list = [...type.matchAll(/"([^"]+)"/g)].map((m) => m[1]!)
  return list.length ? { list, own: /\bstring\b/.test(type) } : undefined
}
/** The value set of an option of the HTML / Accessibility groups. */
const valuesOf = new Map<string, ValueSet>()
const BOOL_ATTRS = new Set(["autofocus", "hidden", "formnovalidate", "readonly", "required", "inert"])
const TAG_ATTRS: Record<string, string[]> = {
  button: ["autofocus", "form", "formaction", "formmethod", "formnovalidate", "formtarget", "name", "popovertarget", "value"],
  a: ["download", "hreflang", "ping", "referrerpolicy", "rel", "target"],
  input: ["autocomplete", "autofocus", "form", "inputmode", "maxlength", "minlength", "name", "pattern", "readonly", "required", "spellcheck"],
  textarea: ["autocomplete", "autofocus", "form", "maxlength", "minlength", "name", "readonly", "required", "rows", "spellcheck", "wrap"],
  select: ["autocomplete", "autofocus", "form", "name", "required"],
  img: ["decoding", "fetchpriority", "loading", "referrerpolicy"],
}
/** The tag of what the preview draws (its root element): its own attributes are offered. */
/** The tag each exported component draws (its cell's first element): its own attributes are offered. */
const rootTags = signal<Record<string, string>>({})
const HTML_GROUP = "HTML", MARCH_GROUP = "March"
const htmlOptions = (name: string): PlaygroundOption[] => {
  const own = new Set((optionsBy()[name] ?? []).map((o) => String(o.prop || o.key)))
  const tag = rootTags()[name] ?? ""
  const attrs = [...new Set(["class", "data", "hidden", "inert", ...GLOBAL_ATTRS, ...(TAG_ATTRS[tag] ?? [])])].filter((a) => !own.has(a)).sort()
  return attrs.map((a) => ({ key: `html:${a}`, label: a === "data" ? "data-*" : a, prop: a, default: a === "data" ? {} : BOOL_ATTRS.has(a) ? false : "", kind: "text" as const }))
}
// every other prop the component exports (its API reference) that its card does not list (Button's type, href…):
// a yes / no one has three states, a list of words is a select (an editable one when any text goes too), a text or
// a number a field, an icon an IconPicker; what takes a node, a function or an object is left to the code
const SKIP_PROPS = new Set(["children", "class", "style", "ref"])
const apiOptions = (name: string): PlaygroundOption[] => {
  const own = new Set((optionsBy()[name] ?? []).map((o) => String(o.prop || o.key)))
  const out: PlaygroundOption[] = []
  for (const p of exportedProps(name)) {
    if (own.has(p.name) || SKIP_PROPS.has(p.name) || /^on[A-Z]/.test(p.name) || /^aria|^label$|^role$/i.test(p.name) || p.name.includes("[")) continue
    const t = p.type.replace(/MaybeFn<(.*)>$/, "$1"), key = `api:${p.name}`, set = typeValues(t)
    if (set) { valuesOf.set(key, set); out.push({ key, label: p.name, prop: p.name, default: "", kind: "text" }) }
    else if (/^(boolean|null|undefined|\s|\|)+$/.test(t)) out.push({ key, label: p.name, prop: p.name, default: false })
    else if (/^(string|null|undefined|\s|\|)+$/.test(t)) out.push({ key, label: p.name, prop: p.name, default: "", kind: "text" })
    else if (/^(number|null|undefined|\s|\|)+$/.test(t)) out.push({ key, label: p.name, prop: p.name, default: null })
    else if (/icon/i.test(p.name)) out.push({ key, label: p.name, prop: p.name, default: "" })
  }
  return out
}
const commonOptions = (name: string): PlaygroundOption[] => {
  const own = new Set((optionsBy()[name] ?? []).map((o) => String(o.prop || o.key)))
  return COMMON_PROPS.filter((p) => !own.has(p)).map((p) => ({ key: `mp:${p.slice(2)}`, label: p, prop: p, default: COMMON_BOOL.has(p) ? false : "", kind: "text" as const }))
}
const a11yOptions = (name: string): PlaygroundOption[] => {
  const own = new Set((optionsBy()[name] ?? []).map((o) => String(o.prop || o.key)))
  const props = exportedProps(name).filter((p) => !/^on[A-Z]/.test(p.name) && /string|"/.test(p.type)
    && (/^(aria|label$|role$)/i.test(p.name) || /accessib|screen reader|aria-/i.test(p.doc)))
  for (const p of props) { const v = typeValues(p.type); if (v) valuesOf.set(`a11y:${p.name}`, v) }
  const exported = props.map((p) => p.name)
  return [...new Set([...exported, ...A11Y_ATTRS])].filter((a) => !own.has(a)).sort()
    .map((a) => ({ key: `a11y:${a}`, label: a, prop: a, default: "", kind: "text" as const }))
}
const collator = new Intl.Collator("tr")
/** Every option of a component: March's (by label), then its HTML attributes (by name). */
const optsOf = (name: string): readonly PlaygroundOption[] => {
  const march = optionsBy()[name]
  return march ? [...[...march, ...apiOptions(name)].sort((a, b) => collator.compare(a.label, b.label)), ...commonOptions(name), ...htmlOptions(name), ...a11yOptions(name)] : []
}
const isHtml = (o: PlaygroundOption): boolean => /^(html|a11y|mp|api):/.test(o.key)
const isA11y = (o: PlaygroundOption): boolean => o.key.startsWith("a11y:")
const options = (): readonly PlaygroundOption[] => optsOf(selected())
// the set of options (the grid is made again when it changes: a component chosen, the root's tag read)
const optionKeys = computed(() => `${selected()}:${options().map((o) => o.key).join(",")}`)
const values = (): Record<string, unknown> => { const v = valuesBy()[selected()] ?? {}; return Object.fromEntries(options().map((o) => [o.key, v[o.key] ?? defaultOf(o)])) }
const setValues = (v: Record<string, unknown>) => valuesBy.set({ ...valuesBy.peek(), [selected.peek()]: { ...v } })
// March's classes: every .m-… class of the page's stylesheets (read once, when a class field first opens)
let marchClasses: string[] | null = null
const classList = (): string[] => {
  if (marchClasses) return marchClasses
  const found = new Set<string>()
  const walk = (list: CSSRuleList): void => {
    for (const r of [...list]) {
      if ("selectorText" in r) for (const m of String((r as CSSStyleRule).selectorText).matchAll(/\.(m-[\w-]+)/g)) found.add(m[1]!)
      if ("cssRules" in r) walk((r as CSSGroupingRule).cssRules)
    }
  }
  for (const sheet of [...document.styleSheets]) {
    let rules: CSSRuleList
    try { rules = sheet.cssRules } catch { continue } // another origin's sheet (fonts)
    walk(rules)
  }
  return (marchClasses = [...found].sort())
}
/** An editable select (`own`) or chips (`multi`, the value written space-separated) over a list of values. */
const comboControl = (list: () => readonly string[], set: ValueSet, label: string, placeholder?: string) => (cp: Record<string, unknown>): unknown => h(Combobox, {
  get value() { const v = String(cp["value"] ?? ""); return set.multi ? v.split(/\s+/).filter(Boolean) : v || null },
  onChange: (v: unknown) => (cp["setValue"] as (v: unknown) => void)(Array.isArray(v) ? v.join(" ") : String(v ?? "")),
  options: list(), multiple: !!set.multi, allowCustom: !!set.own, placeholder: placeholder ?? (set.own ? "seç ya da yaz" : "seç"), "aria-label": label,
})
const classControl = comboControl(classList, { list: [], own: true, multi: true }, "class", "m-… ya da kendi sınıfın")
// data-*: rows of key and value, written as data-key="value"
const dataControl = (cp: Record<string, unknown>): unknown => h(KeyValueEditor, { ...cp, keyPlaceholder: "anahtar", valuePlaceholder: "değer", labels: { key: "anahtar", value: "değer", add: "Ekle" } })
const asProperty = (o: PlaygroundOption): PropertySpec => {
  if (isTri(o)) return { key: o.key, label: o.label, group: MARCH_GROUP, control: (cp: Record<string, unknown>) => h(Toggle, { ...cp, tristate: true }), ...(o.visibleWhen ? { hidden: (v: Record<string, unknown>) => !o.visibleWhen!(v as never) } : {}) } as PropertySpec
  if (isIcon(o)) return { key: o.key, label: o.label, control: (cp: Record<string, unknown>) => IconPicker({ value: () => (cp["value"] as string | null) ?? null, onChange: (n: string | null) => (cp["setValue"] as (v: unknown) => void)(n), label: o.label, packs: iconPickerPacks }), group: MARCH_GROUP, ...(o.visibleWhen ? { hidden: (v: Record<string, unknown>) => !o.visibleWhen!(v as never) } : {}) } as PropertySpec
  if (isHtml(o)) {
    const name = String(o.prop)
    const group = isA11y(o) ? A11Y_GROUP : o.key.startsWith("mp:") ? COMMON_GROUP : o.key.startsWith("api:") ? MARCH_GROUP : HTML_GROUP, label = o.label
    if (o.default === null) return { key: o.key, label, group, type: "number" } as PropertySpec
    if (name === "m:theme") return { key: o.key, label, group, type: "select", options: colorThemes().map((x) => ({ value: x.id, label: x.name })) } as PropertySpec
    if (name === "class") return { key: o.key, label, group, control: classControl } as PropertySpec
    if (name === "data") return { key: o.key, label, group, control: dataControl } as PropertySpec
    const set = valuesOf.get(o.key) ?? ATTR_VALUES[name]
    if (set && (set.own || set.multi)) return { key: o.key, label, group, control: comboControl(() => set.list, set, name) } as PropertySpec
    if (set) return { key: o.key, label, group, type: "select", options: set.list.map((x) => ({ value: x, label: x })) } as PropertySpec
    return { key: o.key, label, group, type: typeof o.default === "boolean" ? "switch" : "text" } as PropertySpec
  }
  const opts = o.options?.map((x) => (typeof x === "object" ? x : { value: x, label: String(x) }))
  const type = typeof o.default === "boolean" ? "switch" : opts ? (opts.length <= 4 ? "segmented" : "select") : typeof o.default === "number" ? (o.min !== undefined && o.max !== undefined ? "slider" : "number") : "text"
  return { key: o.key, label: o.label, type, group: MARCH_GROUP, ...(o.visibleWhen ? { hidden: (v: Record<string, unknown>) => !o.visibleWhen!(v as never) } : {}), ...(opts ? { options: opts } : {}), ...(o.min !== undefined ? { min: o.min } : {}), ...(o.max !== undefined ? { max: o.max } : {}), ...(o.step !== undefined ? { step: o.step } : {}) } as PropertySpec
}
// the preview entry: the exported component, rendered by the preview runtime with the Properties' values. The values
// are not written into the code: they go to the rendered component through a channel (setProps), so changing a
// property needs no build; only a change of the files (or of the exported name) builds again.
// the signals and computed values of the file: exported for the build only (the editor's text stays as it is)
const live = (): string[] => dataItems().filter((d) => d.kind === "signal" || d.kind === "computed").map((d) => d.name)
const withData = (src: string): string => (live().length ? `${src}\nexport const __marchData = { ${live().join(", ")} }\n` : src)
const entrySource = computed(() => {
  const names = [...exportedNames(), ...(live().length ? ["__marchData"] : [])]
  return names.length ? `export { ${names.join(", ")} } from "./${active()}"\n` : "export {}\n"
})
// an option whose card writes its value as code of its own (toCode: Button's spinner "off" → {false}, "own" →
// {<MyDots />}): the code turned into a value the preview can take. null: the prop is left out; a literal: its value;
// an icon's name: the icon (as "icon:name", the runtime takes it); a JSX part of the card's own: a stand-in "•••".
const OMIT = Symbol("omit")
const codeOf = (o: PlaygroundOption, x: unknown, v: Record<string, unknown>): unknown => {
  const map = o.toCode
  return typeof map === "function" ? (map as (x: unknown, v: unknown) => unknown)(x, v) : (map as Record<string, unknown>)[String(x)]
}
function fromCode(o: PlaygroundOption, x: unknown, v: Record<string, unknown>): unknown {
  const code = codeOf(o, x, v)
  if (code === undefined) return x
  if (code === null) return OMIT
  const inner = /^\{([\s\S]*)\}$/.exec(String(code))?.[1]?.trim() ?? String(code)
  if (/^(true|false|null|-?\d+(\.\d+)?|"[^"]*")$/.test(inner)) return JSON.parse(inner)
  if (/^[A-Za-z_$][\w$]*$/.test(inner)) return `icon:${inner}`
  if (inner.startsWith("<")) return "•••"
  return OMIT
}
/** A component's values as its props: the shown options only, empty / off left out; \`changed\`: only what differs from the default. */
function propsOf(opts: readonly PlaygroundOption[], v: Record<string, unknown>, changed = false): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  const defs = Object.fromEntries(opts.map((o) => [o.key, defaultOf(o)]))
  for (const o of opts) {
    const prop = o.prop || o.key
    // several options may write one prop (Button's spinner and its own mark): the one that is shown wins
    if (!changed && !(prop in out)) out[prop] = undefined
    if (o.visibleWhen && !o.visibleWhen(v as never)) continue
    const cur = v[o.key] ?? defaultOf(o)
    // an option hidden at the defaults (Button's own spinner mark) is a change once it shows, even at its default
    if (changed && JSON.stringify(cur) === JSON.stringify(defaultOf(o)) && (!o.visibleWhen || o.visibleWhen(defs as never))) continue
    // an icon given to a prop that is not named so (spinner): "icon:name", which the runtime turns into the icon
    // an icon of a pack ("lucide:arrow-left"): the icon itself (its pack was loaded by the picker that chose it)
    const x = isIcon(o) ? (typeof cur === "string" && cur.includes(":") ? packRef(cur) : typeof cur === "string" && cur && !/icon/i.test(prop) ? `icon:${cur}` : cur) : o.toCode ? fromCode(o, cur, v) : cur
    if (x === undefined) continue
    if (o.key === "html:data") { delete out[prop]; for (const [k, d] of Object.entries(x as Record<string, unknown>)) out[`data-${k}`] = d; continue }
    if (x === OMIT || x === "" || x === null || (x === false && !o.toCode && !isTri(o))) { if (changed && x === false) out[prop] = false; continue }
    out[prop] = x
  }
  return out
}
// a top-level element takes only what was changed in Properties (its written props stay under them)
const propsFor = (r: string): Record<string, unknown> => ({ ...propsOf(optsOf(r), valuesBy()[r] ?? {}, !!rootTag(r)), ...handlerFns(r) })
/** The props of every exported component, by name. */
const rootProps = (): Record<string, Record<string, unknown>> => Object.fromEntries(exportedNames().map((r) => [r, propsFor(r)]))
/** The components under a root of the tree (itself left out). */
const below = (root: string): string[] => { const out = new Set<string>(); const go = (n: DepNode): void => { n.children?.forEach((c) => { out.add(c.label); go(c) }) }; const node = depTree().find((n) => n.label === root); if (node) go(node); out.delete(root); return [...out] }
/** The m:parts of a root: what was changed on the components under it. */
const partsFor = (root: string): Record<string, Record<string, unknown>> => {
  const out: Record<string, Record<string, unknown>> = {}
  for (const name of below(root)) {
    const p = { ...propsOf(optsOf(name), valuesBy()[name] ?? {}, true), ...handlerFns(name) }
    if (Object.keys(p).length) out[name] = p
  }
  return out
}
const partsNow = (): Record<string, Record<string, Record<string, unknown>>> => Object.fromEntries(exportedNames().map((r) => [r, partsFor(r)]))
// the code of what the preview shows, with what was changed: <Button variant="danger" m:parts={{ Spinner: { … } }}>…
const jsxValue = (o: PlaygroundOption | undefined, x: unknown, v: Record<string, unknown>): string => {
  if (o && isIcon(o) && typeof v[o.key] === "string" && String(v[o.key]).includes(":")) return `{icon(${JSON.stringify(v[o.key])})}`
  if (o && isIcon(o) && typeof x === "string") return `{${x.replace(/^icon:/, "")}}`
  if (o?.toCode && !isIcon(o)) { const c = codeOf(o, v[o.key], v); if (typeof c === "string") return c }
  return typeof x === "string" ? JSON.stringify(x) : `{${JSON.stringify(x)}}`
}
const objValue = (o: PlaygroundOption | undefined, x: unknown, v: Record<string, unknown>): string => { const j = jsxValue(o, x, v); return j.startsWith("{") ? j.slice(1, -1) : j }
const usageOf = (name: string): string => {
  const opts = optsOf(name), v = valuesBy()[name] ?? {}
  const changed = propsOf(opts, v, true)
  const byProp = (prop: string) => opts.find((o) => (o.prop || o.key) === prop)
  const attrs = Object.entries(changed).filter(([k]) => k !== "children").map(([k, x]) => (x === true ? k : `${k}=${jsxValue(byProp(k), x, v)}`))
  attrs.push(...handlerCode(name).map(([ev, code]) => `${ev}={${code}}`))
  const parts = Object.entries(partsFor(name)).map(([n, p]) => {
    const po = optsOf(n), pv = valuesBy()[n] ?? {}
    const own = Object.entries(p).filter(([, x]) => typeof x !== "function").map(([k, x]) => `${k}: ${objValue(po.find((o) => (o.prop || o.key) === k), x, pv)}`)
    return `${n}: { ${[...own, ...handlerCode(n).map(([ev, code]) => `${ev}: ${code}`)].join(", ")} }`
  })
  if (parts.length) attrs.push(`m:parts={{ ${parts.join(", ")} }}`)
  const kids = propsFor(name)["children"]
  const tag = (rootTag(name) ?? name).replace(/^<(.*)>$/, "$1")
  const open = [tag, ...attrs].join(" ")
  return kids !== undefined && kids !== "" ? `<${open}>${String(kids)}</${tag}>` : `<${open} />`
}
/** The code of every exported component, one under the other. */
const usage = computed((): string => exportedNames().map(usageOf).join("\n"))
// Accessibility: the accessible name, description, role… of the component chosen (its exported props for them first)
// a grid panel: made again (the old one disposed and removed) whenever the component chosen or its set of options
// changes, so it always shows that component's own values; drawn by hand into its box, one grid at a time
// (in a root of its own: only this panel disposes it, never a re-run of what is around it)
const gridPanel = (make: () => unknown) => () => {
  const inner = <div class="sc-props-in" /> as HTMLElement
  let dispose: (() => void) | null = null, queued = false, gone = false
  // after the change that asked for it has settled (a code edit runs through several updates): built outside them, once
  const rebuild = (): void => { queued = false; if (gone) return; dispose?.(); inner.replaceChildren(); dispose = createRoot(() => mount(make, inner), null) }
  onCleanup(() => { gone = true; dispose?.() })
  return <div class="sc-props">
    {() => { optionKeys(); if (!queued) { queued = true; queueMicrotask(rebuild) } return null }}
    {inner}
  </div>
}
const a11yPanel = gridPanel(() => { const list = options().filter(isA11y); return list.length
  ? <PropertyGrid properties={list.map(asProperty)} value={values()} onChange={setValues} label={`${selected()} erişilebilirliği`} saved={values()} footer={false} history={false} dirty={false} search={false} />
  : <div class="sc-playground-empty"><b>Erişilebilirlik</b><span>Dışa aktarılan bileşen yok</span></div> })
const propsPanel = gridPanel(() => (options().length
  ? <PropertyGrid properties={options().filter((o) => !isA11y(o)).map(asProperty)} value={values()} onChange={setValues} label={`${selected()} özellikleri`} saved={values()} footer={false} history={false} dirty={false} search={false} />
  : <div class="sc-playground-empty"><b>Özellik yok</b><span>{selected() ? `${selected()} prop almıyor` : "Dışa aktarılan bileşen yok"}</span></div>))
// Dependencies: the tree of the components the work is built from; the one chosen shows its Properties
const allIds = (nodes: readonly DepNode[]): string[] => { const ids: string[] = []; const go = (n: DepNode): void => { ids.push(n.id); n.children?.forEach(go) }; nodes.forEach(go); return ids }
// the row chosen (a component may sit at several places of the tree; the first one when chosen elsewhere)
const pickedId = signal("")
const selectedId = (): string | undefined => { const ids = allIds(depTree()); const p = pickedId(); return p && ids.includes(p) && p.split("/").pop() === selected() ? p : ids.find((id) => id.split("/").pop() === selected()) }
const depsPanel = () => <div class="sc-deps">
  {() => (depTree().length
    ? <Tree nodes={depTree()} toggle="chevron" expanded={allIds(depTree())} selected={() => selectedId()} label="Bileşenin parçaları" onSelect={(n: { id: string; label: unknown }) => { pickedId.set(n.id); selected.set(String(n.label)) }} />
    : <div class="sc-playground-empty"><b>Bağımlılık yok</b><span>Dışa aktarılan bileşen yok</span></div>)}
</div>

// Events: the callbacks a component exports (its on… props, from the API reference), each with a handler to try
// it: none, write to the Console, a toast, or a counter. The handler goes to the rendered component with its props
// (no build) and into the code under the preview. A component without callbacks says so.
let indexP: Promise<MarchCatalog> | null = null
const apiIndex = (): Promise<MarchCatalog> => (indexP ??= fetch(appUrl("api/index.tr.json")).then((r) => r.json() as Promise<MarchCatalog>))
const chunks = new Map<number, Promise<Record<string, { props?: ApiProp[] }>>>()
const eventsBy = signal<Record<string, ApiProp[]>>({})
async function loadEvents(name: string): Promise<void> {
  const api = rootTag(name) ?? name
  const idx = await apiIndex() as unknown as { subpaths: { subpath: string; items: [string, string, string, string, number][] }[] }
  let found: { key: string; chunk: number } | null = null
  for (const sp of idx.subpaths) for (const it of sp.items) if (it[0] === api && it[1] === "component" && (!found || sp.subpath === "hadi-march/ui")) found = { key: `${sp.subpath}#${api}`, chunk: it[4] }
  let all: ApiProp[] = []
  if (found) {
    const { key, chunk } = found
    if (!chunks.has(chunk)) chunks.set(chunk, fetch(appUrl(`api/docs-${chunk}.json`)).then((r) => r.json()))
    all = (await chunks.get(chunk)!)[key]?.props ?? []
  }
  apiPropsBy.set({ ...apiPropsBy.peek(), [name]: all })
  eventsBy.set({ ...eventsBy.peek(), [name]: all.filter((p) => /^on[A-Z]/.test(p.name)).sort((a, b) => a.name.localeCompare(b.name)) })
}
effect(() => { for (const name of inTree()) if (!(name in untrack(eventsBy))) void loadEvents(name) })
type Handler = "" | "log" | "toast" | "count"
const HANDLERS: { value: Handler; label: string }[] = [{ value: "", label: "yok" }, { value: "log", label: "konsola yaz" }, { value: "toast", label: "bildirim" }, { value: "count", label: "sayaç" }]
/** The handler chosen for each component's events: { Button: { onChange: "log" } }. */
const handlersBy = signal<Record<string, Record<string, Handler>>>({})
/** How many times each event ran: "IconPicker.onChange" → n. */
const fired = signal<Record<string, number>>({})
const short = (x: unknown): string => { try { const j = JSON.stringify(x); return j === undefined ? String(x) : j.length > 60 ? `${j.slice(0, 57)}…` : j } catch { return String(x) } }
/** Run the handler chosen for an event. */
const handle = (name: string, ev: string, how: Handler) => (...args: unknown[]) => {
  const id = `${name}.${ev}`
  fired.set({ ...fired.peek(), [id]: (fired.peek()[id] ?? 0) + 1 })
  const said = args.map((a) => (a instanceof KeyboardEvent ? a.key : a instanceof Event ? "" : short(a))).filter(Boolean)
  if (how === "log") print(`[${stamp()}] ⚡ ${id}(${said.join(", ")})`, "info")
  else if (how === "toast") toast(`${ev} çalıştı`)
}
const handlerFns = (name: string): Record<string, unknown> => {
  const out: Record<string, unknown> = {}
  for (const [ev, how] of Object.entries(handlersBy()[name] ?? {})) if (how && !ev.startsWith("on:")) out[ev] = handle(name, ev, how)
  return out
}
// HTML events of what the preview draws (its root element): listened to on the preview (capture), so every component
// has them, whatever it passes on to its element
const DOM_EVENTS = ["blur", "click", "contextmenu", "dblclick", "focus", "keydown", "keyup", "pointerenter", "pointerleave"]
const FIELD_EVENTS = ["change", "input"]
const tagEvents = (tag: string): string[] => [...DOM_EVENTS, ...(["input", "textarea", "select"].includes(tag) ? FIELD_EVENTS : []), ...(tag === "form" ? ["submit"] : [])].sort()
const domEvents = (name: string): string[] => { const tag = rootTags()[name] ?? ""; return [...DOM_EVENTS, ...(["input", "textarea", "select"].includes(tag) ? FIELD_EVENTS : []), ...(tag === "form" ? ["submit"] : [])].sort() }
/** The code of the chosen handlers: [event, expression]. */
const handlerCode = (name: string): [string, string][] => Object.entries(handlersBy()[name] ?? {}).filter(([ev, how]) => how && (isRoot(name) || !ev.startsWith("on:"))).map(([ev, how]) =>
  [ev, how === "log" ? `(...a) => console.log("${ev}", ...a)` : how === "toast" ? `() => toast("${ev} çalıştı")` : "() => count++"])
const eventsPanel = () => <div class="sc-events">
  {() => {
    // an HTML element of the tree (<div>): it exports nothing, it has its HTML events
    const name = selected(), tag = /^<([\w-]+)>$/.exec(name)?.[1], local = localComps()[name]
    const list = tag ? [] : local ? local.props.filter((p) => /^on[A-Z]/.test(p.name)) : eventsBy()[name]
    rootTags()
    if (!name) return <div class="sc-playground-empty"><b>Olay yok</b><span>Dışa aktarılan bileşen yok</span></div>
    if (!list) return <div class="sc-playground-empty"><span>Olaylar okunuyor…</span></div>
    const dom = tag ? tagEvents(tag) : isRoot(name) ? domEvents(name) : []
    const row = (ev: string, sub: string) => <li class="sc-events-row">
      <span class="sc-events-name"><code>{ev}</code><small>{sub}</small></span>
      <Badge tone="info">{() => String(fired()[`${name}.${ev}`] ?? 0)}</Badge>
      <Select size="sm" placeholder={false} aria-label={`${ev} işleyicisi`} options={HANDLERS} value={handlersBy()[name]?.[ev] ?? ""}
        onChange={(v: Handler | null) => handlersBy.set({ ...handlersBy.peek(), [name]: { ...handlersBy.peek()[name], [ev]: v ?? "" } })} />
    </li>
    return untrack(() => <div>
      {tag ? null : <h3 class="sc-events-head">Bileşen olayları</h3>}
      {tag ? null : list.length
        ? <ul class="sc-events-list" aria-label={`${name} olayları`}>{list.map((p) => row(p.name, p.doc || p.type))}</ul>
        : <p class="sc-events-none">{name} olay dışa aktarmıyor</p>}
      {dom.length ? <h3 class="sc-events-head">HTML olayları</h3> : null}
      {dom.length ? <ul class="sc-events-list" aria-label={`${name} HTML olayları`}>{dom.map((ev) => row(`on:${ev}`, `<${tag ?? (rootTags()[name] || "öğe")}> üzerinde`))}</ul> : null}
    </div>)
  }}
</div>

/** The current values of the running preview's signals and computed values. */
const liveData = signal<Record<string, unknown>>({})
const json = (v: unknown): string => { try { return JSON.stringify(v) ?? String(v) } catch { return String(v) } }
const parse = (text: string): { ok: true; value: unknown } | { ok: false } => { try { return { ok: true, value: JSON.parse(text) } } catch { return { ok: false } } }
const KIND_TONE: Record<string, "info" | "success" | "neutral" | "warn"> = { signal: "info", computed: "success", const: "neutral", let: "warn" }
/** A constant's new value, written into the code in place of the old one (the preview is built again). */
const writeConst = (d: DataItem, text: string): void => { const f = files.get(active()); if (!f) return; const src = f.peek(); if (src.slice(d.from, d.to) === d.init) f.set(src.slice(0, d.from) + text + src.slice(d.to)) }
const setLive = (name: string, value: unknown): void => { void runtime?.then((r) => r.setData(name, value)); print(`[${stamp()}] ⇢ ${name} = ${short(value)}`, "info") }
const dataRow = (d: DataItem) => {
  let draft = d.kind === "signal" ? json(untrack(liveData)[d.name]) : d.init, more = ""
  const commit = (): void => {
    if (d.kind === "signal") { const p = parse(draft); if (p.ok) setLive(d.name, p.value); else print(`[${stamp()}] ✖ ${d.name}: geçerli bir JSON değil`, "error") }
    else if (draft !== d.init) writeConst(d, draft)
  }
  const push = (): void => { const cur = untrack(liveData)[d.name]; if (!Array.isArray(cur) || !more.trim()) return; const p = parse(more); setLive(d.name, [...cur, p.ok ? p.value : more]); more = "" }
  return <li class="sc-data-row">
    <span class="sc-data-name"><code>{d.name}</code><Badge tone={KIND_TONE[d.kind]} size="xs">{d.kind}</Badge></span>
    {d.kind === "computed"
      ? <code class="sc-data-value">{() => json(liveData()[d.name])}</code>
      : <TextInput aria-label={`${d.name} değeri`} placeholder="Enter ile uygula" value={d.kind === "signal" ? json(liveData()[d.name]) : d.init}
          onChange={(v: string) => { draft = v }} onKeyDown={(e: KeyboardEvent) => { if (e.key === "Enter") commit() }} />}
    {d.kind === "signal" && Array.isArray(untrack(liveData)[d.name])
      ? <span class="sc-data-push"><TextInput aria-label={`${d.name} listesine eklenecek`} placeholder="eklenecek" onChange={(v: string) => { more = v }} onKeyDown={(e: KeyboardEvent) => { if (e.key === "Enter") push() }} />
          <Button size="sm" variant="secondary" on:click={push}>push</Button></span>
      : null}
  </li>
}
const dataPanel = () => <div class="sc-data">
  {() => {
    const list = dataItems()
    liveData()
    return untrack(() => list.length
      ? <ul class="sc-data-list" aria-label="Veriler">{list.map(dataRow)}</ul>
      : <div class="sc-playground-empty"><b>Veri yok</b><span>Kodda sinyal, hesaplanan değer ya da sabit yok</span></div>)
  }}
</div>

// the build: its steps go to the Console (lines written before the Console is there wait for it)
let consoleApi: TerminalApi | null = null
const waiting: [string, Parameters<TerminalApi["print"]>[1]][] = []
type Tone = "success" | "warn" | "error" | "info" | "muted"
const print = (text: string, tone?: Tone) => { if (consoleApi) consoleApi.print(text, { tone }); else waiting.push([text, { tone }]) }
const builder = createBuilder(print)
const stamp = () => new Date().toLocaleTimeString("tr-TR", { hour12: false })
const consolePanel = () => <Terminal readonly scheme="dark" height="100%" label="Derleme çıktısı" class="sc-console"
  ref={(api: TerminalApi) => { consoleApi = api; for (const [t, o] of waiting.splice(0)) api.print(t, o) }} />
// Terminal: the playground's command line (no shell: March is built here in the browser and exported, never
// installed from npm). Its commands work on the component in work (props, events, the preview's language and theme,
// a build, an accessibility check, the size of the build); a line that names no command is JavaScript, run in the
// running preview with the file's signals in scope (count.set(3)), $el (the chosen component's element) and $props.
/** Build the file in front now (its kept result is not used); the steps go to the Console. */
const buildNow = async () => {
  const path = untrack(active)
  let src = untrack(() => forBuild(files.get(path)?.() ?? ""))
  // debugging: the file with the debugger's calls written in (the session starts for it); its line numbers stay
  const dbg = untrack(debugSvc)
  if (dbg && untrack(dbg.active)) {
    try { src = (await dbg.prepare({ [path]: src }))[path] ?? src; print(`[${stamp()}] 🐞 ${path} hata ayıklama için hazırlandı`, "info") }
    catch (e) { print(`[${stamp()}] ✖ Hata ayıklama hazırlanamadı: ${String((e as Error)?.message ?? e)}`, "error") }
  }
  const now = untrack(() => ({ [path]: withData(src), [ENTRY]: entrySource() }))
  const r = await builder.build(now, ENTRY)
  if (r?.ok) await render(r.code)
  return r
}
const previewTheme = signal(""), previewMode = signal<"system" | "light" | "dark">("system")
/** The element the chosen component draws in the preview (an HTML tag of the tree: its first one). */
const chosenEl = (): HTMLElement | null => {
  const name = selected.peek(), tag = /^<([\w-]+)>$/.exec(name)?.[1]
  if (tag) return previewEl?.querySelector<HTMLElement>(`.sc-pv-stage ${tag}`) ?? null
  const cell = previewEl?.querySelector<HTMLElement>(`.sc-pv-cell[data-pv="${name}"] > .sc-pv-stage`) ?? previewEl?.querySelector<HTMLElement>(".sc-pv-stage")
  return (cell?.firstElementChild as HTMLElement | null) ?? null
}
/** The chosen component's options by prop name (the shown one when several write one prop). */
const optionsByProp = (): Map<string, PlaygroundOption> => {
  const v = values(), out = new Map<string, PlaygroundOption>()
  for (const o of options()) { const k = String(o.prop || o.key); if (!out.has(k) || !o.visibleWhen || o.visibleWhen(v as never)) out.set(k, o) }
  return out
}
/** A typed value: true / false / null, a number, JSON; anything else is text. */
const typed = (text: string): unknown => { const p = parse(text); return p.ok ? p.value : text }
const describe = (v: unknown): string => v instanceof Element ? `<${v.tagName.toLowerCase()}${v.id ? `#${v.id}` : ""}${v.classList.length ? `.${[...v.classList].join(".")}` : ""}>` : short(v)
/** Print what a line of JavaScript gave: a value, a tree for an object, a signal's value. */
const show = (v: unknown, io: TerminalIO): void => {
  if (v === undefined) io.print("undefined", { tone: "muted" })
  // a signal or a computed value (an accessor: it has peek): its value, read without following it
  else if (typeof v === "function") io.print("peek" in v ? `${"set" in v ? "sinyal" : "hesaplanan"} → ${short((v as { peek(): unknown }).peek())}` : `ƒ ${v.name || "fonksiyon"}`, { color: 6 })
  else if (v instanceof Element) io.print(describe(v), { color: 4 })
  else if (v && typeof v === "object") io.json(v, 1)
  else io.print(typeof v === "string" ? JSON.stringify(v) : String(v), { color: typeof v === "number" ? 3 : 2 })
}
// the accessibility check: the preview's elements without a name, images without alt, hidden focusable ones,
// repeated ids, a positive tabindex, and text whose contrast is under WCAG AA (4.5, 3 for large text)
const rgb = (c: string): [number, number, number, number] | null => { const m = /rgba?\(([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:[,/ ]+([\d.]+%?))?/.exec(c); if (!m) return null; const a = m[4] ? (m[4].endsWith("%") ? parseFloat(m[4]) / 100 : +m[4]) : 1; return [+m[1]!, +m[2]!, +m[3]!, a] }
const lum = ([r, g, b]: readonly number[]): number => { const f = (x: number) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4 }; return 0.2126 * f(r!) + 0.7152 * f(g!) + 0.0722 * f(b!) }
const bgOf = (el: Element | null): readonly number[] => { for (let n = el; n; n = n.parentElement) { const c = rgb(getComputedStyle(n).backgroundColor); if (c && c[3] > 0.5) return c } return [255, 255, 255] }
const nameOf = (el: Element): string => {
  const by = el.getAttribute("aria-labelledby")
  const label = el.id ? el.ownerDocument.querySelector(`label[for="${CSS.escape(el.id)}"]`) : null
  const own = el.getAttribute("aria-label") || (by ? by.split(/\s+/).map((id) => el.ownerDocument.getElementById(id)?.textContent || "").join(" ") : "")
  const text = el.tagName === "IMG" ? el.getAttribute("alt") || "" : el.textContent || ""
  return (own || text || label?.textContent || el.closest("label")?.textContent || el.getAttribute("title") || "").trim()
}
const FOCUSABLE = "a[href], button, input, select, textarea, [tabindex], [contenteditable=true], [role=button], [role=link], [role=checkbox], [role=switch], [role=tab], [role=menuitem]"
interface Issue { problem: string; element: string }
const audit = (root: HTMLElement): Issue[] => {
  const out: Issue[] = [], add = (problem: string, el: Element) => out.push({ problem, element: describe(el) })
  for (const el of root.querySelectorAll("img:not([alt])")) add("alt yok", el)
  for (const el of root.querySelectorAll(FOCUSABLE)) {
    if (el.closest("[hidden], [inert]") || (el as HTMLInputElement).type === "hidden") continue
    if (!nameOf(el)) add("erişilebilir adı yok", el)
    if (el.closest("[aria-hidden=true]") && !el.hasAttribute("disabled") && el.getAttribute("tabindex") !== "-1") add("aria-hidden içinde odaklanabilir", el)
    if (+(el.getAttribute("tabindex") ?? 0) > 0) add("tabindex > 0 (sırayı bozar)", el)
  }
  const ids = new Map<string, number>()
  for (const el of root.querySelectorAll("[id]")) ids.set(el.id, (ids.get(el.id) ?? 0) + 1)
  for (const [id, n] of ids) if (n > 1) out.push({ problem: `id ${n} kez tekrar ediyor`, element: `#${id}` })
  for (const el of root.querySelectorAll<HTMLElement>("*")) {
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.nodeValue?.trim()) || !el.offsetParent) continue
    const st = getComputedStyle(el), fg = rgb(st.color)
    if (!fg) continue
    const [hi, lo] = [lum(fg), lum(bgOf(el))].sort((x, y) => y - x) as [number, number], ratio = (hi + 0.05) / (lo + 0.05)
    const large = parseFloat(st.fontSize) >= 24 || (parseFloat(st.fontSize) >= 18.66 && +st.fontWeight >= 700)
    if (ratio < (large ? 3 : 4.5)) add(`kontrast ${ratio.toFixed(2)} (en az ${large ? 3 : 4.5})`, el)
  }
  return out
}
const gzipSize = async (text: string): Promise<number> => (await new Response(new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer()).byteLength
const kb = (n: number): string => (n < 1024 ? `${n} B` : `${(n / 1024).toFixed(2)} KB`)
const HANDLER_NAMES: Record<string, Handler> = { log: "log", toast: "toast", count: "count", none: "" }
const EMITTABLE = [...DOM_EVENTS, ...FIELD_EVENTS, "submit"].sort()
const fileNames = (): string[] => [...files.keys()]
const propNames = (): string[] => [...optionsByProp().keys()]
const COMMANDS: Record<string, TerminalCommand> = {
  build: { desc: "Öndeki dosyayı şimdi derle (adımlar Konsol'da)", run: async (_a, io) => {
    const s = io.spinner(`${active()} derleniyor`), r = await buildNow()
    if (r?.ok) s.done(`${active()} derlendi, önizleme çizildi`); else s.fail("Derleme başarısız: ayrıntı Konsol'da")
  } },
  files: { desc: "Dosyalar (öndeki işaretli)", run: (_a, io) => { for (const f of files.keys()) io.print(`${f === active() ? "▸" : " "} ${f}`, f === active() ? { color: 2 } : {}) } },
  open: { desc: "Bir dosyayı öne getir", args: [{ name: "dosya", required: true, get choices() { return fileNames() } }], run: (a, io) => {
    const id = Object.entries(FILE_OF).find(([, f]) => f === a.args["dosya"])?.[0]
    if (id && dock) { dock.open(id); io.success(`${String(a.args["dosya"])} önde`) }
  } },
  select: { desc: "Bağımlılık ağacından bir bileşen seç", args: [{ name: "bileşen", get choices() { return inTree() } }], run: (a, io) => {
    if (a.args["bileşen"]) selected.set(String(a.args["bileşen"]))
    io.print(`Seçili: ${selected()}`, { color: 2 })
  } },
  props: { desc: "Seçili bileşenin özellikleri", options: { changed: { alias: "c", desc: "Yalnız değişenler" } }, run: (a, io) => {
    const v = values(), rows = [...optionsByProp()].map(([prop, o]) => [prop, short(v[o.key] ?? defaultOf(o)), short(defaultOf(o))])
      .filter((r) => !a.options["changed"] || r[1] !== r[2])
    if (rows.length) io.table(rows, ["özellik", "değer", "varsayılan"]); else io.print(a.options["changed"] ? "Değişen özellik yok" : `${selected()} özellik almıyor`, { tone: "muted" })
  } },
  set: { desc: "Özellik ver: set variant danger · set disabled true · set label \"Kaydet\"", args: [{ name: "özellik", required: true, get choices() { return propNames() } }, { name: "değer", rest: true }], run: (a, io) => {
    const o = optionsByProp().get(String(a.args["özellik"]))!, raw = String(a.args["değer"] ?? "")
    const x = o.key === "html:data" || typeof o.default !== "string" ? typed(raw) : raw === "null" ? null : raw
    setValues({ ...values(), [o.key]: x })
    io.success(`${String(a.args["özellik"])} = ${short(x)}`)
  } },
  reset: { desc: "Özellikleri (ya da birini) varsayılana döndür", args: [{ name: "özellik", get choices() { return propNames() } }], run: (a, io) => {
    const one = a.args["özellik"] ? optionsByProp().get(String(a.args["özellik"])) : null
    setValues(one ? { ...values(), [one.key]: defaultOf(one) } : Object.fromEntries(options().map((o) => [o.key, defaultOf(o)])))
    io.success(one ? `${String(a.args["özellik"])} varsayılanda` : `${selected()}: tüm özellikler varsayılanda`)
  } },
  on: { desc: "Bir olaya işleyici bağla: on onClick log · on on:click toast · on onChange none", args: [
    { name: "olay", required: true, get choices() { const n = selected(); return [...(localComps()[n]?.props.filter((p) => /^on[A-Z]/.test(p.name)) ?? eventsBy()[n] ?? []).map((p) => p.name), ...(n.startsWith("<") ? tagEvents(n.slice(1, -1)) : isRoot(n) ? domEvents(n) : []).map((e) => `on:${e}`)] } },
    { name: "işleyici", required: true, choices: Object.keys(HANDLER_NAMES) }], run: (a, io) => {
    const n = selected.peek(), ev = String(a.args["olay"])
    handlersBy.set({ ...handlersBy.peek(), [n]: { ...handlersBy.peek()[n], [ev]: HANDLER_NAMES[String(a.args["işleyici"])]! } })
    io.success(`${n}.${ev} → ${String(a.args["işleyici"])}`)
  } },
  emit: { desc: "Seçili bileşenin öğesinde bir HTML olayı çalıştır: emit click · emit keydown --key=Enter", args: [{ name: "olay", required: true, choices: EMITTABLE }], options: { key: { type: "string", desc: "Klavye olayının tuşu" } }, run: (a, io) => {
    const el = chosenEl(), type = String(a.args["olay"])
    if (!el) { io.error("Önizlemede seçili bileşenin öğesi yok"); return }
    if (type === "click") el.click()
    else if (type === "focus") el.focus()
    else if (type === "blur") el.blur()
    else el.dispatchEvent(type.startsWith("key") ? new KeyboardEvent(type, { key: String(a.options["key"] ?? "Enter"), bubbles: true }) : type.startsWith("pointer") ? new PointerEvent(type) : new Event(type, { bubbles: true, cancelable: true }))
    io.success(`${type} → ${describe(el)}`)
  } },
  data: { desc: "Dosyanın sinyalleri, hesaplanan değerleri ve sabitleri", run: (_a, io) => {
    const list = dataItems()
    if (!list.length) { io.print("Kodda sinyal, hesaplanan değer ya da sabit yok", { tone: "muted" }); return }
    io.table(list.map((d) => [d.name, d.kind, d.kind === "signal" || d.kind === "computed" ? short(liveData()[d.name]) : d.init]), ["ad", "tür", "değer"])
    io.print("Değiştirmek için JavaScript: ad.set(değer) · listeye ekle: ad.set([...ad(), x])", { tone: "muted" })
  } },
  code: { desc: "Önizlemedeki bileşenin kodu", run: (_a, io) => { if (usage()) io.print(usage(), { color: 6 }); else io.print("Dışa aktarılan bileşen yok", { tone: "muted" }) } },
  copy: { desc: "Bileşenin kodunu panoya kopyala", run: async (_a, io) => { await navigator.clipboard.writeText(usage()); io.success("Kod panoda") } },
  download: { desc: "Bir dosyayı indir (varsayılan: öndeki)", args: [{ name: "dosya", get choices() { return fileNames() } }], run: (a, io) => {
    const path = String(a.args["dosya"] ?? active()), url = URL.createObjectURL(new Blob([files.get(path)?.() ?? ""], { type: "text/plain" }))
    const link = document.createElement("a")
    link.href = url; link.download = path; link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    io.success(`${path} indirildi`)
  } },
  size: { desc: "Son derlemenin boyutu (March'ın kendisi hariç)", run: async (_a, io) => {
    if (!lastCode) { io.warn("Henüz derleme yok"); return }
    io.table([[active(), kb(new Blob([lastCode]).size), kb(await gzipSize(lastCode))]], ["dosya", "ham", "gzip"])
  } },
  a11y: { desc: "Önizlemenin erişilebilirlik denetimi (ad, alt, odak, id, kontrast)", run: (_a, io) => {
    if (!previewEl) { io.error("Önizleme yok"); return }
    const found = audit(previewEl)
    if (found.length) { io.warn(`${found.length} sorun`); io.table(found.map((f) => [f.problem, f.element]), ["sorun", "öğe"]) } else io.success("Sorun bulunmadı")
  } },
  lang: { desc: "Diller: lang · lang use en · lang add de · lang rm de", run: (_a, io) => {
    for (const l of languageList()) io.print(`${l.value === previewLang() ? "▸" : " "} ${l.label}`, l.value === previewLang() ? { color: 2 } : {})
  }, sub: {
    use: { desc: "Önizlemenin dili", args: [{ name: "dil", required: true, get choices() { return ["default", ...Object.keys(langs())] } }], run: (a, io) => { const c = String(a.args["dil"]); previewLang.set(c === "default" ? "" : c); io.success(`Önizleme: ${c === "default" ? "Varsayılan" : langName(c)}`) } },
    add: { desc: "Dil ekle (gösterilen dil kopyalanır)", args: [{ name: "dil", required: true }], run: (a, io) => { const c = String(a.args["dil"]).toLowerCase(); if (!LANG_CODE.test(c)) { io.error("Dil kodu: tr, en, de, pt-br gibi"); return } addLang(c) } },
    rm: { desc: "Eklenen bir dili sil", args: [{ name: "dil", required: true, get choices() { return Object.keys(langs()) } }], run: (a) => removeLang(String(a.args["dil"])) },
  } },
  theme: { desc: "Önizlemenin teması: theme · theme page · theme <ad>", args: [{ name: "tema", get choices() { return ["page", ...colorThemes().map((x) => x.id)] } }], run: (a, io) => {
    const t = a.args["tema"]
    if (t) previewTheme.set(t === "page" ? "" : String(t))
    io.print(`Tema: ${previewTheme() ? colorThemes().find((x) => x.id === previewTheme())?.name ?? previewTheme() : "Sayfa teması"}`, { color: 2 })
  } },
  mode: { desc: "Önizlemenin aydınlık / karanlık modu", args: [{ name: "mod", choices: ["system", "light", "dark"] }], run: (a, io) => {
    if (a.args["mod"]) previewMode.set(a.args["mod"] as "system" | "light" | "dark")
    io.print(`Mod: ${previewMode()}`, { color: 2 })
  } },
}
/** A line that names no command: JavaScript, run in the preview. */
const evalLine = async (line: string, io: TerminalIO): Promise<void> => {
  if (!runtime || !previewEl) { io.error("Önizleme henüz çizilmedi"); return }
  const r = await runtime
  // stopped in the debugger: the names in scope at that step come first (their values then)
  const dbg = debugSvc.peek(), at = dbg && dbg.session.state() === "paused" ? dbg.session.scope() : null
  if (at) io.print(`🐞 ${dbg!.session.shown()?.fn ?? ""} kapsamında`, { tone: "muted" })
  show(await r.evaluate(line, { $el: chosenEl(), $preview: previewEl, $props: propsFor(selected.peek()), toast, ...at }), io)
}
// switched to (its tab pressed, or opened from the palette): the input takes the focus, so typing starts at once; not
// when the page opens with it in front (the focus stays where it is)
let termApi: TerminalApi | null = null
const focusTerminal = (): void => { const at = document.activeElement; if (at && at !== document.body) termApi?.focus() }
const terminalPanel = () => <Terminal ref={(api: TerminalApi) => { termApi = api }} scheme="dark" height="100%" prompt="› " persist="sc.playground" label="Playground terminali" class="sc-console"
  commands={COMMANDS} fallback={evalLine} labels={{ command: "Komut ya da JavaScript" }}
  welcome={["[info] help: komutlar · Tab: tamamla · ↑ ↓: geçmiş", "[info] Komut olmayan satır JavaScript olarak önizlemede çalışır: count.set(3), $el, $props"]} />
// lang.json: the texts the last build found (JSX text, titles, labels…), as a locale file lists them
// lang.json: the default language is the code's own texts (each key is its own text); a language added with + starts
// as a copy of it under its code and is translated here; the preview's language tool lists them all
const langJson = () => Object.fromEntries(builder.texts().map((k) => [k, k]))
const LANGS_KEY = "sc.playground.langs"
const readLangs = (): Record<string, Record<string, string>> => { try { return JSON.parse(localStorage.getItem(LANGS_KEY) ?? "{}") as Record<string, Record<string, string>> } catch { return {} } }
const langs = signal<Record<string, Record<string, string>>>(readLangs())
const saveLangs = (v: Record<string, Record<string, string>>): void => { langs.set(v); try { localStorage.setItem(LANGS_KEY, JSON.stringify(v)) } catch { /* private mode */ } }
/** A language's file: every key of the code, its own translations kept (a new text starts as itself). */
const langFile = (code: string): Record<string, string> => { const own = langs()[code] ?? {}; return Object.fromEntries(Object.entries(langJson()).map(([k, v]) => [k, own[k] ?? v])) }
const langShown = signal("")
const previewLang = signal("")
/** A language's name in itself ("English", "Türkçe"); the code when the browser does not know it. */
const langName = (code: string): string => { try { const n = new Intl.DisplayNames([code], { type: "language" }).of(code); return n && n !== code ? n.charAt(0).toLocaleUpperCase(code) + n.slice(1) : code } catch { return code } }
const languageList = () => [{ value: "", label: "Varsayılan" }, ...Object.keys(langs()).sort().map((c) => ({ value: c, label: `${langName(c)}: ${c}` }))]
let addCode = ""
const LANG_CODE = /^[a-z]{2,3}(-[a-z0-9]{2,8})*$/
const addLang = (given = addCode): void => {
  const code = given.trim().toLowerCase()
  if (!LANG_CODE.test(code)) { toast("Dil kodu: tr, en, de, pt-br gibi"); return }
  if (langs()[code]) { langShown.set(code); return }
  saveLangs({ ...langs(), [code]: langFile(langShown()) })
  langShown.set(code)
  print(`[${stamp()}] + ${langName(code)}: ${code} eklendi (kopyalanan: ${langShown() ? langShown() : "Varsayılan"})`, "success")
}
/** Remove an added language (the default stays); the preview falls back to the default when it showed it. */
const removeLang = (code: string): void => {
  const { [code]: _gone, ...rest } = langs()
  saveLangs(rest)
  if (langShown() === code) langShown.set("")
  if (previewLang() === code) previewLang.set("")
  print(`[${stamp()}] − ${code}.json silindi`, "warn")
}
// the note over the languages: what lang.json is and how to try it (closed once, kept closed)
const LANG_NOTE_KEY = "sc.playground.langNote"
const langNote = signal((() => { try { return localStorage.getItem(LANG_NOTE_KEY) !== "off" } catch { return true } })())
const closeLangNote = (): void => { langNote.set(false); try { localStorage.setItem(LANG_NOTE_KEY, "off") } catch { /* private mode */ } }
const langPanel = () => <div class="sc-lang">
  {() => (langNote() ? <Alert tone="info" class="sc-lang-note" dismissable onDismiss={closeLangNote} dismissLabel="Bilgiyi kapat">
    March, koddaki bütün metinleri kendisi bulur ve dil dosyasına çıkarır. Yeni bir dil eklemek için <b>+</b> düğmesine basın; çeviriyi denemek için önizlemedeki dil kutusundan dili değiştirin.
  </Alert> : null)}
  <div class="sc-lang-bar">
    <div class="sc-lang-tabs" role="tablist" aria-label="Diller">
      {() => languageList().map((l) => <span class="sc-lang-tab" aria-current={() => (langShown() === l.value ? "true" : null)}>
        <button type="button" role="tab" class="sc-lang-tab-name" aria-selected={() => String(langShown() === l.value)} on:click={() => langShown.set(l.value)}>{l.label}</button>
        {l.value ? <IconButton class="sc-lang-tab-x" size="xs" icon={xIcon} label={`${l.label} dilini sil`} on:click={() => removeLang(l.value)} /> : null}
      </span>)}
    </div>
    <Dropdown icon={plus} label="Dil ekle" size="sm" variant="ghost" placement="bottom-end" panelClass="sc-lang-new">
      {(close: () => void) => <div class="sc-lang-new-body">
        <span class="sc-lang-new-hint">{() => `${langShown() ? `${langName(langShown())}: ${langShown()}` : "Varsayılan"} kopyalanır`}</span>
        <div class="sc-lang-new-row">
          <TextInput aria-label="Yeni dilin kodu" placeholder="tr, en, de…" onChange={(v: string) => { addCode = v }} onKeyDown={(e: KeyboardEvent) => { if (e.key === "Enter") { addLang(); close() } }} />
          <Button size="sm" variant="primary" on:click={() => { addLang(); close() }}>Ekle</Button>
        </div>
      </div>}
    </Dropdown>
  </div>
  {() => { const code = langShown(); return untrack(() => (code
    ? <JsonEditor value={langFile(code)} onChange={(v: unknown) => { if (v && typeof v === "object") saveLangs({ ...langs(), [code]: v as Record<string, string> }) }} aria-label={`${code}.json`} />
    : <JsonView value={langJson} open={2} label="Varsayılan metinler" />)) }}
</div>

// the preview (AppPreview): its toolbar sets the preview's own theme, accent and light / dark; each successful build's
// PreviewControl is rendered in the middle of its stage by the preview runtime (playground/preview.js, loaded once)
let previewEl: HTMLElement | null = null
type Parts = Record<string, Record<string, unknown>>
type Runtime = { untrack<T>(fn: () => T): T; evaluate(line: string, scope?: Record<string, unknown>): Promise<unknown>; run(code: string, el: HTMLElement, props?: Record<string, Record<string, unknown>>, parts?: Record<string, Parts>): Promise<string[]>; setProps(props: Record<string, Record<string, unknown>>, parts?: Record<string, Parts>): void; stop(): void; onData(cb: (values: Record<string, unknown>) => void): void; setData(name: string, value: unknown): void; setLanguage(dict: Record<string, string> | null): void }
let runtime: Promise<Runtime> | null = null, runtimeNow: Runtime | null = null
const loadRuntime = () => (runtime ??= (async () => {
  // its components' stylesheet, once
  const link = document.createElement("link")
  link.rel = "stylesheet"; link.href = appUrl("playground/preview.css")
  document.head.append(link)
  const r = await import(/* @vite-ignore */ appUrl("playground/preview.js")) as Runtime
  r.onData((values) => liveData.set(values))
  runtimeNow = r
  return r
})())
/** Each cell's first element: the tag its component draws. */
const readTag = (): void => {
  const out: Record<string, string> = {}
  for (const cell of previewEl?.querySelectorAll<HTMLElement>(".sc-pv-cell") ?? []) out[cell.dataset["pv"] ?? ""] = cell.querySelector(".sc-pv-stage")?.firstElementChild?.tagName.toLowerCase() ?? ""
  if (JSON.stringify(out) !== JSON.stringify(untrack(rootTags))) rootTags.set(out)
}
/** The code of the last build the preview drew (the Terminal's size reads it). */
let lastCode = ""
// a build that came before the preview's box (coming back to the page: the kept result is there at once, the panels
// later): drawn when the box is there
let pendingCode = ""
const previewReady = (el: HTMLElement): void => {
  previewEl = el
  const code = pendingCode
  pendingCode = ""
  if (code) queueMicrotask(() => void render(code))
}
async function render(code: string): Promise<void> {
  if (!previewEl) { pendingCode = code; return }
  lastCode = code
  const t0 = performance.now()
  try {
    await (await loadRuntime()).run(code, previewEl, untrack(rootProps), untrack(partsNow))
    readTag()
    print(`[${stamp()}] Önizleme çizildi · ${Math.round(performance.now() - t0)} ms`, "success")
  } catch (e) {
    print(`[${stamp()}] ✖ Çalışma hatası: ${String((e as Error)?.message ?? e)}`, "error")
  }
}
const preview = () => <AppPreview toolbar={{ theme: true, accent: true, mode: true, language: true }} theme={previewTheme} mode={previewMode} language={previewLang} languages={languageList}
  footer={() => (usage() ? <CodeView code={usage} lang="tsx" copy wrap label="Bileşenin kodu" /> : null)}>
  <div class="sc-pv-root" m:no-select ref={previewReady}>
    <div class="sc-playground-empty"><b>Önizleme</b><span>Derleniyor…</span></div>
  </div>
</AppPreview>

const PANELS: AppPanel[] = [
  { id: "preview", title: "Önizleme", icon: monitor, content: preview },
  { id: "props", title: "Özellikler", icon: sliders, disabled: () => !options().length, content: propsPanel },
  { id: "events", title: "Olaylar", icon: zap, content: eventsPanel },
  { id: "data", title: "Veriler", icon: database, disabled: () => !dataItems().length, content: dataPanel },
  { id: "deps", title: "Bağımlılıklar", icon: packageBox, disabled: () => !depTree().length, content: depsPanel },
  { id: "a11y", title: "Erişilebilirlik", icon: users, content: a11yPanel },
  fileTab("c1", "Button.tsx"),
  fileTab("c2", "Component2.tsx"),
  fileTab("c3", "Component3.tsx"),
  { id: "console", title: "Konsol", icon: code, content: consolePanel },
  { id: "terminal", title: "Terminal", icon: terminal, content: terminalPanel, onShow: focusTerminal },
  { id: "i18n", title: "lang.json", icon: globe, content: langPanel },
]
const PRESETS: Record<string, Preset> = {
  main: {
    title: "Playground",
    tree: () => row(
      [0.6, col([0.7, tabs("preview")], [0.3, row([0.5, tabs(["props", "events", "data"])], [0.5, tabs(["deps", "a11y"])])])],
      [0.4, col([0.7, tabs(["c1", "c2", "c3"])], [0.3, tabs(["console", "debug", "terminal", "i18n"])])],
    ),
  },
}
// March's exports for the suggestions: the API reference's index (one JSON file, fetched when the playground opens)
const catalog = (): Promise<MarchCatalog> => apiIndex()
// the TypeScript language service in a worker (the build copies it, the compiler and the lib files to playground/)
// TypeScript reads the file as it is built (its top-level elements as exports): no "one parent element" error for them
const typescript = typeScriptPlugin({ worker: appUrl("playground/ts-worker.js"), typescript: appUrl("playground/ts/typescript.js"), lib: appUrl("playground/ts/"),
  view: (path, text) => viewRoots(text, /\.tsx?$/.test(path)) })
// the debugger (march-app-ui): the panel, the editor's gutter (click a line number: a breakpoint) and F5 / F8 / F10 / F11;
// while it is on, every build writes its calls into the file (buildNow); watches, conditions and the Terminal evaluate in
// the preview runtime (its March, its untrack)
const debugSvc = signal<DebuggerService | null>(null)
const debugTab = (file: string): void => { const id = Object.entries(FILE_OF).find(([, f]) => f === file)?.[0]; if (id && dock) dock.open(id) }
const debug = debuggerPlugin({
  persist: "sc.playground.debug",
  run: () => scheduleBuild(0),
  reveal: (file) => debugTab(file),
  evaluate: async (expr, scope) => (await loadRuntime()).evaluate(expr, scope),
  untrack: (fn) => (runtimeNow ? runtimeNow.untrack(fn) : fn()),
})
const PLUGINS = [typescript, debug, codeEditorPlugin({ save: (f) => { print(`[${stamp()}] 💾 ${f.path} kaydedildi, derleniyor`, "success"); scheduleBuild(0) } }), marchLanguagePlugin({ catalog })]

// the next build (one at a time: a newer request replaces a waiting one)
let timer: ReturnType<typeof setTimeout> | undefined
const scheduleBuild = (ms: number): void => { clearTimeout(timer); timer = setTimeout(() => { void buildNow() }, ms) }

export default function PlaygroundPage(props: { name?: string }) {
  // every change is built a moment after typing stops
  effect(() => {
    // only the file in front (and the entry that renders it)
    const path = active()
    const now = { [path]: withData(forBuild(files.get(path)?.() ?? "")), [ENTRY]: entrySource() }
    clearTimeout(timer)
    // debugging: every build writes the debugger's calls in (buildNow), nothing kept is used
    if (debugSvc()?.active()) { scheduleBuild(350); return }
    // built before with this very code (a tab shown again): the kept result, at once
    const kept = builder.cached(now, ENTRY)
    if (kept) { print(`[${stamp()}] ↺ ${path}: bu kod daha önce derlendi, bellekteki sonuç kullanılıyor`, "muted"); void render(kept.code); return }
    scheduleBuild(350)
  })
  // the preview's language: its file, or the code's own texts
  effect(() => { const code = previewLang(), file = code ? langFile(code) : null; void runtime?.then((r) => r.setLanguage(file)) })
  // a property changes: the rendered component takes it at once (no build)
  effect(() => { const p = rootProps(), parts = partsNow(); void runtime?.then((r) => { r.setProps(p, parts); readTag() }) })
  // HTML events chosen in Events: listened to on the preview, for the element each exported component draws
  effect(() => {
    // what is chosen is read first (so the effect follows it even before the preview is there)
    const tags = inTree().filter((n) => n.startsWith("<"))
    const chosen = [...exportedNames(), ...tags].flatMap((name) => Object.entries(handlersBy()[name] ?? {}).filter(([ev, how]) => how && ev.startsWith("on:")).map(([ev, how]) => [name, ev, how] as const))
    rootTags()
    const el = previewEl
    if (!el) return
    const offs = chosen.map(([name, ev, how]) => {
      const type = ev.slice(3), run = handle(name, ev, how as Handler), tag = /^<([\w-]+)>$/.exec(name)?.[1]
      const fn = (e: Event) => {
        const target = e.target as Element
        if (tag) { const hit = target.closest?.(tag); if (hit && el.contains(hit) && (!["pointerenter", "pointerleave"].includes(type) || hit === target)) run(e); return }
        const root = el.querySelector(`.sc-pv-cell[data-pv="${name}"] > .sc-pv-stage`)?.firstElementChild
        if (root && (e.target === root || (!["pointerenter", "pointerleave"].includes(type) && root.contains(e.target as Node)))) run(e)
      }
      el.addEventListener(type, fn, true)
      return () => el.removeEventListener(type, fn, true)
    })
    onCleanup(() => offs.forEach((off) => off()))
  })
  onCleanup(() => { clearTimeout(timer); consoleApi = null; previewEl = null; void runtime?.then((r) => r.stop()) })
  return <div class="sc-playground">
    <AppUI title={props.name ?? "Test Bileşen"} tools={<PaletteButton label="Komut ara…" class="sc-playground-pal" />}
      panels={PANELS} presets={PRESETS} plugins={PLUGINS} commands="playground" persist="sc.playground.v5" label="Playground" api={followTabs}
      kit={(k: AppKit) => debugSvc.set(k.service<DebuggerService>("debugger") ?? null)} />
  </div>
}
