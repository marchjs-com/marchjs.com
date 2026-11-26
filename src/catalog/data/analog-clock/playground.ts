import { definePlayground } from "../../spec.ts";

interface Values { seconds: string; numerals: string; timeZone: string; caption: string; readout: boolean; color: string; size: number; motion: boolean; label: string }

export default definePlayground<Values>({
  stage: "center",
  code: {},
  options: [
    { key: "seconds", label: "Saniye ibresi (seconds)", default: "tick", options: [{ value: "tick", label: "tik tak" }, { value: "smooth", label: "süzülen" }, { value: "off", label: "yok" }],
      toCode: { tick: null, smooth: '"smooth"', off: "{false}" }, toProp: (x) => (x === "off" ? false : x) },
    { key: "numerals", label: "Rakamlar (numerals)", default: "arabic", options: [{ value: "arabic", label: "1–12" }, { value: "roman", label: "I–XII" }, { value: "quarters", label: "çeyrekler" }, { value: "none", label: "yok" }],
      toCode: { arabic: null } },
    { key: "timeZone", label: "Saat dilimi (timeZone)", default: "", options: [{ value: "", label: "yerel" }, { value: "Europe/Istanbul", label: "İstanbul" }, { value: "Asia/Tokyo", label: "Tokyo" }, { value: "America/New_York", label: "New York" }],
      toCode: (x) => (x ? JSON.stringify(x) : null), toProp: (x) => (x || undefined) },
    { key: "caption", label: "Kadran yazısı (caption)", default: "", kind: "text", toCode: (x) => (x ? JSON.stringify(x) : null), toProp: (x) => (x || undefined) },
    // a date window: readout gets the shown Date
    { key: "readout", label: "Tarih penceresi (readout)", default: false,
      toCode: { true: "{(d) => d.getDate()}", false: null }, toProp: (x) => (x ? (d: Date) => String(d.getDate()) : undefined) },
    { key: "color", label: "Saniye rengi (color)", default: "danger", options: [{ value: "danger", label: "kırmızı" }, { value: "brand-blue", label: "mavi" }, { value: "success", label: "yeşil" }, { value: "brand-gold", label: "altın" }],
      visibleWhen: (v) => v.seconds !== "off", toCode: { danger: null } },
    { key: "size", label: "Genişlik (size)", default: 220, min: 140, max: 320, step: 10, unit: "px", toCode: (x) => (x === 220 ? null : `{${x}}`) },
    { key: "motion", label: "Hareket (motion)", default: true },
    { key: "label", label: "Erişilebilir ad (label)", default: "Saat", kind: "text" },
  ],
});
