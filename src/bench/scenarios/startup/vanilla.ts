// Start-up, plain DOM (hand-written): one prototype per part (page skeleton, nav item, card, table row, form field),
// built once like a compiled template; a start clones them, fills the text and attributes, attaches the "+1" listener
// and appends the page. Tearing down removes the page node.
import { rowsFor, HEADS, type Dash, type Run } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Dash): ScenarioApp {
  const doc = host.ownerDocument
  const E = (tag: string, cls?: string, ...kids: (Node | string)[]): HTMLElement => { const e = doc.createElement(tag); if (cls) e.className = cls; e.append(...kids); return e }
  const page = E("div", "dash",
    E("header", "hd", E("h1", "", ""), E("span", "run", ""), E("span", "count", ""), E("button", "inc", "+1")),
    E("nav", "nv", E("ul")),
    E("section", "cards"),
    E("table", "bt", E("thead", "", E("tr", "", ...HEADS.map((t) => E("th", "", t)))), E("tbody")),
    E("form", "fm"))
  ;(page.querySelector(".inc") as HTMLButtonElement).type = "button"
  const save = E("button", "", "Kaydet") as HTMLButtonElement
  save.type = "button"; page.lastChild!.appendChild(save)
  const li = E("li", "", E("a", "", ""))
  const card = E("div", "card", E("div", "lbl", ""), E("div", "val", ""), E("div", "delta", ""))
  const tr = E("tr", "", E("td", "id", ""), E("td", "", E("a", "", "")), E("td", "", ""), E("td", "", E("span", "badge", "")), E("td", "amt", ""), E("td", "", ""))
  const field = E("div", "f", E("label", "", ""), E("input"))
  const text = (n: Node, s: string) => { (n.firstChild as Text).data = s }

  let cur: HTMLElement | null = null
  const start = (k: number) => {
    cur?.remove()
    const p = page.cloneNode(true) as HTMLElement
    const [hd, nv, cards, table, form] = p.children as unknown as HTMLElement[]
    text(hd!.children[0]!, data.title); text(hd!.children[1]!, String(k)); text(hd!.children[2]!, "0")
    const count = hd!.children[2]!.firstChild as Text
    let n = 0
    hd!.children[3]!.addEventListener("click", () => { count.data = String(++n) })
    const ul = nv!.firstChild!
    for (const l of data.nav) { const x = li.cloneNode(true) as HTMLElement, a = x.firstChild as HTMLAnchorElement; a.setAttribute("href", l.href); text(a, l.label); ul.appendChild(x) }
    for (const s of data.stats) { const x = card.cloneNode(true) as HTMLElement; text(x.children[0]!, s.label); text(x.children[1]!, s.value); text(x.children[2]!, s.delta); cards!.appendChild(x) }
    const tbody = table!.lastChild!
    for (const r of rowsFor(data.rows, k)) {
      const x = tr.cloneNode(true) as HTMLElement, td = x.children
      text(td[0]!, String(r.id))
      const a = td[1]!.firstChild as HTMLElement; a.setAttribute("href", `#u${r.id}`); text(a, r.name)
      text(td[2]!, r.email)
      const b = td[3]!.firstChild as HTMLElement; b.className = `badge ${r.status}`; text(b, r.status)
      text(td[4]!, r.amount); text(td[5]!, r.date)
      tbody.appendChild(x)
    }
    for (const f of data.fields) { const x = field.cloneNode(true) as HTMLElement; text(x.firstChild!, f.label); const i = x.lastChild as HTMLElement; i.setAttribute("name", f.name); i.setAttribute("type", f.type); form!.insertBefore(x, form!.lastChild) }
    host.appendChild(p)
    cur = p
  }
  start(0)
  return {
    step: (p) => { start(p as Run); (host.querySelector(".inc") as HTMLElement).click() },
    destroy: () => { cur?.remove(); cur = null },
  }
}
