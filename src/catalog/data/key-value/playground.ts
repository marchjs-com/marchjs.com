import { definePlayground } from "../../spec.ts";

interface Values { items: string; columns: number; empty: string; hint: boolean; blank: boolean }

// items is required: MarchIDE's raw <KeyValue /> gets this JSON (kind "json"); an object ({ "Plan": "Kurumsal" }) works too
export const ITEMS = JSON.stringify([
  { label: "Müşteri", value: "HADİ" },
  { label: "Tutar", value: "1.499,90 ₺", hint: "KDV dahil" },
  { label: "Durum", value: "Kargoda", hint: "2 gün içinde teslim" },
  { label: "Kanal", value: "Mobil uygulama" },
  { label: "Not", value: "" },
  { label: "Kargo", value: "HD123456" },
]);

export default definePlayground<Values>({
  options: [
    { key: "items", label: "Satırlar (items, JSON)", default: ITEMS, kind: "json", toCode: (x) => `{${String(x)}}` },
    { key: "columns", label: "Sütun", default: 2, options: [1, 2, 3, 4] },
    { key: "empty", label: "Boş değerin yerine (empty)", default: "—", kind: "text" },
    // the showcase card's own: hints on its rows, and whether the note is empty (in MarchIDE: the rows' JSON)
    { key: "hint", label: "İpucu satırı", default: true, prop: false },
    { key: "blank", label: "Boş değer", default: true, prop: false },
  ],
});
