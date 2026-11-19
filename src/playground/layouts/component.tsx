// The "component" layout of MarchIDE (ide.json › layout: "component"): the workspace of a component's page on march-app-ui (AppUI). The top bar: the component's name on the
// left, the command palette and the Layout button on the right. Preview over Properties and Dependencies /
// Accessibility on the left; the component's files over Console / Debugger / Terminal / lang.json on the right. The
// .tsx tabs are files: the code editor plugin opens them, the March language plugin suggests March's exports. Button.tsx exports
// the component under work; Properties shows its options, and the build renders it with them (PreviewControl.tsx). Every
// change is built in the page (playground/build.ts): the Console shows each step with its time and the errors,
// lang.json the texts the build found. No tab has a close mark (groups still collapse to strips).
import "./component.css";
import { h, render as mount, createRoot, signal, computed, effect, untrack, batch, onCleanup, SX, locale, t } from "march";
import { registry } from "march/components/registry.gen.ts";
import type { PlaygroundOption } from "march/components/meta.ts";
import { appUrl } from "march/base";
import { PaletteButton, Spinner, Segmented, JsonView, Terminal, PropertyGrid, IconPicker, Chip, Combobox, Toggle, Select, Badge, Button, IconButton, Dropdown, toast, colorThemes, Tree, CodeView, Alert, type TerminalApi, type TerminalCommand, type TerminalIO, type PropertySpec } from "march/ui";
import { AppUI, AppPreview, codeEditorPlugin, marchLanguagePlugin, typeScriptPlugin, debuggerPlugin, vaultPlugin, aiPlugin, groups, type AiService, type DebuggerService, type TypeScriptService, type AppKit, type DockApi, row, col, tabs, type AppPanel, type Preset, type MarchCatalog, type CodeProblem } from "march/app-ui";
import { x as xIcon, sparkles, alertTriangle, packageBox, activity, checkCircle, image, video, save, history, plus, database, zap, monitor, sliders, layers, braces, users, code, terminal, fileText, globe, plug } from "march/icons";
import { KeyValueEditor, TextInput, JsonEditor } from "march/forms"
import { COLOR_TOKENS } from "march/theme"
import { createBuilder, type BuildResult } from "../build.ts";
import { openBuildOutput } from "../output.tsx";
import { findRoots, exportRoots, viewRoots, jsxTree, type JsxRoot, type JsxNode } from "../roots.ts";
import { iconPickerPacks, packRef, loadPack, loadIndex, loadExports, loadNames } from "../../icon-packs.ts";
import type { IconPack, IconNames } from "../prop-helpers.ts";
import type { IdeJson, IdeSource } from "../ide.ts";
// the ide.json texts as t`…` (tools/gen-ide-texts.js): imported so the build collects them for translation
import "../ide-texts.gen.tsx";
import { idle } from "../march-ide.tsx";
import { HUBS } from "../../topics.ts";
import { IDE_PAGES } from "../ide-pages.ts";
import { ExtensionsPanel, extensionOptions, extensionSpec, withExtensionSuggestions, NO_EXT, type ExtInfo, type OwnProp } from "../extensions-tab.tsx";
import { CORE_PROPS } from "../prop-suggest.ts";
import { ProblemsPanel, lineColOf, type IdeProblem } from "../problems-panel.tsx";
import type { ConsoleEvent } from "../preview-runtime.ts";
import { QuickPick, type PickItem } from "../quick-pick.tsx";
import { parseSourceMap, originalAt, blobFrames, type SourceMap } from "../source-map.ts";
import { BundlePanel, marchImports, type ExportSizes, type MarchImport } from "../bundle-panel.tsx";
import { ReactivityPanel, parseProbeName, type ReactRow } from "../reactivity-panel.tsx";
import type { Probe, TestResult } from "../preview-runtime.ts";
import { TestsPanel, isTestFile, type TestRun } from "../tests-panel.tsx";
import { capturePicture, startRecording } from "../capture.ts";
import { aiIndex, aiDetails, marchNamesIn } from "../ai-reference.ts";
import { hotkeys } from "march/managers";


// the workspace's files (from its ide.json, kept for this visit): every file's text, made before anything reads them
// (the exported name, the build)
const files = new Map<string, ReturnType<typeof signal<string>>>()
/** Every file's text as last saved: the build, the preview and the language file follow it, not the typing (Ctrl + S
 * or the bar's Save button saves; the TypeScript check runs on the typed text, in its worker). */
const saved = new Map<string, ReturnType<typeof signal<string>>>()
const isDirty = (path: string): boolean => { const t = files.get(path), s = saved.get(path); return !!t && !!s && t() !== s() }
const anyDirty = (): boolean => [...files.keys()].some(isDirty)
/** Saves a file (else every file): its text becomes the saved one, which builds it. Returns whether anything changed. */
const saveFiles = (path?: string): boolean => {
  let changed = false
  for (const p of path ? [path] : [...files.keys()]) {
    const t = files.get(p), s = saved.get(p)
    if (t && s && s.peek() !== t.peek()) { s.set(t.peek()); changed = true }
  }
  return changed
}
const fileTab = (id: string, path: string): AppPanel => {
  const text = files.get(path) ?? signal("")
  return { id, title: path, icon: fileText, dirty: () => isDirty(path), file: { path, text, set: (v: string) => text.set(v) } }
}

// the component under work: the first name Button.tsx exports; its Properties are the options of its showcase card
// (its playground.ts); the preview entry renders it with the values chosen there
// a playground, not a project: the code tab in front (of the files' group) is the one built, previewed, translated
// (lang.json) and whose Properties show; the others wait
const ENTRY = "PreviewControl.tsx"
// a file's tab id (c1, c2…) → its name
const FILE_OF: Record<string, string> = {}
const active = signal("")
let dock: DockApi | null = null
const followTabs = (api: DockApi) => {
  dock = api

  effect(() => {
    const L = api.layout()
    if (!L) return
    // the files' group: the group that holds a file tab; its front tab is the file in work
    const g = groups(L.root).find((x) => x.panels.some((id) => id in FILE_OF))
    const file = g?.active ? FILE_OF[g.active] : undefined
    // while a page's tabs come in the tab in front changes on its way: not a line of the Console
    if (file && file !== untrack(active)) { active.set(file); if (!switching) print(`[${stamp()}] ${file} sekmesi etkin`, "info") }
  })
}
/** The text of the file in front as saved: the editor draws every key at once, the analyses below (its roots, exports,
 * own components, data, the Hierarchy's tree, the live code) and the build follow the saves, not the typing. */
const settledText = (): string => saved.get(active())?.() ?? ""
// the components the file in front exports (names with a capital letter): each has a cell of the preview and a root
// in the Dependencies tree
// the elements the file writes at its top level, assigned to nothing (<CodeEditor … />): components of their own,
// named by their tag (CodeEditor_1); their props are the written ones, Properties go over them
const jsxRoots = computed((): JsxRoot[] => findRoots(settledText()), { equals: (a, b) => !!a && !!b && a.map((r) => r.name + r.tag).join() === b.map((r) => r.name + r.tag).join() })
/** The tag a top-level element's name stands for (CodeEditor_1 → CodeEditor); undefined for a name the file exports. */
const rootTag = (name: string): string | undefined => jsxRoots().find((r) => r.name === name)?.tag
/** The code built: the top-level elements written as exports. */
const forBuild = (src: string): string => exportRoots(src)
const exportedNames = computed((): string[] => {
  const src = settledText(), out: string[] = []
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
interface LocalComp { props: ApiProp[]; from: number; to: number }
const typeFields = (body: string): ApiProp[] => body.split(/[;\n]/).map((line) => /^\s*(?:readonly\s+)?([\w$]+)(\?)?\s*:\s*(.+?)\s*,?\s*$/.exec(line))
  .filter((m): m is RegExpExecArray => !!m).map((m) => ({ name: m[1]!, type: `${m[3]!}${m[2] ? " | undefined" : ""}`, doc: "" }))
const localComps = computed((): Record<string, LocalComp> => {
  const src = settledText(), out: Record<string, LocalComp> = {}
  const starts = [...src.matchAll(/(?:function\s+([A-Z][\w$]*)\s*(?:<[^>]*>)?\s*\(|(?:const|let)\s+([A-Z][\w$]*)\s*=\s*(?:async\s*)?\()/g)]
  starts.forEach((m, i) => {
    const name = (m[1] ?? m[2])!, from = m.index!, to = starts[i + 1]?.index ?? src.length, body = src.slice(from, to)
    // the first parameter's type: written in place, or a name the file declares
    const t = /\(\s*(?:[\w$]+|\{[^}]*\})\s*:\s*(\{[^{}]*\}|[A-Z][\w$]*)/.exec(body)?.[1] ?? ""
    const decl = t.startsWith("{") ? t.slice(1, -1) : t ? (new RegExp(`(?:interface\\s+${t}\\b[^{]*|type\\s+${t}\\s*=\\s*)\\{([^}]*)\\}`).exec(src)?.[1] ?? "") : ""
    out[name] = { props: typeFields(decl), from, to }
  })
  return out
})
// Data: what the file declares at its top (signals, computed values, constants): the Data tab shows them; a signal is
// set (or pushed to) in the running preview at once, a constant's value is written into the code (and built again)
interface DataItem { name: string; kind: "signal" | "computed" | "const" | "let"; init: string; from: number; to: number }
const dataItems = computed((): DataItem[] => {
  const src = settledText(), out: DataItem[] = []
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
// Hierarchy: every element the file in front draws, where it is written and nested as in the code (a Button written
// twice is two rows), each March component with the parts it is built from (its composedOf, recursively) under it.
// Choosing a row shows that component's Properties.
interface DepNode { id: string; label: string; children?: DepNode[] }
const depTree = computed((): DepNode[] => {
  const src = settledText(), roots = exportedNames()
  if (!roots.length) return []
  let n = 0
  const make = (label: string, kids: DepNode[]): DepNode => ({ id: `${label}#${n++}`, label, ...(kids.length ? { children: kids } : {}) })
  // a March component's parts, recursively (a part already above it is not repeated)
  const parts = (name: string, seen: ReadonlySet<string>): DepNode[] => (seen.has(name) || localComps()[name] ? [] :
    (metaOf(name)?.meta.composedOf ?? []).filter((k) => metaOf(k)).map((k) => make(k, parts(k, new Set(seen).add(name)))))
  // a written element: what is written inside it, then (a March component) its own parts; a fragment is its children
  const written = (j: JsxNode): DepNode[] => {
    if (!j.tag) return j.kids.flatMap(written)
    const label = /^[a-z]/.test(j.tag) ? `<${j.tag}>` : j.tag
    return [make(label, [...j.kids.flatMap(written), ...parts(label, new Set())])]
  }
  return roots.map((r) => {
    const local = localComps()[r], top = jsxRoots().find((x) => x.name === r)
    // the file's own component: the elements its body draws; a top-level element: what is written inside it
    if (local) return make(r, jsxTree(src, local.from, local.to).flatMap(written))
    if (top) { const j = jsxTree(src, top.from, top.to)[0]; return make(r, [...(j?.kids.flatMap(written) ?? []), ...parts(top.tag, new Set())]) }
    return make(r, parts(r, new Set()))
  })
})
// the instances the preview draws now (its runtime's componentTree): the Hierarchy shows them, one row each
interface LiveItem { id: number; parent: number; name: string; key: string; elId: string; text: string }
const liveTree = signal<LiveItem[]>([])
const inTree = computed((): string[] => {
  const out = new Set<string>(); const go = (n: DepNode): void => { out.add(n.label); n.children?.forEach(go) }; depTree().forEach(go)
  for (const it of liveTree()) out.add(it.name)
  return [...out]
}, { equals: (a, b) => !!a && !!b && a.join() === b.join() })
/** The component whose Properties show (chosen in the Dependencies tree; the exported one by default). */
const selected = signal("")
const optionsBy = signal<Record<string, readonly PlaygroundOption[]>>({})
const valuesBy = signal<Record<string, Record<string, unknown>>>({})
interface ApiProp { name: string; type: string; doc: string; tr?: string }
/** Every prop a component exports (the API reference): its events and its accessibility props are read from it. */
const apiPropsBy = signal<Record<string, ApiProp[]>>({})
/** The common props' texts (`m:color`, `m:tip`…) in the page's language, by name: from the API index (src/props CommonProps). */
const commonText = signal<Record<string, string>>({})
const pageLang = (): "tr" | "en" => (locale().split("-")[0] === "tr" ? "tr" : "en")
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
/** A component's options and default values, loaded once (its card's playground.ts; none for the file's own). */
const loadOptions = (name: string): Promise<void> => {
  if (optionsBy.peek()[name]) return Promise.resolve()
  const entry = metaOf(name)
  // the file's own component: no card; its props come from its type (exportedProps)
  if (!entry || localComps.peek()[name]) { optionsBy.set({ ...optionsBy.peek(), [name]: [] }); return Promise.resolve() }
  return entry.playground().then((m) => {
    if (optionsBy.peek()[name]) return
    const list = (m.default as { options: readonly PlaygroundOption[] }).options.filter((o) => o.prop !== false)
    optionsBy.set({ ...optionsBy.peek(), [name]: list })
    if (!valuesBy.peek()[name]) valuesBy.set({ ...valuesBy.peek(), [name]: Object.fromEntries(list.map((o) => [o.key, defaultOf(o)])) })
  }, () => undefined)
}
// every component of the tree gets its options and default values once
effect(() => { for (const name of inTree()) void untrack(() => loadOptions(name)) })
// besides its card's options (March's, on top), a component takes HTML attributes: class (March's own classes to
// choose, or any typed one), the global attributes and those of the element it draws (the root's tag, read from the
// preview). What the component sets itself (its own props: disabled, type…) is not listed again.
const GLOBAL_ATTRS = ["dir", "id", "lang", "title", "translate"]
// the Accessibility tab: the attributes of accessibility, and the props a component exports for it (its accessible
// name, its texts for screen readers: from the API reference)
const A11Y_ATTRS = ["accesskey", "aria-describedby", "aria-description", "aria-hidden", "aria-label", "aria-labelledby", "role", "tabindex"]
const A11Y_GROUP = "Erişilebilirlik", COMMON_GROUP = "Ortak (m:)", SX_GROUP = "sx"
// sx: the design-token shorthands (march's SX table), one property per key, on any component (its root)
const SX_SPEC = SX as unknown as Record<string, readonly (string | number)[]>
/** A key's values: a number range (0–8) or its words. */
const sxValues = (k: string): string[] => { const s = SX_SPEC[k] ?? [], lo = s[0], hi = s[1]; return typeof lo === "number" ? Array.from({ length: (hi as number) - lo + 1 }, (_, i) => String(lo + i)) : s.map(String) }
// keys whose words combine, and the words of each that exclude each other (one size, one colour, one alignment…)
const SX_GROUPS: Record<string, readonly (readonly string[])[]> = {
  text: [["xs", "sm", "md", "lg", "xl", "2xl"], ["left", "center", "right"], ["mono"], ["bold"]],
  flex: [["row", "col"], ["wrap"], ["center", "between", "end"], ["grow"]],
}
const sxOptions = (): PlaygroundOption[] => Object.keys(SX_SPEC).map((k) => ({ key: `sx:${k}`, label: k, prop: `sx.${k}`, default: "", kind: "text" as const }))
// March's common props (march/props): every component takes them
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
  return march ? [...[...march, ...apiOptions(name)].sort((a, b) => collator.compare(a.label, b.label)), ...extOptions(name), ...commonOptions(name), ...sxOptions(), ...htmlOptions(name), ...a11yOptions(name)] : []
}
const isHtml = (o: PlaygroundOption): boolean => /^(html|a11y|mp|api|ext|sx):/.test(o.key)
// the props the code's extensions add to a component (the preview runtime's March: read after every build): their own
// group in Properties, named by the extension
const extInfo = signal<ExtInfo>(NO_EXT, { equals: (a, b) => JSON.stringify(a) === JSON.stringify(b) })
const extOptions = (name: string): PlaygroundOption[] => extensionOptions(extInfo(), name, new Set((optionsBy()[name] ?? []).map((o) => String(o.prop || o.key))))
const isA11y = (o: PlaygroundOption): boolean => o.key.startsWith("a11y:")
const options = (): readonly PlaygroundOption[] => optsOf(selected())
// the set of options (the grid is made again when it changes: a component chosen, the root's tag read)
const optionKeys = computed(() => `${selected()}:${options().map((o) => o.key).join(",")}:${selected() in tableBy() ? 1 : 0}:${selected() in apiPropsBy() ? 1 : 0}:${locale()}:${Object.values(commonText())[0] ?? ""}`)
// an instance chosen in the Hierarchy (one of several Buttons) takes its own values: Properties changes that one
// only (the runtime gives them to the instance with its key). The exported component on top and a choice made by name
// (no instance) keep the values of the component's kind.
const selectedInst = signal<{ key: string; name: string; root: boolean } | null>(null)
const valuesByInst = signal<Record<string, Record<string, unknown>>>({})
/** "Tüm örneklere uygula" (Properties' bar): while on, a change is the kind's, so every instance of it takes it. */
const applyAll = signal(false)
const instOn = (): string | null => { const s = selectedInst(); return s && !s.root && !applyAll() && s.name === selected() ? s.key : null }
/** What a change in Properties goes to, in words: the instance (with its text), or every instance of the kind. */
const target = (): string => {
  const name = selected(), k = instOn()
  if (!name) return ""
  if (k) { const it = liveTree().find((x) => x.key === k); return it?.text ? `${name} · “${it.text}”` : name }
  const many = liveTree().filter((x) => x.name === name).length
  return many > 1 ? `tüm ${name} örnekleri (${many})` : name
}
const values = (): Record<string, unknown> => { const k = instOn(), v = (k ? valuesByInst()[k] : valuesBy()[selected()]) ?? {}; return Object.fromEntries(options().map((o) => [o.key, v[o.key] ?? defaultOf(o)])) }
const setValues = (v: Record<string, unknown>) => {
  const k = untrack(instOn), name = selected.peek()
  if (k) { valuesByInst.set({ ...valuesByInst.peek(), [k]: { ...v } }); return }
  // for the whole kind: what changed is taken off the instances' own values too, so every instance shows it
  const before = untrack(values), changed = Object.keys(v).filter((x) => JSON.stringify(v[x]) !== JSON.stringify(before[x]))
  if (untrack(applyAll) && changed.length) {
    const next = { ...valuesByInst.peek() }
    for (const [key, own] of Object.entries(next)) if (nameOfKey(key) === name) { const o = { ...own }; for (const x of changed) delete o[x]; next[key] = o }
    valuesByInst.set(next)
  }
  valuesBy.set({ ...valuesBy.peek(), [name]: { ...v } })
}
// the instance a choice made by name stands on (the first one opened, a tab shown, the command line): the row the
// Hierarchy marks is the instance Properties changes, so what is shown chosen and what a change goes to are one
effect(() => {
  const items = liveTree(), name = selected(), inst = untrack(selectedInst)
  if (inst && inst.name === name && items.some((x) => x.key === inst.key)) return
  const it = items.find((x) => x.name === name)
  untrack(() => selectedInst.set(it ? { key: it.key, name, root: it.parent === 0 } : null))
})
/** An instance key's component: "SaveBar/SaveBar:0/Button:1" → Button. */
const nameOfKey = (key: string): string => (key.split("/").pop() ?? "").replace(/:\d+$/, "")
/** Chooses a live instance (a Hierarchy row, a focus in the preview). */
const chooseInst = (it: LiveItem): void => { selectedInst.set({ key: it.key, name: it.name, root: it.parent === 0 }); pickedId.set(`${it.name}#i${it.id}`); selected.set(it.name) }
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
// each property's text under its name (muted, small): the API reference's (the prop's JSDoc), else the component's
// docs table; in the showcase's language: Turkish (the prop's `@tr` JSDoc tag, `props[].tr`) when the page is Turkish
const tableBy = signal<Record<string, Record<string, string>>>({})
const tables = new Map<string, Promise<Record<string, { props?: [string, string, string, string][] }>>>()
const plain = (md: string): string => md.replace(/`([^`]*)`/g, "$1").replace(/\*\*?([^*]+)\*\*?/g, "$1").trim()
async function loadTable(name: string): Promise<void> {
  const folder = metaOf(name) ? registry.find((e) => e.meta === metaOf(name)!.meta)?.folder : undefined
  if (!folder) { tableBy.set({ ...tableBy.peek(), [name]: {} }); return }
  const cat = folder.split("/")[0]!
  if (!tables.has(cat)) tables.set(cat, fetch(appUrl(`comp/${cat}.json`)).then((r) => r.json()).catch(() => ({})))
  const rows = (await tables.get(cat)!)[folder]?.props ?? [], out: Record<string, string> = {}
  for (const [names, , , text] of rows) for (const m of names.matchAll(/`([^`]+)`/g)) if (text) out[m[1]!] = plain(text)
  tableBy.set({ ...tableBy.peek(), [name]: out })
}
effect(() => { for (const name of inTree()) if (!(name in untrack(tableBy))) void loadTable(name) })
/** The text under a property's name. */
const describeProp = (name: string, o: PlaygroundOption): string => {
  const prop = String(o.prop || o.key).replace(/^(html|a11y|api|mp):/, "")
  const api = (apiPropsBy()[name] ?? []).find((p) => p.name === prop)
  const tr = pageLang() === "tr" ? api?.tr : ""
  return plain(tr || api?.doc || (prop.startsWith("m:") ? commonText()[prop] : "") || tableBy()[name]?.[prop] || "")
}
const asProperty = (o: PlaygroundOption): PropertySpec => {
  const spec = asPropertyBase(o), text = untrack(() => describeProp(selected(), o))
  return text ? { ...spec, description: text, name: String(o.prop || o.key).replace(/^(html|a11y|api|mp):/, "") } : spec
}
/** At most this many fixed values are a button group; more are chips that wrap (a colour token's chip in its colour). */
const SEGMENTS = 7
type Choice = { value: unknown; label: string; title?: string; color?: string }
// `multi`: several values at once (a list; a press adds or takes one out, "—" clears them); `groups`: values that
// exclude each other (two sizes): one per group, a divider between the groups
const chipsControl = (choices: readonly Choice[], name: string, multi = false, groups?: readonly (readonly string[])[]) => (cp: Record<string, unknown>): unknown =>
  h("div", { class: "sc-chips", role: "group", "aria-label": name }, choices.map((c, i) => {
    const groupOf = (v: unknown): readonly string[] | undefined => groups?.find((g) => g.includes(String(v)))
    const now = (): unknown[] => (Array.isArray(cp["value"]) ? cp["value"] as unknown[] : cp["value"] ? [cp["value"]] : [])
    const on = (): boolean => (multi && c.value !== "" ? now().includes(c.value) : multi ? !now().length : (cp["value"] ?? "") === c.value)
    const press = (): void => {
      const set = cp["setValue"] as (v: unknown) => void
      if (!multi || c.value === "") { set(c.value); return }
      const mates = groupOf(c.value) ?? []
      const next = on() ? now().filter((x) => x !== c.value) : [...now().filter((x) => !mates.includes(String(x))), c.value]
      set(next.length ? next : "")
    }
    const chip = h(Chip, { size: "sm", selected: on, onClick: press, title: c.title ?? null, children: c.color ? [h("span", { class: "sc-chip-dot", "aria-hidden": "true" }), c.label] : c.label }) as Element
    if (c.color) chip.setAttribute("data-m-color", c.color)
    // a new group starts: a thin divider before its first value
    const prev = choices[i - 1]
    return groups && prev && prev.value !== "" && groupOf(prev.value) !== groupOf(c.value) ? [h("span", { class: "sc-chip-sep", "aria-hidden": "true" }), chip] : chip
  }))
const asPropertyBase = (o: PlaygroundOption): PropertySpec => {
  if (isTri(o)) return { key: o.key, label: o.label, group: MARCH_GROUP, control: (cp: Record<string, unknown>) => h(Toggle, { ...cp, tristate: true }), ...(o.visibleWhen ? { hidden: (v: Record<string, unknown>) => !o.visibleWhen!(v as never) } : {}) } as PropertySpec
  if (isIcon(o)) return { key: o.key, label: o.label, control: (cp: Record<string, unknown>) => IconPicker({ value: () => (cp["value"] as string | null) ?? null, onChange: (n: string | null) => (cp["setValue"] as (v: unknown) => void)(n), label: o.label, packs: iconPickerPacks }), group: MARCH_GROUP, ...(o.visibleWhen ? { hidden: (v: Record<string, unknown>) => !o.visibleWhen!(v as never) } : {}) } as PropertySpec
  if (o.key.startsWith("ext:")) {
    const x = untrack(() => extensionSpec(extInfo(), selected(), o.key)), t = x?.spec.type
    const base = { key: o.key, label: o.label, group: x?.group ?? "Askı", ...(x?.spec.doc ? { description: x.spec.doc } : {}) }
    if (x?.spec.values?.length) return { ...base, type: "select", options: x.spec.values.map((v) => ({ value: v, label: String(v) })) } as PropertySpec
    return { ...base, type: t === "boolean" ? "switch" : t === "number" ? "number" : "text" } as PropertySpec
  }
  if (isHtml(o)) {
    const name = String(o.prop)
    // an sx key: its values as a button group or chips (the empty one first: not set)
    if (o.key.startsWith("sx:")) {
      const k = String(o.label), opts = [{ value: "", label: "—", title: "yok" }, ...sxValues(k).map((x) => ({ value: x, label: x }))]
      // keys whose words combine (text: muted + center + bold; flex: row + wrap): one per group
      if (SX_GROUPS[k]) return { key: o.key, label: o.label, group: SX_GROUP, control: chipsControl(opts, k, true, SX_GROUPS[k]) } as PropertySpec
      // color: each token's chip in its colour
      if (k === "color") return { key: o.key, label: o.label, group: SX_GROUP, control: chipsControl(opts.map((x) => (x.value && x.value !== "muted" ? { ...x, color: x.value } : x)), k) } as PropertySpec
      return (opts.length <= SEGMENTS ? { key: o.key, label: o.label, group: SX_GROUP, type: "segmented", options: opts } : { key: o.key, label: o.label, group: SX_GROUP, control: chipsControl(opts, k) }) as PropertySpec
    }
    const group = isA11y(o) ? A11Y_GROUP : o.key.startsWith("mp:") ? COMMON_GROUP : o.key.startsWith("api:") ? MARCH_GROUP : HTML_GROUP, label = o.label
    if (o.default === null) return { key: o.key, label, group, type: "number" } as PropertySpec
    if (name === "m:theme") return { key: o.key, label, group, control: chipsControl([{ value: "", label: "—", title: "sayfanın teması" }, ...colorThemes().map((x) => ({ value: x.id, label: x.name }))], name) } as PropertySpec
    if (name === "class") return { key: o.key, label, group, control: classControl } as PropertySpec
    if (name === "data") return { key: o.key, label, group, control: dataControl } as PropertySpec
    const set = valuesOf.get(o.key) ?? ATTR_VALUES[name]
    if (set && (set.own || set.multi)) return { key: o.key, label, group, control: comboControl(() => set.list, set, name) } as PropertySpec
    // a fixed list of values: a button group (with the empty value first: not set, the component's default) while it
    // fits, a select past SEGMENTS values
    if (set) {
      const opts = [{ value: "", label: "—", title: "boş (bileşenin varsayılanı)" }, ...set.list.map((x) => ({ value: x, label: x }))]
      if (opts.length <= SEGMENTS) return { key: o.key, label, group, type: "segmented", options: opts } as PropertySpec
      return { key: o.key, label, group, control: chipsControl(opts.map((x) => (name === "m:color" && x.value ? { ...x, color: x.value } : x)), name) } as PropertySpec
    }
    return { key: o.key, label, group, type: typeof o.default === "boolean" ? "switch" : "text" } as PropertySpec
  }
  const opts = o.options?.map((x) => (typeof x === "object" ? x : { value: x, label: String(x) }))
  // a card option with a long list of values: chips that wrap, like the attributes' (a select hides them)
  if (opts && opts.length > SEGMENTS && typeof o.default !== "boolean") return { key: o.key, label: o.label, group: MARCH_GROUP, control: chipsControl(opts.map((x) => ({ value: x.value, label: String(x.label ?? x.value) })), o.label), ...(o.visibleWhen ? { hidden: (v: Record<string, unknown>) => !o.visibleWhen!(v as never) } : {}) } as PropertySpec
  const type = typeof o.default === "boolean" ? "switch" : opts ? "segmented" : typeof o.default === "number" ? (o.min !== undefined && o.max !== undefined ? "slider" : "number") : "text"
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
// a JSON list or object: its value; an icon's name: the icon (as "icon:name", the runtime takes it); a JSX part of the card's own: a stand-in "•••".
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
  // a JSON list or object (ListEditor's sample items {["a", "b"]}): its value
  if (/^[[{]/.test(inner)) { try { return JSON.parse(inner) } catch { /* not JSON: left out below */ } }
  if (/^[A-Za-z_$][\w$]*$/.test(inner)) return `icon:${inner}`
  if (inner.startsWith("<")) return "•••"
  return OMIT
}
const jsonOf = (x: unknown): unknown => { if (typeof x !== "string") return x; try { return JSON.parse(x) } catch { return OMIT } }
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
    // a data prop written as JSON (kind "json": Tree's nodes, Timeline's items): its parsed value; text that does not parse is left out
    const x = o.kind === "json" ? jsonOf(cur) : isIcon(o) ? (typeof cur === "string" && cur.includes(":") ? packRef(cur) : typeof cur === "string" && cur && !/icon/i.test(prop) ? `icon:${cur}` : cur) : o.toCode ? fromCode(o, cur, v) : cur
    if (x === undefined) continue
    if (o.key === "html:data") { delete out[prop]; for (const [k, d] of Object.entries(x as Record<string, unknown>)) out[`data-${k}`] = d; continue }
    if (x === OMIT || x === "" || x === null || (x === false && !o.toCode && !isTri(o))) { if (changed && x === false) out[prop] = false; continue }
    out[prop] = x
  }
  // the sx keys (sx.p, sx.text…) become one sx object; a number scale's value is a number
  const sxo: Record<string, unknown> = {}
  for (const k of Object.keys(out)) if (k.startsWith("sx.")) { const v = out[k], key = k.slice(3); delete out[k]; if (v !== undefined && v !== "" && !(Array.isArray(v) && !v.length)) sxo[key] = typeof SX_SPEC[key]?.[0] === "number" ? Number(v) : Array.isArray(v) && v.length === 1 ? v[0] : v }
  if (Object.keys(sxo).length) out["sx"] = sxo; else if (!changed) out["sx"] = undefined
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
/** What was changed in a component's values, as JSX attributes: [prop, its code] (`["size", 'size="lg"']`). */
const attrsOf = (name: string, v: Record<string, unknown>): [string, string][] => {
  const opts = optsOf(name), byProp = (prop: string) => opts.find((o) => (o.prop || o.key) === prop)
  return Object.entries(propsOf(opts, v, true)).filter(([k]) => k !== "children").map(([k, x]): [string, string] =>
    [k, k === "sx" ? `sx={{ ${Object.entries(x as Record<string, unknown>).map(([a, b]) => `${a}: ${JSON.stringify(b)}`).join(", ")} }}` : x === true ? k : `${k}=${jsxValue(byProp(k), x, v)}`])
}
const usageOf = (name: string): string => {
  const v = valuesBy()[name] ?? {}
  const attrs = attrsOf(name, v).map(([, a]) => a)
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
// The TSX box under the preview: the file in front, whole (it scrolls), and under it the calls with what Properties
// changed. The instance chosen in the Hierarchy is found where it is written (its key followed down the file's JSX:
// the root component's body, then each component inside it by its place among the ones of its name; one written in a
// .map stands for all it draws), its lines are marked and the box scrolls to them.
const fileCode = (): string => settledText()
const tsxCode = computed((): string => {
  const src = withInstanceValues(fileCode()).replace(/\s+$/, ""), calls = usage()
  const plain = exportedNames().every((n) => usageOf(n) === `<${(rootTag(n) ?? n).replace(/^<(.*)>$/, "$1")} />`)
  return plain || !calls ? src : `${src}\n\n// önizlemede, Özellikler'de değişenlerle:\n${calls}`
})
/** Where an instance (by its key) is written in the file: its element, or the root component's body, or null. */
const writtenAt = (key: string, src: string): { node: JsxNode | null; body: [number, number] | null; whole: boolean } => {
  const steps = key.split("/").slice(1).map((x) => { const m = /^(.*):(\d+)$/.exec(x); return { name: m?.[1] ?? x, n: Number(m?.[2] ?? 0) } })
  const root = steps[0]
  if (!root) return { node: null, body: null, whole: false }
  const local = localComps()[root.name], top = jsxRoots().find((x) => x.name === root.name)
  let nodes: JsxNode[] = local ? jsxTree(src, local.from, local.to) : top ? jsxTree(src, top.from, top.to) : []
  let hit: JsxNode | null = !local && top ? nodes[0] ?? null : null
  if (hit) nodes = hit.kids
  // the components under a list of elements (through the plain elements and fragments, down to the next components)
  const comps = (list: readonly JsxNode[]): JsxNode[] => list.flatMap((k) => (!k.tag || /^[a-z]/.test(k.tag) ? comps(k.kids) : [k]))
  // whole: every step found in the code (a part a component draws itself, its Spinner, is not written there)
  let whole = true
  for (const st of steps.slice(1)) {
    const same = comps(nodes).filter((k) => k.tag === st.name)
    if (!same.length) { whole = false; break }
    hit = same[Math.min(st.n, same.length - 1)]!
    nodes = hit.kids
  }
  return { node: steps.length > 1 ? hit : !local ? hit : null, body: local ? [local.from, local.to] : null, whole }
}
const selectedRange = computed((): [number, number] | null => {
  const inst = selectedInst()
  if (!inst) return null
  const w = writtenAt(inst.key, fileCode())
  return w.node ? [w.node.from, w.node.to] : w.body
})
/** The end of an element's opening tag (before its `>` or `/>`). */
const openEnd = (src: string, from: number): number => {
  let depth = 0
  for (let i = from + 1; i < src.length; i++) {
    const c = src[i]
    if (c === '"' || c === "'") { const e = src.indexOf(c, i + 1); i = e < 0 ? src.length : e; continue }
    if (c === "{") depth++
    else if (c === "}") depth--
    else if (depth === 0 && c === ">") return src[i - 1] === "/" ? i - 1 : i
  }
  return src.length
}
/** The file with the instances' own values written into the elements they stand for: an attribute there is
 *  replaced, a new one added; an element that draws several instances (a .map) gets a note instead. */
const withInstanceValues = (src: string): string => {
  const edits: { at: number; end: number; text: string }[] = []
  const byNode = new Map<number, { node: JsxNode; keys: string[] }>()
  for (const it of liveTree()) { const w = writtenAt(it.key, src); if (w.node && w.whole) { const g = byNode.get(w.node.from) ?? { node: w.node, keys: [] }; g.keys.push(it.key); byNode.set(w.node.from, g) } }
  for (const { node, keys } of byNode.values()) {
    const own = keys.map((k) => ({ k, attrs: attrsOf(nameOfKey(k), valuesByInst()[k] ?? {}) })).filter((x) => x.attrs.length)
    if (!own.length) continue
    const end = openEnd(src, node.from)
    if (keys.length > 1) { edits.push({ at: end, end, text: ` {/* ${own.map((x) => `${Number(/:(\d+)$/.exec(x.k)?.[1] ?? 0) + 1}. örnek: ${x.attrs.map(([, a]) => a).join(" ")}`).join("; ")} */}` }); continue }
    let tag = src.slice(node.from, end)
    for (const [prop, attr] of own[0]!.attrs) {
      // the attribute as written (prop="…", prop='…', prop={…} or a bare prop), after a space
      const re = new RegExp("(\\s)" + prop.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(=(\"[^\"]*\"|'[^']*'|\\{[^}]*\\}))?(?=[\\s/>]|$)")
      tag = re.test(tag) ? tag.replace(re, `$1${attr}`) : `${tag} ${attr}`
    }
    edits.push({ at: node.from, end, text: tag })
  }
  let out = src
  for (const e of edits.sort((a, b) => b.at - a.at)) out = out.slice(0, e.at) + e.text + out.slice(e.end)
  return out
}
const lineAt = (src: string, at: number): number => src.slice(0, at).split("\n").length
/** Marks the chosen element's lines in the TSX box and scrolls them into its view (smoothly; at once with reduced motion). */
const markTsx = (): void => { setTimeout(() => {
  const pre = document.querySelector<HTMLElement>(".sc-pv-code .m-code-pre"), r = untrack(selectedRange), src = untrack(fileCode)
  if (!pre) return
  const lines = pre.querySelectorAll<HTMLElement>(".m-code-line")
  lines.forEach((l) => l.classList.remove("is-hl"))
  if (!r) return
  const a = lineAt(src, r[0]), b = lineAt(src, r[1])
  for (let i = a; i <= b; i++) lines[i - 1]?.classList.add("is-hl")
  const first = lines[a - 1]
  if (!first) return
  const top = pre.scrollTop + first.getBoundingClientRect().top - pre.getBoundingClientRect().top - pre.clientHeight / 4
  pre.scrollTo({ top: Math.max(0, top), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })
}, 0) }
effect(() => { selectedRange(); tsxCode(); markTsx() })
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
    <div class="sc-props-bar">
      <span class="sc-props-target" title={target}>{target}</span>
      <Chip size="sm" icon={layers} selectedIcon={false} selected={() => applyAll()} onClick={() => applyAll.set(!applyAll.peek())}
        title="Açıkken bir değişiklik aynı türdeki her bileşene uygulanır">Tüm örneklere uygula</Chip>
    </div>
    {inner}
  </div>
}
const a11yPanel = gridPanel(() => { const list = options().filter(isA11y); return list.length
  ? <PropertyGrid persist="sc.playground.a11y" properties={list.map(asProperty)} value={values()} onChange={setValues} label={`${selected()} erişilebilirliği`} saved={values()} footer={false} history={false} dirty={false} search={false} />
  : <div class="sc-playground-empty"><b>Erişilebilirlik</b><span>Dışa aktarılan bileşen yok</span></div> })
const propsPanel = gridPanel(() => (options().length
  ? <PropertyGrid persist="sc.playground.props" openGroups={[MARCH_GROUP]} properties={options().filter((o) => !isA11y(o)).map(asProperty)} value={values()} onChange={setValues} label={`${selected()} özellikleri`} saved={values()} footer={false} history={false} dirty={false} search={false} />
  : <div class="sc-playground-empty"><b>Özellik yok</b><span>{selected() ? `${selected()} prop almıyor` : "Dışa aktarılan bileşen yok"}</span></div>))
// Hierarchy: every component the preview draws, one row per instance, under the instance that drew it (its root's id
// and text beside it); before the preview has drawn, the tree of what the file writes (depTree). The filter keeps the
// rows whose name, id or text has what is typed (and the rows above them). Choosing one shows its Properties and
// points at it in the preview.
interface ShownNode { id: string; label: string; meta?: string; name: string; elId: string; text: string; children?: ShownNode[] }
// the filter: typed text (in the fields chosen), one component (the list of what is on screen), March's or the file's
// own, and either the rows above a match kept (the path to it) or the matches alone, in a flat list
type TreeField = "name" | "id" | "text"
const treeFilter = signal(""), treeComp = signal<string | null>(null), treeFields = signal<readonly TreeField[]>(["name", "id", "text"])
const treeOrigin = signal<"all" | "march" | "own">("all"), treeFlat = signal(false)
const liveNodes = (items: readonly LiveItem[]): ShownNode[] => {
  const ids = new Set(items.map((x) => x.id)), kids = new Map<number, LiveItem[]>()
  for (const it of items) { const at = ids.has(it.parent) ? it.parent : 0; const list = kids.get(at) ?? []; list.push(it); kids.set(at, list) }
  const make = (it: LiveItem): ShownNode => {
    const ch = (kids.get(it.id) ?? []).map(make), meta = [it.elId && `#${it.elId}`, it.text && `“${it.text}”`].filter(Boolean).join("  ")
    return { id: `${it.name}#i${it.id}`, label: it.name, name: it.name, elId: it.elId, text: it.text, ...(meta ? { meta } : {}), ...(ch.length ? { children: ch } : {}) }
  }
  return (kids.get(0) ?? []).map(make)
}
const staticNodes = (nodes: readonly DepNode[]): ShownNode[] => nodes.map((n) => ({ id: n.id, label: n.label, name: n.label, elId: "", text: "", ...(n.children ? { children: staticNodes(n.children) } : {}) }))
/** Every row of the tree, unfiltered. */
const treeAll = computed((): ShownNode[] => (liveTree().length ? liveNodes(liveTree()) : staticNodes(depTree())))
const flat = (nodes: readonly ShownNode[]): ShownNode[] => nodes.flatMap((n) => [n, ...flat(n.children ?? [])])
/** The components on screen with how many of each (the component list). */
const treeNames = computed((): { name: string; count: number }[] => {
  const by = new Map<string, number>()
  for (const n of flat(treeAll())) if (!n.name.startsWith("<")) by.set(n.name, (by.get(n.name) ?? 0) + 1)
  return [...by].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
})
const isOwn = (name: string): boolean => name in localComps() || !metaOf(name)
const hits = (n: ShownNode): boolean => {
  const q = treeFilter().trim().toLocaleLowerCase("tr"), comp = treeComp(), origin = treeOrigin(), f = treeFields()
  if (comp && n.name !== comp) return false
  if (origin !== "all" && (n.name.startsWith("<") || isOwn(n.name) !== (origin === "own"))) return false
  if (!q) return true
  return (f.includes("name") && n.name.toLocaleLowerCase("tr").includes(q)) || (f.includes("id") && n.elId.toLocaleLowerCase("tr").includes(q))
    || (f.includes("text") && n.text.toLocaleLowerCase("tr").includes(q))
}
const filtering = (): boolean => !!treeFilter().trim() || !!treeComp() || treeOrigin() !== "all"
const keep = (nodes: readonly ShownNode[]): ShownNode[] => nodes.flatMap((n) => {
  const ch = keep(n.children ?? [])
  return hits(n) || ch.length ? [{ ...n, children: ch.length ? ch : undefined }] : []
})
const shownTree = computed((): ShownNode[] => {
  if (!filtering()) return treeAll()
  return treeFlat() ? flat(treeAll()).filter(hits).map((n) => ({ ...n, children: undefined })) : keep(treeAll())
})
const hitCount = computed((): [number, number] => { const all = flat(treeAll()); return [filtering() ? all.filter(hits).length : all.length, all.length] })
const allIds = (nodes: readonly ShownNode[]): string[] => { const ids: string[] = []; const go = (n: ShownNode): void => { ids.push(n.id); n.children?.forEach(go) }; nodes.forEach(go); return ids }
// the row chosen (a component may sit at several places of the tree; the first one when chosen elsewhere)
const pickedId = signal("")
const labelOfId = (id: string): string => id.slice(0, id.lastIndexOf("#"))
const selectedId = (): string | undefined => {
  // a chosen instance is followed by its key (the preview draws again with new ids)
  const inst = selectedInst(), it = inst && inst.name === selected() ? liveTree().find((x) => x.key === inst.key) : undefined
  if (it) return `${it.name}#i${it.id}`
  const ids = allIds(shownTree()); const p = pickedId(); return p && ids.includes(p) && labelOfId(p) === selected() ? p : ids.find((id) => labelOfId(id) === selected()) }
/** Brings the chosen row into the middle of the Hierarchy (smoothly; at once with reduced motion). Only the panel's own
 * list scrolls, not the page or the workspace around it. */
const revealRow = (): void => { setTimeout(() => {
  const box = document.querySelector<HTMLElement>(".sc-deps"), row = box?.querySelector<HTMLElement>('[role="treeitem"][aria-selected="true"] > .m-tree-row')
  if (!box || !row) return
  const top = box.scrollTop + row.getBoundingClientRect().top - box.getBoundingClientRect().top - (box.clientHeight - row.offsetHeight) / 2
  box.scrollTo({ top: Math.max(0, top), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })
}, 0) }
/** The preview's instances again (their texts change as the preview runs). */
const readTree = (): void => { if (runtimeNow) liveTree.set(runtimeNow.componentTree()) }
const FIELDS: readonly [TreeField, string][] = [["name", "Ad"], ["id", "ID"], ["text", "Metin"]]
const toggleField = (f: TreeField): void => { const now = treeFields.peek(); const next = now.includes(f) ? now.filter((x) => x !== f) : [...now, f]; treeFields.set(next.length ? next : [f]) }
const clearTree = (): void => { treeFilter.set(""); treeComp.set(null); treeOrigin.set("all") }
const depsPanel = () => <div class="sc-deps">
  <div class="sc-deps-bar" role="search" aria-label="Hiyerarşi süzgeci">
    <div class="sc-deps-row">
    <TextInput class="sc-deps-q" type="search" aria-label="Hiyerarşide ara" placeholder="Ara…" value={treeFilter()}
      onChange={(v: string) => { readTree(); treeFilter.set(v) }} onKeyDown={(e: KeyboardEvent) => { if (e.key === "Escape") clearTree() }} />
    <Combobox class="sc-deps-comp" aria-label="Bileşen" placeholder="Bileşen" value={treeComp()}
      options={treeNames().map((x) => ({ value: x.name, label: x.name, hint: String(x.count) }))} onChange={(v: unknown) => treeComp.set((v as string | null) || null)} />
    </div>
    <div class="sc-deps-opts">
      {FIELDS.map(([f, label]) => <Chip size="sm" selectedIcon={false} selected={() => treeFields().includes(f)} onClick={() => toggleField(f)}>{label}</Chip>)}
      <span class="sc-deps-sep" aria-hidden="true" />
      <Chip size="sm" selectedIcon={false} selected={() => treeOrigin() === "march"} onClick={() => treeOrigin.set(treeOrigin.peek() === "march" ? "all" : "march")}>March</Chip>
      <Chip size="sm" selectedIcon={false} selected={() => treeOrigin() === "own"} onClick={() => treeOrigin.set(treeOrigin.peek() === "own" ? "all" : "own")}>Benim</Chip>
      <span class="sc-deps-sep" aria-hidden="true" />
      <Chip size="sm" selectedIcon={false} selected={() => treeFlat()} onClick={() => treeFlat.set(!treeFlat.peek())} title="Yalnız eşleşenler, düz liste">Düz</Chip>
      <span class="sc-deps-count" aria-live="polite">{() => { const [n, all] = hitCount(); return filtering() ? `${n}/${all}` : String(all) }}</span>
      {() => (filtering() ? <IconButton size="sm" variant="ghost" icon={xIcon} label="Süzgeci temizle" on:click={clearTree} /> : null)}
    </div>
  </div>
  {() => (shownTree().length
    ? <Tree nodes={shownTree()} toggle="chevron" expanded={allIds(shownTree())} selected={() => selectedId()} label="Hiyerarşi"
      onSelect={(n: { id: string }) => {
        const i = /#i(\d+)$/.exec(n.id), it = i ? liveTree.peek().find((x) => x.id === +i[1]!) : undefined
        if (it) { chooseInst(it); runtimeNow?.highlight(it.id) } else { selectedInst.set(null); pickedId.set(n.id); selected.set(labelOfId(n.id)) }
      }} />
    : <div class="sc-playground-empty"><b>{filtering() ? "Eşleşen yok" : "Hiyerarşi boş"}</b><span>{filtering() ? "Süzgeci gevşetin ya da temizleyin" : "Dışa aktarılan bileşen yok"}</span></div>)}
</div>

// Events: the callbacks a component exports (its on… props, from the API reference), each with a handler to try
// it: none, write to the Console, a toast, or a counter. The handler goes to the rendered component with its props
// (no build) and into the code under the preview. A component without callbacks says so.
// the API index in the page's language (its summaries and the common props' texts); the docs files are shared
const indexP = new Map<string, Promise<MarchCatalog>>()
const apiIndex = (): Promise<MarchCatalog> => {
  const lang = untrack(pageLang)
  let p = indexP.get(lang)
  if (!p) indexP.set(lang, (p = fetch(appUrl(`api/index.${lang}.json`)).then((r) => r.json() as Promise<MarchCatalog>)))
  return p
}
effect(() => { pageLang(); void apiIndex().then((idx) => commonText.set(Object.fromEntries((idx as unknown as { common?: [string, string][] }).common ?? []))) })
const chunks = new Map<number, Promise<Record<string, { props?: ApiProp[] }>>>()
const eventsBy = signal<Record<string, ApiProp[]>>({})
/** A March component's props as the API reference has them (its name as March exports it), fetched once. */
async function apiProps(api: string): Promise<ApiProp[]> {
  const idx = await apiIndex() as unknown as { subpaths: { subpath: string; items: [string, string, string, string, number][] }[] }
  let found: { key: string; chunk: number } | null = null
  for (const sp of idx.subpaths) for (const it of sp.items) if (it[0] === api && it[1] === "component" && (!found || sp.subpath === "march/ui")) found = { key: `${sp.subpath}#${api}`, chunk: it[4] }
  if (!found) return []
  const { key, chunk } = found
  if (!chunks.has(chunk)) chunks.set(chunk, fetch(appUrl(`api/docs-${chunk}.json`)).then((r) => r.json()))
  return (await chunks.get(chunk)!)[key]?.props ?? []
}
/** The code editor's props of a tag (its list inside `<Button …>` and the pointer's rest on a prop): the file's own
 * component's, else March's, each with its type and its text in the page's language. */
/** A prop typed as an icon (IconType, March's IconProp): the editor's icon list in its quotes, whatever its name. */
const ICON_TYPE = /\bIcon(Type|Prop)\b/
const editorProps = async (name: string): Promise<OwnProp[]> => {
  await ensureOptions(name)
  const tr = untrack(pageLang) === "tr"
  const api = new Map((untrack(localComps)[name]?.props ?? untrack(apiPropsBy)[name] ?? []).map((p) => [p.name, p] as const))
  const textOf = (p: ApiProp | undefined): string => plain((tr && p?.tr) || p?.doc || "")
  const out: OwnProp[] = [], seen = new Set<string>()
  // the Properties panel's options, in its order: March's (the card's, the API's, the extensions'), the common ones
  // (m:…), the HTML and accessibility attributes; each with its values and its text
  for (const o of untrack(() => optsOf(name))) {
    if (o.key.startsWith("sx:")) continue
    const prop = String(o.prop || o.key).replace(/^(html|a11y|api|mp|ext:[^:]+):/, "")
    if (!prop || prop === "data" || prop === "children" || seen.has(prop)) continue
    seen.add(prop)
    const group = /^(html|a11y):/.test(o.key) ? "HTML" : o.key.startsWith("mp:") ? "Ortak" : "March"
    const a = api.get(prop)
    // an attribute's words (dir, loading…) only for the attribute: March's own `loading` is a yes / no
    const set = valuesOf.get(o.key) ?? (group === "March" ? undefined : ATTR_VALUES[prop])
    const values = (o.options ?? []).map((x) => String(typeof x === "object" ? x.value : x)).filter((x) => x !== "")
    const words = values.length ? values : [...(set?.list ?? [])]
    const write: OwnProp["write"] = isIcon(o) ? "code" : typeof o.default === "boolean" || BOOL_ATTRS.has(prop) || COMMON_BOOL.has(prop) ? "bare"
      : typeof o.default === "number" || o.default === null ? "code" : "text"
    out.push({ name: prop, group, write, ...(isIcon(o) || ICON_TYPE.test(a?.type ?? "") ? { icon: true } : {}), ...(a?.type ? { type: a.type } : {}), ...(words.length ? { values: words } : {}),
      doc: untrack(() => describeProp(name, o)) || textOf(a) })
  }
  // the rest the component takes (events, children…): March's too, written as code
  for (const a of api.values()) if (!seen.has(a.name) && a.name !== "children") { seen.add(a.name); out.push({ name: a.name, type: a.type, doc: textOf(a), group: "March", ...(/^on[A-Z]/.test(a.name) ? { write: "code" as const } : /icon/i.test(a.name) || ICON_TYPE.test(a.type ?? "") ? { write: "code" as const, icon: true } : {}) }) }
  // the directives every tag takes: sx, class, style, ref and the DOM events (on:click…)
  for (const p of CORE_PROPS) if (!seen.has(p.name)) out.push(p)
  return out
}
/** A component's options and API props, loaded once (the Properties panel loads them for the components on screen; the
 * code editor asks for any tag it is in). */
async function ensureOptions(name: string): Promise<void> {
  if (!untrack(optionsBy)[name]) {
    const entry = metaOf(name)
    if (!entry || untrack(localComps)[name]) optionsBy.set({ ...optionsBy.peek(), [name]: [] })
    else {
      const m = await entry.playground()
      const list = (m.default as { options: readonly PlaygroundOption[] }).options.filter((o) => o.prop !== false)
      if (!optionsBy.peek()[name]) optionsBy.set({ ...optionsBy.peek(), [name]: list })
      if (!valuesBy.peek()[name]) valuesBy.set({ ...valuesBy.peek(), [name]: Object.fromEntries(list.map((o) => [o.key, defaultOf(o)])) })
    }
  }
  if (!(name in untrack(apiPropsBy))) await loadEvents(name)
}
/** A component under the pointer in the code editor: the file's own (no summary), else March's from the API index
 * (its subpath and its summary in the page's language); null for a name that is no component. */
const editorComponent = async (name: string): Promise<{ sub?: string; summary?: string } | null> => {
  if (untrack(localComps)[name]) return { summary: "Bu dosyanın bileşeni." }
  const idx = await apiIndex() as unknown as { subpaths: { subpath: string; items: [string, string, string?][] }[] }
  let hit: { sub: string; summary?: string } | null = null
  for (const sp of idx.subpaths) for (const it of sp.items) if (it[0] === name && it[1] === "component" && (!hit || sp.subpath === "march/ui")) hit = { sub: sp.subpath, ...(it[2] ? { summary: plain(it[2]) } : {}) }
  // a whole sentence reads better than the index's short line: in Turkish the components page's (topics.ts), else the
  // component's own summary (its meta, as written: braces in it are code, not placeholders)
  const topic = Object.values(HUBS).flat().find((x) => x.name === name)
  const own = untrack(pageLang) === "tr" && topic?.desc ? topic.desc : registry.find((e) => e.meta.name === name)?.meta.summary
  if (hit && own) hit.summary = own
  return hit
}
async function loadEvents(name: string): Promise<void> {
  const all = await apiProps(rootTag(name) ?? name)
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
const writeConst = (d: DataItem, text: string): void => { const f = files.get(active()); if (!f) return; const src = f.peek(); if (src.slice(d.from, d.to) === d.init) { f.set(src.slice(0, d.from) + text + src.slice(d.to)); saveFiles(active()) } }
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
/** A node in the Console (a table). */
const printNode = (node: unknown) => { if (consoleApi) consoleApi.print(node); else waiting.push([node as string, {}]) }
const builder = createBuilder(print)
const stamp = () => new Date().toLocaleTimeString("tr-TR", { hour12: false })
// a console call's arguments as the Console writes them: a text as it is, an error with its message, the rest as JSON
const CONSOLE_TONE: Record<string, Tone | undefined> = { log: undefined, debug: "muted", info: "info", warn: "warn", error: "error" }
/** One console event of the preview's code in the Console: a line (indented by its group), a table, a clear. */
const showConsole = (e: ConsoleEvent): void => {
  if (e.kind === "clear") { consoleApi?.clear(); print(`[${stamp()}] Konsol temizlendi (console.clear)`, "muted"); return }
  if (e.kind === "error" && e.uncaught) showRunError(e.args[0])
  const pad = "  ".repeat(e.depth)
  if (e.kind === "table") { print(`${pad}[${stamp()}] console.table`, "muted"); printNode(consoleTable(e.data, e.columns)); return }
  print(`${pad}[${stamp()}] ${e.args.map(consoleText).join(" ")}`.replace(/\n/g, `\n${pad}`), CONSOLE_TONE[e.kind])
}
/** console.table's data as a table: a row per item (an array's index, an object's key), a column per key (or "Değer"). */
const consoleTable = (data: unknown, only?: readonly string[]): HTMLElement => {
  const rows: [string, unknown][] = Array.isArray(data) ? data.map((v, i) => [String(i), v]) : data && typeof data === "object" ? Object.entries(data as Record<string, unknown>) : [["0", data]]
  const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v)
  const keys = only ?? [...new Set(rows.flatMap(([, v]) => (isObj(v) ? Object.keys(v) : Array.isArray(v) ? v.map((_, i) => String(i)) : [])))]
  const plain = rows.some(([, v]) => !isObj(v) && !Array.isArray(v))
  const cell = (v: unknown, k: string): string => (isObj(v) || Array.isArray(v) ? (k in (v as object) ? consoleText((v as Record<string, unknown>)[k]) : "") : "")
  const table = <table class="sc-console-table">
    <thead><tr><th>(indeks)</th>{keys.map((k) => <th>{k}</th>)}{plain ? <th>Değer</th> : null}</tr></thead>
    <tbody>{rows.slice(0, 200).map(([i, v]) => <tr><th>{i}</th>{keys.map((k) => <td>{cell(v, k)}</td>)}{plain ? <td>{isObj(v) || Array.isArray(v) ? "" : consoleText(v)}</td> : null}</tr>)}</tbody>
  </table>
  return table as HTMLElement
}
const consoleText = (v: unknown): string => {
  if (typeof v === "string") return v
  if (v instanceof Error) return `${v.name}: ${v.message}`
  if (typeof v === "function") return `ƒ ${v.name || "anonim"}()`
  if (v instanceof Node) return `<${(v as Element).tagName?.toLowerCase() ?? v.nodeName}>`
  try { const j = JSON.stringify(v, (_k, x) => (typeof x === "bigint" ? `${x}n` : x)); return j === undefined ? String(v) : j.length > 500 ? `${j.slice(0, 499)}…` : j } catch { return String(v) }
}
/** The build the preview drew last: its files open in a dialog (the Console's button, the Terminal's `output`). */
const lastBuild = signal<BuildResult | null>(null)
/** The file the last build was made from (its languages go with it); the workspace's id (the page it came from). */
const builtFile = signal("")
const workspaceId = signal("")
// Debug (the default): the build says where each thing is written (data-m-src, signal names, a source map) for the
// tools: Alt+click, the inspector, error places. Release: nothing of the files' names or places, minified, no debugger
const BUILD_MODE_KEY = "sc.playground.buildMode"
const buildMode = signal<"debug" | "release">((() => { try { return localStorage.getItem(BUILD_MODE_KEY) === "release" ? "release" : "debug" } catch { return "debug" } })())
const setBuildMode = (m: "debug" | "release"): void => {
  if (m === untrack(buildMode)) return
  buildMode.set(m)
  try { localStorage.setItem(BUILD_MODE_KEY, m) } catch { /* private mode */ }
  print(`[${stamp()}] ${m === "release" ? "📦 Release: dosya adı, kaynak yeri ve hata ayıklama bilgisi yok; küçültülmüş. Alt+tık, Tepki adları ve hata satırları çalışmaz." : "🐞 Debug: kaynak yerleri ve adlar derlemede (araçlar için)."}`, "info")
  scheduleBuild(0)
}
// the Bundle tab: the last build minified and gzipped (each file's share from its metafile), the code's March imports
// with each component's size alone (export-sizes.json, fetched once)
const bundleOwn = signal<{ min: number; gzip: number; files: [string, number][] } | null>(null)
const measureBundle = async (r: BuildResult): Promise<void> => {
  try {
    const min = await builder.minify(r.code)
    const gz = typeof CompressionStream === "function" ? (await new Response(new Blob([min]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer()).byteLength : Math.round(min.length / 3)
    const own = Object.entries(r.inputs ?? {}).filter(([f]) => files.has(f)).sort((a, b) => b[1] - a[1])
    bundleOwn.set({ min: new Blob([min]).size, gzip: gz, files: own })
  } catch { /* the size is only shown */ }
}
let sizesP: Promise<ExportSizes | null> | null = null
const exportSizes = signal<ExportSizes | null>(null)
const loadSizes = (): void => { sizesP ??= fetch(appUrl("export-sizes.json")).then((x) => (x.ok ? x.json() as Promise<ExportSizes> : null)).catch(() => null).then((s) => { exportSizes.set(s); return s }) }
// the March imports of the files the last build bundled (not every tab)
const bundleImports = computed((): MarchImport[] => marchImports((bundleOwn()?.files ?? []).map(([f]) => saved.get(f)?.() ?? "")))
/** What the last build was made of (the export builds it again in the chosen mode). */
let lastInputs: Record<string, string> | null = null
const showOutput = async (): Promise<boolean> => {
  if (!untrack(lastBuild) || !lastInputs) return false
  // the exported page's build: the same as the preview's (i18n: its languages are March's messages), in the chosen mode
  const b = await builder.build(lastInputs, ENTRY, { release: untrack(buildMode) === "release" })
  if (!b?.ok) return false
  await openBuildOutput({ build: b, name: (untrack(builtFile) || untrack(active)).replace(/\.[jt]sx?$/, ""), entry: ENTRY, js: builder.js,
    release: untrack(buildMode) === "release", minify: builder.minify,
    // every language added in lang.json, as its file (the texts not translated yet keep the code's own)
    languages: untrack(() => Object.fromEntries(Object.keys(langs()).map((c) => [c, langFile(c)]))) })
  return true
}
// the Console shows one build: its output, and (the globe) its languages: the texts it found and their translations
const consoleLangs = signal(false)
const consolePanel = () => <div class="sc-console-box" class:is-langs={consoleLangs()}>
  <Terminal readonly scheme="dark" height="100%" label="Derleme çıktısı" class="sc-console"
    ref={(api: TerminalApi) => { consoleApi = api; for (const [t, o] of waiting.splice(0)) api.print(t, o) }} />
  {() => (consoleLangs() ? <div class="sc-console-langs">{langPanel()}</div> : null)}
  <div class="sc-console-tools">
    <Segmented size="sm" class="sc-build-mode" aria-label="Derleme türü" value={buildMode()} onChange={(v: unknown) => setBuildMode(v === "release" ? "release" : "debug")}
      options={[{ value: "debug", label: "Debug", hint: "Kaynak yerleri ve adlar derlemede: Alt+tık, Tepki, hata satırları" }, { value: "release", label: "Release", hint: "Dosya adı, kaynak yeri, hata ayıklama bilgisi yok; küçültülmüş" }]} />
    <IconButton icon={globe} size="sm" variant="raised" pressed={consoleLangs()} disabled={!lastBuild()}
      label={consoleLangs() ? "Derleme çıktısına dön" : "Son derlemenin dilleri"} onClick={() => consoleLangs.set(!consoleLangs())} />
    <Button size="xs" variant="secondary" icon={history} class="sc-console-out" disabled={() => !lastBuild()} onClick={() => void showOutput()}>Son derlemeyi göster</Button>
  </div>
</div>
// Terminal: the playground's command line (no shell: March is built here in the browser and exported, never
// installed from npm). Its commands work on the component in work (props, events, the preview's language and theme,
// a build, an accessibility check, the size of the build); a line that names no command is JavaScript, run in the
// running preview with the file's signals in scope (count.set(3)), $el (the chosen component's element) and $props.
/** Build the file in front now (its kept result is not used); the steps go to the Console. */
// the Tests tab: each test file built with the workspace's other files (its imports: "./ButtonLab.tsx") and run in the
// preview's runtime; after every save (when there is one) and on its button
const testRuns = signal<TestRun[] | null>(null)
const testsRunning = signal(false)
let testsAgain = false
const runAllTests = async (): Promise<void> => {
  if (testsRunning.peek()) { testsAgain = true; return }
  const names = [...files.keys()].filter(isTestFile)
  if (!names.length) { testRuns.set([]); return }
  testsRunning.set(true)
  try {
    const rt = await loadRuntime(), runs: TestRun[] = []
    const all = Object.fromEntries([...files.keys()].map((n) => [n, forBuild(saved.get(n)?.peek() ?? files.get(n)?.peek() ?? "")]))
    for (const file of names) {
      const b = await builder.build(all, file)
      if (!b?.ok) { runs.push({ file, error: "Derlenemedi: ayrıntı Konsol'da.", results: [] }); continue }
      const sm = b.map ? parseSourceMap(b.map) : null
      const results = await rt.runTests(b.code).catch((e: unknown) => { runs.push({ file, error: String((e as Error)?.message ?? e), results: [] }); return null })
      if (!results) continue
      runs.push({ file, results: results.map((t) => {
        const f = t.error ? blobFrames(t.error.stack).map((x) => (sm ? originalAt(sm, x.line, x.column) : null)).find((o) => o && files.has(o.source.replace(/^files:/, ""))) : null
        return { name: t.name, ok: t.ok, ms: t.ms, ...(t.error ? { message: t.error.message } : {}), ...(f ? { at: { file: f.source.replace(/^files:/, ""), line: f.line } } : {}) }
      }) })
    }
    testRuns.set(runs)
    const bad = runs.reduce((n, r) => n + r.results.filter((t) => !t.ok).length + (r.error ? 1 : 0), 0), count = runs.reduce((n, r) => n + r.results.length, 0)
    print(`[${stamp()}] 🧪 Testler: ${count - runs.reduce((n, r) => n + r.results.filter((t) => !t.ok).length, 0)} geçti${bad ? `, ${bad} kaldı` : ""}`, bad ? "error" : "success")
  } finally {
    testsRunning.set(false)
    if (testsAgain) { testsAgain = false; void runAllTests() }
  }
}
const buildNow = async () => {
  const path = untrack(active)
  // a test file in front: its tests run (the preview keeps what it shows)
  if (isTestFile(path)) { await runAllTests(); dock?.open("tests"); return null }
  // the saved text: what is typed and not saved yet is not built
  let src = untrack(() => forBuild(saved.get(path)?.() ?? files.get(path)?.() ?? ""))
  // debugging: the file with the debugger's calls written in (the session starts for it); its line numbers stay
  const dbg = untrack(debugSvc), release = untrack(buildMode) === "release"
  if (dbg && untrack(dbg.active) && !release) {
    try { src = (await dbg.prepare({ [path]: src }))[path] ?? src; print(`[${stamp()}] 🐞 ${path} hata ayıklama için hazırlandı`, "info") }
    catch (e) { print(`[${stamp()}] ✖ Hata ayıklama hazırlanamadı: ${String((e as Error)?.message ?? e)}`, "error") }
  }
  const now = untrack(() => ({ [path]: withData(src), [ENTRY]: entrySource() }))
  lastInputs = now
  const r = await builder.build(now, ENTRY, { release })
  if (r?.ok) { batch(() => { lastBuild.set(r); builtFile.set(path) }); void measureBundle(r); await render(r.code) }
  if ([...files.keys()].some(isTestFile)) void runAllTests()
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
  select: { desc: "Hiyerarşiden bir bileşen seç", args: [{ name: "bileşen", get choices() { return inTree() } }], run: (a, io) => {
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
  output: { desc: "Son derlemenin dosyalarını aç: klasörler, derlenmiş kod, zip olarak indir", run: async (_a, io) => {
    if (await showOutput()) io.success("Son derleme açıldı"); else io.warn("Henüz derleme yok")
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
// the texts of the last build (not a test file's: those builds do not count), and the languages of that build: kept per
// workspace and built file, so another tab's build shows its own (a file's languages follow it, not one shared list)
const langJson = () => Object.fromEntries((lastBuild()?.texts ?? []).map((k) => [k, k]))
const LANGS_KEY = "sc.playground.langs.v2"
type LangSet = Record<string, Record<string, string>>
const readLangStore = (): Record<string, LangSet> => { try { return JSON.parse(localStorage.getItem(LANGS_KEY) ?? "{}") as Record<string, LangSet> } catch { return {} } }
const langStore = signal<Record<string, LangSet>>(readLangStore())
/** The build the languages belong to: "<workspace>|<file>". */
const buildKey = (): string => `${workspaceId()}|${builtFile()}`
const langs = computed((): LangSet => langStore()[buildKey()] ?? {})
/** A language's translations with `next` laid over them: a text no longer in the code keeps its translation (it comes
 *  back with the text), so editing or a new build never loses one. */
const mergeLang = (code: string, next: Record<string, string>): LangSet => ({ ...untrack(langs), [code]: { ...(untrack(langs)[code] ?? {}), ...next } })
const saveLangs = (v: LangSet): void => {
  const all = { ...untrack(langStore) }, k = untrack(buildKey)
  if (Object.keys(v).length) all[k] = v; else delete all[k]
  langStore.set(all)
  try { localStorage.setItem(LANGS_KEY, JSON.stringify(all)) } catch { /* private mode */ }
}
/** A language's file: every key of the code, its own translations kept (a new text starts as itself). */
const langFile = (code: string): Record<string, string> => { const own = langs()[code] ?? {}; return Object.fromEntries(Object.entries(langJson()).map(([k, v]) => [k, own[k] ?? v])) }
const langShown = signal("")
const previewLang = signal("")
// the first language shown: the browser's when this build has a file for it ("de-at" → de-at, else de), else the code's
// own. A language picked by hand stays while the build is the same; another build (another tab) starts over.
const BROWSER_LANG = (globalThis.navigator?.language ?? "").toLowerCase()
let autoLang = "", langFor = ""
effect(() => {
  const l = langs(), key = buildKey()
  untrack(() => {
    if (key === langFor && previewLang() !== autoLang) return
    langFor = key
    const base = BROWSER_LANG.split("-")[0] ?? ""
    autoLang = l[BROWSER_LANG] ? BROWSER_LANG : base && l[base] ? base : ""
    previewLang.set(autoLang)
  })
})
/** A language's name in itself ("English", "Türkçe"); the code when the browser does not know it. */
const langName = (code: string): string => { try { const n = new Intl.DisplayNames([code], { type: "language" }).of(code); return n && n !== code ? n.charAt(0).toLocaleUpperCase(code) + n.slice(1) : code } catch { return code } }
const languageList = () => [{ value: "", label: "Varsayılan Dil" }, ...Object.keys(langs()).sort().map((c) => ({ value: c, label: `${langName(c)}: ${c}` }))]
let addCode = ""
const LANG_CODE = /^[a-z]{2,3}(-[a-z0-9]{2,8})*$/
const addLang = (given = addCode): void => {
  const code = given.trim().toLowerCase()
  if (!LANG_CODE.test(code)) { toast("Dil kodu: tr, en, de, pt-br gibi"); return }
  if (langs()[code]) { langShown.set(code); return }
  saveLangs({ ...langs(), [code]: langFile(langShown()) })
  langShown.set(code)
  print(`[${stamp()}] + ${langName(code)}: ${code} eklendi (kopyalanan: ${langShown() ? langShown() : "Varsayılan Dil"})`, "success")
}
// languages made by the AI: the user lists them ("en, de, Japonca…"), each one is the default texts translated by the
// user's own AI (its default provider and model), one request per language; the keys and {0} placeholders are kept
let aiSvc: AiService | null = null
let aiLangText = ""
const aiLangBusy = signal("")
const parseJsonReply = (text: string): unknown => {
  const m = /```(?:json)?\s*([\s\S]*?)```/.exec(text), body = (m ? m[1]! : text).trim()
  const a = body.indexOf("{"), b = body.lastIndexOf("}")
  return JSON.parse(a >= 0 && b > a ? body.slice(a, b + 1) : body)
}
const addLangsWithAi = async (given = aiLangText): Promise<void> => {
  const asked = given.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean)
  if (!asked.length) { toast("Hangi diller? Kodlarını ya da adlarını yaz: en, de, Japonca…"); return }
  if (!aiSvc) { toast("AI eklentisi yok"); return }
  const cur = await aiSvc.current().catch(() => "locked" as const)
  if (cur === "locked" || cur === "none") { toast(cur === "locked" ? "Önce AI anahtarları sekmesinde kasayı aç" : "Önce bir AI anahtarı ekle"); aiSvc.openKeys(); return }
  const source = langJson(), keys = Object.keys(source)
  if (!keys.length) { toast("Çevrilecek metin yok: önce kodu derle"); return }
  let made = 0
  for (const [i, want] of asked.entries()) {
    aiLangBusy.set(`${want} (${i + 1}/${asked.length}) · ${cur.name}`)
    try {
      const r = await aiSvc.chat({
        maxTokens: 16_000, temperature: 0.2,
        system: "You translate the user interface texts of an app. Reply with only one JSON object, nothing else.",
        messages: [{ role: "user", content: `Translate the values of this JSON (the texts of an app's interface) into: ${want}.
Reply with only a JSON object: {"code": "<the BCP 47 code of that language, lowercase, e.g. en, de, pt-br>", "texts": {<the same keys>: <the translated text>}}.
Keep every key exactly as it is. Keep {0}, {1}… placeholders, HTML-like tags and emoji as they are. Short, natural interface wording.

${JSON.stringify(source, null, 1)}` }],
      })
      const out = parseJsonReply(r.text) as { code?: string; texts?: Record<string, unknown> }
      const code = String(out.code ?? "").trim().toLowerCase()
      if (!LANG_CODE.test(code) || !out.texts || typeof out.texts !== "object") throw new Error("yanıt beklenen biçimde değil")
      // every key of the code: a text the AI left out keeps the default
      const file = Object.fromEntries(keys.map((k) => [k, typeof out.texts![k] === "string" && (out.texts![k] as string).trim() ? out.texts![k] as string : source[k]!]))
      const missing = keys.filter((k) => file[k] === source[k] && typeof out.texts![k] !== "string").length
      saveLangs(mergeLang(code, file))
      langShown.set(code)
      made++
      print(`[${stamp()}] ✨ ${langName(code)}: ${code} AI ile oluşturuldu (${keys.length - missing}/${keys.length} metin · ↑${r.usage.input} ↓${r.usage.output} token)`, "success")
    } catch (e) {
      print(`[${stamp()}] ✖ ${want}: AI ile oluşturulamadı: ${String((e as Error)?.message ?? e)}`, "error")
    }
  }
  aiLangBusy.set("")
  toast(made ? `${made} dil AI ile oluşturuldu` : "Dil oluşturulamadı: ayrıntı Konsol'da")
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
  <p class="sc-lang-of">{() => (builtFile() ? <><b>{builtFile()}</b> derlemesinin dilleri · {Object.keys(langJson()).length} metin</> : "Henüz derleme yok")}</p>
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
        <span class="sc-lang-new-hint">{() => `${langShown() ? `${langName(langShown())}: ${langShown()}` : "Varsayılan Dil"} kopyalanır`}</span>
        <div class="sc-lang-new-row">
          <TextInput aria-label="Yeni dilin kodu" placeholder="tr, en, de…" onChange={(v: string) => { addCode = v }} onKeyDown={(e: KeyboardEvent) => { if (e.key === "Enter") { addLang(); close() } }} />
          <Button size="sm" variant="primary" on:click={() => { addLang(); close() }}>Ekle</Button>
        </div>
        <div class="sc-lang-new-ai">
          <span class="sc-lang-new-hint">AI ile dil ekle: istediğin dilleri yaz, her biri varsayılan metinlerden çevrilir (kendi AI anahtarınla)</span>
          <div class="sc-lang-new-row">
            <TextInput aria-label="AI ile oluşturulacak diller" placeholder="en, de, fr, Japonca…" onChange={(v: string) => { aiLangText = v }} onKeyDown={(e: KeyboardEvent) => { if (e.key === "Enter") { close(); void addLangsWithAi() } }} />
            <Button size="sm" variant="primary" icon={sparkles} disabled={() => !!aiLangBusy()} on:click={() => { close(); void addLangsWithAi() }}>Oluştur</Button>
          </div>
        </div>
      </div>}
    </Dropdown>
  </div>
  {() => (aiLangBusy() ? <p class="sc-lang-busy" role="status"><Spinner size="sm" /> AI çeviriyor: {aiLangBusy()}</p> : null)}
  {() => { const code = langShown(); return untrack(() => (code
    ? <JsonEditor value={langFile(code)} onChange={(v: unknown) => { if (v && typeof v === "object") saveLangs(mergeLang(code, v as Record<string, string>)) }} aria-label={`${code}.json`} />
    : <JsonView value={langJson} open={2} label="Varsayılan metinler" />)) }}
</div>

// the preview (AppPreview): its toolbar sets the preview's own theme, accent and light / dark; each successful build's
// PreviewControl is rendered in the middle of its stage by the preview runtime (playground/preview.js, loaded once)
let previewEl: HTMLElement | null = null
type Parts = Record<string, Record<string, unknown>>
let tsSvc: TypeScriptService | null = null
type Runtime = { extensionInfo(names: readonly string[]): ExtInfo; setHost(host: { instrument?: (files: Record<string, string>) => Promise<{ files: Record<string, string>; metas: unknown[] }> }): void; untrack<T>(fn: () => T): T; evaluate(line: string, scope?: Record<string, unknown>): Promise<unknown>; run(code: string, el: HTMLElement, props?: Record<string, Record<string, unknown>>, parts?: Record<string, Parts>): Promise<string[]>; setProps(props: Record<string, Record<string, unknown>>, parts?: Record<string, Parts>): void; stop(): void; onData(cb: (values: Record<string, unknown>) => void): void; setData(name: string, value: unknown): void; setLanguage(code: string | null, dict: Record<string, string> | null): void; onTree(cb: () => void): void; onConsole(cb: (e: ConsoleEvent) => void): void; sourceAt(node: Node | null): { file: string; line: number } | null; onProbes(cb: (p: Probe[], dom: [string, number][]) => void, root: Element): void; resetProbes(): void; runTests(code: string): Promise<TestResult[]>; elementsAt(root: Element, file: string, line: number): Element[]; componentTree(): LiveItem[]; highlight(id: number): void; instanceAt(node: Node | null): number; setInstanceProps(map: Record<string, Record<string, unknown>>): void }
let runtime: Promise<Runtime> | null = null, runtimeNow: Runtime | null = null
const loadRuntime = () => (runtime ??= (async () => {
  // its components' stylesheet, once
  const link = document.createElement("link")
  link.rel = "stylesheet"; link.href = appUrl("playground/preview.css")
  document.head.append(link)
  // a big module: fetched and run in a free moment, not in the middle of the page's first paints
  await idle(800)
  const r = await import(/* @vite-ignore */ appUrl("playground/preview.js")) as Runtime
  r.onData((values) => liveData.set(values))
  r.onTree(() => liveTree.set(r.componentTree()))
  // the code's console.log / warn / error… in the Console, each with its time
  r.onConsole(showConsole)
  // import { instrument, run } from "march/playground": the code's own debugging, with the page's TypeScript worker
  r.setHost({ instrument: (files) => (tsSvc ? tsSvc.instrument(files) : Promise.reject(new Error("TypeScript yok"))) })
  runtimeNow = r
  // the language already chosen (the browser's, picked before the runtime was there)
  untrack(() => { const code = previewLang(); r.setLanguage(code || null, code ? langFile(code) : null) })
  return r
})())
/** What the code's extensions are and did (the Extensions tab, Properties, suggestions): read from the preview's March. */
const readExtensions = (): void => { if (runtimeNow) extInfo.set(runtimeNow.extensionInfo(untrack(inTree))) }
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
  // what takes focus in the preview is chosen in the Hierarchy (and its Properties show)
  el.addEventListener("focusin", (e) => {
    const r = runtimeNow, id = r?.instanceAt(e.target as Node)
    if (!r || !id) return
    readTree()
    const it = untrack(liveTree).find((x) => x.id === id)
    if (it) { chooseInst(it); revealRow() }
  })
  // Alt+click on what the preview draws: the line of the code that wrote it, in its file
  el.addEventListener("click", (e) => {
    if (!e.altKey) return
    const at = runtimeNow?.sourceAt(e.target as Node)
    if (!at || !files.has(at.file)) return
    e.preventDefault(); e.stopPropagation()
    goToLine(at.file, at.line)
  }, true)
  const code = pendingCode
  pendingCode = ""
  if (code) queueMicrotask(() => void render(code))
}
// the other way: the caret's line in the file in front outlines what that line draws in the preview
let litNow: Element[] = []
const outlineCaretLine = (): void => {
  const ta = document.activeElement
  const off = (): void => { for (const x of litNow) x.classList.remove("sc-src-lit"); litNow = [] }
  if (!(ta instanceof HTMLTextAreaElement) || !ta.classList.contains("m-ced-input") || !previewEl || !runtimeNow) return off()
  const file = active(), text = files.get(file)?.peek()
  if (text === undefined || ta.value !== text) return off()
  const line = ta.value.slice(0, ta.selectionStart ?? 0).split("\n").length
  const next = runtimeNow.elementsAt(previewEl, file, line)
  if (next.length === litNow.length && next.every((x, i) => x === litNow[i])) return
  off(); litNow = next
  for (const x of next) x.classList.add("sc-src-lit")
}
document.addEventListener("selectionchange", outlineCaretLine)
// an error the preview's code throws (as it runs, or later: an event handler, a promise): a box over the preview with
// the message and the code's places it came through (the bundle's stack mapped back by the build's source map); a place
// opens its file at that line. The next good run takes the box away.
const pvError = signal<{ title: string; frames: { file: string; line: number; fn: string }[] } | null>(null)
let mapFor: { build: unknown; map: SourceMap | null } | null = null
const showRunError = (err: unknown): void => {
  const e = err as Error | undefined, b = untrack(lastBuild)
  if (b && mapFor?.build !== b) mapFor = { build: b, map: b.map ? parseSourceMap(b.map) : null }
  const sm = mapFor?.map ?? null, seen = new Set<string>()
  const frames = blobFrames(String(e?.stack ?? "")).flatMap((f) => {
    const o = sm ? originalAt(sm, f.line, f.column) : null
    const file = o?.source.replace(/^files:/, "")
    if (!o || !file || !files.has(file) || seen.has(`${file}:${o.line}`)) return []
    seen.add(`${file}:${o.line}`)
    return [{ file, line: o.line, fn: f.fn }]
  }).slice(0, 6)
  pvError.set({ title: e instanceof Error ? `${e.name}: ${e.message}` : String(err), frames })
}
/** A place of the error: its file in front, the caret at the line's start. */
const goToLine = (file: string, line: number): void => {
  const text = files.get(file)?.peek() ?? "", lines = text.split("\n")
  let at = 0; for (let i = 0; i < line - 1 && i < lines.length; i++) at += lines[i]!.length + 1
  debugTab(file); goTo.set({ ...goTo.peek(), [file]: { from: at, to: at + (lines[line - 1]?.length ?? 0) } })
}
const errorBox = () => (pvError()
  ? <div class="sc-pv-error" role="alert">
      <div class="sc-pv-error-head"><b>Çalışma hatası</b><IconButton icon={xIcon} size="sm" variant="ghost" label="Kapat" onClick={() => pvError.set(null)} /></div>
      <pre class="sc-pv-error-msg">{pvError()!.title}</pre>
      {pvError()!.frames.length
        ? <ul class="sc-pv-error-frames">{pvError()!.frames.map((f) => <li><button type="button" on:click={() => goToLine(f.file, f.line)}>
            <span class="sc-pv-error-at">{`${f.file}:${f.line}`}</span>{f.fn ? <span class="m-muted">{f.fn}</span> : null}
          </button></li>)}</ul>
        : <p class="m-muted">Hatanın kodda geçtiği yer bulunamadı; ayrıntı Konsol'da.</p>}
    </div>
  : null)
// the Tepki tab: the code's signals, effects and computeds counted, the DOM updates by line (the preview runtime's probes)
const reactRows = signal<ReactRow[]>([])
const reactDom = signal<[string, number][]>([])
let probing: HTMLElement | null = null
const watchReactivity = (r: Runtime, root: HTMLElement): void => {
  if (probing === root) return
  probing = root
  r.onProbes((list, dom) => {
    const b = untrack(lastBuild)
    if (b && mapFor?.build !== b) mapFor = { build: b, map: b.map ? parseSourceMap(b.map) : null }
    const now = performance.now()
    reactRows.set(list.map((p): ReactRow => {
      const named = p.kind === "signal" ? parseProbeName(p.name) : null
      const o = !named && p.at && mapFor?.map ? originalAt(mapFor.map, p.at.line, p.at.column) : null
      const file = named?.file ?? o?.source.replace(/^files:/, ""), line = named?.line ?? o?.line
      return { kind: p.kind, name: named?.name ?? p.kind, ...(file ? { file } : {}), ...(line ? { line } : {}), count: p.count, ...(p.value !== undefined || p.kind === "signal" ? { value: consoleText(p.value) } : {}), recent: now - p.last < 900 }
    }))
    reactDom.set(dom)
  }, root)
}
// MarchIDE's loading layer: the page whose files were just taken is ready once its tabs are in the workspace (the
// preview is drawn after, on its own)
let readyCb: ((id: string) => void) | undefined, readyFor: string | null = null
const markReady = (): void => { const id = readyFor; if (id === null) return; readyFor = null; readyCb?.(id) }
async function render(code: string): Promise<void> {
  if (!previewEl) { pendingCode = code; return }
  lastCode = code
  const t0 = performance.now()
  pvError.set(null)
  try {
    const rt = await loadRuntime()
    watchReactivity(rt, previewEl)
    // a March component exported as it is (export { IconButton }) is drawn with its options' values: they are there
    // first, or a required prop (IconButton's label) is missing on the first draw of a page
    await Promise.all(untrack(exportedNames).map(loadOptions))
    await rt.run(code, previewEl, untrack(rootProps), untrack(partsNow))
    readTag()
    readExtensions()
    print(`[${stamp()}] Önizleme çizildi · ${Math.round(performance.now() - t0)} ms`, "success")
  } catch (e) {
    print(`[${stamp()}] ✖ Çalışma hatası: ${String((e as Error)?.message ?? e)}`, "error")
    showRunError(e)
  }
}
// the preview's picture and recording (the browser asks to share the tab first; the file is saved, nothing is sent)
const recording = signal<{ stop(): void } | null>(null)
const pvBox = (): Element | null => previewEl?.closest(".m-app-pv-stage") ?? previewEl
const snap = async (): Promise<void> => {
  const el = pvBox(); if (!el) return
  if (!(await capturePicture(el, `${active().replace(/\.[^.]+$/, "")}-onizleme`))) print(`[${stamp()}] Ekran görüntüsü alınamadı (sekmeyi paylaşmaya izin verilmedi ya da tarayıcı desteklemiyor)`, "warn")
}
const toggleRecord = async (): Promise<void> => {
  const cur = recording.peek()
  if (cur) { cur.stop(); return }
  const el = pvBox(); if (!el) return
  const r = await startRecording(el, `${active().replace(/\.[^.]+$/, "")}-kayit`, () => recording.set(null))
  if (r) { recording.set(r); print(`[${stamp()}] ⏺ Önizleme kaydediliyor: durdurmak için kayıt düğmesine bas`, "info") }
  else print(`[${stamp()}] Kayıt başlatılamadı (sekmeyi paylaşmaya izin verilmedi ya da tarayıcı desteklemiyor)`, "warn")
}
const captureTools = () => <>
  <IconButton icon={image} size="sm" variant="ghost" label="Önizlemenin ekran görüntüsü (PNG)" onClick={() => void snap()} />
  <IconButton icon={video} size="sm" variant={() => (recording() ? "solid" : "ghost")} pressed={() => !!recording()} label={() => (recording() ? "Kaydı durdur ve kaydet (WebM)" : "Önizlemeyi kaydet (WebM)")} onClick={() => void toggleRecord()} />
</>
const preview = () => <AppPreview tools={captureTools()} toolbar={{ theme: true, accent: true, mode: true, language: true, fullscreen: true, device: true }} theme={previewTheme} mode={previewMode} language={previewLang} languages={languageList}>
  <div class="sc-pv-root" m:no-select ref={previewReady}>
    <div class="sc-playground-empty"><b>Önizleme</b><span>Derleniyor…</span></div>
  </div>
  {errorBox}
</AppPreview>

const PANELS: AppPanel[] = [
  { id: "preview", title: "Önizleme", icon: monitor, content: preview },
  // Canlı kod: the file in front, whole, with what Properties changed written in; the chosen component marked
  { id: "livecode", title: "Canlı kod", icon: braces, content: () => <div class="sc-livecode"><CodeView class="sc-pv-code" code={tsxCode} lang="tsx" copy wrap buttons="icon" label="Canlı kod" /></div> },
  { id: "props", title: "Özellikler", icon: sliders, disabled: () => !options().length, content: propsPanel },
  { id: "events", title: "Olaylar", icon: zap, content: eventsPanel },
  { id: "data", title: "Veriler", icon: database, content: dataPanel },
  { id: "deps", title: "Hiyerarşi", icon: layers, disabled: () => !depTree().length && !liveTree().length, content: depsPanel },
  { id: "a11y", title: "Erişilebilirlik", icon: users, content: a11yPanel },
  { id: "ext", title: "Askılar", icon: plug, content: () => <ExtensionsPanel info={extInfo} selected={selected} ownProps={(n) => exportedProps(n).map((p) => p.name)} refresh={readExtensions} /> },
  { id: "console", title: "Konsol", icon: code, content: consolePanel },
  { id: "tests", title: "Testler", icon: checkCircle, content: () => <TestsPanel runs={() => testRuns()} running={() => testsRunning()} run={() => void runAllTests()} go={goToLine} /> },
  { id: "react", title: "Tepki", icon: activity, content: () => <ReactivityPanel rows={() => reactRows()} dom={() => reactDom()} reset={() => runtimeNow?.resetProbes()} go={goToLine} /> },
  { id: "bundle", title: "Paket", icon: packageBox, onShow: loadSizes, content: () => { loadSizes(); return <BundlePanel own={() => bundleOwn()} imports={() => bundleImports()} sizes={() => exportSizes()} /> } },
  { id: "terminal", title: "Terminal", icon: terminal, content: terminalPanel, onShow: focusTerminal },
]
// the files' tabs: a live list. The layout stays on screen while MarchIDE moves between pages: the next ide.json's
// files replace the tabs (and MarchIDE loads nothing else)
const filePanels = signal<AppPanel[]>([])
// Problems: every open file's errors and warnings (the code editors report them); the tab is there only while there is
// one, beside the Console; a row opens its file and puts the caret on it
const problemsBy = signal<Record<string, readonly IdeProblem[]>>({})
const setProblems = (path: string, list: readonly CodeProblem[], text: string): void => {
  const rows = list.map((p): IdeProblem => ({ file: path, from: p.from, to: p.to, ...lineColOf(text, p.from), message: p.message, error: p.error, code: p.code }))
    .sort((a, b) => Number(b.error) - Number(a.error) || a.from - b.from)
  const cur = problemsBy.peek()
  if (!rows.length && !cur[path]) return
  const next = { ...cur }
  if (rows.length) next[path] = rows; else delete next[path]
  problemsBy.set(next)
}
const allProblems = computed((): IdeProblem[] => Object.values(problemsBy()).flat())
// the quick picks (Ctrl+P, Ctrl+Shift+O)
const pickFiles = signal(false)
const fileItems = (): PickItem<string>[] => Object.values(FILE_OF).map((name) => ({ label: name, hint: isDirty(name) ? "kaydedilmedi" : name === active() ? "önde" : "", value: name }))
// the kinds TypeScript names, as the list says them (a Map: "class" is a kind here, not a CSS class)
const SYMBOL_KIND = new Map<string, string>([["function", "işlev"], ["local function", "işlev"], ["const", "sabit"], ["let", "değişken"], ["var", "değişken"], ["class", "sınıf"], ["method", "metot"], ["property", "özellik"], ["interface", "arayüz"], ["type", "tür"], ["alias", "tür"], ["enum", "enum"], ["module", "modül"]])
const symbolItems = signal<PickItem<{ from: number; to: number }>[] | null>(null)
const openSymbols = async (): Promise<void> => {
  const f = active(), text = files.get(f)?.peek() ?? ""
  const list = tsSvc ? await tsSvc.symbols(f, text).catch(() => []) : []
  symbolItems.set(list.map((x) => ({ label: `${"  ".repeat(x.depth)}${x.name}`, hint: `${SYMBOL_KIND.get(x.kind) ?? x.kind} · ${lineColOf(text, x.from).line}`, value: { from: x.from, to: x.from + x.name.length } })))
}
const problemCount = computed(() => allProblems().length)
const goTo = signal<Record<string, { from: number; to?: number }>>({})
const pickProblem = (p: IdeProblem): void => { debugTab(p.file); goTo.set({ ...goTo.peek(), [p.file]: { from: p.from, to: p.to } }) }
const PROBLEMS: AppPanel = { id: "problems", title: "Problemler", icon: alertTriangle, badge: () => problemCount() || null, place: { near: "console" },
  content: () => <ProblemsPanel problems={() => allProblems()} onPick={pickProblem} /> }
const allPanels = computed((): AppPanel[] => {
  const at = PANELS.findIndex((p) => p.id === "console")
  return [...PANELS.slice(0, at), ...filePanels(), ...(problemCount() ? [PROBLEMS] : []), ...PANELS.slice(at)]
})
// each ide.json's tabs get new ids (f1-0, f1-1, then f2-0…): a file of the same name in the next one is a new tab with
// its own text, not the old one
let gen = 0
/** Takes an ide.json's files as the workspace's: one tab each, the first one in work. The old tabs leave in the same
 * step (none of them stays); the new ones open above the Console, where the files' group stands by default. */
// each page's code tab in front when it was left (page → file name): coming back opens that one, not the first
const TAB_KEY = "sc.playground.tabs"
const readTabs = (): Record<string, string> => { try { return JSON.parse(localStorage.getItem(TAB_KEY) ?? "{}") as Record<string, string> } catch { return {} } }
let switching = false // a page's tabs are coming in
let tabsOf = "" // the page whose files are the workspace's (its tab is remembered once they are shown)
effect(() => {
  const file = active(), page = tabsOf
  // a test file is not a page's code: coming back never opens it (nor the Tests tab it builds into)
  if (!page || !file || !files.has(file) || isTestFile(file)) return
  const all = readTabs()
  if (all[page] === file) return
  try { localStorage.setItem(TAB_KEY, JSON.stringify({ ...all, [page]: file })) } catch { /* private mode */ }
})
const useSources = (sources: readonly IdeSource[], page = ""): void => {
  // while the tabs change, nothing is remembered (the new files' tabs are not the old page's)
  tabsOf = ""; switching = true
  // another component: the Console starts empty (the last one's builds and logs are not this one's)
  waiting.length = 0
  consoleApi?.clear()
  const ids = sources.map((_, i) => `f${++gen}-${i}`)
  for (const name of [...files.keys()]) if (!sources.some((s) => s.name === name)) { files.delete(name); saved.delete(name) }
  for (const s of sources) { files.set(s.name, signal(s.code)); saved.set(s.name, signal(s.code)) }
  for (const k of Object.keys(FILE_OF)) delete FILE_OF[k]
  sources.forEach((s, i) => { FILE_OF[ids[i]!] = s.name })
  filePanels.set(sources.map((s, i): AppPanel => ({ ...fileTab(ids[i]!, s.name),
    place: i === 0 ? { near: "console", zone: "top", size: 0.7 } : { near: ids[0]! } })))
  // the page's last tab (if it still has that file), else its first
  const last = page ? readTabs()[page] : undefined
  const at = Math.max(0, sources.findIndex((s) => s.name === last))
  active.set(sources[at]?.name ?? "")
  // the dock takes the new tabs after this step: the remembered one comes in front then, and from then on the tab in
  // front is this page's
  const id = ids[at]
  dock?.open(id ?? "")
  const g = gen
  setTimeout(() => { if (g !== gen) return; if (id && FILE_OF[id]) dock?.open(id); tabsOf = page; switching = false; print(`[${stamp()}] ${untrack(active)} sekmesi etkin`, "info"); markReady() }, 0)
}
const PRESETS: Record<string, Preset> = {
  main: {
    title: "MarchIDE",
    tree: () => row(
      [0.6, col([0.5, tabs("preview")], [0.2, tabs("livecode")], [0.3, row([0.8, tabs(["props", "a11y", "events", "data"])], [0.2, tabs(["deps"])])])],
      [0.4, col([0.7, tabs(Object.keys(FILE_OF))], [0.3, tabs(["console", "ai", "debug", "terminal", "tests", "react", "bundle", "ext", "ai-keys"])])],
    ),
  },
}
// March's exports for the suggestions: the API reference's index (one JSON file, fetched when the playground opens)
/** The export names of March's icons (the icon gallery's march pack), for the editor's list inside `icon={…}`. */
const marchIcons = (): Promise<string[]> => loadPack("march").then((p) => p.icons.map((r) => r[1]))
/** March's components (march/ui's, by name), for the editor's list inside `m:parts={{ … }}`. */
const marchComponents = (): Promise<string[]> => apiIndex().then((idx) => {
  const subs = (idx as unknown as { subpaths: { subpath: string; items: [string, string][] }[] }).subpaths
  return [...new Set(subs.filter((s) => s.subpath === "march/ui").flatMap((s) => s.items.filter((it) => it[1] === "component").map((it) => it[0])))].sort()
})
/** The icon packs (not March's own) with their export names, for the editor's list inside `icon={…}`: loaded once. */
let packsP: Promise<IconPack[]> | null = null
const iconPacks = (): Promise<IconPack[]> => (packsP ??= Promise.all([loadIndex(), loadExports()]).then(([idx, exps]) =>
  idx.filter((p) => p.id !== "march" && exps[p.id]).map((p) => ({ id: p.id, label: p.name, icons: exps[p.id]!.split(" ") }))).catch((e) => { packsP = null; throw e }))
/** Every icon set's names (March's first), for the editor's list inside `icon="…"`: loaded once. */
let namesP: Promise<IconNames[]> | null = null
const iconNames = (): Promise<IconNames[]> => (namesP ??= Promise.all([loadIndex(), loadNames()]).then(([idx, names]) =>
  [...idx].sort((a, b) => (a.id === "march" ? -1 : b.id === "march" ? 1 : 0)).filter((p) => names[p.id]).map((p) => ({ id: p.id, label: p.name, names: names[p.id]!.split(" ") }))).catch((e) => { namesP = null; throw e }))
const catalog = (): Promise<MarchCatalog> => apiIndex()
// the TypeScript language service in a worker (the build copies it, the compiler and the lib files to playground/)
// TypeScript reads the file as it is built (its top-level elements as exports): no "one parent element" error for them
// march/icons as it is (its exports, every March icon, IconType with the sets' names) instead of `any`: a type imported
// from it is a type (`import type { IconType } from "march/icons"`), and a March icon's name is checked
const marchEnv = async (): Promise<Record<string, string>> => {
  const [idx, names, exps, packs] = await Promise.all([apiIndex(), loadNames(), loadExports(), loadIndex()])
  const items = (idx as unknown as { subpaths: { subpath: string; items: [string, string][] }[] }).subpaths.find((s) => s.subpath === "march/icons")?.items ?? []
  const J = JSON.stringify
  const icons = (exps["march"] ?? "").split(" ").filter(Boolean), marchNames = (names["march"] ?? "").split(" ").filter(Boolean)
  const ids = packs.map((p) => p.id).filter((id) => id !== "march")
  const values = [...new Set([...items.filter(([, k]) => k !== "type" && k !== "interface").map(([n]) => n), ...icons])]
  return { "/march-icons.d.ts": `declare module "march/icons" {
  export interface IconDef { readonly name: string; readonly d: readonly string[]; readonly fill?: boolean; [more: string]: unknown }
  export type MarchIconName = ${marchNames.map((n) => J(n)).join(" | ") || "string"};
  export type IconPackId = ${ids.map((n) => J(n)).join(" | ") || "string"};
  export type IconType = IconDef | MarchIconName | \`march:\${MarchIconName}\` | \`\${IconPackId}:\${string}\`;
  export type IconProp = any;
  export type IconProps = any;
${values.map((n) => `  export const ${n}: ${icons.includes(n) ? "IconDef" : "any"};`).join("\n")}
}
` }
}
const typescript = typeScriptPlugin({ worker: appUrl("playground/ts-worker.js"), typescript: appUrl("playground/ts/typescript.js"), lib: appUrl("playground/ts/"), env: marchEnv,
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
/** Ctrl + S in a file, the bar's Save button: saved files build (the build effect follows the saved text); saving with
 * nothing changed builds again. */
const saveAndBuild = (path?: string): void => {
  const changed = saveFiles(path)
  print(`[${stamp()}] 💾 ${path ?? "tüm dosyalar"} kaydedildi, derleniyor`, "success")
  if (!changed) scheduleBuild(0)
}
// the user's own AI (march-app-ui's vault and AI plugins): keys encrypted in this browser's vault, requests straight from
// here to the provider with the user's key; the chat knows the open file, its problems and the last run error
// the model reads March's own guide for AI assistants (AI_INSTRUCTIONS.md, ~25k tokens; the providers cache it, so a
// later message pays about a tenth for it) and then the IDE's rules
const AI_IDE = `You are the assistant inside MarchIDE, the browser IDE of March (MarchJS). The guide and the API index above are the contract (a message brings the full entries of the March names it uses): write March code exactly as it says (no React, no hooks, no useState / useEffect, no className; signals, March JSX, march/ui components), and prefer what it lists under Do / Don't and Common mistakes.
The files of the workspace are .tsx; the preview runs them with March. Tests use march/testing (test, expect, renderTest).
When you change a file, reply with the WHOLE file in one fenced code block (\`\`\`tsx), then a short list of what changed. Keep answers short and concrete.`
const AI_SYSTEM = async (): Promise<string> => {
  const [guide, idx] = await Promise.all([
    fetch(appUrl("playground/ai-instructions.md")).then((r) => (r.ok ? r.text() : "")).catch(() => ""),
    aiIndex().catch(() => ""),
  ])
  return [guide, idx, AI_IDE].filter(Boolean).join("\n\n---\n\n")
}
/** The full docs of the March names a message uses (the open file's, the selection's, the question's). */
const aiReference = async (text: string): Promise<string> => aiDetails(await marchNamesIn(text))
const aiContext = () => {
  const file = active(), code = files.get(file)?.peek()
  const ta = document.activeElement
  const selection = ta instanceof HTMLTextAreaElement && ta.classList.contains("m-ced-input") && ta.selectionEnd > ta.selectionStart ? ta.value.slice(ta.selectionStart, ta.selectionEnd) : undefined
  const problems = allProblems().filter((p) => p.file === file).map((p) => `${p.file}:${p.line}:${p.col} ${p.error ? "error" : "warning"} ${p.message}`)
  const e = pvError()
  return { file, code, selection, problems, error: e ? [e.title, ...e.frames.map((f) => `  at ${f.fn} (${f.file}:${f.line})`)].join("\n") : undefined }
}
/** A code block of the AI into a file: tests go into the open file's test file when there is one. */
const aiApply = (file: string, code: string): void => {
  let target = file
  if (/from ["']march\/testing["']/.test(code) && !isTestFile(file)) {
    const t = file.replace(/\.tsx?$/, ".test.tsx")
    if (!files.has(t)) { toast("Bu kod bir test dosyası: kopyalayıp yeni bir .test.tsx dosyasına yapıştır."); return }
    target = t
  }
  const f = files.get(target)
  if (!f) return
  debugTab(target)
  // the file's text: its editor follows it, and keeps the change as one step (Ctrl+Z takes it back)
  f.set(code)
  print(`[${stamp()}] ✨ AI önerisi ${target} dosyasına yazıldı (kaydedince derlenir; Ctrl+Z geri alır)`, "success")
}
const ai = aiPlugin({ context: aiContext, apply: aiApply, open: (id) => dock?.open(id), system: AI_SYSTEM, reference: aiReference, panel: { place: { near: "console" } } })
const PLUGINS = [typescript, debug, vaultPlugin({ panel: { place: { near: "console" } } }), ai, codeEditorPlugin({ save: (f) => saveAndBuild(f.path), formatOnSave: true, problems: setProblems, openProblems: () => dock?.open("problems"), goTo: (path) => goTo()[path] }), withExtensionSuggestions(marchLanguagePlugin({ catalog }), extInfo, editorProps, editorComponent, { icons: marchIcons, packs: iconPacks, iconNames, components: marchComponents, sx: SX_SPEC })]

// the next build (one at a time: a newer request replaces a waiting one)
let timer: ReturnType<typeof setTimeout> | undefined
const scheduleBuild = (ms: number): void => { clearTimeout(timer); timer = setTimeout(() => { void buildNow() }, ms) }

/** The "component" layout: its ide.json's files in the code tabs; `id` (the path it came from) keeps its own layout. */
/** The "component" layout: its ide.json's files in the code tabs. It stays while MarchIDE moves between its pages:
 * the next ide.json's files replace the tabs, the rest of the workspace (preview, console, layout) stays. */
/** The page an ide.json belongs to, as the menu names it: its Turkish title and its March name ("Düğme", "Button"). The
 * page that opens it (IDE_PAGES), else a topic whose slug is the ide.json's last part (/ide/components/x). */
function topicOfIde(id: string): { title: string; name?: string } | null {
  const page = Object.keys(IDE_PAGES).find((p) => IDE_PAGES[p] === id)
  if (page) {
    const base = page.slice(0, page.lastIndexOf("/")), slug = page.slice(page.lastIndexOf("/") + 1)
    const t = HUBS[base]?.find((x) => x.slug === slug)
    if (t) return t
  }
  const slug = id.split("/").pop()
  return (slug && Object.values(HUBS).flat().find((x) => x.slug === slug)) || null
}
/** The bar's title: "MarchIDE · Düğme (Button)", the March name in brackets when it differs from the title. */
const ideTitle = (id: string): string => {
  const t = topicOfIde(id)
  return t ? `MarchIDE · ${t.title}${t.name && t.name !== t.title ? ` (${t.name})` : ""}` : "MarchIDE"
}

export default function ComponentLayout(props: { ide: () => IdeJson; id: () => string; ready?: (id: string) => void }) {
  readyCb = props.ready
  // the first files before the workspace is drawn (the layout's preset names their tabs), the next ones as they come
  effect(() => workspaceId.set(props.id()))
  let shown = untrack(props.ide)
  readyFor = untrack(props.id)
  useSources(shown.sources, untrack(props.id))
  effect(() => { const ide = props.ide(); if (ide !== shown) { shown = ide; untrack(() => { readyFor = props.id(); useSources(ide.sources, props.id()) }) } })
  // every save is built (and the file in front when it changes): the typing builds nothing
  effect(() => {
    // only the file in front (and the entry that renders it)
    const path = active()
    const now = { [path]: withData(forBuild(saved.get(path)?.() ?? "")), [ENTRY]: entrySource() }
    clearTimeout(timer)
    // debugging: every build writes the debugger's calls in (buildNow), nothing kept is used
    if (debugSvc()?.active()) { scheduleBuild(350); return }
    // built before with this very code (a tab shown again): the kept result, at once
    const kept = builder.cached(now, ENTRY, untrack(buildMode) === "release")
    if (kept) { batch(() => { lastBuild.set(kept); builtFile.set(path) }); lastInputs = now; print(`[${stamp()}] ↺ ${path}: bu kod daha önce derlendi, bellekteki sonuç kullanılıyor`, "muted"); void render(kept.code); return }
    scheduleBuild(350)
  })
  // the preview's language: its file, or the code's own texts
  effect(() => { const code = previewLang(), file = code ? langFile(code) : null; void runtime?.then((r) => r.setLanguage(code || null, file)) })
  // an instance's own values: given to that instance only (the runtime draws again)
  effect(() => {
    const map = Object.fromEntries(Object.entries(valuesByInst()).map(([k, v]) => [k, propsOf(optsOf(nameOfKey(k)), v, true)]).filter(([, p]) => Object.keys(p as object).length))
    void runtime?.then((r) => r.setInstanceProps(map))
  })
  // a property changes: the rendered component takes it at once (no build)
  effect(() => { const p = rootProps(), parts = partsNow(); void runtime?.then((r) => { r.setProps(p, parts); readTag(); readExtensions() }) })
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
  // Ctrl+P: the files; Ctrl+Shift+O: the named things of the file in front (TypeScript's), the caret goes to the one picked
  hotkeys.bind("mod+p", () => { pickFiles.set(true) }, { inInputs: true, description: "Dosyaya git", group: "MarchIDE" })
  hotkeys.bind("mod+shift+o", () => { void openSymbols() }, { inInputs: true, description: "Dosyadaki sembole git", group: "MarchIDE" })
  return <div class="sc-playground">
    <QuickPick open={() => pickFiles()} onClose={() => pickFiles.set(false)} title="Dosyaya git" placeholder="Dosya adı…" items={fileItems} onPick={(name: string) => debugTab(name)} />
    <QuickPick open={() => !!symbolItems()} onClose={() => symbolItems.set(null)} title="Sembole git" placeholder="Bileşen, işlev, değişken…" items={() => symbolItems() ?? []}
      empty="Bu dosyada adı olan bir şey yok." onPick={(r: { from: number; to: number }) => { const f = active(); debugTab(f); goTo.set({ ...goTo.peek(), [f]: r }) }} />
    <AppUI title={() => ideTitle(props.id())} description={() => (props.ide().description ? t(props.ide().description!) : "") || props.id() || "bileşeni yaz, özelliklerini ayarla, önizlemede canlı dene"} tools={<><IconButton icon={save} size="sm" variant={() => (anyDirty() ? "solid" : undefined)} disabled={() => !anyDirty()} class="sc-ide-save" label="Kaydet ve derle (Ctrl + S)" onClick={() => saveAndBuild()} /><PaletteButton label="Komut ara…" class="sc-playground-pal" /></>}
      panels={allPanels} presets={PRESETS} plugins={PLUGINS} commands="playground" persist="sc.march-ide.v3" label="MarchIDE" narrowTabs="bottom" api={followTabs}
      kit={(k: AppKit) => { debugSvc.set(k.service<DebuggerService>("debugger") ?? null); tsSvc = k.service<TypeScriptService>("typescript") ?? null; aiSvc = k.service<AiService>("ai") ?? null }} />
  </div>
}
