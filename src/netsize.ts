// Size of a loaded file for the Speed page's live network panel. The browser measures a response only when it may:
// a cross-origin file without Timing-Allow-Origin reports transferSize ≈ the headers (~300 B) and body sizes 0.
// Then the build report (march-report.json › files: raw + gzip per file) gives the real size, and the row says so.

/** What the Resource Timing entry gave (the fields that matter). */
export interface Timing { transferSize: number; encodedBodySize: number; decodedBodySize: number; workerStart?: number }
export type SizeFrom = "ölçülen" | "derleme raporu" | "bilinmiyor";
export interface FileSize { raw: number; gzip: number }

/** True when the entry carries real body sizes (same origin, or Timing-Allow-Origin). A cache hit is measured too. */
export const measured = (e: Timing): boolean => e.encodedBodySize > 0 || e.decodedBodySize > 0;

/** Bytes that went over the wire for a measured entry (0 for a cache or service-worker hit). */
export const wireBytes = (e: Timing): number => (e.transferSize > 0 ? Math.max(e.transferSize, e.encodedBodySize) : 0);

/** The file's path relative to the app base, without `?v=` (the report's key). */
export function reportKey(href: string, base: string): string {
  const u = new URL(href), b = new URL(".", base);
  const path = u.pathname.startsWith(b.pathname) ? u.pathname.slice(b.pathname.length) : u.pathname.replace(/^\//, "");
  return decodeURIComponent(path);
}

/**
 * The size to show: measured bytes when the browser measured the response; else the report's gzip size (raw too);
 * else unknown. `fromCache` rows show the file size from either source (nothing went over the wire).
 */
export function resolveSize(e: Timing & { key: string }, files: Record<string, FileSize> | null | undefined): { bytes: number; raw: number | null; from: SizeFrom } {
  if (measured(e)) return { bytes: e.transferSize > 0 ? wireBytes(e) : e.encodedBodySize, raw: e.decodedBodySize || null, from: "ölçülen" };
  const f = files?.[e.key] ?? files?.[e.key.replace(/^\.\//, "")];
  if (f) return { bytes: f.gzip, raw: f.raw, from: "derleme raporu" };
  return { bytes: 0, raw: null, from: "bilinmiyor" };
}
