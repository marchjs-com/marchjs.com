// MarchIDE's Problems tab: every open file's errors and warnings (TypeScript's, as the editors get them), filtered by
// kind, copied as text, a row taking the caret to its place. The tab is there only while there is a problem
// (layouts/component.tsx adds and removes it); the count under a file's code opens it.
import { signal } from "march";
import { Chip, CopyButton } from "march/ui";
import { Icon, xCircle, alertTriangle } from "march/icons";
import "./problems-panel.css";

/** A problem as the panel lists it: its file, its place in the text, line and column, what it says. */
export interface IdeProblem { file: string; from: number; to: number; line: number; col: number; message: string; error: boolean; code?: number }

/** The line and column (1-based) of an offset in a text. */
export function lineColOf(text: string, at: number): { line: number; col: number } {
  let line = 1, start = 0
  for (let i = text.indexOf("\n"); i >= 0 && i < at; i = text.indexOf("\n", i + 1)) { line++; start = i + 1 }
  return { line, col: at - start + 1 }
}
/** The problems as text (one per line: `file:line:col  hata|uyarı  message`), for the clipboard. */
export const problemsText = (list: readonly IdeProblem[]): string =>
  list.map((p) => `${p.file}:${p.line}:${p.col}  ${p.error ? "hata" : "uyarı"}${p.code ? ` TS${p.code}` : ""}  ${p.message}`).join("\n")

/**
 * The panel. `problems`: every file's, in order; `onPick`: a row was chosen (open the file, put the caret there).
 * A chip per kind (both on) hides or shows its rows; the copy button copies the rows shown.
 */
export function ProblemsPanel(props: { problems: () => readonly IdeProblem[]; onPick: (p: IdeProblem) => void }) {
  const showErrors = signal(true), showWarnings = signal(true)
  const count = (error: boolean): number => props.problems().filter((p) => p.error === error).length
  const visible = (): readonly IdeProblem[] => props.problems().filter((p) => (p.error ? showErrors() : showWarnings()))
  return <div class="sc-problems">
    <div class="sc-problems-bar">
      <Chip size="sm" tone="danger" icon={xCircle} selectedIcon={xCircle} selected={showErrors} onClick={() => showErrors.set(!showErrors.peek())}>{() => `Hatalar ${count(true)}`}</Chip>
      <Chip size="sm" tone="warn" icon={alertTriangle} selectedIcon={alertTriangle} selected={showWarnings} onClick={() => showWarnings.set(!showWarnings.peek())}>{() => `Uyarılar ${count(false)}`}</Chip>
      <span class="sc-problems-gap" />
      <CopyButton text={() => problemsText(visible())} label="Görünenleri kopyala" iconOnly size="sm" variant="ghost" />
    </div>
    {() => {
      const list = visible()
      if (!list.length) return <p class="sc-problems-none">{props.problems().length ? "Seçili türde sorun yok." : "Sorun yok."}</p>
      const byFile = new Map<string, IdeProblem[]>()
      for (const p of list) byFile.set(p.file, [...(byFile.get(p.file) ?? []), p])
      return <div class="sc-problems-list">{[...byFile].map(([file, rows]) => <section class="sc-problems-file">
        <h4 class="sc-problems-head"><span>{file}</span><span class="sc-problems-count">{rows.length}</span></h4>
        <ul>{rows.map((p) => <li>
          <button type="button" class={`sc-problems-row ${p.error ? "is-error" : "is-warning"}`} on:click={() => props.onPick(p)} title={`${file}:${p.line}:${p.col}`}>
            <span class="sc-problems-ic" aria-hidden="true"><Icon of={p.error ? xCircle : alertTriangle} /></span>
            <span class="sc-problems-msg">{p.message}</span>
            <span class="sc-problems-at">{`${p.line}:${p.col}`}</span>
          </button>
        </li>)}</ul>
      </section>)}</div>
    }}
  </div>
}
