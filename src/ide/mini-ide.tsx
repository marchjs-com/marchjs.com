// IDE shell demo: a small editor on march-app-ui. AppUI is the base (top bar with the Layout menu, the ActivityBar in
// its side slot, the DockLayout workspace: file tree, editor tabs, inspector, console; the StatusBar in its status slot);
// PropertyGrid, OverflowToolbar, Breadcrumbs and the command palette (every action is a command: Ctrl+K finds it).
// Demo data is neutral ("hadi" project).
import { signal, computed, effect, onCleanup } from "hadi-march";
import { Tree, PaletteButton, toast, PropertyGrid, OverflowToolbar, StatusBar, ActivityBar, Breadcrumbs, type PropertySpec } from "hadi-march/ui";
import { AppUI, row, col, tabs, type DockApi, type DockPanel, type Preset } from "hadi-march/app-ui";
import { command } from "hadi-march/managers/command";
import { bindCommandKeys } from "hadi-march/managers/command/ui";
import { dirtyState } from "hadi-march/managers/dirty";
import { files as filesIcon, fileText, folder, search, terminal, sliders, gitBranch, alertTriangle, play, save as saveIcon, columns, settings, sparkles, plus } from "./icons.ts";

interface File { name: string; dir: string; text: string }
const START: File[] = [
  { name: "app.ts", dir: "src", text: `import { startApp } from "./router"\nimport { theme } from "./theme"\n\nexport function main() {\n  theme.apply("hadi")\n  return startApp({ root: "#app" })\n}\n` },
  { name: "router.ts", dir: "src", text: `export function startApp(o: { root: string }) {\n  const el = document.querySelector(o.root)\n  if (!el) throw new Error("root yok")\n  return el\n}\n` },
  { name: "theme.css", dir: "src", text: `:root {\n  --brand: #f2801f;\n  --radius: 12px;\n}\n` },
  { name: "README.md", dir: "", text: `# hadi\n\nKüçük örnek proje. Ctrl+K ile komutları ara.\n` },
]
// the base layout: explorer | editors over settings and console
const PRESETS: Record<string, Preset> = {
  main: { title: "Editör", tree: () => row([0.24, tabs("files")], [0.76, col([0.62, tabs(["file:app.ts", "file:theme.css"])], [0.38, tabs(["inspector", "console"])])]) },
  focus: { title: "Odak", tree: () => row([0.2, tabs("files", { collapsed: true })], [0.8, col([0.8, tabs(["file:app.ts", "file:theme.css"])], [0.2, tabs(["console", "inspector"], { collapsed: true })])]) },
}
const LANG: Record<string, string> = { ts: "TypeScript", css: "CSS", md: "Markdown" }
const langOf = (n: string) => LANG[n.split(".").pop() ?? ""] ?? "Metin"

export default function MiniIde() {
  const files = signal<File[]>(START.map((f) => ({ ...f })))
  const saved = new Map(START.map((f) => [f.name, f.text]))
  const savedTick = signal(0)
  const open = signal<string[]>(["app.ts", "theme.css"])
  const active = signal("app.ts")
  const caret = signal({ line: 1, col: 1 })
  const view = signal<string | null>("files")
  const query = signal("")
  const logs = signal<{ t: string; kind: "info" | "ok" | "err" }[]>([{ t: "hadi hazır. F5 / Ctrl+Enter çalıştırır.", kind: "info" }])
  const saving = signal(false)
  const settingsVal = signal<Record<string, unknown>>({ fontSize: 13, tabSize: 2, wrap: false, lineNumbers: true, accent: "orange" })
  let dock: DockApi | undefined

  const file = (n: string) => files().find((f) => f.name === n)
  const isDirty = (n: string) => { savedTick(); return (file(n)?.text ?? "") !== (saved.get(n) ?? "") }
  const dirtyList = computed(() => files().filter((f) => isDirty(f.name)).map((f) => f.name))
  const log = (t: string, kind: "info" | "ok" | "err" = "info") => logs.set([...logs(), { t, kind }].slice(-60))
  const setText = (n: string, text: string) => files.set(files().map((f) => (f.name === n ? { ...f, text } : f)))

  // unsaved files: leave warning (DirtyState) and saveAll
  const off = dirtyState().track("mini-ide", () => dirtyList().length > 0, "Örnek editör", () => saveAll())
  onCleanup(off)

  async function saveAll(only?: string) {
    const list = only ? [only] : dirtyList()
    if (!list.length) return
    saving.set(true)
    await new Promise((r) => setTimeout(r, 450))
    for (const n of list) saved.set(n, file(n)?.text ?? "")
    savedTick.set(savedTick() + 1)
    saving.set(false)
    log(`${list.join(", ")} kaydedildi`, "ok")
  }
  function openFile(n: string) {
    if (!open().includes(n)) open.set([...open(), n])
    active.set(n)
    // a new editor goes next to the other editors (its `place`); an open one comes to the front
    queueMicrotask(() => dock?.open(`file:${n}`))
  }
  function format() {
    const n = active(), f = file(n)
    if (!f) return
    const tab = " ".repeat(Number(settingsVal()["tabSize"]) || 2)
    setText(n, f.text.split("\n").map((l) => l.replace(/^\t+/, (m) => tab.repeat(m.length)).replace(/\s+$/, "")).join("\n"))
    log(`${n} biçimlendirildi`)
  }
  function run() {
    log(`$ hadi run ${active()}`)
    const f = file(active())
    if (f && /throw new Error/.test(f.text) && Math.random() < 0.3) log("Hata: root yok", "err")
    else log(`Çıktı: ${f ? f.text.split("\n").length : 0} satır derlendi, 0 uyarı`, "ok")
    dock?.open("console")
  }
  function newFile() {
    let i = 1
    while (file(`yeni-${i}.ts`)) i++
    const n = `yeni-${i}.ts`
    files.set([...files(), { name: n, dir: "src", text: "" }])
    saved.set(n, "")
    openFile(n)
  }

  // commands: the palette (Ctrl+K), the toolbar, the status bar and the shortcuts show the same thing
  const cmds = [
    command({ id: "ide.save", title: "Kaydet", icon: saveIcon, shortcut: "mod+s", group: "Dosya", when: () => isDirty(active()), run: () => saveAll(active()) }),
    command({ id: "ide.saveAll", title: "Tümünü kaydet", icon: saveIcon, shortcut: "mod+alt+s", group: "Dosya", when: () => dirtyList().length > 0, run: () => saveAll() }),
    command({ id: "ide.new", title: "Yeni dosya", icon: plus, group: "Dosya", run: newFile }),
    command({ id: "ide.format", title: "Belgeyi biçimlendir", icon: sparkles, shortcut: "mod+shift+i", group: "Düzen", run: format }),
    command({ id: "ide.run", title: "Çalıştır", icon: play, shortcut: "mod+enter", group: "Çalıştır", run }),
    command({ id: "ide.console", title: "Konsolu göster", icon: terminal, group: "Görünüm", run: () => dock?.open("console") }),
  ]
  onCleanup(() => cmds.forEach((c) => c.dispose()))
  onCleanup(bindCommandKeys())

  // ---------------------------------------------------------------- panels
  const treeNodes = computed(() => {
    const q = query().toLocaleLowerCase("tr")
    const match = (f: File) => !q || f.name.toLocaleLowerCase("tr").includes(q) || f.text.toLocaleLowerCase("tr").includes(q)
    const leaf = (f: File) => ({ id: f.name, label: f.name, icon: fileText, meta: isDirty(f.name) ? "●" : undefined })
    return [{ id: "hadi", label: "hadi", icon: folder, children: [
      { id: "src", label: "src", icon: folder, children: files().filter((f) => f.dir === "src" && match(f)).map(leaf) },
      ...files().filter((f) => !f.dir && match(f)).map(leaf),
    ] }]
  })
  const explorer = () => <div class="sc-ide-side">
    {() => (view() === "search"
      ? <label class="sc-ide-search"><span class="m-sr-only">Dosyalarda ara</span><input class="m-input" type="search" placeholder="Dosyalarda ara…" value={query()} on:input={(e: Event) => query.set((e.target as HTMLInputElement).value)} /></label>
      : null)}
    {() => <Tree nodes={treeNodes()} expanded={["hadi", "src"]} selected={active} label="Dosyalar" onSelect={(n: { id: string; children?: unknown }) => { if (!n.children) openFile(n.id) }} />}
  </div>

  const editor = (n: string) => () => {
    const f = () => file(n)
    const lines = () => (f()?.text ?? "").split("\n").length
    const onCaret = (e: Event) => {
      const ta = e.target as HTMLTextAreaElement
      const before = ta.value.slice(0, ta.selectionStart).split("\n")
      caret.set({ line: before.length, col: (before[before.length - 1]?.length ?? 0) + 1 })
      active.set(n)
    }
    const sizes = (el: HTMLElement) => effect(() => { el.style.setProperty("--sc-ide-fs", `${settingsVal()["fontSize"]}px`); el.style.setProperty("--sc-ide-tab", String(settingsVal()["tabSize"])) })
    return <div ref={sizes} class={() => ["sc-ide-editor", settingsVal()["wrap"] ? "is-wrap" : "", settingsVal()["lineNumbers"] ? "" : "no-gutter", `accent-${settingsVal()["accent"]}`].join(" ")}>
      <div class="sc-ide-gutter" aria-hidden="true">{() => Array.from({ length: lines() }, (_, i) => <span>{i + 1}</span>)}</div>
      <textarea class="sc-ide-code" spellcheck={false} aria-label={`${n} içeriği`} value={() => f()?.text ?? ""}
        on:input={(e: Event) => { setText(n, (e.target as HTMLTextAreaElement).value); onCaret(e) }} on:keyup={onCaret} on:click={onCaret} on:focus={onCaret} />
    </div>
  }

  const SETTINGS: PropertySpec[] = [
    { key: "fontSize", label: "Yazı boyutu", type: "slider", min: 11, max: 20, group: "Editör" },
    { key: "tabSize", label: "Sekme genişliği", type: "segmented", options: [{ value: 2, label: "2" }, { value: 4, label: "4" }], group: "Editör" },
    { key: "wrap", label: "Satır kaydır", type: "switch", group: "Editör" },
    { key: "lineNumbers", label: "Satır numaraları", type: "switch", group: "Görünüm" },
    { key: "accent", label: "Vurgu", type: "segmented", options: [{ value: "orange", label: "Turuncu" }, { value: "blue", label: "Mavi" }, { value: "green", label: "Yeşil" }, { value: "purple", label: "Mor" }], group: "Görünüm" },
  ]
  const consolePanel = () => <div class="sc-ide-console" role="log" aria-label="Konsol çıktısı">
    {() => logs().map((l) => <div class={`sc-ide-log is-${l.kind}`}>{l.t}</div>)}
  </div>

  const panels = computed((): DockPanel[] => [
    { id: "files", title: "Gezgin", icon: filesIcon, min: [150, 120], content: explorer },
    ...open().map((n): DockPanel => ({ id: `file:${n}`, title: n, icon: fileText, closable: true, dirty: () => isDirty(n), content: editor(n),
      // beside the other editors: the group of another open file, else right of the explorer
      place: { near: open().map((x) => `file:${x}`).find((x) => x !== `file:${n}`) ?? "files", zone: open().length > 1 ? "center" : "right", size: 0.7 } })),
    { id: "inspector", title: "Ayarlar", icon: sliders, place: { near: "console", zone: "center" }, content: () => <PropertyGrid properties={SETTINGS} value={settingsVal} label="Editör ayarları" saved={{ fontSize: 13, tabSize: 2, wrap: false, lineNumbers: true, accent: "orange" }} id="mini-ide-settings" dirty={false} /> },
    { id: "console", title: "Konsol", icon: terminal, min: [180, 80], place: { near: "files", zone: "right", size: 0.7 }, badge: () => logs().filter((l) => l.kind === "err").length || null, content: consolePanel },
  ])

  const crumbs = () => {
    const f = file(active())
    return [
      { id: "hadi", label: "hadi", icon: folder },
      ...(f?.dir ? [{ id: f.dir, label: f.dir, icon: folder, siblings: files().filter((x) => x.dir === f.dir).map((x) => ({ id: x.name, label: x.name, icon: fileText, onSelect: () => openFile(x.name) })) }] : []),
      { id: "file", label: active(), icon: fileText },
    ]
  }

  return <div class="sc-ide" aria-label="Örnek editör">
    <AppUI id="mini-ide-dock" class="sc-ide-app" panels={panels} presets={PRESETS} commands="ide.dock" label="Editör çalışma alanı" persist="sc.mini-ide.v2" api={(a: DockApi) => { dock = a }}
      onClose={(id: string) => { if (id.startsWith("file:")) open.set(open().filter((x) => `file:${x}` !== id)) }}
      tools={<div class="sc-ide-top">
      <Breadcrumbs items={crumbs} label="Dosya yolu" />
      <OverflowToolbar label="Editör araçları" items={[
        { id: "save", command: "ide.save", priority: 10 },
        { id: "run", command: "ide.run", priority: 9, showLabel: true },
        { id: "s1", separator: true },
        { id: "format", command: "ide.format", priority: 5 },
        { id: "new", command: "ide.new", priority: 4 },
        { id: "split", label: "Ayarlar paneli", icon: columns, onSelect: () => dock?.open("inspector"), priority: 2 },
        { id: "reset", label: "Yerleşimi sıfırla", icon: settings, command: "ide.dock.reset", priority: 1 },
      ]} />
      <PaletteButton label="Komut ara…" class="sc-ide-pal" />
      </div>}
      side={
      <ActivityBar value={view} controls="mini-ide-dock" label="Görünümler" onChange={(v: string | null) => { view.set(v); if (v) dock?.open("files"); else dock?.collapse("files") }} items={[
        { id: "files", label: "Gezgin", icon: filesIcon },
        { id: "search", label: "Ara", icon: search },
        { id: "git", label: "Kaynak denetimi", icon: gitBranch, badge: () => dirtyList().length },
        { id: "settings", label: "Ayarlar", icon: settings, position: "end", onSelect: () => dock?.open("inspector") },
      ]} />
      }
      status={
    <StatusBar label="Editör durumu" items={[
      { id: "branch", icon: gitBranch, text: "main", title: "Dal", onSelect: () => { toast("Dal: main") }, priority: 6 },
      { id: "problems", icon: alertTriangle, text: () => `${logs().filter((l) => l.kind === "err").length} hata`, tone: () => (logs().some((l) => l.kind === "err") ? "danger" : "neutral"), onSelect: () => dock?.open("console"), priority: 5 },
      { id: "pos", side: "end", text: () => `Sa ${caret().line}, Sü ${caret().col}`, priority: 7 },
      { id: "tab", side: "end", text: () => `Boşluk: ${settingsVal()["tabSize"]}`, priority: 2 },
      { id: "lang", side: "end", text: () => langOf(active()), priority: 3 },
      { id: "save", side: "end", live: true, priority: 9, text: () => (saving() ? "Kaydediliyor…" : dirtyList().length ? `${dirtyList().length} kaydedilmemiş` : "Kaydedildi"), tone: () => (saving() ? "busy" : dirtyList().length ? "warn" : "success"), command: "ide.saveAll" },
    ]} />
      } />
  </div>
}
