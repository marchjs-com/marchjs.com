// Theme change, plain DOM (hand-optimized): the cards are cloned from one prototype, the badge elements are kept in an
// array, and a step sets every badge's class. There is no context: the page knows its badges.
import { FIRST, badgeClass, type Card } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Card[]): ScenarioApp {
  const doc = host.ownerDocument
  const root = doc.createElement("div"), proto = doc.createElement("div")
  root.className = "cards"; proto.className = "card"
  const h3 = doc.createElement("h3"), p = doc.createElement("p"), badge = doc.createElement("span")
  badge.className = badgeClass(FIRST)
  h3.append(""); p.append(""); badge.append("")
  proto.append(h3, p, badge)
  const badges: HTMLElement[] = []
  for (const c of data) {
    const card = proto.cloneNode(true) as HTMLElement
    ;(card.firstChild!.firstChild as Text).data = c.title
    ;(card.childNodes[1]!.firstChild as Text).data = c.text
    const b = card.lastChild as HTMLElement
    ;(b.firstChild as Text).data = `#${c.id}`
    badges.push(b)
    root.append(card)
  }
  host.append(root)
  return {
    step: (p) => { const cls = badgeClass(p as string); for (const b of badges) b.className = cls },
    destroy: () => root.remove(),
  }
}
