// MarchIDE's History tab: every save of the file in front kept for the visit (newest first), each one's difference
// from the text now (lines taken out red, lines put in green, the rest folded to a few lines of context), and a
// button that brings that version back (as an unsaved change, Ctrl+Z takes it back).
import { signal } from "march";
import { Button, CopyButton } from "march/ui";
import "./history-panel.css";

/** A saved version of a file: when, and its text. */
export interface Snapshot { at: number; text: string }
/** A line of a difference: kept (" "), taken out ("-") or put in ("+"), with its numbers in the old and the new text. */
export interface DiffLine { op: " " | "-" | "+"; text: string; a?: number; b?: number }

/**
 * The lines of `before` and `after` that differ, by the longest run of lines they share (a line diff; texts of up to a
 * few thousand lines). Kept lines are listed too; `fold` shows them only near a change.
 */
export function lineDiff(before: string, after: string): DiffLine[] {
  const a = before.split("\n"), b = after.split("\n")
  // the common head and tail first: most edits are in one place
  let s = 0
  while (s < a.length && s < b.length && a[s] === b[s]) s++
  let ea = a.length, eb = b.length
  while (ea > s && eb > s && a[ea - 1] === b[eb - 1]) { ea--; eb-- }
  const A = a.slice(s, ea), B = b.slice(s, eb)
  // the longest common subsequence of what is left (row by row, from the end)
  const n = A.length, m = B.length
  const L: Uint32Array[] = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1))
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i]![j] = A[i] === B[j] ? L[i + 1]![j + 1]! + 1 : Math.max(L[i + 1]![j]!, L[i]![j + 1]!)
  const out: DiffLine[] = []
  for (let k = 0; k < s; k++) out.push({ op: " ", text: a[k]!, a: k + 1, b: k + 1 })
  let i = 0, j = 0
  while (i < n || j < m) {
    if (i < n && j < m && A[i] === B[j]) { out.push({ op: " ", text: A[i]!, a: s + i + 1, b: s + j + 1 }); i++; j++ }
    else if (j < m && (i >= n || L[i]![j + 1]! >= L[i + 1]![j]!)) { out.push({ op: "+", text: B[j]!, b: s + j + 1 }); j++ }
    else { out.push({ op: "-", text: A[i]!, a: s + i + 1 }); i++ }
  }
  for (let k = 0; k < a.length - ea; k++) out.push({ op: " ", text: a[ea + k]!, a: ea + k + 1, b: eb + k + 1 })
  return out
}
/** The difference with kept lines folded: `context` lines around each change, the rest as one "…" row (null). */
export function foldDiff(lines: readonly DiffLine[], context = 3): (DiffLine | null)[] {
  const near = new Set<number>()
  lines.forEach((l, i) => { if (l.op !== " ") for (let k = i - context; k <= i + context; k++) near.add(k) })
  const out: (DiffLine | null)[] = []
  lines.forEach((l, i) => { if (l.op !== " " || near.has(i)) out.push(l); else if (out[out.length - 1] !== null) out.push(null) })
  return out
}
/** How many lines were taken out and put in. */
export const diffCount = (lines: readonly DiffLine[]): { added: number; removed: number } =>
  ({ added: lines.filter((l) => l.op === "+").length, removed: lines.filter((l) => l.op === "-").length })
/** The difference as unified text (`- old` / `+ new`), for the clipboard. */
export const diffText = (lines: readonly (DiffLine | null)[]): string => lines.map((l) => (l ? `${l.op} ${l.text}` : "…")).join("\n")

/** A row of the History list: the unsaved changes (`k` -1) or a save (`k` its place, 0 the newest), what it compares. */
export interface HistoryRow { k: number; title: string; before: string; after: string; at?: number }
/**
 * The rows of a file's history: its unsaved changes first (the text now against the last save, when they differ),
 * then each save with what it changed against the one before it; the oldest is the text the file opened with.
 */
export function historyRows(list: readonly Snapshot[], now: string): HistoryRow[] {
  const time = (at: number): string => new Date(at).toLocaleTimeString("tr", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  const rows: HistoryRow[] = []
  if (list[0] && list[0].text !== now) rows.push({ k: -1, title: "Kaydedilmemiş değişiklikler", before: list[0].text, after: now })
  list.forEach((x, k) => {
    const prev = list[k + 1]
    rows.push(prev ? { k, title: `${time(x.at)} kaydı`, before: prev.text, after: x.text, at: x.at } : { k, title: `${time(x.at)} · açılış`, before: x.text, after: x.text, at: x.at })
  })
  return rows
}

/** The panel: `file` the file in front, `snapshots(file)` its saves (newest first), `current(file)` its text now. */
export function HistoryPanel(props: { file: () => string; snapshots: (file: string) => readonly Snapshot[]; current: (file: string) => string; restore: (file: string, text: string) => void }) {
  const chosen = signal(0)
  return <div class="sc-history">
    {() => {
      const f = props.file(), rows = historyRows(props.snapshots(f), props.current(f))
      if (rows.length < 2 && rows[0]?.k !== -1) return <p class="sc-history-none">{`${f || "Dosya"} henüz değişmedi. Yazdıkların burada "Kaydedilmemiş değişiklikler" olarak, her Ctrl+S da bir kayıt olarak görünür; bir kaydın neyi değiştirdiği yeşil / kırmızı satırlarla gösterilir, istersen o sürüm geri getirilir.`}</p>
      const i = Math.min(chosen(), rows.length - 1), row = rows[i]!
      const diff = lineDiff(row.before, row.after), folded = foldDiff(diff), c = diffCount(diff)
      return <div class="sc-history-body">
        <ul class="sc-history-list">{rows.map((r, k) => {
          const n = diffCount(lineDiff(r.before, r.after))
          return <li>
            <button type="button" class={`sc-history-item${k === i ? " is-on" : ""}${r.k === -1 ? " is-unsaved" : ""}`} on:click={() => chosen.set(k)}>
              <span>{r.title}</span><span class="sc-history-count">{n.added || n.removed ? <><b class="is-add">{`+${n.added}`}</b> <b class="is-del">{`−${n.removed}`}</b></> : <span class="m-muted">değişiklik yok</span>}</span>
            </button>
          </li>
        })}</ul>
        <div class="sc-history-diff">
          <div class="sc-history-bar">
            <span><b class="is-add">{`+${c.added}`}</b> <b class="is-del">{`−${c.removed}`}</b> <span class="m-muted">{row.k === -1 ? "son kayıttan bu yana" : "bir önceki kayda göre"}</span></span>
            <span class="sc-history-gap" />
            <CopyButton text={() => diffText(folded)} label="Farkı kopyala" iconOnly size="sm" variant="ghost" />
            {row.k === -1
              ? <Button size="sm" variant="ghost" onClick={() => props.restore(f, row.before)}>Değişiklikleri at</Button>
              : <Button size="sm" variant="ghost" disabled={row.after === props.current(f)} onClick={() => props.restore(f, row.after)}>Bu sürüme dön</Button>}
          </div>
          {c.added || c.removed
            ? <pre class="sc-history-lines">{folded.map((l) => (l
              ? <div class={`sc-history-line is-${l.op === "+" ? "add" : l.op === "-" ? "del" : "same"}`}><span class="sc-history-n">{l.a ?? ""}</span><span class="sc-history-n">{l.b ?? ""}</span><span class="sc-history-op">{l.op}</span><span>{l.text || " "}</span></div>
              : <div class="sc-history-line is-gap"><span>…</span></div>))}</pre>
            : <p class="sc-history-none">{row.k === -1 ? "Değişiklik yok." : "Dosyanın açıldığı hali; sonraki kayıtlar bunun üzerine."}</p>}
        </div>
      </div>
    }}
  </div>
}
