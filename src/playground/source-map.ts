// A source map read without a library: a place of the built bundle (its line and column, 1-based line, 0-based column)
// back to the file and line it came from. MarchIDE maps an error's stack (the preview runs the bundle) to the code tabs.

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const VAL = new Map([...B64].map((c, i) => [c, i] as const));

/** One segment's numbers (base64 VLQ): generated column, source, original line, original column, name. */
function vlq(seg: string): number[] {
  const out: number[] = [];
  let shift = 0, value = 0;
  for (const ch of seg) {
    const d = VAL.get(ch);
    if (d === undefined) return out;
    value += (d & 31) << shift;
    if (d & 32) { shift += 5; continue; }
    out.push(value & 1 ? -(value >>> 1) : value >>> 1);
    value = 0; shift = 0;
  }
  return out;
}

/** A parsed map: per generated line, its segments [column, source, line, column] (absolute, 0-based). */
export interface SourceMap { sources: string[]; lines: [number, number, number, number][][] }

/** Reads a source map's JSON (version 3). */
export function parseSourceMap(json: string): SourceMap | null {
  let m: { sources?: string[]; mappings?: string };
  try { m = JSON.parse(json); } catch { return null; }
  if (!m.mappings || !m.sources) return null;
  const lines: [number, number, number, number][][] = [];
  let src = 0, oline = 0, ocol = 0;
  for (const text of m.mappings.split(";")) {
    const segs: [number, number, number, number][] = [];
    let gcol = 0;
    for (const s of text.split(",")) {
      if (!s) continue;
      const v = vlq(s);
      gcol += v[0] ?? 0;
      if (v.length >= 4) { src += v[1]!; oline += v[2]!; ocol += v[3]!; segs.push([gcol, src, oline, ocol]); }
    }
    lines.push(segs);
  }
  return { sources: m.sources, lines };
}

/** The original place of a generated one (`line` 1-based, `column` 0-based): the segment at or before the column. */
export function originalAt(map: SourceMap, line: number, column: number): { source: string; line: number; column: number } | null {
  const segs = map.lines[line - 1];
  if (!segs?.length) return null;
  let best = segs[0]!;
  for (const s of segs) { if (s[0] <= column) best = s; else break; }
  const source = map.sources[best[1]];
  return source === undefined ? null : { source, line: best[2] + 1, column: best[3] };
}

/** The frames of an error's stack that point into a blob: module (the preview's bundle): their line and column. */
export function blobFrames(stack: string): { fn: string; line: number; column: number }[] {
  const out: { fn: string; line: number; column: number }[] = [];
  for (const l of stack.split("\n")) {
    const m = /^\s*at (?:(.+?) \()?blob:[^\s)]+?:(\d+):(\d+)\)?\s*$/.exec(l) ?? /^\s*(?:(.*?)@)?blob:[^\s]+?:(\d+):(\d+)\s*$/.exec(l);
    if (m) out.push({ fn: m[1]?.trim() ?? "", line: Number(m[2]), column: Number(m[3]) - 1 });
  }
  return out;
}
