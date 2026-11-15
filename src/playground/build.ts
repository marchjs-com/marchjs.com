// The playground's build: every change of a component file is compiled in the page, no server. The March compiler
// (bundled for the browser at build time, playground/march-compiler.js) turns March JSX into JavaScript and lists the
// texts people read; esbuild-wasm (playground/esbuild.js + esbuild.wasm, on the page's thread: the page's CSP has
// 'wasm-unsafe-eval' and lets no worker start) strips the types. Each step is reported with a timestamp; the texts of
// the last build make the locale file (lang.json).
import { signal } from "hadi-march";
import { appUrl } from "hadi-march/base";

type Tone = "success" | "warn" | "error" | "info" | "muted";
/** Where the build reports (the Console panel: a read-only Terminal). */
export type BuildLog = (text: string, tone?: Tone) => void;
interface MarchCompile { (source: string, opts: { filename: string }): { code: string; keys: string[]; texts: string[]; warnings: string[] } }
interface Esbuild {
  initialize(o: { wasmURL: string; worker: boolean }): Promise<void>;
  transform(code: string, o: Record<string, unknown>): Promise<{ code: string; warnings: { text: string }[] }>;
}
/** What one build gives: the compiled modules and the texts to translate. */
export interface BuildResult { ok: boolean; modules: Record<string, string>; texts: string[] }

const stamp = (): string => new Date().toLocaleTimeString("tr-TR", { hour12: false });
const ms = (t0: number): string => `${Math.round(performance.now() - t0)} ms`;

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

  async function build(files: Record<string, string>): Promise<BuildResult | null> {
    const n = ++run;
    let t: { compile: MarchCompile; esbuild: Esbuild };
    try { t = await load(); } catch (err) { tools = null; say(`Derleme araçları yüklenemedi: ${String((err as Error)?.message ?? err)}`, "error"); return null; }
    if (n !== run) return null; // a newer change is on its way
    const t0 = performance.now(), paths = Object.keys(files);
    say(`Derleniyor: ${paths.length} dosya`, "info");
    const modules: Record<string, string> = {}, found = new Set<string>();
    let bad = 0;
    for (const path of paths) {
      const t1 = performance.now();
      try {
        const r = t.compile(files[path] ?? "", { filename: path });
        for (const x of [...r.texts, ...r.keys]) found.add(x);
        for (const w of r.warnings) say(`⚠ ${path}: ${w}`, "warn");
        const out = await t.esbuild.transform(r.code, { loader: "ts", format: "esm", sourcefile: path, target: "es2022" });
        for (const w of out.warnings) say(`⚠ ${path}: ${w.text}`, "warn");
        modules[path] = out.code;
        say(`✓ ${path} · ${ms(t1)}`, "success");
      } catch (err) {
        bad++;
        const e = err as { line?: number; column?: number; message?: string; errors?: { text: string; location?: { line: number; column: number } }[] };
        const first = e.errors?.[0];
        const where = first?.location ? `${first.location.line}:${first.location.column + 1}` : e.line ? `${e.line}:${e.column ?? 1}` : "";
        const text = first?.text ?? String(e.message ?? err).replace(/^March compile error in [^:]+(:\d+:\d+)?: /, "");
        say(`✖ ${path}${where ? `:${where}` : ""} ${text}`, "error");
      }
    }
    if (n !== run) return null;
    texts.set([...found].sort((a, b) => a.localeCompare(b, "tr")));
    say(bad ? `Bitti: ${paths.length - bad} başarılı, ${bad} hatalı · ${ms(t0)}` : `Bitti: ${paths.length} dosya derlendi · ${ms(t0)}`, bad ? "error" : "success");
    return { ok: !bad, modules, texts: texts() as string[] };
  }
  return { build, texts };
}
