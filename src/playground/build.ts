// The playground's build: every change (a file, a property) is built in the page, no server. esbuild-wasm
// (playground/esbuild.js + esbuild.wasm, on the page's thread: the page's CSP has 'wasm-unsafe-eval') bundles the
// preview entry (PreviewControl.tsx, written from the Properties panel) with the component's files from memory; each
// file goes through the March compiler first (bundled for the browser at build time, playground/march-compiler.js),
// which also lists the texts people read. march stays outside the bundle (the page has it). Each step is reported
// with a timestamp; the texts of the last build make the locale file (lang.json). A successful build is kept: the same
// files are not built twice (a tab shown again).
import { signal } from "march";
import { appUrl } from "march/base";

type Tone = "success" | "warn" | "error" | "info" | "muted";
/** Where the build reports (the Console panel: a read-only Terminal). */
export type BuildLog = (text: string, tone?: Tone) => void;
interface MarchCompile { (source: string, opts: { filename: string }): { code: string; keys: string[]; texts: string[]; warnings: string[] } }
interface Message { text: string; location?: { file: string; line: number; column: number } | null }
interface Esbuild {
  initialize(o: { wasmURL: string; worker: boolean }): Promise<void>;
  build(o: Record<string, unknown>): Promise<{ outputFiles?: { path: string; text: string }[]; warnings: Message[] }>;
  transform(code: string, o: Record<string, unknown>): Promise<{ code: string }>;
}
/** What one build gives: the bundled module of the entry, the texts to translate, each file the March compiler wrote
 * (TypeScript still: `js` makes it a module) and when it was built. */
/** A build: the bundle, its source map (an error's stack mapped back to the files), the texts and modules it found. */
export interface BuildResult { ok: boolean; code: string; map?: string; texts: string[]; modules: Record<string, string>; at: number }

/** A free moment of the page (at the latest after 600 ms). */
const free = (): Promise<void> => new Promise((r) => {
  const g = globalThis as typeof globalThis & { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number };
  if (g.requestIdleCallback) g.requestIdleCallback(() => r(), { timeout: 600 }); else setTimeout(r, 50);
});
const stamp = (): string => new Date().toLocaleTimeString("tr-TR", { hour12: false });
const ms = (t0: number): string => `${Math.round(performance.now() - t0)} ms`;
const where = (m: Message): string => (m.location ? `${m.location.file}:${m.location.line}:${m.location.column + 1} ` : "");

export function createBuilder(log: BuildLog) {
  const say = (text: string, tone?: Tone): void => log(`[${stamp()}] ${text}`, tone);
  let tools: Promise<{ compile: MarchCompile; esbuild: Esbuild }> | null = null;
  const load = () => (tools ??= (async () => {
    const t0 = performance.now();
    say("esbuild-wasm ve March derleyicisi yükleniyor…", "muted");
    // step by step, each in a free moment of the page: the tools are big and run on the page's thread
    // (esbuild's worker would need a blob: worker the page's Trusted Types do not allow)
    await free()
    const m = await import(/* @vite-ignore */ appUrl("playground/march-compiler.js")) as { compile: MarchCompile };
    await free()
    const e = await import(/* @vite-ignore */ appUrl("playground/esbuild.js")) as Esbuild;
    await free()
    await e.initialize({ wasmURL: appUrl("playground/esbuild.wasm"), worker: false });
    say(`Derleme araçları hazır (${ms(t0)})`, "muted");
    return { compile: m.compile, esbuild: e };
  })());
  /** The texts of the last build (lang.json). */
  const texts = signal<readonly string[]>([]);
  let run = 0;
  // every build kept by what went in (the entry and the files' texts): a tab shown again with the same code is not
  // built again, its last result comes back at once
  const memo = new Map<string, BuildResult>();
  const keyOf = (files: Record<string, string>, entry: string): string => JSON.stringify([entry, Object.entries(files).sort(([a], [b]) => a.localeCompare(b))]);
  /** The kept result of these files, if they were built before (its texts become lang.json's). */
  function cached(files: Record<string, string>, entry: string): BuildResult | null {
    const r = memo.get(keyOf(files, entry));
    if (!r) return null;
    run++; // a build still on its way is no longer wanted
    texts.set(r.texts);
    return r;
  }

  /** Bundle `entry` (a path in `files`) with the files it imports. */
  async function build(files: Record<string, string>, entry: string): Promise<BuildResult | null> {
    const n = ++run;
    let t: { compile: MarchCompile; esbuild: Esbuild };
    try { t = await load(); } catch (err) { tools = null; say(`Derleme araçları yüklenemedi: ${String((err as Error)?.message ?? err)}`, "error"); return null; }
    if (n !== run) return null; // a newer change is on its way
    const t0 = performance.now();
    say(`Derleniyor: ${entry}`, "info");
    const found = new Set<string>(), modules: Record<string, string> = {};
    const compile = t.compile;
    const memory = {
      name: "playground-files",
      setup(b: { onResolve: (o: object, f: (a: { path: string }) => object) => void; onLoad: (o: object, f: (a: { path: string }) => object) => void }) {
        // march is the page's: left outside the bundle
        b.onResolve({ filter: /^(hadi-)?march(\/|$)/ }, (a) => ({ path: a.path.replace(/^hadi-/, ""), external: true }));
        b.onResolve({ filter: /.*/ }, (a) => ({ path: a.path.replace(/^\.\//, ""), namespace: "files" }));
        b.onLoad({ filter: /.*/, namespace: "files" }, (a) => {
          const source = files[a.path];
          if (source === undefined) return { errors: [{ text: `Dosya yok: ${a.path}` }] };
          const t1 = performance.now();
          try {
            const r = compile(source, { filename: a.path });
            for (const x of [...r.texts, ...r.keys]) found.add(x);
            modules[a.path] = r.code;
            say(`✓ ${a.path} · ${ms(t1)}`, "success");
            return { contents: r.code, loader: "ts", warnings: r.warnings.map((text) => ({ text })) };
          } catch (err) {
            const e = err as { line?: number; column?: number; message?: string };
            return { errors: [{ text: String(e.message ?? err).replace(/^March compile error in [^:]+(:\d+:\d+)?: /, ""), location: { file: a.path, line: e.line ?? 1, column: Math.max(0, (e.column ?? 1) - 1) } }] };
          }
        });
      },
    };
    try {
      const out = await t.esbuild.build({ entryPoints: [entry], bundle: true, write: false, format: "esm", target: "es2022", plugins: [memory], logLevel: "silent", sourcemap: "external", outfile: "preview.js" });
      const files = out.outputFiles ?? [], code = files.find((f) => !f.path.endsWith(".map"))?.text ?? "", map = files.find((f) => f.path.endsWith(".map"))?.text;
      const r = { ok: true, code, ...(map ? { map } : {}), texts: [...found].sort((a, b) => a.localeCompare(b, "tr")), modules, at: Date.now() };
      // kept even when another tab came to the front meanwhile: showing this one again needs no build
      memo.set(keyOf(files, entry), r);
      if (n !== run) return null;
      for (const w of out.warnings) say(`⚠ ${where(w)}${w.text}`, "warn");
      texts.set(r.texts);
      say(`Bitti: ${(code.length / 1024).toFixed(1)} KB paket · ${ms(t0)}`, "success");
      return r;
    } catch (err) {
      if (n !== run) return null;
      const errors = (err as { errors?: Message[] }).errors ?? [{ text: String((err as Error)?.message ?? err) }];
      for (const e of errors) say(`✖ ${where(e)}${e.text}`, "error");
      say(`Derleme başarısız: ${errors.length} hata · ${ms(t0)}`, "error");
      return { ok: false, code: "", texts: [...texts()], modules: {}, at: Date.now() };
    }
  }
  /** A compiled file as a JavaScript module (esbuild prints it: types gone, laid out the same way every time). */
  async function js(path: string, code: string): Promise<string> {
    const t = await load();
    return (await t.esbuild.transform(code, { loader: /\.jsx?$/.test(path) ? "js" : "ts", format: "esm", target: "es2022", sourcefile: path })).code;
  }
  return { build, cached, texts, js };
}
