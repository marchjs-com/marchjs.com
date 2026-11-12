// Small result widgets the API examples share: a labelled live value and a short event log.

/** `label: value` — the value may be a live accessor. */
export function Out(props: { label: string; value: unknown }) {
  return <span class="sc-ex-out"><span>{props.label}</span><code class="sc-ex-val">{props.value as string}</code></span>
}

/** A log of lines (newest last); `lines` is a live accessor of strings. */
export function Log(props: { lines: () => string[]; label?: string }) {
  return <ol class="sc-ex-log" aria-label={props.label ?? "Günlük"} aria-live="polite">{() => props.lines().map((l) => <li>{l}</li>)}</ol>
}

/** A row of examples' controls and readouts. */
export function Row(props: { children?: unknown }) {
  return <div class="sc-row">{props.children}</div>
}
