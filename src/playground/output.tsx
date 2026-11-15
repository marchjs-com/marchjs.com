// The last build's files in a dialog: a small read-only IDE made from AppUI. On the left the files of the output in
// their folders (index.html, the bundle, each compiled module, lang.json), on the right a read-only code editor per
// opened file as a tab. A file chosen in the tree opens its tab (or brings it to the front); a tab brought to the front
// is chosen in the tree. The code is esbuild's print of it (laid out the same way every time). The toolbar has one
// button: download every file as a zip.
import "./output.css";
import { signal, computed, effect, untrack } from "hadi-march";
import { openDialog, Tree, Button } from "hadi-march/ui";
import { AppUI, codeEditorPlugin, groups, row, tabs, type AppPanel, type DockApi, type Preset } from "hadi-march/app-ui";
import { fileText, folder, download } from "hadi-march/icons";
import { zip } from "./zip.ts";
import type { BuildResult } from "./build.ts";

/** What the dialog needs: the build, a name for the page and the zip, and how a compiled file becomes a module. */
export interface OutputSource {
  build: BuildResult;
  name: string;
  /** The entry the build started from (its module is the bundle, not listed again). */
  entry: string;
  js: (path: string, code: string) => Promise<string>;
}

const base = (path: string): string => path.replace(/\.[jt]sx?$/, "");
const kb = (n: number): string => `${(n / 1024).toFixed(1)} KB`;
/** The files of the output, path → text: the page, its start, the bundle, each compiled module, the texts. */
export async function outputFiles(o: OutputSource): Promise<Record<string, string>> {
  const { build: b, name } = o;
  const modules = await Promise.all(Object.entries(b.modules).filter(([p]) => p !== o.entry).map(async ([p, code]): Promise<[string, string]> => {
    // the modules import each other as .js
    const js = (await o.js(p, code)).replace(/(from\s+["']\.\/[^"']+?)\.[jt]sx?(["'])/g, "$1.js$2");
    return [`src/${base(p)}.js`, js];
  }));
  const out: Record<string, string> = {
    "index.html": `<!doctype html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${name}</title>
    <!-- hadi-march npm'de yok: github.com/tlghn/hadimarch deposundan kur, yolunu buraya yaz -->
    <script type="importmap">
      { "imports": { "hadi-march": "./hadi-march/src/index.ts", "hadi-march/": "./hadi-march/src/" } }
    </script>
  </head>
  <body>
    <main id="app"></main>
    <script type="module" src="./assets/main.js"></script>
  </body>
</html>
`,
    "assets/main.js": `// the page's start: every component the bundle exports, each in its own section
import { h, render } from "hadi-march";
import * as app from "./app.js";

const root = document.getElementById("app");
for (const [name, C] of Object.entries(app)) {
  if (!/^[A-Z]/.test(name) || typeof C !== "function") continue;
  const box = document.createElement("section");
  box.dataset.component = name;
  root.append(box);
  render(() => h(C, {}), box);
}
`,
    "assets/app.js": b.code,
    ...Object.fromEntries(modules),
  };
  if (b.texts.length) out["lang.json"] = `${JSON.stringify(Object.fromEntries(b.texts.map((k) => [k, k])), null, 2)}\n`;
  return out;
}

interface Node { id: string; label: string; icon: unknown; children?: Node[] }
/** The tree of the paths: folders first, then files, each by name. */
function treeOf(paths: readonly string[]): Node[] {
  const top: Node[] = [];
  for (const p of paths) {
    const parts = p.split("/");
    let level = top, at = "";
    parts.forEach((part, i) => {
      at = at ? `${at}/${part}` : part;
      if (i === parts.length - 1) { level.push({ id: p, label: part, icon: fileText }); return; }
      let dir = level.find((n) => n.id === `${at}/`);
      if (!dir) { dir = { id: `${at}/`, label: part, icon: folder, children: [] }; level.push(dir); }
      level = dir.children as Node[];
    });
  }
  const sort = (list: Node[]): Node[] => list.sort((a, b) => Number(!!b.children) - Number(!!a.children) || a.label.localeCompare(b.label)).map((n) => (n.children ? { ...n, children: sort(n.children) } : n));
  return sort(top);
}
const folders = (list: readonly Node[]): string[] => list.flatMap((n) => (n.children ? [n.id, ...folders(n.children)] : []));

/** Open the dialog of the last build's files. */
export async function openBuildOutput(o: OutputSource): Promise<void> {
  const files = await outputFiles(o);
  const paths = Object.keys(files), nodes = treeOf(paths);
  const first = "assets/app.js";
  const tabId = (path: string): string => `f:${path}`;
  // the opened files, in the order they were opened; a tab's place is fixed when it opens
  const open = signal<{ path: string; place: AppPanel["place"] }[]>([{ path: first, place: undefined }]);
  const chosen = signal(first);
  let dock: DockApi | null = null;
  const show = (path: string): void => {
    if (!(path in files)) return;
    chosen.set(path);
    const now = untrack(open);
    if (now.some((x) => x.path === path)) { dock?.open(tabId(path)); return; }
    // next to the opened files (in their group), or beside the tree when every tab was closed
    const near = now.at(-1)?.path;
    open.set([...now, { path, place: near ? { near: tabId(near), zone: "center" } : { near: "files", zone: "right", size: 0.76 } }]);
  };
  const panels = computed((): AppPanel[] => [
    { id: "files", title: "Dosyalar", icon: folder, content: () => <div class="sc-out-tree">
      <Tree nodes={nodes} toggle="chevron" expanded={folders(nodes)} selected={chosen} label="Derlemenin dosyaları"
        onSelect={(n: { id: string }) => show(n.id)} />
    </div> },
    ...open().map(({ path, place }): AppPanel => ({ id: tabId(path), title: path.split("/").pop() ?? path, icon: fileText, closable: true, place, file: { path, text: () => files[path] ?? "" } })),
  ]);
  const presets: Record<string, Preset> = { main: { title: "Dosyalar ve kod", tree: () => row([0.24, tabs(["files"])], [0.76, tabs([tabId(first)])]) } };
  const size = paths.reduce((n, p) => n + new Blob([files[p] ?? ""]).size, 0);
  const save = (): void => {
    const url = URL.createObjectURL(zip(files, new Date(o.build.at)));
    const a = document.createElement("a");
    a.href = url; a.download = `${o.name}-derleme.zip`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const when = new Date(o.build.at).toLocaleTimeString("tr-TR", { hour12: false });
  await openDialog(() => <AppUI class="sc-out" panels={panels} presets={presets} plugins={[codeEditorPlugin()]} label="Son derleme" layoutMenu={false}
    description={`${when} · ${paths.length} dosya · ${kb(size)}`}
    tools={<Button size="sm" variant="secondary" icon={download} onClick={save}>İndir (.zip)</Button>}
    onClose={(id: string) => { open.set(untrack(open).filter((x) => tabId(x.path) !== id)) }}
    api={(api: DockApi) => {
      dock = api
      let before: string[] = []
      // a tab brought to the front is chosen in the tree (the group that holds the chosen file, else any file tab)
      effect(() => {
        const L = api.layout()
        if (!L) return
        const fronts = groups(L.root).map((g) => g.active).filter((id): id is string => !!id && id.startsWith("f:")).map((id) => id.slice(2))
        // the tab that just came to the front; else the chosen one stays while it is in front
        const fresh = fronts.find((p) => !before.includes(p)), now = untrack(chosen)
        before = fronts
        if (fresh) chosen.set(fresh)
        else if (fronts.length && !fronts.includes(now)) chosen.set(fronts[0] as string)
      })
    }} />, { title: `Son derleme · ${o.name}`, size: "full", class: "sc-out-dialog" })
}
