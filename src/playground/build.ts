// The playground's build: every change (a file, a property) is built in the page, no server. esbuild-wasm
// (playground/esbuild.js + esbuild.wasm, on the page's thread: the page's CSP has 'wasm-unsafe-eval') bundles the
// preview entry (PreviewControl.tsx, written from the Properties panel) with the component's files from memory; each
// file goes through the March compiler first (bundled for the browser at build time, playground/march-compiler.js),
// which also lists the texts people read. hadi-march stays outside the bundle (the page has it). Each step is reported
// with a timestamp; the texts of the last build make the locale file (lang.json).
import { signal } from "hadi-march";
import { appUrl } from "hadi-march/base";

type Tone = "success" | "warn" | "error" | "info" | "muted";
/** Where the build reports (the Console panel: a read-only Terminal). */
export type BuildLog = (text: string, tone?: Tone) => void;
interface MarchCompile { (source: string, opts: { filename: string }): { code: string; keys: string[]; texts: string[]; warnings: string[] } }
interface Message { text: string; location?: { file: string; line: number; column: number } | null }
interface Esbuild {
  initialize(o: { wasmURL: string; worker: boolean }): Promise<void>;
  build(o: Record<string, unknown>): Promise<{ outputFiles?: { text: string }[]; warnings: Message[] }>;
}
/** What one build gives: the bundled module of the entry and the texts to translate. */
export interface BuildResult { ok: boolean; code: string; texts: string[] }

const stamp = (): string => new Date().toLocaleTimeString("tr-TR", { hour12: false });
const ms = (t0: number): string => `${Math.round(performance.now() - t0)} ms`;
const where = (m: Message): string => (m.location ? `${m.location.file}:${m.location.line}:${m.location.column + 1} ` : "");

export function createBuilder(log: BuildLog) {
  const say = (text: string, tone?: Tone): void => log(`[${stamp()}] ${text}`, tone);
  let tools: Promise<{ compile: MarchCompile; esbuild: Esbuild }> | null = null;
  const load = () => (tools ??= (async () => {
    const t0 = performance.now();
    say("esbuild-wasm ve March derleyicisi yükleniyor…", "muted");
    const [m, e] = await Promise.all([import(/* @vite-ignore */ appUrl("playground/march-compiler.js")), import(/* @vite-ignore */ appUrl("playground/esbuild.js"))]) as [{ compile: MarchCompile }, Esbuild];
    await e.initialize({ wasmURL: appUrl("playground/esbuild.wasm"), worker: false });
    say(`Derleme araçları hazır (${ms(t0)})`, "muted");
    return { compile: m.compile, esbuild: e };
  })());
  /** The texts of the last build (lang.json). */
  const texts = signal<readonly string[]>([]);
  let run = 0;

  /** Bundle `entry` (a path in `files`) with the files it imports. */
  async function build(files: Record<string, string>, entry: string): Promise<BuildResult | null> {
    const n = ++run;
    let t: { compile: MarchCompile; esbuild: Esbuild };
    try { t = await load(); } catch (err) { tools = null; say(`Derleme araçları yüklenemedi: ${String((err as Error)?.message ?? err)}`, "error"); return null; }
    if (n !== run) return null; // a newer change is on its way
    const t0 = performance.now();
    say(`Derleniyor: ${entry}`, "info");
    const found = new Set<string>();
    const compile = t.compile;
    const memory = {
      name: "playground-files",
      setup(b: { onResolve: (o: object, f: (a: { path: string }) => object) => void; onLoad: (o: object, f: (a: { path: string }) => object) => void }) {
        // hadi-march is the page's: left outside the bundle
        b.onResolve({ filter: /^hadi-march(\/|$)/ }, (a) => ({ path: a.path, external: true }));
        b.onResolve({ filter: /.*/ }, (a) => ({ path: a.path.replace(/^\.\//, ""), namespace: "files" }));
        b.onLoad({ filter: /.*/, namespace: "files" }, (a) => {
          const source = files[a.path];
          if (source === undefined) return { errors: [{ text: `Dosya yok: ${a.path}` }] };
          const t1 = performance.now();
          try {
            const r = compile(source, { filename: a.path });
            for (const x of [...r.texts, ...r.keys]) found.add(x);
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
      const out = await t.esbuild.build({ entryPoints: [entry], bundle: true, write: false, format: "esm", target: "es2022", plugins: [memory], logLevel: "silent" });
      if (n !== run) return null;
      for (const w of out.warnings) say(`⚠ ${where(w)}${w.text}`, "warn");
      const code = out.outputFiles?.[0]?.text ?? "";
      texts.set([...found].sort((a, b) => a.localeCompare(b, "tr")));
      say(`Bitti: ${(code.length / 1024).toFixed(1)} KB paket · ${ms(t0)}`, "success");
      return { ok: true, code, texts: [...texts()] };
    } catch (err) {
      if (n !== run) return null;
      const errors = (err as { errors?: Message[] }).errors ?? [{ text: String((err as Error)?.message ?? err) }];
      for (const e of errors) say(`✖ ${where(e)}${e.text}`, "error");
      say(`Derleme başarısız: ${errors.length} hata · ${ms(t0)}`, "error");
      return { ok: false, code: "", texts: [...texts()] };
    }
  }
  return { build, texts };
}
