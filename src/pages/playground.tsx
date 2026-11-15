// Playground: the workspace of a component's page on march-app-ui (AppUI). The top bar: the component's name on the
// left, the command palette and the Layout button on the right. Preview over Properties and Dependencies /
// Accessibility on the left; the component's files over Console / Debugger / Terminal / lang.json on the right. The
// .tsx tabs are files: the code editor plugin opens them, the March language plugin suggests March's exports. Button.tsx exports
// the component under work; Properties shows its options, and the build renders it with them (PreviewControl.tsx). Every
// change is built in the page (playground/build.ts): the Console shows each step with its time and the errors,
// lang.json the texts the build found. No tab has a close mark (groups still collapse to strips).
import "./playground.css";
import { h, signal, computed, effect, untrack, onCleanup } from "hadi-march";
import { registry } from "hadi-march/components/registry.gen.ts";
import type { PlaygroundOption } from "hadi-march/components/meta.ts";
import { appUrl } from "hadi-march/base";
import { PaletteButton, JsonView, Terminal, PropertyGrid, IconPicker, Combobox, Toggle, Select, Badge, toast, colorThemes, Tree, CodeView, type TerminalApi, type PropertySpec } from "hadi-march/ui";
import { AppUI, AppPreview, codeEditorPlugin, marchLanguagePlugin, typeScriptPlugin, groups, type DockApi, row, col, tabs, type AppPanel, type Preset, type MarchCatalog } from "hadi-march/app-ui";
import { zap, monitor, sliders, packageBox, users, code, terminal, bug, fileText, globe } from "hadi-march/icons";
import { KeyValueEditor } from "hadi-march/forms"
import { COLOR_TOKENS } from "hadi-march/theme"
import { createBuilder } from "../playground/build.ts";

const empty = (name: string) => () => <div class="sc-playground-empty"><b>{name}</b><span>Boş panel</span></div>
const panel = (id: string, title: string, icon: unknown): AppPanel => ({ id, title, icon, content: empty(title) })

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
const followTabs = (api: DockApi) => {

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
const exportedNames = computed((): string[] => {
  const src = files.get(active())?.() ?? "", out: string[] = []
  for (const m of src.matchAll(/export\s*\{([^}]*)\}/g)) for (const part of (m[1] ?? "").split(",")) { const n = part.trim().replace(/^type\s+/, "").split(/\s+as\s+/).pop()?.trim(); if (n) out.push(n) }
  for (const m of src.matchAll(/export\s+(?:async\s+)?(?:function\*?|const|let|class)\s+([A-Za-z_$][\w$]*)/g)) out.push(m[1]!)
  return [...new Set(out)].filter((n) => /^[A-Z]/.test(n))
}, { equals: (a, b) => !!a && !!b && a.join() === b.join() })
const isRoot = (name: string): boolean => exportedNames().includes(name)
// the components of the work: the exported one and, in the Dependencies tree, the ones it is built from (their
// composedOf, recursively). Each has its options (its showcase card's playground.ts) and its values; the exported one
// takes its values as props, the others as m:parts of it (only what was changed from their defaults)
const metaOf = (name: string) => registry.find((e) => e.meta.name === name)
interface DepNode { id: string; label: string; children?: DepNode[] }
const depTree = computed((): DepNode[] => {
  const roots = exportedNames()
  if (!roots.length) return []
  const walk = (name: string, path: string, seen: Set<string>): DepNode => {
    const kids = seen.has(name) ? [] : (metaOf(name)?.meta.composedOf ?? []).filter((k) => metaOf(k))
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
    if (!entry) continue
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
  for (const p of apiPropsBy()[name] ?? []) {
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
  const props = (apiPropsBy()[name] ?? []).filter((p) => !/^on[A-Z]/.test(p.name) && /string|"/.test(p.type)
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
  if (isIcon(o)) return { key: o.key, label: o.label, control: (cp: Record<string, unknown>) => IconPicker({ value: () => (cp["value"] as string | null) ?? null, onChange: (n: string | null) => (cp["setValue"] as (v: unknown) => void)(n), label: o.label }), group: MARCH_GROUP, ...(o.visibleWhen ? { hidden: (v: Record<string, unknown>) => !o.visibleWhen!(v as never) } : {}) } as PropertySpec
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
const entrySource = computed(() => {
  const names = exportedNames()
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
    const x = isIcon(o) ? (typeof cur === "string" && cur && !/icon/i.test(prop) ? `icon:${cur}` : cur) : o.toCode ? fromCode(o, cur, v) : cur
    if (x === undefined) continue
    if (o.key === "html:data") { delete out[prop]; for (const [k, d] of Object.entries(x as Record<string, unknown>)) out[`data-${k}`] = d; continue }
    if (x === OMIT || x === "" || x === null || (x === false && !o.toCode && !isTri(o))) { if (changed && x === false) out[prop] = false; continue }
    out[prop] = x
  }
  return out
}
const propsFor = (r: string): Record<string, unknown> => ({ ...propsOf(optsOf(r), valuesBy()[r] ?? {}), ...handlerFns(r) })
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
  const open = [name, ...attrs].join(" ")
  return kids !== undefined && kids !== "" ? `<${open}>${String(kids)}</${name}>` : `<${open} />`
}
/** The code of every exported component, one under the other. */
const usage = computed((): string => exportedNames().map(usageOf).join("\n"))
// Accessibility: the accessible name, description, role… of the component chosen (its exported props for them first)
const a11yPanel = () => <div class="sc-props">
  {() => { optionKeys(); return untrack(() => { const list = options().filter(isA11y); return list.length
    ? <PropertyGrid properties={list.map(asProperty)} value={values()} onChange={setValues} label={`${selected()} erişilebilirliği`} saved={values()} footer={false} history={false} dirty={false} search={false} />
    : <div class="sc-playground-empty"><b>Erişilebilirlik</b><span>Dışa aktarılan bileşen yok</span></div> }) }}
</div>
// made again for each component chosen in the Dependencies tree (its own values, not the last one's)
const propsPanel = () => <div class="sc-props">
  {() => { optionKeys(); return untrack(() => options().length
    ? <PropertyGrid properties={options().filter((o) => !isA11y(o)).map(asProperty)} value={values()} onChange={setValues} label={`${selected()} özellikleri`} saved={values()} footer={false} history={false} dirty={false} search={false} />
    : <div class="sc-playground-empty"><b>Özellik yok</b><span>{selected() ? `${selected()} prop almıyor` : "Dışa aktarılan bileşen yok"}</span></div>) }}
</div>
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
  const idx = await apiIndex() as unknown as { subpaths: { subpath: string; items: [string, string, string, string, number][] }[] }
  let found: { key: string; chunk: number } | null = null
  for (const sp of idx.subpaths) for (const it of sp.items) if (it[0] === name && it[1] === "component" && (!found || sp.subpath === "hadi-march/ui")) found = { key: `${sp.subpath}#${name}`, chunk: it[4] }
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
const domEvents = (name: string): string[] => { const tag = rootTags()[name] ?? ""; return [...DOM_EVENTS, ...(["input", "textarea", "select"].includes(tag) ? FIELD_EVENTS : []), ...(tag === "form" ? ["submit"] : [])].sort() }
/** The code of the chosen handlers: [event, expression]. */
const handlerCode = (name: string): [string, string][] => Object.entries(handlersBy()[name] ?? {}).filter(([ev, how]) => how && (isRoot(name) || !ev.startsWith("on:"))).map(([ev, how]) =>
  [ev, how === "log" ? `(...a) => console.log("${ev}", ...a)` : how === "toast" ? `() => toast("${ev} çalıştı")` : "() => count++"])
const eventsPanel = () => <div class="sc-events">
  {() => {
    const name = selected(), list = eventsBy()[name]
    rootTags()
    if (!name) return <div class="sc-playground-empty"><b>Olay yok</b><span>Dışa aktarılan bileşen yok</span></div>
    if (!list) return <div class="sc-playground-empty"><span>Olaylar okunuyor…</span></div>
    const dom = isRoot(name) ? domEvents(name) : []
    const row = (ev: string, sub: string) => <li class="sc-events-row">
      <span class="sc-events-name"><code>{ev}</code><small>{sub}</small></span>
      <Badge tone="info">{() => String(fired()[`${name}.${ev}`] ?? 0)}</Badge>
      <Select size="sm" placeholder={false} aria-label={`${ev} işleyicisi`} options={HANDLERS} value={handlersBy()[name]?.[ev] ?? ""}
        onChange={(v: Handler | null) => handlersBy.set({ ...handlersBy.peek(), [name]: { ...handlersBy.peek()[name], [ev]: v ?? "" } })} />
    </li>
    return untrack(() => <div>
      <h3 class="sc-events-head">Bileşen olayları</h3>
      {list.length
        ? <ul class="sc-events-list" aria-label={`${name} olayları`}>{list.map((p) => row(p.name, p.doc || p.type))}</ul>
        : <p class="sc-events-none">{name} olay dışa aktarmıyor</p>}
      {dom.length ? <h3 class="sc-events-head">HTML olayları</h3> : null}
      {dom.length ? <ul class="sc-events-list" aria-label={`${name} HTML olayları`}>{dom.map((ev) => row(`on:${ev}`, `<${rootTags()[name] || "öğe"}> üzerinde`))}</ul> : null}
    </div>)
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
// lang.json: the texts the last build found (JSX text, titles, labels…), as a locale file lists them
const langJson = () => Object.fromEntries(builder.texts().map((k) => [k, ""]))

// the preview (AppPreview): its toolbar sets the preview's own theme, accent and light / dark; each successful build's
// PreviewControl is rendered in the middle of its stage by the preview runtime (playground/preview.js, loaded once)
let previewEl: HTMLElement | null = null
type Parts = Record<string, Record<string, unknown>>
type Runtime = { run(code: string, el: HTMLElement, props?: Record<string, Record<string, unknown>>, parts?: Record<string, Parts>): Promise<string[]>; setProps(props: Record<string, Record<string, unknown>>, parts?: Record<string, Parts>): void; stop(): void }
let runtime: Promise<Runtime> | null = null
const loadRuntime = () => (runtime ??= (async () => {
  // its components' stylesheet, once
  const link = document.createElement("link")
  link.rel = "stylesheet"; link.href = appUrl("playground/preview.css")
  document.head.append(link)
  return await import(/* @vite-ignore */ appUrl("playground/preview.js")) as Runtime
})())
/** Each cell's first element: the tag its component draws. */
const readTag = (): void => {
  const out: Record<string, string> = {}
  for (const cell of previewEl?.querySelectorAll<HTMLElement>(".sc-pv-cell") ?? []) out[cell.dataset["pv"] ?? ""] = cell.querySelector(".sc-pv-stage")?.firstElementChild?.tagName.toLowerCase() ?? ""
  if (JSON.stringify(out) !== JSON.stringify(untrack(rootTags))) rootTags.set(out)
}
async function render(code: string): Promise<void> {
  if (!previewEl) return
  const t0 = performance.now()
  try {
    await (await loadRuntime()).run(code, previewEl, untrack(rootProps), untrack(partsNow))
    readTag()
    print(`[${stamp()}] Önizleme çizildi · ${Math.round(performance.now() - t0)} ms`, "success")
  } catch (e) {
    print(`[${stamp()}] ✖ Çalışma hatası: ${String((e as Error)?.message ?? e)}`, "error")
  }
}
const preview = () => <AppPreview toolbar={{ theme: true, accent: true, mode: true }}
  footer={() => (usage() ? <CodeView code={usage} lang="tsx" copy wrap label="Bileşenin kodu" /> : null)}>
  <div class="sc-pv-root" ref={(el: HTMLElement) => { previewEl = el }}>
    <div class="sc-playground-empty"><b>Önizleme</b><span>Derleniyor…</span></div>
  </div>
</AppPreview>

const PANELS: AppPanel[] = [
  { id: "preview", title: "Önizleme", icon: monitor, content: preview },
  { id: "props", title: "Özellikler", icon: sliders, disabled: () => !options().length, content: propsPanel },
  { id: "events", title: "Olaylar", icon: zap, content: eventsPanel },
  { id: "deps", title: "Bağımlılıklar", icon: packageBox, disabled: () => !depTree().length, content: depsPanel },
  { id: "a11y", title: "Erişilebilirlik", icon: users, content: a11yPanel },
  fileTab("c1", "Button.tsx"),
  fileTab("c2", "Component2.tsx"),
  fileTab("c3", "Component3.tsx"),
  { id: "console", title: "Konsol", icon: code, content: consolePanel },
  panel("debug", "Hata ayıklayıcı", bug),
  panel("terminal", "Terminal", terminal),
  { id: "i18n", title: "lang.json", icon: globe, content: () => <div class="sc-lang"><JsonView value={langJson} open={2} label="Çevrilecek metinler" /></div> },
]
const PRESETS: Record<string, Preset> = {
  main: {
    title: "Playground",
    tree: () => row(
      [0.6, col([0.7, tabs("preview")], [0.3, row([0.5, tabs(["props", "events"])], [0.5, tabs(["deps", "a11y"])])])],
      [0.4, col([0.7, tabs(["c1", "c2", "c3"])], [0.3, tabs(["console", "debug", "terminal", "i18n"])])],
    ),
  },
}
// March's exports for the suggestions: the API reference's index (one JSON file, fetched when the playground opens)
const catalog = (): Promise<MarchCatalog> => apiIndex()
// the TypeScript language service in a worker (the build copies it, the compiler and the lib files to playground/)
const typescript = typeScriptPlugin({ worker: appUrl("playground/ts-worker.js"), typescript: appUrl("playground/ts/typescript.js"), lib: appUrl("playground/ts/") })
const PLUGINS = [typescript, codeEditorPlugin(), marchLanguagePlugin({ catalog })]

export default function PlaygroundPage(props: { name?: string }) {
  // every change is built a moment after typing stops
  let timer: ReturnType<typeof setTimeout> | undefined
  effect(() => {
    // only the file in front (and the entry that renders it)
    const path = active()
    const now = { [path]: files.get(path)?.() ?? "", [ENTRY]: entrySource() }
    clearTimeout(timer)
    // built before with this very code (a tab shown again): the kept result, at once
    const kept = builder.cached(now, ENTRY)
    if (kept) { print(`[${stamp()}] ↺ ${path}: bu kod daha önce derlendi, bellekteki sonuç kullanılıyor`, "muted"); void render(kept.code); return }
    timer = setTimeout(() => { void builder.build(now, ENTRY).then((r) => { if (r?.ok) void render(r.code) }) }, 350)
  })
  // a property changes: the rendered component takes it at once (no build)
  effect(() => { const p = rootProps(), parts = partsNow(); void runtime?.then((r) => { r.setProps(p, parts); readTag() }) })
  // HTML events chosen in Events: listened to on the preview, for the element each exported component draws
  effect(() => {
    const el = previewEl
    if (!el) return
    const offs = exportedNames().flatMap((name) => Object.entries(handlersBy()[name] ?? {}).filter(([ev, how]) => how && ev.startsWith("on:")).map(([ev, how]) => {
      const type = ev.slice(3), run = handle(name, ev, how as Handler)
      const fn = (e: Event) => {
        const root = el.querySelector(`.sc-pv-cell[data-pv="${name}"] > .sc-pv-stage`)?.firstElementChild
        if (root && (e.target === root || (!["pointerenter", "pointerleave"].includes(type) && root.contains(e.target as Node)))) run(e)
      }
      el.addEventListener(type, fn, true)
      return () => el.removeEventListener(type, fn, true)
    }))
    onCleanup(() => offs.forEach((off) => off()))
  })
  onCleanup(() => { clearTimeout(timer); consoleApi = null; previewEl = null; void runtime?.then((r) => r.stop()) })
  return <div class="sc-playground">
    <AppUI title={props.name ?? "Test Bileşen"} tools={<PaletteButton label="Komut ara…" class="sc-playground-pal" />}
      panels={PANELS} presets={PRESETS} plugins={PLUGINS} commands="playground" persist="sc.playground.v4" label="Playground" api={followTabs} />
  </div>
}
