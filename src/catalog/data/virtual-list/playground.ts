import { definePlayground } from "../../spec.ts";

interface Values { items: string; label: string; estimate: number; gap: number; overscan: number; count: number; heights: string }

// items is required: MarchIDE's raw <VirtualList /> gets these 100 rows (kind "json"); without render a row shows its title
const WORDS = ["Koşu", "Bisiklet", "Kitap", "Kahve", "Yürüyüş", "Fotoğraf", "Masa oyunu", "Konser", "Atölye", "Piknik"];
export const ITEMS = JSON.stringify(Array.from({ length: 100 }, (_, i) => ({ id: i, title: `${WORDS[i % WORDS.length]} buluşması #${i + 1}` })));

export default definePlayground<Values>({
  options: [
    { key: "items", label: "Ögeler (items, JSON)", default: ITEMS, kind: "json", toCode: (x) => `{${String(x)}}` },
    { key: "label", label: "Ad (label)", default: "Buluşmalar", kind: "text" },
    { key: "estimate", label: "Tahmini yükseklik", default: 56, options: [{ value: 40, label: "40 px" }, { value: 56, label: "56 px" }, { value: 120, label: "120 px" }] },
    { key: "gap", label: "Ara", default: 8, options: [0, 8, 16] },
    { key: "overscan", label: "Ekran dışı pay", default: 300, options: [{ value: 0, label: "0" }, { value: 300, label: "300 px" }, { value: 1200, label: "1200 px" }] },
    // the showcase card's own: how many rows it makes from the items, and their heights (not props of VirtualList)
    { key: "count", label: "Satır", default: 10000, options: [{ value: 100, label: "100" }, { value: 10000, label: "10.000" }, { value: 100000, label: "100.000" }], prop: false },
    { key: "heights", label: "Yükseklik", default: "mixed", options: [{ value: "same", label: "eşit" }, { value: "mixed", label: "karışık" }], prop: false },
  ],
});
