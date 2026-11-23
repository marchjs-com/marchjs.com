import { definePlayground } from "../../spec.ts";

interface Values { value: string; open: number; arrow: string; labels: string; label: string }

// value is required: MarchIDE's raw <JsonView /> gets this JSON (kind "json")
export const ORDER = JSON.stringify({
  id: 48210, customer: { name: "HADİ", city: "İstanbul", vip: true },
  items: [{ sku: "KB-01", qty: 2, price: 499.9 }, { sku: "MS-07", qty: 1, price: 249.5 }],
  shippedAt: "2026-11-12T11:40:00Z", coupon: null, total: 1249.3,
});

export default definePlayground<Values>({
  options: [
    { key: "value", label: "Değer (value, JSON)", default: ORDER, kind: "json", toCode: (x) => `{${String(x)}}` },
    { key: "open", label: "Açık derinlik", default: 1, options: [0, 1, 2, 3] },
    { key: "arrow", label: "Açma oku", default: "on", options: [{ value: "on", label: "ok" }, { value: "own", label: "kendi işaretim (+ / −)" }, { value: "off", label: "yok" }], toCode: { on: null, own: "{(open) => <b>{() => (open() ? \"−\" : \"+\")}</b>}", off: "{false}" } },
    { key: "labels", label: "Sayım metinleri (labels, JSON)", default: '{"items":"öğe","keys":"alan"}', kind: "json", toCode: (x) => `{${String(x)}}` },
    { key: "label", label: "Ad (label)", default: "Sipariş", kind: "text" },
  ],
});
