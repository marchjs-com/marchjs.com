// MarchIDE's Bundle tab: what the code in front would ship. Your code: each file's share and the whole of it minified
// and gzipped (measured on the last build). March: the components it imports, each with what it costs alone (the core
// it needs included; export-sizes.json, made by tools/gen-export-sizes.js), and an estimate of the whole (the core once,
// then each component's own part): tree shaking ships only these.
import { Badge } from "march/ui";
import "./bundle-panel.css";

/** export-sizes.json: the core every app pays, then each component alone (minified, gzip bytes), by "subpath#Name". */
export interface ExportSizes { base: { min: number; gzip: number }; items: Record<string, [number, number]> }
/** A March import of the code: its module and name. */
export interface MarchImport { from: string; name: string }

/** The March imports of some files (`import { A, B as C } from "march/ui"`; type imports left out). */
export function marchImports(files: readonly string[]): MarchImport[] {
  const seen = new Set<string>(), out: MarchImport[] = [];
  for (const text of files) for (const m of text.matchAll(/import\s+(type\s+)?\{([^}]*)\}\s*from\s*["']((?:hadi-)?march(?:\/[^"']*)?)["']/g)) {
    if (m[1]) continue;
    for (const part of m[2]!.split(",")) {
      const spec = part.trim(); if (!spec || spec.startsWith("type ")) continue;
      const name = spec.split(/\s+as\s+/)[0]!.trim(), from = m[3]!.replace(/^hadi-/, "");
      if (!seen.has(`${from}#${name}`)) { seen.add(`${from}#${name}`); out.push({ from, name }); }
    }
  }
  return out;
}
/** The components' sizes and the estimate of the whole: the core once, then each component's part beyond it. */
export function marchCost(imports: readonly MarchImport[], sizes: ExportSizes | null): { rows: { key: string; gzip: number | null }[]; total: number | null } {
  if (!sizes) return { rows: imports.map((i) => ({ key: `${i.from}#${i.name}`, gzip: null })), total: null };
  const rows = imports.map((i) => {
    const hit = sizes.items[`${i.from}#${i.name}`] ?? Object.entries(sizes.items).find(([k]) => k.endsWith(`#${i.name}`))?.[1];
    return { key: `${i.from}#${i.name}`, gzip: hit ? hit[1] : null };
  });
  const known = rows.filter((r) => r.gzip != null)
  return { rows, total: known.length ? sizes.base.gzip + known.reduce((s, r) => s + Math.max(0, r.gzip! - sizes.base.gzip), 0) : null };
}
export const kb = (n: number): string => `${(n / 1024).toFixed(n < 10240 ? 2 : 1)} KB`;

/** The panel. `own`: your files' bytes (min, gzip and each file's share); `imports` the code's March imports. */
export function BundlePanel(props: { own: () => { min: number; gzip: number; files: [string, number][] } | null; imports: () => readonly MarchImport[]; sizes: () => ExportSizes | null }) {
  return <div class="sc-bundle">
    {() => {
      const own = props.own(), cost = marchCost(props.imports(), props.sizes())
      if (!own) return <p class="m-muted sc-bundle-none">Kaydedip derleyince burada paketin boyutu görünür.</p>
      const total = cost.total != null ? cost.total + own.gzip : null
      return <div class="sc-bundle-body">
        <div class="sc-bundle-sum">
          <div><b>{total != null ? `≈ ${kb(total)}` : "—"}</b><span class="m-muted">tahmini toplam (gzip)</span></div>
          <div><b>{kb(own.gzip)}</b><span class="m-muted">{`senin kodun (küçültülmüş ${kb(own.min)})`}</span></div>
          <div><b>{cost.total != null ? kb(cost.total) : "—"}</b><span class="m-muted">March (yalnız kullandıkların)</span></div>
        </div>
        <h4 class="sc-bundle-head">Senin kodun</h4>
        <ul class="sc-bundle-list">{own.files.map(([f, b]) => <li><span>{f}</span><span class="sc-bundle-bar"><i style={{ width: `${Math.max(2, Math.round((b / Math.max(1, own.files[0]![1])) * 100))}%` }} /></span><span class="m-muted">{kb(b)}</span></li>)}</ul>
        <h4 class="sc-bundle-head">March <Badge tone="neutral">{`çekirdek ${props.sizes() ? kb(props.sizes()!.base.gzip) : "—"}`}</Badge></h4>
        {() => {
          // the components with their sizes; icons and the small functions in one line each
          const comps = cost.rows.filter((r) => r.gzip != null)
          const icons = cost.rows.filter((r) => r.gzip == null && r.key.startsWith("march/icons"))
          const rest = cost.rows.filter((r) => r.gzip == null && !r.key.startsWith("march/icons"))
          const names = (list: typeof rest): string => list.map((r) => r.key.split("#")[1]).join(", ")
          return cost.rows.length
            ? <ul class="sc-bundle-list">
                {comps.map((r) => <li><code>{r.key.replace("#", " › ")}</code><span /><span class="m-muted">{`${kb(r.gzip!)} tek başına`}</span></li>)}
                {icons.length ? <li><span title={names(icons)}>{`${icons.length} ikon: ${names(icons)}`}</span><span /><span class="m-muted">ikon başına ≈ 0.1–0.3 KB</span></li> : null}
                {rest.length ? <li><span title={names(rest)}>{`İşlevler: ${names(rest)}`}</span><span /><span class="m-muted">küçük, çekirdekle paylaşılır</span></li> : null}
              </ul>
            : <p class="m-muted">Kod March'tan bir şey içe aktarmıyor.</p>
        }}
        <p class="m-muted sc-bundle-note">Bileşenler çekirdeği paylaşır: toplam, tek başına boyutların toplamından küçüktür (çekirdek bir kez, sonra her bileşenin kendine düşen kısmı). Kullanmadığın March kodu pakete girmez.</p>
      </div>
    }}
  </div>
}
