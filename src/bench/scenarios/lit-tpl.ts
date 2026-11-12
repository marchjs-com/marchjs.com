// Lit templates for the scenarios in lit-html's compiled form, built with DOM calls: the showcase CSP's Trusted Types
// refuse the HTML string a html`` template parses. Write the tree with el(); mark dynamic places with attr(), on() and
// child(); the part indexes are counted here (elements and comments in document order, as lit-html's walker does).
// Load this module only inside the lit app chunk (after no-tt.ts has hidden the policy lookup).
import { _$LH, type TemplateResult } from "lit/html.js"

const { H: AttributePart, U: EventPart } = _$LH as unknown as { H: unknown; U: unknown }
type Mark = { $part: "attr" | "on" | "child"; name?: string }
export const attr = (name: string): Mark => ({ $part: "attr", name })
export const on = (name: string): Mark => ({ $part: "on", name })
export const child = (): Mark => ({ $part: "child" })
export interface Spec { tag: string; props: Record<string, string | Mark>; kids: (Spec | string | Mark)[] }
export const el = (tag: string, props: Record<string, string | Mark> = {}, ...kids: (Spec | string | Mark)[]): Spec => ({ tag, props, kids })

export interface LitTemplate { (...values: unknown[]): TemplateResult }
/** A compiled lit-html template from a spec; call it with the values in document order to get a TemplateResult. */
export function template(spec: Spec): LitTemplate {
  const tpl = document.createElement("template"), parts: object[] = []
  let index = -1
  const one = ["", ""]
  const build = (s: Spec): Element => {
    const e = document.createElement(s.tag)
    const at = ++index
    for (const [k, v] of Object.entries(s.props)) {
      if (typeof v === "string") e.setAttribute(k, v)
      else parts.push({ type: 1, index: at, name: v.name, strings: one, ctor: v.$part === "on" ? EventPart : AttributePart })
    }
    for (const k of s.kids) {
      if (typeof k === "string") e.append(k)
      else if ("$part" in k) { e.append(document.createComment("")); parts.push({ type: 2, index: ++index }) }
      else e.append(build(k))
    }
    return e
  }
  tpl.content.append(build(spec))
  const compiled = { h: Object.assign([""], { raw: [""] }), el: tpl, parts }
  return (...values) => ({ ["_$litType$"]: compiled, values }) as unknown as TemplateResult
}
