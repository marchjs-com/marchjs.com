// MarchIDE's quick pick: a field and a list in a small dialog (Ctrl+P: the files, Ctrl+Shift+O: the named things of the
// file in front). Typing narrows the list (a name that starts with it first, then one that holds it); arrows and Enter
// pick, Escape closes. Built from Dialog, TextInput and OptionList.
import { signal, effect } from "march";
import { Dialog, TextInput, OptionList } from "march/ui";
import "./quick-pick.css";

/** A row of the list: what it shows, a hint after it, its group heading, and the value it gives back. */
export interface PickItem<T> { label: string; hint?: string; group?: string; value: T }

/** The rows for what is typed: a label that starts with it first, then one that holds it (case aside), shortest first. */
export function rankPick<T>(items: readonly PickItem<T>[], typed: string): PickItem<T>[] {
  const q = typed.trim().toLowerCase()
  if (!q) return [...items]
  const fit = (it: PickItem<T>): number => { const l = it.label.toLowerCase(); return l.startsWith(q) ? 0 : l.includes(q) ? 1 : (it.hint ?? "").toLowerCase().includes(q) ? 2 : 3 }
  return items.filter((it) => fit(it) < 3).sort((a, b) => fit(a) - fit(b) || a.label.length - b.label.length)
}

/**
 * The quick pick. `items` is read when it opens (and while it is open); `onPick` gets the chosen row's value; it
 * closes after a pick or Escape (`onClose`).
 */
export function QuickPick<T>(props: { open: () => boolean; onClose: () => void; title: string; placeholder: string; items: () => readonly PickItem<T>[]; onPick: (value: T) => void; empty?: string }) {
  const query = signal(""), active = signal(0)
  effect(() => { query(); active.set(0) }) // a new word: the best row is the one lit
  let field: HTMLInputElement | null = null
  const rows = (): PickItem<T>[] => rankPick(props.items(), query())
  const pick = (i: number): void => { const it = rows()[i]; props.onClose(); query.set(""); if (it) props.onPick(it.value) }
  return <Dialog open={() => props.open()} onClose={() => { query.set(""); props.onClose() }} size="sm" label={props.title} class="sc-quick-pick" closeButton={false}>
    <TextInput value={query} placeholder={props.placeholder} ref={(el: HTMLInputElement) => { field = el; queueMicrotask(() => el.focus()) }} />
    {() => (rows().length
      ? <OptionList keysFrom={() => field} active={active} inline check={false} size="sm" label={props.title} options={() => rows().map((it, i) => ({ value: i, label: it.label, hint: it.hint, group: it.group }))} onPick={(i: number) => pick(i)} />
      : <p class="sc-quick-pick-none">{props.empty ?? "Eşleşen yok."}</p>)}
  </Dialog>
}
