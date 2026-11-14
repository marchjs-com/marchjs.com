// Light or dark for ONE element (the workbench stage, its code box), whatever the page's mode is.
// The theme tokens switch with `data-theme` on <html> only, so an element cannot be given the other mode by an
// attribute. This reads what the tokens would be in that mode (the root takes the mode for one style pass, with
// transitions off and before any paint) and returns the ones that differ, to be written on the element.
import { effect, signal, untrack, onCleanup } from "hadi-march";
import { theme, colorTheme, accent } from "hadi-march/ui";

export type StageMode = "light" | "dark"

/** Every `--m-*` custom property a root / theme rule sets. */
function tokenNames(): string[] {
  const out = new Set<string>()
  const walk = (rules: CSSRuleList): void => {
    for (const rule of rules) {
      const r = rule as CSSStyleRule & { cssRules?: CSSRuleList }
      if (r.selectorText !== undefined) {
        if (!/:root|data-m-theme|data-theme/.test(r.selectorText)) continue
        for (const name of r.style) if (name.startsWith("--m-")) out.add(name)
      } else if (r.cssRules) walk(r.cssRules)
    }
  }
  for (const sheet of document.styleSheets) { try { walk(sheet.cssRules) } catch { /* a sheet from another origin */ } }
  return [...out]
}

/** The tokens of `mode` that differ from the page's current ones. */
export function modeTokens(mode: StageMode): Record<string, string> {
  const root = document.documentElement, names = tokenNames(), style = getComputedStyle(root)
  const read = (): string[] => names.map((n) => style.getPropertyValue(n))
  const now = read(), before = root.getAttribute("data-theme")
  root.setAttribute("data-m-restyling", "")
  root.setAttribute("data-theme", mode)
  const then = read()
  if (before === null) root.removeAttribute("data-theme"); else root.setAttribute("data-theme", before)
  style.getPropertyValue("color")
  setTimeout(() => root.removeAttribute("data-m-restyling"), 0)
  const out: Record<string, string> = {}
  names.forEach((n, i) => { if (then[i] !== now[i]) out[n] = then[i]! })
  return out
}

/**
 * Keep `el` in `mode()` (`null`: the page's mode): its tokens are rewritten when the mode, the page's light / dark,
 * the color theme or the accent changes. Returns the tokens as a signal-backed style object for `style={…}`.
 */
export function scopedMode(mode: () => StageMode | null): () => Record<string, string | null> {
  const vars = signal<Record<string, string | null>>({})
  effect(() => {
    const m = mode()
    theme(); colorTheme(); accent()
    const old = untrack(vars)
    const cleared: Record<string, string | null> = Object.fromEntries(Object.keys(old).map((k) => [k, null]))
    // the page restyles first (theme CSS may still be loading): read on the next task
    const id = setTimeout(() => vars.set(m ? { ...cleared, ...modeTokens(m) } : cleared), 0)
    onCleanup(() => clearTimeout(id))
  })
  return vars
}
