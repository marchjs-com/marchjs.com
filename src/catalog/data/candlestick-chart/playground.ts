import { definePlayground } from "../../spec.ts";

interface Values { type: string; volume: boolean; ma: string; window: string; navigator: boolean; marks: string; lastPrice: boolean; zoom: boolean; grid: string;
  colors: string; format: string; animate: string; height: number; title: string }

export default definePlayground<Values>({
  options: [
    { key: "type", label: "Görünüm (type)", default: "candle", options: [{ value: "candle", label: "mum" }, { value: "ohlc", label: "OHLC çubuk" }, { value: "line", label: "kapanış çizgisi" }],
      toCode: { candle: null } },
    { key: "volume", label: "Hacim bölmesi (volume)", default: true, toProp: (v) => (v ? "vol" : undefined), toCode: { true: '"vol"', false: null } },
    { key: "ma", label: "Hareketli ortalama (ma)", default: "short", options: [{ value: "none", label: "yok" }, { value: "short", label: "7 ve 21" }, { value: "long", label: "20 ve 50" }],
      toProp: (v) => (v === "short" ? [7, 21] : v === "long" ? [20, 50] : undefined), toCode: { none: null, short: "{[7, 21]}", long: "{[20, 50]}" } },
    { key: "window", label: "Son mumlar (window)", default: "60", options: [{ value: "all", label: "hepsi" }, { value: "60", label: "son 60" }, { value: "30", label: "son 30" }],
      toProp: (v) => (v === "all" ? undefined : Number(v)), toCode: { all: null, "60": "{60}", "30": "{30}" } },
    { key: "navigator", label: "Aralık gezgini (navigator)", default: true },
    { key: "marks", label: "İşaretler (marks)", default: "line", options: [{ value: "none", label: "yok" }, { value: "line", label: "hedef + ortalama" }, { value: "band", label: "destek bandı" }],
      toProp: (v) => (v === "line" ? [{ y: 64000, label: "Hedef 64.000", color: "brand-blue" }, { y: "average", color: "neutral" }] : v === "band" ? [{ y: [56000, 60000], label: "Destek bölgesi", color: "brand-green" }] : undefined),
      toCode: { none: null, line: '{[{ y: 64000, label: "Hedef 64.000", color: "brand-blue" }, { y: "average" }]}', band: '{[{ y: [56000, 60000], label: "Destek bölgesi", color: "brand-green" }]}' } },
    { key: "lastPrice", label: "Son fiyat çizgisi (lastPrice)", default: true, toCode: { true: null, false: "{false}" } },
    { key: "zoom", label: "Sürükleyip yakınlaş (zoom)", default: true, toCode: { true: null, false: "{false}" } },
    { key: "grid", label: "Izgara (grid)", default: "h", options: [{ value: "h", label: "yatay" }, { value: "both", label: "ikisi" }, { value: "none", label: "yok" }],
      toProp: (v) => (v === "none" ? false : v === "both" ? "both" : true), toCode: { h: null, both: '"both"', none: "{false}" } },
    { key: "colors", label: "Yükselen / düşen renk (up, down)", default: "theme", options: [{ value: "theme", label: "tema" }, { value: "brand", label: "mavi / turuncu" }, { value: "mono", label: "tek renk" }],
      toCode: (v) => (v === "brand" ? { up: '"brand-blue"', down: '"brand-orange"' } : v === "mono" ? { up: '"neutral"', down: '"--m-text"' } : null),
      toProps: (v) => (v === "brand" ? { up: "brand-blue", down: "brand-orange" } : v === "mono" ? { up: "neutral", down: "--m-text" } : {}) },
    { key: "format", label: "Fiyat biçimi (format)", default: "money", options: [{ value: "money", label: "para (USD)" }, { value: "number", label: "sayı" }],
      toProp: (v) => (v === "money" ? ["money", "USD"] : "number"), toCode: { money: "{[\"money\", \"USD\"]}", number: null } },
    { key: "animate", label: "Animasyon (animate)", default: "spring", options: [{ value: "spring", label: "yay" }, { value: "out", label: "yumuşak" }, { value: "stagger", label: "sırayla" }, { value: "off", label: "kapalı" }],
      toProp: (v) => (v === "spring" ? true : v === "off" ? false : v === "stagger" ? { stagger: 18 } : v), toCode: { spring: null, off: "{false}", stagger: "{{ stagger: 18 }}" } },
    { key: "height", label: "Yükseklik (height)", default: 340, min: 220, max: 480, step: 20, unit: "px" },
    { key: "title", label: "Başlık (title)", default: "HADİ / USD", kind: "text" },
  ],
});
