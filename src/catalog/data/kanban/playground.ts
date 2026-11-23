import { definePlayground } from "../../spec.ts";

interface Values { columns: string; cols: number; dot: string; brand: boolean; tones: boolean; count: string; animate: boolean }

// columns is required: MarchIDE's raw <Kanban /> gets this JSON (kind "json"); a card shows its item's title
export const COLUMNS = JSON.stringify([
  { id: "todo", title: "Yapılacak", tone: "info", items: [{ id: "t1", title: "Tema seçiciyi üst çubuğa al", tag: "Arayüz" }, { id: "t2", title: "Tablo dışa aktarma", tag: "Veri" }] },
  { id: "doing", title: "Sürüyor", tone: "warn", items: [{ id: "t3", title: "Koyu tema kontrastı", tag: "Erişilebilirlik" }] },
  { id: "review", title: "İncelemede", tone: "primary", items: [{ id: "t6", title: "Fatura ekranı", tag: "Ödeme" }] },
  { id: "done", title: "Bitti", tone: "success", items: [{ id: "t4", title: "Yazı tipleri", tag: "Tipografi" }, { id: "t5", title: "İkon seti", tag: "İkon" }] },
]);

export default definePlayground<Values>({
  options: [
    { key: "columns", label: "Sütunlar (columns, JSON)", default: COLUMNS, kind: "json", toCode: (x) => `{${String(x)}}` },
    { key: "dot", label: "Başlık noktası", default: "on", options: [{ value: "on", label: "var" }, { value: "own", label: "kendi ikonum" }, { value: "off", label: "yok" }], toCode: { on: null, own: "{() => <Icon of={layers} size=\"sm\" />}", off: "{false}" } },
    { key: "count", label: "Sayaç", default: "on", options: [{ value: "on", label: "var" }, { value: "own", label: "kendi metnim" }, { value: "off", label: "yok" }], toCode: { on: null, own: "{(col) => `${col.items.length} iş`}", off: "{false}" } },
    { key: "animate", label: "Kart giriş hareketi", default: true },
    // the showcase card's own: how many columns, and their colours (in MarchIDE: the columns' JSON)
    { key: "cols", label: "Sütun sayısı", default: 3, options: [2, 3, 4], prop: false },
    { key: "brand", label: "Marka renkleri", default: false, prop: false, visibleWhen: (v) => v.dot !== "off" },
    { key: "tones", label: "Tonlu başlık", default: true, prop: false, visibleWhen: (v) => v.dot !== "off" && !v.brand },
  ],
});
