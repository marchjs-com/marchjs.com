// Comparative render benchmark: the measurement core (no DOM). Row data, the operation list, statistics and the
// share-link codec. Every library under test gets the same rows from the same seeded generator, so the work is equal.

export interface Row { id: number; label: string }

/** What every benchmark app does (one per library, src/bench/apps/*). Select and remove are clicks on a row's links
 * (`a.lbl`, `a.rm`): the library's own event handling runs. */
export interface BenchApp {
  /** Replace all rows. */
  run(rows: Row[]): void
  /** Append rows. */
  add(rows: Row[]): void
  /** Append " !!!" to every 10th row's label. */
  update(): void
  /** Swap the 2nd and the 999th row. */
  swap(): void
  /** Remove every row. */
  clear(): void
  /** Unmount and release everything. */
  destroy(): void
}
export type MountFn = (host: HTMLElement) => BenchApp | Promise<BenchApp>

const ADJ = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive", "cheap", "expensive", "fancy"]
const COLOR = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"]
const NOUN = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse", "keyboard"]

/** Seeded PRNG (mulberry32): the same seed gives every library the same labels. */
export function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Row source: ids keep counting up (as in js-framework-benchmark), labels come from the seeded generator. */
export function rowSource(seed = 1): (count: number) => Row[] {
  const r = rng(seed)
  let next = 1
  const pick = (list: string[]): string => list[Math.floor(r() * list.length)]!
  return (count) => {
    const out: Row[] = new Array(count)
    for (let i = 0; i < count; i++) out[i] = { id: next++, label: `${pick(ADJ)} ${pick(COLOR)} ${pick(NOUN)}` }
    return out
  }
}

export type OpId = "create1k" | "create10k" | "replace" | "update" | "select" | "swap" | "remove" | "clear" | "append"
/** One measured operation: `setup` runs unmeasured before every sample, `act` is timed up to the next paint, `check`
 * reads the DOM afterwards (a library that skips work fails the check instead of winning). */
export interface Op {
  id: OpId
  label: string
  desc: string
  /** warm-up samples before the measured ones */
  warm: number
  /** the most a sample is expected to take (ms): a library with a sample over it, or whose samples add up to more than
   * limit × samples, is stopped for this operation and reported as not finishing in the expected time */
  limit: number
  setup(app: BenchApp, rows: (n: number) => Row[], dom: DomProbe): void
  /** Reads the prepared table after setup has been drawn (libraries that render in a microtask have drawn by then). */
  mark?(dom: DomProbe): void
  act(app: BenchApp, rows: (n: number) => Row[], dom: DomProbe): void
  check(dom: DomProbe): boolean
}
/** The few DOM reads the operations need (the browser side gives a real one, tests a fake). */
export interface DomProbe {
  count(): number
  label(i: number): string
  id(i: number): string
  selected(i: number): boolean
  click(i: number, link: "lbl" | "rm"): void
}

const fresh = (app: BenchApp, rows: (n: number) => Row[], n: number) => { app.clear(); app.run(rows(n)) }
let before = ""
/** The start of the error a library gets when its samples of an operation take longer than expected (Op.limit). */
export const TIMEOUT = "Beklenen sürede bitiremedi"
export const OPS: Op[] = [
  { id: "create1k", label: "1.000 satır oluştur", desc: "Boş tabloya 1.000 satır", warm: 0, limit: 1000,
    setup: (a) => a.clear(), act: (a, r) => a.run(r(1000)), check: (d) => d.count() === 1000 },
  { id: "create10k", label: "10.000 satır oluştur", desc: "Boş tabloya 10.000 satır", warm: 0, limit: 5000,
    setup: (a) => a.clear(), act: (a, r) => a.run(r(10000)), check: (d) => d.count() === 10000 },
  { id: "replace", label: "Tümünü değiştir", desc: "1.000 satırın yerine yeni 1.000 satır", warm: 0, limit: 1000,
    setup: (a, r) => fresh(a, r, 1000), mark: (d) => { before = d.id(0) }, act: (a, r) => a.run(r(1000)), check: (d) => d.count() === 1000 && d.id(0) !== before },
  { id: "update", label: "Her 10. satırı güncelle", desc: "1.000 satırda her 10. satırın etiketine ekleme", warm: 0, limit: 1000,
    setup: (a, r) => fresh(a, r, 1000), act: (a) => a.update(), check: (d) => d.label(0).endsWith(" !!!") && d.label(10).endsWith(" !!!") && !d.label(1).endsWith(" !!!") },
  { id: "select", label: "Satır seç", desc: "1.000 satırdan birine tıklayıp vurgulamak", warm: 0, limit: 1000,
    setup: (a, r) => fresh(a, r, 1000), act: (_a, _r, d) => d.click(1, "lbl"), check: (d) => d.selected(1) && !d.selected(0) },
  { id: "swap", label: "İki satırı takas et", desc: "1.000 satırda 2. ve 999. satırın yer değiştirmesi", warm: 0, limit: 1000,
    setup: (a, r) => fresh(a, r, 1000), mark: (d) => { before = d.id(1) }, act: (a) => a.swap(), check: (d) => d.id(998) === before && d.count() === 1000 },
  { id: "remove", label: "Satır sil", desc: "1.000 satırdan birini silmek", warm: 0, limit: 1000,
    setup: (a, r) => fresh(a, r, 1000), mark: (d) => { before = d.id(3) }, act: (_a, _r, d) => d.click(3, "rm"), check: (d) => d.count() === 999 && d.id(3) !== before },
  { id: "clear", label: "Temizle", desc: "1.000 satırın hepsini kaldırmak", warm: 0, limit: 1000,
    setup: (a, r) => fresh(a, r, 1000), act: (a) => a.clear(), check: (d) => d.count() === 0 },
  { id: "append", label: "10.000 satır ekle", desc: "1.000 satırlık tablonun sonuna 10.000 satır", warm: 0, limit: 5000,
    setup: (a, r) => fresh(a, r, 1000), act: (a, r) => a.add(r(10000)), check: (d) => d.count() === 11000 },
]
export const opById = (id: string): Op | undefined => OPS.find((o) => o.id === id)

/** Two-sided 95% Student t quantiles for n − 1 degrees of freedom (1…30), then the normal value. */
const T95 = [12.706, 4.303, 3.182, 2.776, 2.571, 2.447, 2.365, 2.306, 2.262, 2.228, 2.201, 2.179, 2.16, 2.145, 2.131, 2.12, 2.11, 2.101, 2.093, 2.086, 2.08, 2.074, 2.069, 2.064, 2.06, 2.056, 2.052, 2.048, 2.045, 2.042]
export const t95 = (df: number): number => (df < 1 ? NaN : df <= 30 ? T95[df - 1]! : 1.96)

export interface Stats { n: number; median: number; mean: number; sd: number; ci: [number, number]; min: number; max: number }
/** Median, mean, sample standard deviation and the 95% confidence interval of the mean. */
export function stats(samples: readonly number[]): Stats {
  const n = samples.length
  if (!n) return { n: 0, median: NaN, mean: NaN, sd: NaN, ci: [NaN, NaN], min: NaN, max: NaN }
  const s = [...samples].sort((a, b) => a - b)
  const median = n % 2 ? s[(n - 1) >> 1]! : (s[n / 2 - 1]! + s[n / 2]!) / 2
  const mean = s.reduce((a, b) => a + b, 0) / n
  const sd = n > 1 ? Math.sqrt(s.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1)) : 0
  const h = n > 1 ? t95(n - 1) * sd / Math.sqrt(n) : 0
  return { n, median, mean, sd, ci: [mean - h, mean + h], min: s[0]!, max: s[n - 1]! }
}

/** Share of the median above which a result is not trusted (a busy machine). */
export const NOISE = 0.15
/** True when the standard deviation or the half-width of the 95% interval is above NOISE × median. */
export function unreliable(s: Stats): boolean {
  if (s.n < 2 || !(s.median > 0)) return false
  return s.sd > NOISE * s.median || (s.ci[1] - s.ci[0]) / 2 > NOISE * s.median
}

/** True when two results' 95% intervals overlap: their order is within the noise. */
export const overlaps = (a: Stats, b: Stats): boolean => a.n > 1 && b.n > 1 && a.ci[0] <= b.ci[1] && b.ci[0] <= a.ci[1]

/** Factor against the baseline (pure JavaScript, no framework): 1.00 = as fast, 2.00 = twice the time. */
export const factor = (value: number, base: number): number => (base > 0 && Number.isFinite(value) ? value / base : NaN)

/**
 * Place of each result counting only clear wins: 1 + the number of others whose 95% interval lies wholly below its own.
 * Results whose intervals overlap share a place (a tie within the noise). `skip` (the yardstick) is not counted.
 */
export function places<T extends { id: string; stats: Stats }>(list: readonly T[], skip?: string): Map<string, number> {
  const ok = list.filter((x) => x.stats.n > 1 && x.id !== skip)
  return new Map(ok.map((x) => [x.id, 1 + ok.filter((y) => y !== x && y.stats.ci[1] < x.stats.ci[0]).length]))
}

/** Results ranked fastest first (by median); failed or empty entries last. */
export function rank<T extends { stats: Stats; error?: string | undefined }>(list: readonly T[]): T[] {
  const key = (x: T) => (x.error || !x.stats.n ? Infinity : x.stats.median)
  return [...list].sort((a, b) => key(a) - key(b))
}

/** One run's results: everything the share link, the JSON file and the table need. */
export interface RunResult {
  v: 1
  date: string
  env: { ua: string; cores?: number | undefined; memory?: number | undefined; screen?: string | undefined; dpr?: number | undefined }
  reps: number
  /** library id → op id → samples (ms): the whole sample, from its start to its end (preparing the table, the operation,
   * emptying the table again, with their paints: nothing the library does is left out) */
  samples: Record<string, Record<string, number[]>>
  /** library id → op id → the operation alone (ms, from the call to its paint; older results have none) */
  act?: Record<string, Record<string, number[]>>
  /** library id → op id → the most JS heap any of its samples grew by (MB, from that sample's start, read after each
   * paint); only where the browser reports the heap */
  heapMax?: Record<string, Record<string, number>>
  /** library id → op id → the busiest any of its samples kept the page's main thread (% of the sample's time: its calls
   * with their microtasks, and its frames from their start to the end of their paint) */
  cpuMax?: Record<string, Record<string, number>>
  /** library id → op id → reason (a failed check, a load error) */
  errors: Record<string, Record<string, string>>
  /** library id → first paint (ms: download + start-up + first empty draw) */
  firstPaint: Record<string, number>
  /** library id → JS heap growth after 1.000 rows (MB), when the browser reports it */
  memory: Record<string, number>
}

const b64url = (bytes: Uint8Array): string => {
  let s = ""
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}
const unb64url = (text: string): Uint8Array => {
  const s = atob(text.replace(/-/g, "+").replace(/_/g, "/"))
  const out = new Uint8Array(s.length)
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i)
  return out
}
async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const buf = await new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(stream)).arrayBuffer()
  return new Uint8Array(buf)
}
/** Samples rounded to 0.1 ms keep the link short. */
const round1 = (m: Record<string, Record<string, number[]>>) => Object.fromEntries(Object.entries(m).map(([k, ops]) => [k, Object.fromEntries(Object.entries(ops).map(([o, xs]) => [o, xs.map((x) => Math.round(x * 10) / 10)]))]))
const round = (r: RunResult): RunResult => ({ ...r, samples: round1(r.samples), ...(r.act ? { act: round1(r.act) } : {}) })
/** Result → deflate → base64url (the share link's hash part). */
export async function encodeResult(r: RunResult): Promise<string> {
  return b64url(await pipe(new TextEncoder().encode(JSON.stringify(round(r))), new CompressionStream("deflate-raw")))
}
/** The reverse of encodeResult; null for a broken or foreign value. */
export async function decodeResult(text: string): Promise<RunResult | null> {
  try {
    const r = JSON.parse(new TextDecoder().decode(await pipe(unb64url(text), new DecompressionStream("deflate-raw")))) as RunResult
    return r && r.v === 1 && typeof r.samples === "object" ? r : null
  } catch { return null }
}
