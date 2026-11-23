import { definePlayground } from "../../spec.ts";

interface Values { rows: string; columns: string; label: string; count: string; groupBy: string; rowHeight: number; selectable: boolean; pinned: boolean; footer: boolean; toolbar: string; columnMenu: boolean; labels: boolean; animate: boolean }

// MarchIDE's raw <DataGrid /> draws these rows and columns (kind "json"); the showcase card makes up to 100 000 rows
// of its own unless "Satır" is "JSON"
const REGIONS = ["Marmara", "Ege", "Akdeniz"], CUSTOMERS = ["HADİ", "Globex", "Initech", "Umbrella", "Hooli", "Wonka"];
export const ROWS = JSON.stringify(CUSTOMERS.map((c, i) => ({ id: i + 1, customer: c, region: REGIONS[i % 3], qty: 2 + ((i * 7) % 9), amount: 150 + ((i * 263) % 900) })));
// key, label, width and the rest (a helper: test/playground-keys.test.js would read literal column keys as options)
const col = (key: string, label: string, width: number, more: Record<string, unknown> = {}) => ({ key, label, width, ...more });
export const COLUMNS = JSON.stringify([
  col("id", "No", 80, { type: "number" }),
  col("customer", "Müşteri", 160, { editable: true, filter: "text", aggregate: "distinct" }),
  col("region", "Bölge", 130, { filter: "select" }),
  col("qty", "Adet", 100, { type: "number", aggregate: "sum" }),
  col("amount", "Tutar", 140, { type: "number", format: ["money", "TRY"], aggregate: "sum" }),
]);

export default definePlayground<Values>({
  options: [
    { key: "rows", label: "Satırlar (rows, JSON)", default: ROWS, kind: "json", toCode: (x) => `{${String(x)}}` },
    { key: "columns", label: "Sütunlar (columns, JSON)", default: COLUMNS, kind: "json", toCode: (x) => `{${String(x)}}` },
    { key: "label", label: "Ad (label)", default: "Siparişler", kind: "text" },
    { key: "groupBy", label: "Grupla (groupBy, JSON)", default: "[]", kind: "json", toCode: (x) => (x === "[]" ? null : `{${String(x)}}`) },
    { key: "rowHeight", label: "Yoğunluk", default: 36, options: [{ value: 30, label: "sıkı" }, { value: 36, label: "normal" }, { value: 44, label: "rahat" }] },
    { key: "selectable", label: "Satır seçimi", default: true },
    { key: "footer", label: "Toplam satırı", default: true },
    { key: "toolbar", label: "Araç çubuğu", default: "full", options: [{ value: "full", label: "tam" }, { value: "lean", label: "yalnız arama + sayı" }, { value: "off", label: "yok" }], toCode: { full: null, lean: "{{ groups: false, filters: false, csv: false }}", off: "{false}" } },
    { key: "columnMenu", label: "Sütun menüsü (⋮)", default: true },
    { key: "animate", label: "Hareket", default: true },
    // the showcase card's own (not props of DataGrid): its generated row count, a pinned column, its own texts
    { key: "count", label: "Satır", default: "100000", options: [{ value: "json", label: "JSON" }, { value: "1000", label: "1 bin" }, { value: "10000", label: "10 bin" }, { value: "100000", label: "100 bin" }], prop: false },
    { key: "pinned", label: "Müşteri sütunu sabit", default: true, prop: false },
    { key: "labels", label: "Kendi metinlerim (sipariş)", default: false, prop: false },
  ],
});
