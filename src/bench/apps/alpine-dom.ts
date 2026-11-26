// Alpine.js (CSP build) helpers shared by the benchmark app and its scenarios: markup as it would be written in HTML,
// built with DOM calls (Trusted Types refuse HTML strings), and Alpine started on it.
import Alpine from "@alpinejs/csp"

/** <tag attr="value"…>kids</tag>; a <template>'s kids go into its content, as the HTML parser puts them. */
export const el = (tag: string, attrs: Record<string, string>, ...kids: (Node | string)[]): HTMLElement => {
  const e = document.createElement(tag)
  for (const k in attrs) e.setAttribute(k, attrs[k]!)
  ;(e instanceof HTMLTemplateElement ? e.content : e).append(...kids)
  return e
}

let started = false, seq = 0
/** Puts `root` in `host` with `scope` as its x-data (a component registered under a fresh name: the CSP build reads
 * x-data as a name, not as an object literal) and lets Alpine initialise it. Returns the reactive scope. */
export function start<T extends object>(host: HTMLElement, root: HTMLElement, scope: T): T {
  const name = `bench${++seq}`
  Alpine.data(name, () => scope)
  root.setAttribute("x-data", name)
  host.append(root)
  if (started) Alpine.initTree(root)
  else { started = true; Alpine.start() }
  return Alpine.$data(root) as T
}
