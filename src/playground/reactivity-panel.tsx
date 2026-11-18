// MarchIDE's Tepki (reactivity) tab: what the code's reactivity does while you use the preview. Its signals ($count:
// value, how many times written), its effects and computeds (how many times they ran) and the preview's DOM updates by
// the line that wrote the element (how many times it changed: a line that changes more than it should shows here).
// A row's place opens its line. The counters start again with each run, or with the reset button.
import { Button, Badge } from "march/ui";
import "./reactivity-panel.css";

/** A row of the tab, as the IDE gives it (its place mapped back to the code). */
export interface ReactRow { kind: "signal" | "computed" | "effect"; name: string; file?: string; line?: number; count: number; value?: string; recent: boolean }

/** A signal's IDE name ("count@App.tsx:4") as its name, file and line. */
export function parseProbeName(name: string): { name: string; file?: string; line?: number } {
  const m = /^(.*)@(.*):(\d+)$/.exec(name);
  return m ? { name: m[1]!, file: m[2]!, line: Number(m[3]) } : { name };
}

export function ReactivityPanel(props: { rows: () => readonly ReactRow[]; dom: () => readonly [string, number][]; reset: () => void; go: (file: string, line: number) => void }) {
  const place = (file?: string, line?: number) => (file && line ? <button type="button" class="sc-react-at" on:click={() => props.go(file, line)}>{`${file}:${line}`}</button> : <span class="m-muted">—</span>)
  return <div class="sc-react">
    <div class="sc-react-bar">
      <span class="m-muted">Önizlemeyi kullandıkça sayılar artar: bir sinyal kaç kez yazıldı, bir etki kaç kez çalıştı, DOM'da hangi satırın öğesi kaç kez değişti.</span>
      <Button size="sm" variant="ghost" onClick={() => props.reset()}>Sıfırla</Button>
    </div>
    {() => {
      const rows = props.rows(), sigs = rows.filter((r) => r.kind === "signal"), runs = rows.filter((r) => r.kind !== "signal"), dom = props.dom()
      return <div class="sc-react-body">
        <h4 class="sc-react-head">Sinyaller <Badge tone="neutral">{String(sigs.length)}</Badge></h4>
        {sigs.length
          ? <table class="sc-react-table"><thead><tr><th>ad</th><th>değer</th><th>yazma</th><th>yer</th></tr></thead>
              <tbody>{sigs.map((r) => <tr class={r.recent ? "is-recent" : ""}><td><code>{`$${r.name}`}</code></td><td class="sc-react-val">{r.value ?? ""}</td><td class="sc-react-n">{String(r.count)}</td><td>{place(r.file, r.line)}</td></tr>)}</tbody></table>
          : <p class="m-muted">Kodda $ sinyali yok.</p>}
        <h4 class="sc-react-head">Etkiler ve hesaplananlar <Badge tone="neutral">{String(runs.length)}</Badge></h4>
        {runs.length
          ? <table class="sc-react-table"><thead><tr><th>tür</th><th>son değer</th><th>çalışma</th><th>yer</th></tr></thead>
              <tbody>{runs.map((r) => <tr class={r.recent ? "is-recent" : ""}><td>{r.kind === "effect" ? "effect" : "computed"}</td><td class="sc-react-val">{r.value ?? ""}</td><td class="sc-react-n">{String(r.count)}</td><td>{place(r.file, r.line)}</td></tr>)}</tbody></table>
          : <p class="m-muted">Kodda effect() ya da computed() yok (JSX'teki bağlar March'ın kendisinde, aşağıda DOM güncellemeleri olarak sayılır).</p>}
        <h4 class="sc-react-head">DOM güncellemeleri <Badge tone="neutral">{String(dom.reduce((s, [, n]) => s + n, 0))}</Badge></h4>
        {dom.length
          ? <table class="sc-react-table"><thead><tr><th>yer</th><th>değişiklik</th></tr></thead>
              <tbody>{dom.slice(0, 30).map(([k, n]) => { const m = /^(.*):(\d+)$/.exec(k); return <tr><td>{place(m?.[1], m ? Number(m[2]) : undefined)}</td><td class="sc-react-n">{String(n)}</td></tr> })}</tbody></table>
          : <p class="m-muted">Önizlemede henüz bir değişiklik olmadı.</p>}
      </div>
    }}
  </div>
}
