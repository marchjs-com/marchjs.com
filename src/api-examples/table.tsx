// API examples of the table (hadi-march/table) and the CRUD screen built on it (hadi-march/crud). The <Table> and
// crud() examples load their modules when they open (the table renderer is the same lazy part the data page uses).
// Layout and rules: tools/api-examples.js. Each `run` is a small live demo of its `code`.
import { signal, untrack, Await } from "hadi-march";
import { schema } from "hadi-march/schema";
import {
  CellEditor, column, createTable, createVirtual, csvField, describeFilter, download, FilterControl, formatValue,
  isEmptyFilter, mapParams, matchFilter, sortRows, toCSV, toJSON, windowRange, type SortSpec,
} from "hadi-march/table";
import { Button, Badge, Segmented, TextInput, Slider } from "hadi-march/ui";
import { examples } from "./types.ts";
import { Out, Log, Row } from "./_kit.tsx";
import { ORDERS, money, type Order } from "./_orders.ts";
import "./table.css";
export { default as SIG } from "./table.sig.gen.ts";

const now = () => new Date().toLocaleTimeString("tr-TR")
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const json = (v: unknown) => JSON.stringify(v)
/** Renders `children(module)` once `load()` resolves (a lazy part). */
function Load<M>(props: { load: () => Promise<M>; children: (m: M) => unknown }) {
  return <Await for={props.load} loading={<p class="hm-muted">Yükleniyor…</p>}>{props.children}</Await>
}

const COLS = [
  { key: "customer", label: "Müşteri" },
  { key: "region", label: "Bölge", filter: "select" as const },
  { key: "amount", label: "Tutar", type: "number", format: ["money", "TRY"] as [string, string], filter: "range" as const, editable: true },
  { key: "paid", label: "Ödendi", type: "bool", filter: "bool" as const, editable: true },
  { key: "date", label: "Tarih", format: "date", filter: "dateRange" as const },
]
const OrderList = (props: { rows: () => readonly Order[] }) =>
  <ul class="sc-ex-table-list">{() => props.rows().map((o) => <li><span>{o.customer}</span><span>{o.region} · {money(o.amount)}</span></li>)}</ul>


export default examples({
  "hadi-march/crud": {
    crud: {
      code: `{crud({ list, create, update, remove }, {
  schema: Customer, title: "Müşteriler", mode: "client",
  can: { remove: "customers.delete" },
})}`,
      run: () => {
        const Customer = schema({
          id: { type: "int", readonly: true, label: "No" },
          name: { type: "text", required: true, label: "Ad" },
          city: { type: "pick", options: ["İzmir", "Ankara", "Bursa"], label: "Şehir" },
          credit: { type: "money", currency: "TRY", min: 0, label: "Kredi" },
        })
        let rows = [{ id: 1, name: "Acme", city: "İzmir", credit: 5000 }, { id: 2, name: "Bora Yapı", city: "Ankara", credit: 1200 }, { id: 3, name: "Çınar Gıda", city: "Bursa", credit: 800 }]
        let next = 4
        return <Load load={() => import("hadi-march/crud")}>{({ crud }: { crud: (...a: any[]) => unknown }) => crud({
          list: async () => { await wait(200); return rows },
          create: async (v) => { rows = [...rows, { ...(v as typeof rows[0]), id: next++ }] },
          update: async (id, v) => { rows = rows.map((r) => (r.id === id ? { ...r, ...v } : r)) },
          remove: async (id) => { rows = rows.filter((r) => r.id !== id) },
        }, { schema: Customer as never, title: "Müşteriler", mode: "client", pageSize: 5, labels: { create: "Yeni müşteri" } })}</Load>
      },
    },
  },
  "hadi-march/table": {
    CellEditor: {
      code: `// inside a custom cell: the editor of table.editing() (Enter saves, Escape cancels)
{() => table.editing()?.key === col.key
  ? CellEditor(table, col, row, "orders")
  : <button onClick={() => table.startEdit(row, col.key)}>{table.format(row, col)}</button>}`,
      play: { options: [{ key: "col", label: "Sütun", default: "amount", options: [{ value: "customer", label: "Metin" }, { value: "amount", label: "Sayı" }, { value: "paid", label: "Onay" }] }] },
      run: (p: { values: { col: string } }) => {
        const rows = signal<Order[]>([ORDERS[0]!])
        const log = signal<string[]>([])
        const table = createTable<Order>({
          rows, columns: COLS.map((c) => ({ ...c, editable: true, validate: c.key === "amount" ? (v: unknown) => (Number(v) > 0 ? null : "Tutar 0'dan büyük olmalı") : undefined })),
          onEdit: (row, key, value) => { rows.set([{ ...row, [key]: value }]); log.update((l) => [...l, `${now()} ${key} = ${json(value)}`]) },
        })
        return <div class="sc-ex-table-stack">
          {() => {
            const key = p.values.col
            return untrack(() => {
              const col = table.column(key)!
              return <Row>
                <span>{col.label}:</span>
                {() => { const row = rows()[0]!; return table.editing()?.key === key ? untrack(() => CellEditor(table, col, row, "sc-ex-cell")) : <button type="button" class="sc-ex-table-cell" onClick={() => table.startEdit(row, key)}>{String(table.format(row, col))} ✎</button> }}
              </Row>
            })
          }}
          <Log lines={log} />
        </div>
      },
    },
    column: {
      code: `column({ key: "amount", format: ["money", "TRY"], filter: "range" })
// { label: "Amount", align: "end", sortable: true, searchable: false, minWidth: 48, … }`,
      run: () => {
        const inputs: Record<string, Parameters<typeof column>[0]> = {
          "metin": { key: "customerName" },
          "para": { key: "amount", format: ["money", "TRY"], filter: "range" },
          "hesaplı": { label: "KDV", value: (r: unknown) => (r as Order).amount * 0.2, sortValue: (r: unknown) => (r as Order).amount },
        }
        const pick = signal("para")
        return <div class="sc-ex-table-stack">
          <Segmented value={pick} onChange={(v: string) => pick.set(v)} options={Object.keys(inputs)} aria-label="Tanım" />
          {() => { const c = column(inputs[pick()]!); return <Row>{(["label", "align", "sortable", "searchable", "filter"] as const).map((k) => <Out label={k} value={json(c[k])} />)}</Row> }}
        </div>
      },
    },
    createTable: {
      code: `const table = createTable({ rows: orders, columns: ["customer", "region", "amount"], pageSize: 3 })
table.toggleSort("amount")   table.setSearch("ege")   table.next()
<For each={table.rows}>{(o) => <OrderRow order={o()} />}</For>`,
      run: () => {
        const table = createTable<Order>({ rows: ORDERS, columns: COLS, pageSize: 3 })
        return <div class="sc-ex-table-stack">
          <TextInput value={table.search} onChange={(v: string) => table.setSearch(v)} placeholder="Ara (ör. ege)" aria-label="Ara" />
          <Row>
            <Button onClick={() => table.toggleSort("amount")}>{() => `Tutar ${table.sortDir("amount") === "asc" ? "↑" : table.sortDir("amount") === "desc" ? "↓" : "↕"}`}</Button>
            <Button disabled={() => !table.hasPrev()} onClick={() => table.prev()}>‹</Button>
            <Button disabled={() => !table.hasNext()} onClick={() => table.next()}>›</Button>
            <Out label="sayfa" value={() => `${table.page()} / ${table.pageCount() ?? "?"} · ${table.total()} kayıt`} />
          </Row>
          <OrderList rows={table.rows} />
        </div>
      },
    },
    createVirtual: {
      code: `const v = createVirtual({ count: () => rows.length, rowHeight: 28, height: 168 })
<div class="scroll" on:scroll={(e) => v.onScroll(e.currentTarget)}>
  <div style={{ height: v.range().top }} />{rows.slice(v.range().start, v.range().end).map(Row)}<div style={{ height: v.range().bottom }} />
</div>`,
      run: () => {
        const count = signal(10_000)
        const v = createVirtual({ count, rowHeight: 28, height: 168, overscan: 3 })
        return <div class="sc-ex-table-stack">
          <Row><Segmented value={count} onChange={(n: number) => count.set(n)} options={[{ value: 50, label: "50" }, { value: 10_000, label: "10.000" }, { value: 1_000_000, label: "1 milyon" }]} aria-label="Satır" />
            <Out label="DOM'da" value={() => `${v.range().start}–${v.range().end}`} /></Row>
          <div class="sc-ex-table-scroll" tabindex="0" aria-label="Sanal liste" onScroll={(e: Event) => v.onScroll(e.currentTarget as HTMLElement)}>
            <span style={() => ({ display: "block", height: `${v.range().top}px` })} />
            {() => { const r = v.range(); return Array.from({ length: r.end - r.start }, (_, i) => <div>Satır {(r.start + i + 1).toLocaleString("tr-TR")}</div>) }}
            <span style={() => ({ display: "block", height: `${v.range().bottom}px` })} />
          </div>
        </div>
      },
    },
    csvField: {
      code: `csvField('Acme, "Ltd"')        // "\\"Acme, \\"\\"Ltd\\"\\"\\""
csvField("=SUM(A1:A9)")         // "'=SUM(A1:A9)" (formula-safe)
csvField("a;b", ";")            // separator-aware quoting`,
      run: () => {
        const raw = signal('Acme, "Ltd"')
        return <div class="sc-ex-table-stack">
          <TextInput value={raw} onChange={(v: string) => raw.set(v)} aria-label="Hücre" />
          <Row>{["=SUM(A1:A9)", "a;b", "Ada\nLovelace"].map((s) => <Button size="sm" variant="ghost" onClick={() => raw.set(s)}>{json(s)}</Button>)}</Row>
          <Out label="csvField(v)" value={() => csvField(raw())} />
          <Out label='csvField(v, ";")' value={() => csvField(raw(), ";")} />
          <Out label='csvField(v, ",", false)' value={() => csvField(raw(), ",", false)} />
        </div>
      },
    },
    describeFilter: {
      code: `describeFilter({ filter: "range" }, { min: 500, max: 2000 })     // "500 – 2000"
describeFilter({ filter: "select", options: regions }, ["ege"])  // "Ege"`,
      run: () => {
        const cases: [string, { filter: "range" | "select" | "bool" | "dateRange" | "text"; options?: unknown[] }, unknown][] = [
          ["range", { filter: "range" }, { min: 500, max: 2000 }],
          ["range ≥", { filter: "range" }, { min: 1000 }],
          ["select", { filter: "select", options: [{ value: "ege", label: "Ege" }, { value: "mar", label: "Marmara" }] }, ["ege", "mar"]],
          ["bool", { filter: "bool" }, true],
          ["dateRange", { filter: "dateRange" }, { from: "2026-10-01", to: "2026-10-31" }],
          ["text", { filter: "text" }, "acme"],
        ]
        return <ul class="sc-ex-table-list">{cases.map(([k, col, f]) => <li><code>{k} {json(f)}</code><Badge>{describeFilter(col, f)}</Badge></li>)}</ul>
      },
    },
    download: {
      code: `download("siparisler.csv", toCSV(rows, columns), "text/csv;charset=utf-8")`,
      run: () => {
        const log = signal<string[]>([])
        const save = (name: string, text: string, type: string) => { download(name, text, type); log.update((l) => [...l, `${now()} ${name} (${text.length} karakter)`]) }
        const cols = COLS.map((c) => column(c))
        return <div class="sc-ex-table-stack">
          <Row>
            <Button onClick={() => save("acme-siparisler.csv", toCSV(ORDERS, cols, { formatted: true }), "text/csv;charset=utf-8")}>CSV indir</Button>
            <Button variant="ghost" onClick={() => save("acme-siparisler.json", toJSON(ORDERS, cols), "application/json")}>JSON indir</Button>
          </Row>
          <Log lines={log} />
        </div>
      },
    },
    FilterControl: {
      code: `const table = createTable({ rows: orders, columns })
{FilterControl(table, table.column("amount"))}   // min / max inputs (range)
<p>{() => table.total()} kayıt</p>`,
      play: { options: [{ key: "col", label: "Filtre", default: "amount", options: [{ value: "customer", label: "Metin" }, { value: "amount", label: "Aralık" }, { value: "region", label: "Seçim" }, { value: "paid", label: "Evet/Hayır" }] }] },
      run: (p: { values: { col: string } }) => {
        const table = createTable<Order>({ rows: ORDERS, columns: COLS.map((c) => (c.key === "customer" ? { ...c, filter: "text" as const } : c)), paging: false })
        return <div class="sc-ex-table-stack">
          {() => { const key = p.values.col; return untrack(() => { table.clearFilters(); return FilterControl(table, table.column(key)!) }) }}
          <Row>
            <Out label="eşleşen" value={() => `${table.total()} / ${ORDERS.length}`} />
            {() => table.activeFilters().map((f) => <Badge tone="info">{f.label}: {f.text}</Badge>)}
          </Row>
          <OrderList rows={table.rows} />
        </div>
      },
    },
    formatValue: {
      code: `formatValue(order, { key: "amount", format: ["money", "TRY"] })   // "₺1.250,00"
formatValue(order, { key: "paid" })                                // "Yes"
formatValue(order, { key: "amount", format: (v) => v > 1000 ? "büyük" : "küçük" })`,
      run: () => {
        const i = signal(0)
        const cols = [
          { key: "amount", format: ["money", "TRY"] as [string, string] },
          { key: "date", format: "date" },
          { key: "paid" },
          { key: "region", options: [{ value: "Ege", label: "Ege bölgesi" }, { value: "Marmara", label: "Marmara bölgesi" }, { value: "Akdeniz", label: "Akdeniz bölgesi" }] },
          { key: "amount", format: (v: unknown) => (Number(v) > 1000 ? "büyük sipariş" : "küçük sipariş") },
        ]
        return <div class="sc-ex-table-stack">
          <Row><Button onClick={() => i.update((x) => (x + 1) % ORDERS.length)}>Sonraki sipariş</Button><Out label="sipariş" value={() => ORDERS[i()]!.customer} /></Row>
          <ul class="sc-ex-table-list">{cols.map((c) => <li><code>{c.key} · {typeof c.format === "function" ? "işlev" : json(c.format ?? (c.options ? "options" : "—"))}</code><span>{() => String(formatValue(ORDERS[i()]!, c))}</span></li>)}</ul>
        </div>
      },
    },
    isEmptyFilter: {
      code: `isEmptyFilter("")                       // true
isEmptyFilter({ min: null, max: null }) // true
isEmptyFilter(["ege"])                  // false`,
      run: () => <ul class="sc-ex-table-list">{["", "  ", null, [], { min: null, max: null }, false, 0, "acme", ["ege"], { min: 100 }].map((v) => <li><code>{json(v)}</code><Badge tone={isEmptyFilter(v) ? "neutral" : "success"}>{String(isEmptyFilter(v))}</Badge></li>)}</ul>,
    },
    mapParams: {
      code: `mapParams(params, { size: "limit", offset: "skip", page: null,
  sort: (s) => ({ order: s.map((x) => (x.dir === "desc" ? "-" : "") + x.key).join(",") }) })`,
      run: () => {
        const params = { page: 3, size: 20, offset: 40, sort: [{ key: "amount", dir: "desc" }], filters: { region: ["Ege"] }, search: "acme" }
        const styles: Record<string, Parameters<typeof mapParams>[1]> = {
          "varsayılan": undefined,
          "limit/skip": { size: "limit", offset: "skip", page: null, sort: (s) => ({ order: (s as SortSpec[]).map((x) => (x.dir === "desc" ? "-" : "") + x.key).join(",") }) },
          "yalnız sayfa": { offset: null, filters: false, search: "q" },
        }
        const pick = signal("limit/skip")
        return <div class="sc-ex-table-stack">
          <Segmented value={pick} onChange={(v: string) => pick.set(v)} options={Object.keys(styles)} aria-label="Eşleme" />
          <pre class="sc-ex-table-pre">{() => JSON.stringify(mapParams(params, styles[pick()]), null, 1)}</pre>
        </div>
      },
    },
    matchFilter: {
      code: `const amount = column({ key: "amount", filter: "range" })
orders.filter((o) => matchFilter(o, amount, { min: 1000 }))`,
      run: () => {
        const min = signal(1000)
        const amount = column<Order>({ key: "amount", filter: "range" })
        return <div class="sc-ex-table-stack">
          <Slider value={min} onChange={(v: number) => min.set(v)} min={0} max={3200} step={100} format={(v: number) => `en az ${money(v)}`} aria-label="En az tutar" />
          <ul class="sc-ex-table-list">{() => ORDERS.map((o) => <li class={matchFilter(o, amount, { min: min() }) ? "" : "is-off"}><span>{o.customer}</span><span>{money(o.amount)}</span></li>)}</ul>
        </div>
      },
    },
    sortRows: {
      code: `sortRows(orders, [{ key: "region", dir: "asc" }, { key: "amount", dir: "desc" }], columns, "tr")`,
      run: () => {
        const key = signal("amount"), dir = signal("desc"), then = signal(false)
        const cols = COLS.map((c) => column<Order>(c))
        const sorted = () => sortRows(ORDERS, [...(then() ? [{ key: "region", dir: "asc" as const }] : []), { key: key(), dir: dir() as "asc" | "desc" }], cols, "tr")
        return <div class="sc-ex-table-stack">
          <Row>
            <Segmented value={key} onChange={(v: string) => key.set(v)} options={[{ value: "customer", label: "Müşteri" }, { value: "amount", label: "Tutar" }, { value: "date", label: "Tarih" }]} aria-label="Sütun" />
            <Segmented value={dir} onChange={(v: string) => dir.set(v)} options={[{ value: "asc", label: "↑" }, { value: "desc", label: "↓" }]} aria-label="Yön" />
            <Button size="sm" variant="ghost" onClick={() => then.update((x) => !x)}>{() => (then() ? "Önce bölge: açık" : "Önce bölge: kapalı")}</Button>
          </Row>
          <OrderList rows={sorted} />
        </div>
      },
    },
    Table: {
      code: `<Table rows={orders} columns={columns} pageSize={5} selectable
  layout="auto" caption="Siparişler" filename="siparisler" />`,
      play: { options: [
        { key: "layout", label: "Düzen", default: "auto", options: [{ value: "auto", label: "Otomatik" }, { value: "table", label: "Tablo" }, { value: "cards", label: "Kart" }] },
        { key: "selectable", label: "Seçilebilir", default: true },
        { key: "paging", label: "Sayfalı", default: true },
      ] },
      run: (p: { values: { layout: "auto" | "table" | "cards"; selectable: boolean; paging: boolean } }) => <div>{() => {
        const { layout, selectable, paging } = p.values
        return untrack(() => <Load load={() => import("hadi-march/table/render.ts")}>{({ Table }: { Table: (p: any) => unknown }) => <Table rows={ORDERS} columns={COLS} rowKey="id" pageSize={4} paging={paging} selectable={selectable} layout={layout} cardBreakpoint={520} caption="Siparişler" filename="acme-siparisler" />}</Load>)
      }}</div>,
    },
    toCSV: {
      code: `toCSV(rows, columns)                                  // raw values, "," and CRLF
toCSV(rows, columns, { formatted: true, separator: ";", bom: true })   // for spreadsheets`,
      run: () => {
        const formatted = signal(false), sep = signal(",")
        const cols = COLS.map((c) => column<Order>(c))
        return <div class="sc-ex-table-stack">
          <Row>
            <Segmented value={sep} onChange={(v: string) => sep.set(v)} options={[",", ";"]} aria-label="Ayraç" />
            <Button size="sm" variant="ghost" onClick={() => formatted.update((x) => !x)}>{() => (formatted() ? "Biçimli" : "Ham")}</Button>
          </Row>
          <pre class="sc-ex-table-pre">{() => toCSV(ORDERS.slice(0, 4), cols, { formatted: formatted(), separator: sep() })}</pre>
        </div>
      },
    },
    toJSON: {
      code: `toJSON(rows, columns)                       // raw values by column key
toJSON(rows, columns, { formatted: true, space: 2 })`,
      run: () => {
        const formatted = signal(true)
        const cols = COLS.slice(0, 3).map((c) => column<Order>(c))
        return <div class="sc-ex-table-stack">
          <Row><Button size="sm" variant="ghost" onClick={() => formatted.update((x) => !x)}>{() => (formatted() ? "Biçimli değerler" : "Ham değerler")}</Button></Row>
          <pre class="sc-ex-table-pre">{() => toJSON(ORDERS.slice(0, 3), cols, { formatted: formatted(), space: 1 })}</pre>
        </div>
      },
    },
    windowRange: {
      code: `windowRange({ count: 10_000, scrollTop: 4200, height: 480, rowHeight: 48 })
// { start: 81, end: 103, top: 3888, bottom: 475056 }`,
      run: () => {
        const top = signal(4200)
        const r = () => windowRange({ count: 10_000, scrollTop: top(), height: 480, rowHeight: 48 })
        return <div class="sc-ex-table-stack">
          <Slider value={top} onChange={(v: number) => top.set(v)} min={0} max={480_000} step={600} format={(v: number) => `scrollTop ${v.toLocaleString("tr-TR")}`} aria-label="Kaydırma" />
          <Row>{(["start", "end", "top", "bottom"] as const).map((k) => <Out label={k} value={() => r()[k].toLocaleString("tr-TR")} />)}</Row>
        </div>
      },
    },
  },
})
