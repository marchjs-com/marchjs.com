import { definePlayground } from "../../spec.ts";
import type { JsonSchema } from "march/composite";

interface Values { data: string; schema: boolean; search: boolean; expand: number; readonly: boolean; status: boolean; typeBadges: boolean; actions: string; ownLabels: boolean }

export const DATA: Record<string, { value: unknown; schema: JsonSchema }> = {
  config: {
    value: { name: "hadi-api", port: 80, mode: "staging", debug: false, regions: ["eu-west", "us-east"], limits: { rps: 120, burst: 40, hours: { from: 9, to: 18 } }, owner: null },
    schema: { type: "object", required: ["name", "port"], properties: {
      name: { type: "string", minLength: 1 }, port: { type: "integer", minimum: 1024, maximum: 65535, description: "1024–65535" }, mode: { enum: ["dev", "staging-eu", "prod"] },
      debug: { type: "boolean" }, regions: { type: "array", items: { type: "string" }, minItems: 1 }, limits: { type: "object", properties: { rps: { type: "integer", minimum: 1 }, burst: { type: "integer", maximum: 30 } } },
    } },
  },
  order: {
    value: { id: "A-1042", customer: { name: "HADİ", email: "orders@hadi" }, items: [{ sku: "KIT-01", qty: 2, price: 49.9 }, { sku: "KIT-02", qty: 0, price: 12 }], paid: true, note: "" },
    schema: { type: "object", properties: {
      customer: { type: "object", required: ["name", "email"], properties: { email: { type: "string", format: "email" } } },
      items: { type: "array", items: { type: "object", required: ["sku", "qty"], properties: { qty: { type: "integer", minimum: 1 }, price: { type: "number", minimum: 0 } } } },
      note: { type: "string", maxLength: 140 },
    } },
  },
  list: {
    value: ["Kurulum", "Tasarım", 3, { done: true }, null],
    schema: { type: "array", items: { type: "string" } },
  },
}

const json = (x: unknown): string => `{${JSON.stringify(x)}}`;

export default definePlayground<Values>({
  options: [
    { key: "data", label: "Veri", default: "config", kind: "segmented", options: [{ value: "config", label: "ayarlar" }, { value: "order", label: "sipariş" }, { value: "list", label: "liste" }],
      prop: "value", toCode: (x) => json((DATA[String(x)] ?? DATA["config"]!).value) },
    { key: "schema", label: "Şema doğrulaması", default: true, toCode: (x, v) => (x ? json((DATA[v.data] ?? DATA["config"]!).schema) : null) },
    { key: "search", label: "Arama kutusu", default: true, toCode: { false: "{false}" } },
    // 3 opens the deepest container of the sample data: a higher level would change nothing
    { key: "expand", label: "Açık seviye", default: 2, min: 0, max: 3, step: 1 },
    { key: "readonly", label: "Salt okunur", default: false },
    { key: "status", label: "Durum yazısı (Geçerli / N sorun)", default: true, toCode: { false: "{false}" } },
    { key: "typeBadges", label: "Tür rozetleri", default: true, toCode: { false: "{false}" } },
    { key: "actions", label: "Satır eylemleri", default: "all", options: [{ value: "all", label: "hepsi" }, { value: "add", label: "yalnız ekle" }, { value: "none", label: "yok" }], visibleWhen: (v) => !v.readonly,
      toCode: { all: null, add: '{["add"]}', none: "{false}" } },
    { key: "ownLabels", label: "Kendi metinlerim", default: false, prop: "labels", toCode: { true: json({ valid: "Her şey yolunda", search: "Ayarlarda ara" }), false: null } },
  ],
});
