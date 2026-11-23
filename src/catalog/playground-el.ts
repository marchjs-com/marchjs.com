// MarchIDE's sample content for a playground option's toProp (showcase only; not a package export).

/** A plain element as sample content (`el("div", "sc-tile", "Kart 1")`), made afresh on each call. */
export const el = (tag: string, cls: string, ...kids: (string | Node)[]): HTMLElement => {
  const e = document.createElement(tag)
  if (cls) e.className = cls
  e.append(...kids)
  return e
}
