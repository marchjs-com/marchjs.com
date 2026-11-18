// The code editor's props of a component tag, without the DOM: where the caret's tag is, what is written in it, how a
// prop is written when picked, the word under the pointer. extensions-tab.tsx (withExtensionSuggestions) uses them.

/** A prop of a component tag as the editor offers it: its name, its type and what it does (in the page's language); its
 * group ("March", "Ortak", "HTML": the list's order) and the values it takes (offered inside its quotes). */
export interface OwnProp {
  name: string; type?: string; doc?: string;
  group?: string;
  /** The words it takes (`variant="…"`): offered inside the quotes, and they write it in quotes. */
  values?: readonly string[];
  /** How it is written: bare (a yes / no), in quotes (a text) or in braces (code). Default: read from `type`. */
  write?: "bare" | "text" | "code";
  /** It takes an icon (`icon={…}`): inside its braces the icons are offered. */
  icon?: boolean;
  /** What picking it writes, when not `name=""` / `name={}` (`sx={{  }}`), and how far the caret steps back. */
  insert?: string; back?: number;
}
/** The groups in the list's order. */
export const GROUP_ORDER = ["March", "Ortak", "HTML"]

/** The prop whose quoted value the caret is in (`<Button variant="gh|`): the component, the prop, what is typed. */
export function valueAt(before: string): { comp: string; prop: string; typed: string } | null {
  const lt = before.lastIndexOf("<")
  if (lt < 0) return null
  const tag = before.slice(lt)
  if (!/^<[A-Z][\w$.]*\s/.test(tag)) return null
  const m = /\s([\w:$.-]+)\s*=\s*(["'])([^"']*)$/.exec(tag)
  if (!m) return null
  // the quote is the one that opens the value (not a closed value's): the tag before it has every quote closed
  const head = tag.slice(0, tag.length - m[3]!.length - 1)
  let q = ""
  for (const ch of head.replace(/\{[^{}]*\}/g, "")) if (q ? ch === q : ch === `"` || ch === "'") q = q ? "" : ch
  return q ? null : { comp: /^<([A-Z][\w$.]*)/.exec(tag)![1]!, prop: m[1]!, typed: m[3]! }
}

/** The prop whose braces the caret is in, with only a name typed so far (`<Button icon={he|`): the component, the
 * prop, the name typed. Null in a quoted value, in code past a name (`icon={a ? b`) or outside a component's tag. */
export function codeAt(before: string): { comp: string; prop: string; typed: string } | null {
  const m = /\s([\w:$.-]+)\s*=\s*\{\s*([\w$]*)$/.exec(before)
  if (!m) return null
  const t = tagAt(before.slice(0, m.index + 1))
  return t ? { comp: t.comp, prop: m[1]!, typed: m[2]! } : null
}
/** The local names a text imports from a module (`import { plus, heart as like } from "march/icons"` → plus, like). */
export function importedFrom(value: string, module: string): string[] {
  const out: string[] = []
  for (const m of value.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']([^"']+)["']/g)) if (m[2] === module)
    for (const x of m[1]!.split(",")) { const n = x.trim().split(/\s+as\s+/).pop()!.trim(); if (n) out.push(n) }
  return out
}

/** The component tag the text before the caret ends in: its name, the word being typed and the tag's text so far. */
export function tagAt(before: string): { comp: string; word: string; tag: string } | null {
  const lt = before.lastIndexOf("<")
  if (lt < 0) return null
  const tag = before.slice(lt)
  const m = /^<([A-Z][\w$.]*)\s(?:[^<>{}]|\{[^{}]*\})*?([\w:$-]*)$/.exec(tag)
  if (!m) return null
  // inside a quoted value (a quote opened outside braces and not closed): a value is being written, not a prop
  let q = ""
  for (const ch of tag.replace(/\{[^{}]*\}/g, "")) if (q ? ch === q : ch === `"` || ch === "'") q = q ? "" : ch
  if (q) return null
  return { comp: m[1]!, word: m[2] ?? "", tag }
}

/** Where the tag the caret is in ends: its `>` outside quotes and braces, or the next tag's `<` when this one is not
 * closed yet (`<Button |` above `<Button variant="x">`: the next tag's props are not this one's). */
export function tagEnd(value: string, caret: number): number {
  let q = "", depth = 0
  for (let i = caret; i < value.length; i++) {
    const ch = value[i]!
    if (q) { if (ch === q) q = ""; continue }
    if (depth) { if (ch === "{") depth++; else if (ch === "}") depth--; continue }
    if (ch === `"` || ch === "'") q = ch
    else if (ch === "{") depth = 1
    else if (ch === ">" || ch === "<") return i
  }
  return value.length
}
/** The props written in the caret's tag: before the caret (`tag`) and after it, up to the tag's end. */
export function writtenProps(tag: string, value: string, caret: number): Set<string> {
  const whole = (tag + value.slice(caret, tagEnd(value, caret))).replace(/\{[^{}]*\}|"[^"]*"|'[^']*'/g, " ")
  return new Set([...whole.matchAll(/\s([\w:$|-]+)(?==|\s|\/|$)/g)].map((m) => m[1]!.replace(/\|.*$/, "")))
}

/** The DOM events `on:` listens to, with what each is (the list inside a tag offers `on:click={…}` and the rest). */
export const DOM_EVENTS: readonly [string, string][] = [
  ["click", "Tıklanınca"], ["dblclick", "Çift tıklanınca"], ["contextmenu", "Sağ tıklanınca (bağlam menüsü)"],
  ["input", "Değer her değiştiğinde (yazarken)"], ["change", "Değer değişip onaylanınca"], ["submit", "Form gönderilince"],
  ["keydown", "Tuşa basılınca"], ["keyup", "Tuş bırakılınca"], ["focus", "Odak gelince"], ["blur", "Odak gidince"],
  ["focusin", "Kendisine ya da içindekine odak gelince"], ["focusout", "Kendisinden ya da içindekinden odak gidince"],
  ["pointerdown", "İşaretçi basılınca"], ["pointerup", "İşaretçi bırakılınca"], ["pointermove", "İşaretçi üzerinde gezinince"],
  ["pointerenter", "İşaretçi girince"], ["pointerleave", "İşaretçi çıkınca"], ["mouseenter", "Fare girince"], ["mouseleave", "Fare çıkınca"],
  ["wheel", "Tekerlek dönünce"], ["scroll", "Kaydırılınca"], ["touchstart", "Dokunulunca"], ["touchend", "Dokunma bitince"],
  ["dragstart", "Sürükleme başlayınca"], ["drop", "Üzerine bırakılınca"], ["animationend", "CSS animasyonu bitince"], ["transitionend", "CSS geçişi bitince"],
]
/** The core directives every tag takes (docs/core.md): written as code, in the Ortak group. */
export const CORE_PROPS: readonly OwnProp[] = [
  { name: "sx", group: "Ortak", write: "code", insert: "sx={{  }}", back: 3, type: "Sx", doc: "Tasarım belirteçleriyle stil: boşluk, renk, yazı, köşe… (sx={{ p: 4, bg: \"surface\" }})." },
  { name: "class", group: "Ortak", write: "text", type: "string | string[] | Record<string, boolean>", doc: "Sınıf adları: metin, dizi ya da { ad: koşul } nesnesi." },
  { name: "m:parts", group: "Ortak", write: "code", insert: "m:parts={{  }}", back: 3, type: "{ Bileşen: { özellik: değer } }", doc: "İçeride çizilen bileşenlere özellik verir: m:parts={{ Avatar: { size: \"lg\" } }} içerideki her Avatar'ı büyütür." },
  { name: "style", group: "Ortak", write: "code", insert: "style={{  }}", back: 3, type: "Record<string, string | number>", doc: "Satır içi stil (yalnız nesne)." },
  { name: "ref", group: "Ortak", write: "code", type: "(el: Element) => void", doc: "Çizilen öğeyi alır." },
  ...DOM_EVENTS.map(([ev, doc]): OwnProp => ({ name: `on:${ev}`, group: "Ortak", write: "code", type: `(e: Event) => void`,
    doc: `${doc} çalışır. Değiştiriciler: on:${ev}|prevent|stop|once|self|capture|passive.` })),
]

/** How a prop is written when picked: a boolean bare, a text in quotes, anything else (a function, an icon) in braces. */
export function insertOf(p: OwnProp): { insert?: string; back?: number } {
  if (p.insert) return { insert: p.insert, back: p.back ?? 0 }
  if (p.write === "bare") return {}
  if (p.write === "text") return { insert: `${p.name}=""`, back: 1 }
  if (p.write === "code") return { insert: `${p.name}={}`, back: 1 }
  // the type without its reactive wrapper and its empty values: MaybeFn<boolean | null | undefined> is a boolean
  const ty = (p.type ?? "").trim().replace(/^MaybeFn<([\s\S]*)>$/, "$1").replace(/\s*\|\s*(null|undefined)\b/g, "").trim()
  if (ty === "boolean") return {}
  const text = !!p.values?.length || ty === "string" || /^"[^"]*"(\s*\|\s*"[^"]*")*$/.test(ty) || /(Variant|Size|Weight|Shape|Tone|Color|Placement|Href|ClassProp)$/.test(ty)
  return text && !/^on[A-Z]/.test(p.name) ? { insert: `${p.name}=""`, back: 1 } : { insert: `${p.name}={}`, back: 1 }
}
/** The words a type lists (`"sm" | "md" | "lg"`, through MaybeFn): none for any other type. */
export function typeWords(type: string | undefined): string[] {
  const ty = (type ?? "").trim().replace(/^MaybeFn<([\s\S]*)>$/, "$1").replace(/\s*\|\s*(null|undefined)\b/g, "").trim()
  return /^"[^"]*"(\s*\|\s*"[^"]*")*$/.test(ty) ? [...ty.matchAll(/"([^"]*)"/g)].map((m) => m[1]!) : []
}

/** The prop name under the pointer (`at`) when it is inside a component's tag: the component and the name. */
export function propAt(value: string, at: number): { comp: string; name: string } | null {
  let a = at, b = at
  while (a > 0 && /[\w:$-]/.test(value[a - 1]!)) a--
  while (b < value.length && /[\w:$-]/.test(value[b]!)) b++
  if (a >= b) return null
  const t = tagAt(value.slice(0, b))
  return t && t.word && t.word === value.slice(a, b) ? { comp: t.comp, name: t.word } : null
}

/** The component name under the pointer: a tag's name (`<Button`, `</Button`) or a capitalized name elsewhere (the
 * import line, a reference); null for anything else. */
export function componentAt(value: string, at: number): string | null {
  let a = at, b = at
  while (a > 0 && /[\w$]/.test(value[a - 1]!)) a--
  while (b < value.length && /[\w$]/.test(value[b]!)) b++
  const name = value.slice(a, b)
  return /^[A-Z][\w$]*$/.test(name) && !/[\w$.]/.test(value[a - 1] ?? "") ? name : null
}

/** How a long type is shown in a list: the reactive wrapper and the empty values left out, cut at `max` letters. */
export const shortType = (type: string | undefined, max = 40): string => {
  const t = (type ?? "").trim().replace(/^MaybeFn<([\s\S]*)>$/, "$1").replace(/\s*\|\s*(null|undefined)\b/g, "").trim()
  return t.length > max ? `${t.slice(0, max - 1)}…` : t
}
/** The first sentence of a text (a prop's line in a component's list). */
export const firstSentence = (text: string | undefined): string => {
  const t = (text ?? "").trim(), m = /^[\s\S]*?[.!?](?=\s|$)/.exec(t)
  return (m ? m[0] : t).trim()
}

/** A prop's definition for the editor: its name and type on the first line, then its text. */
export const docOf = (p: OwnProp): { kind: string; signature: string; doc?: string } =>
  ({ kind: "property", signature: `${p.name}${p.type ? `: ${p.type}` : ""}`, ...(p.doc ? { doc: p.doc } : {}) })
