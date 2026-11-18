// MarchIDE's Tests tab: the workspace's test files (*.test.tsx) run in the preview's runtime after each save (and on
// the button): each case passed or failed, how long it took, a failure's message and the line it came from (a press
// opens it). A test file uses March's testing module:
//   import { test, expect, renderTest } from "march/testing"
//   test("…", async () => { const s = renderTest(() => <App />); await s.click("Save"); expect(s.sees("Saved")).toBe(true) })
import { Button, Badge } from "march/ui";
import { check, x as xIcon } from "march/icons";
import { Icon } from "march/icons";
import "./tests-panel.css";

/** A test file's run: its cases (a failure with its place mapped back), or the build's error. */
export interface TestRun { file: string; error?: string; results: { name: string; ok: boolean; ms: number; message?: string; at?: { file: string; line: number } }[] }
/** A file is a test file by its name: *.test.ts(x) / *.spec.ts(x). */
export const isTestFile = (name: string): boolean => /\.(test|spec)\.[jt]sx?$/.test(name);

export function TestsPanel(props: { runs: () => readonly TestRun[] | null; running: () => boolean; run: () => void; go: (file: string, line: number) => void }) {
  return <div class="sc-tests">
    <div class="sc-tests-bar">
      {() => {
        const runs = props.runs() ?? [], all = runs.flatMap((r) => r.results), bad = all.filter((r) => !r.ok).length + runs.filter((r) => r.error).length
        return runs.length
          ? <span>{bad ? <Badge tone="danger">{`${bad} kaldı`}</Badge> : <Badge tone="success">{`${all.length} geçti`}</Badge>}<span class="m-muted">{` ${all.length} test · ${Math.round(all.reduce((s, r) => s + r.ms, 0))} ms`}</span></span>
          : <span class="m-muted">{props.running() ? "Çalışıyor…" : "Henüz çalıştırılmadı."}</span>
      }}
      <span class="sc-tests-gap" />
      <Button size="sm" variant="ghost" loading={() => props.running()} onClick={() => props.run()}>Çalıştır</Button>
    </div>
    {() => {
      const runs = props.runs()
      if (runs && !runs.length) return <p class="m-muted sc-tests-none">Çalışma alanında test dosyası yok. Adı .test.tsx ile biten bir dosya testleri tutar: <code>import {"{ test, expect, renderTest }"} from "march/testing"</code></p>
      return <div class="sc-tests-list">{(runs ?? []).map((r) => <section>
        <h4 class="sc-tests-file">{r.file}</h4>
        {r.error ? <p class="sc-tests-err">{r.error}</p> : null}
        <ul>{r.results.map((t) => <li class={t.ok ? "is-ok" : "is-bad"}>
          <span class="sc-tests-ic" aria-hidden="true"><Icon of={t.ok ? check : xIcon} /></span>
          <span class="sc-tests-name">{t.name}</span>
          <span class="m-muted sc-tests-ms">{`${Math.round(t.ms)} ms`}</span>
          {!t.ok ? <div class="sc-tests-why">
            <span>{t.message ?? ""}</span>
            {t.at ? <button type="button" class="sc-tests-at" on:click={() => props.go(t.at!.file, t.at!.line)}>{`${t.at.file}:${t.at.line}`}</button> : null}
          </div> : null}
        </li>)}</ul>
      </section>)}</div>
    }}
  </div>
}
