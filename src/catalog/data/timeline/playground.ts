import { definePlayground } from "../../spec.ts";

interface Values { items: string; dot: string; brand: boolean; tones: boolean; icons: boolean; line: boolean; time: string }

// items: MarchIDE's raw <Timeline /> gets this JSON (kind "json"), so it never draws empty
export const ITEMS = JSON.stringify([
  { time: "Bugün 09:12", title: "Sipariş oluşturuldu", body: "#48210 · 3 ürün", tone: "info" },
  { time: "Bugün 09:14", title: "Ödeme alındı", body: "1.499,90 ₺ · kart", tone: "success" },
  { time: "Bugün 11:40", title: "Kargoya verildi", body: "Takip: HD123456", tone: "warn" },
]);

export default definePlayground<Values>({
  options: [
    { key: "items", label: "Girdiler (items, JSON)", default: ITEMS, kind: "json", toCode: (x) => `{${String(x)}}` },
    { key: "dot", label: "Nokta", default: "on", options: [{ value: "on", label: "var" }, { value: "number", label: "sıra numarası" }, { value: "off", label: "yok" }], toCode: { on: null, number: "{(item, i) => <b>{i + 1}</b>}", off: "{false}" } },
    { key: "line", label: "Bağlantı çizgisi", default: true },
    // the showcase card's own: the colours, icons and time of its items (in MarchIDE: the items' JSON)
    { key: "brand", label: "Marka renkleri", default: false, prop: false, visibleWhen: (v) => v.dot === "on" },
    { key: "tones", label: "Tonlu noktalar", default: true, prop: false, visibleWhen: (v) => v.dot === "on" && !v.brand },
    { key: "icons", label: "İkon", default: false, prop: false, visibleWhen: (v) => v.dot === "on" },
    { key: "time", label: "Zaman", default: "text", prop: false, options: [{ value: "text", label: "metin" }, { value: "date", label: "tarih (biçimlenir)" }, { value: "own", label: "kendi biçimim (saat)" }, { value: "none", label: "yok" }] },
  ],
});
