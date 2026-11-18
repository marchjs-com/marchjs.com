// The elements a playground file writes at its top level, assigned to nothing (a quick try):
//   <CodeEditor lineNumbers bind:value={$code} />
//   <Debugger session={session} />
// Each is a component of its own for the preview (a cell, its Properties, its place in the Dependencies tree): the build
// writes it as `export const CodeEditor_1 = (p) => <CodeEditor … {...p} />`, so its props are the ones written in the code
// and what is changed in Properties goes over them.

/** A top-level element: its export name, its tag, where it stands and where its opening tag ends (the spread goes there). */
export interface JsxRoot { name: string; tag: string; from: number; to: number; spreadAt: number }

const ident = /[A-Za-z_$][\w$.-]*/y;

/** Skip a string, a template or a comment at `i`; returns the index after it (or `i` when there is none). */
function skipQuoted(s: string, i: number): number {
  const c = s[i];
  if (c === "/" && s[i + 1] === "/") { const n = s.indexOf("\n", i); return n < 0 ? s.length : n; }
  if (c === "/" && s[i + 1] === "*") { const n = s.indexOf("*/", i + 2); return n < 0 ? s.length : n + 2; }
  if (c !== '"' && c !== "'" && c !== "`") return i;
  for (let j = i + 1; j < s.length; j++) {
    if (s[j] === "\\") { j++; continue; }
    if (c === "`" && s[j] === "$" && s[j + 1] === "{") { j = skipBraces(s, j + 1) - 1; continue; }
    if (s[j] === c) return j + 1;
  }
  return s.length;
}
/** `{ … }` at `i` (nested braces, strings, JSX inside); returns the index after the closing brace. */
function skipBraces(s: string, i: number): number {
  let depth = 0;
  for (let j = i; j < s.length; j++) {
    const k = skipQuoted(s, j);
    if (k !== j) { j = k - 1; continue; }
    if (s[j] === "{") depth++;
    else if (s[j] === "}" && --depth === 0) return j + 1;
  }
  return s.length;
}
/** An element at `i` (`<Tag …/>`, `<Tag …>…</Tag>`, `<>…</>`); null when it is not one. */
function element(s: string, i: number): { tag: string; end: number; spreadAt: number } | null {
  if (s[i] !== "<") return null;
  ident.lastIndex = i + 1;
  const m = ident.exec(s);
  const tag = m ? m[0] : "";
  if (!tag && s[i + 1] !== ">") return null;
  let j = i + 1 + tag.length;
  // the attributes
  for (; j < s.length; j++) {
    const c = s[j];
    if (c === "{") { j = skipBraces(s, j) - 1; continue; }
    if (c === '"' || c === "'") { j = skipQuoted(s, j) - 1; continue; }
    if (c === "/" && s[j + 1] === ">") return { tag, end: j + 2, spreadAt: j };
    if (c === ">") break;
  }
  if (j >= s.length) return null;
  const spreadAt = j;
  // the children, up to </tag>
  for (j = j + 1; j < s.length; j++) {
    const c = s[j];
    if (c === "{") { j = skipBraces(s, j) - 1; continue; }
    if (c === "<" && s[j + 1] === "/") {
      const close = s.indexOf(">", j);
      if (close < 0) return null;
      return { tag, end: close + 1, spreadAt };
    }
    if (c === "<") { const kid = element(s, j); if (!kid) return null; j = kid.end - 1; }
  }
  return null;
}

/** An element of the written JSX: its tag ("" for a fragment), where it stands in the text (from its `<` to after its
 * end) and the elements written inside it, in order. */
export interface JsxNode { tag: string; from: number; to: number; kids: JsxNode[] }
/** An element at `i` with the elements inside it: in its children and in their `{…}` expressions (a `.map(… => <X/>)`). */
function elementTree(s: string, i: number): { node: JsxNode; end: number } | null {
  if (s[i] !== "<") return null;
  ident.lastIndex = i + 1;
  const tag = ident.exec(s)?.[0] ?? "";
  if (!tag && s[i + 1] !== ">") return null;
  let j = i + 1 + tag.length;
  for (; j < s.length; j++) {
    const c = s[j];
    if (c === "{") { j = skipBraces(s, j) - 1; continue; }
    if (c === '"' || c === "'") { j = skipQuoted(s, j) - 1; continue; }
    if (c === "/" && s[j + 1] === ">") return { node: { tag, from: i, to: j + 2, kids: [] }, end: j + 2 };
    if (c === ">") break;
  }
  const kids: JsxNode[] = [];
  for (j = j + 1; j < s.length; j++) {
    const c = s[j];
    if (c === "{") { const e = skipBraces(s, j); kids.push(...jsxTree(s, j + 1, e - 1)); j = e - 1; continue; }
    if (c === "<" && s[j + 1] === "/") { const close = s.indexOf(">", j); return close < 0 ? null : { node: { tag, from: i, to: close + 1, kids }, end: close + 1 }; }
    if (c === "<") { const kid = elementTree(s, j); if (!kid) return null; kids.push(kid.node); j = kid.end - 1; }
  }
  return null;
}
/**
 * The elements written in `s` (from `from` to `to`), as a tree: each where it is written, nested as in the code. An
 * element counts where a value can stand (after `=>`, `=`, `(`, `?`, `:`, `,`, `&&`, `return`, or at the start of the
 * part read): a `<` of a comparison or a type is not one.
 */
export function jsxTree(s: string, from = 0, to = s.length): JsxNode[] {
  const out: JsxNode[] = [];
  for (let i = from; i < to; i++) {
    const k = skipQuoted(s, i);
    if (k !== i) { i = k - 1; continue; }
    if (s[i] !== "<") continue;
    const before = s.slice(from, i).replace(/(\/\/[^\n]*|\s)+$/, "");
    if (before && !/(=>|[=(,?:&|{]|\breturn|\byield|\bdefault)$/.test(before)) continue;
    const el = elementTree(s, i);
    if (!el || el.end > to) continue;
    out.push(el.node);
    i = el.end - 1;
  }
  return out;
}

/** The top-level elements of `src` (outside every function, object and call; at the start of a line, not a value). */
export function findRoots(src: string): JsxRoot[] {
  const out: JsxRoot[] = [], count = new Map<string, number>();
  let depth = 0;
  for (let i = 0; i < src.length; i++) {
    const k = skipQuoted(src, i);
    if (k !== i) { i = k - 1; continue; }
    const c = src[i];
    if (c === "{" || c === "(" || c === "[") { depth++; continue; }
    if (c === "}" || c === ")" || c === "]") { depth = Math.max(0, depth - 1); continue; }
    if (c !== "<" || depth) continue;
    // at a line's start, and not the value of what comes before (=, =>, (, ?, :, ,, &&, ||, return). A value is skipped
    // whole: its children on lines of their own (`() => <div>` then `<Button …/>` lines) are not roots
    const before = src.slice(0, i).replace(/(\/\/[^\n]*|\s)+$/, "");
    if (/(=>|[=(,?:&|+\-*]|\breturn|\byield|\bdefault)$/.test(before)) { const v = element(src, i); if (v) i = v.end - 1; continue; }
    const line = src.lastIndexOf("\n", i - 1) + 1;
    if (src.slice(line, i).trim()) continue;
    const el = element(src, i);
    if (!el || !el.tag) continue;
    const base = el.tag.charAt(0).toUpperCase() + el.tag.slice(1).replace(/[.-](\w)/g, (_, x: string) => x.toUpperCase());
    const n = (count.get(base) ?? 0) + 1;
    count.set(base, n);
    out.push({ name: `${base}_${n}`, tag: /^[a-z]/.test(el.tag) ? `<${el.tag}>` : el.tag, from: i, to: el.end, spreadAt: el.spreadAt });
    i = el.end - 1;
  }
  return out;
}

/** The code with each root written as an exported component that takes its props over the written ones, and where
 *  text was inserted ([at, length] in the original), so positions can be mapped (the editor's ↔ the language service's).
 *  `typed`: the props parameter has a type (a .ts / .tsx file). */
export function viewRoots(src: string, typed = true, roots: readonly JsxRoot[] = findRoots(src)): { text: string; inserts: [number, number][] } {
  let out = "", at = 0;
  const inserts: [number, number][] = [];
  const add = (pos: number, text: string): void => { out += src.slice(at, pos) + text; at = pos; inserts.push([pos, text.length]); };
  for (const r of roots) {
    add(r.from, `export const ${r.name} = (__p${typed ? ": any" : ""}) => (`);
    add(r.spreadAt, " {...__p}");
    add(r.to, ");");
  }
  return { text: out + src.slice(at), inserts };
}
/** The code built: each root an exported component (see viewRoots). */
export function exportRoots(src: string, typed = true, roots: readonly JsxRoot[] = findRoots(src)): string {
  return viewRoots(src, typed, roots).text;
}
/** A position of the original text in the text with the inserts (an insert at the position comes before it). */
export function toView(inserts: readonly (readonly [number, number])[], pos: number): number {
  let shift = 0;
  for (const [at, len] of inserts) if (at <= pos) shift += len;
  return pos + shift;
}
/** A position of the text with the inserts in the original (inside an insert: where the insert stands). */
export function toOriginal(inserts: readonly (readonly [number, number])[], pos: number): number {
  let shift = 0;
  for (const [at, len] of inserts) {
    const v = at + shift;
    if (pos < v) break;
    if (pos < v + len) return at;
    shift += len;
  }
  return pos - shift;
}
