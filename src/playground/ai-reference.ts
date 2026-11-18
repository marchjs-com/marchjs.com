// MarchIDE's AI reference: what the model knows about March besides the guide (AI_INSTRUCTIONS.md). Two layers, both
// read from the API reference's data (public/api, the same files the API page uses):
// - the index: every export of every subpath with its kind and one-line purpose (sent with the instructions, cached
//   by the provider, so a later message pays about a tenth for it);
// - the details: for the March names a message is about (the open file's imports and tags, the selection, the
//   question), the full entry: signature, every prop / parameter with its type and description, the return value.
import { appUrl } from "march/base"

type Item = [name: string, kind: string, summary: string, status: string, file: number]
interface Sub { subpath: string; slug: string; items: Item[] }
interface Doc {
  subpath: string; name: string; kind: string; doc: string; signature?: string; deprecated?: string
  params?: { name: string; type: string; optional: boolean; doc: string }[]
  returns?: { type: string; doc: string }
  props?: { name: string; type: string; optional: boolean; doc: string }[]
}

// the reference's own subpaths that say nothing about writing code (generated data, icon catalogues)
const SKIP = /registry\.gen|icons\/packs|icons\/catalog/
const json = <T>(path: string): Promise<T> => fetch(appUrl(path)).then((r) => { if (!r.ok) throw new Error(`${path}: ${r.status}`); return r.json() as Promise<T> })

let subs: Promise<Sub[]> | null = null
const index = (): Promise<Sub[]> => (subs ??= json<{ subpaths: Sub[] }>("api/index.en.json").then((j) => j.subpaths.filter((s) => !SKIP.test(s.subpath))).catch((e) => { subs = null; throw e }))
const files = new Map<number, Promise<Record<string, Doc>>>()
const docFile = (n: number): Promise<Record<string, Doc>> => { let p = files.get(n); if (!p) files.set(n, (p = json<Record<string, Doc>>(`api/docs-${n}.json`).catch((e) => { files.delete(n); throw e }))); return p }

/** Every export of March, by subpath: `- name (kind): purpose`. */
export async function aiIndex(): Promise<string> {
  const list = await index()
  const out = ["# March API index (every export; the details of the ones a message uses come with it)"]
  for (const s of list) {
    const rows = s.items.filter((it) => !it[0].startsWith("_") && it[3] !== "deprecated")
    if (!rows.length) continue
    out.push(`\n## ${s.subpath}`)
    for (const [name, kind, summary] of rows) out.push(`- ${name} (${kind})${summary ? `: ${summary.replace(/\s+/g, " ").slice(0, 160)}` : ""}`)
  }
  return out.join("\n")
}

/** The March names in a text: what it imports from march / march/…, and the index's names it uses as words or tags. */
export async function marchNamesIn(text: string): Promise<string[]> {
  const known = new Set((await index()).flatMap((s) => s.items.map((it) => it[0])).filter((n) => !n.startsWith("_")))
  const found = new Set<string>()
  for (const m of text.matchAll(/import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*["']march(?:\/[\w/.-]+)?["']/g))
    for (const part of m[1]!.split(",")) { const n = part.trim().replace(/^type\s+/, "").split(/\s+as\s+/)[0]!.trim(); if (known.has(n)) found.add(n) }
  // components (capitalised, in tags or words) and the camelCase functions the text calls
  for (const m of text.matchAll(/<([A-Z]\w*)|\b([A-Z]\w{2,})\b|\b([a-z]\w{2,})\s*\(/g)) { const n = m[1] ?? m[2] ?? m[3]!; if (known.has(n)) found.add(n) }
  return [...found]
}

/** The full entries of `names` (at most `max`, those found first): signature, props / parameters, return value. */
export async function aiDetails(names: readonly string[], max = 40): Promise<string> {
  if (!names.length) return ""
  const list = await index(), out: string[] = []
  const where = new Map<string, Item & { sub: string }>()
  for (const s of list) for (const it of s.items) if (!where.has(it[0])) where.set(it[0], Object.assign([...it] as Item, { sub: s.subpath }))
  for (const name of names.slice(0, max)) {
    const it = where.get(name)
    if (!it) continue
    const d = (await docFile(it[4]).catch(() => ({} as Record<string, Doc>)))[`${it.sub}#${name}`]
    if (!d) continue
    const lines = [`### ${d.name} (${d.kind}, import from "${d.subpath}")`, d.doc.trim()]
    if (d.signature) lines.push("```ts", d.signature.trim(), "```")
    if (d.props?.length) lines.push("Props:", ...d.props.map((p) => `- ${p.name}${p.optional ? "?" : ""}: ${p.type}${p.doc ? ` — ${p.doc}` : ""}`))
    else if (d.params?.length) lines.push("Parameters:", ...d.params.map((p) => `- ${p.name}${p.optional ? "?" : ""}: ${p.type}${p.doc ? ` — ${p.doc}` : ""}`))
    if (d.returns?.type && d.returns.type !== "void") lines.push(`Returns: ${d.returns.type}${d.returns.doc ? ` — ${d.returns.doc}` : ""}`)
    out.push(lines.join("\n"))
  }
  return out.length ? `# March reference for this message (full entries)\n\n${out.join("\n\n")}` : ""
}
