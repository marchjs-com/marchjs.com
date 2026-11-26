import { definePlayground } from "../../spec.ts";

interface Values { timeZone: string; hour12: string; seconds: boolean; separator: string; blink: boolean; size: string; color: string; frame: boolean; motion: boolean; label: string }

export default definePlayground<Values>({
  stage: "center",
  options: [
    { key: "timeZone", label: "Saat dilimi (timeZone)", default: "", options: [{ value: "", label: "cihazın" }, { value: "Europe/Istanbul", label: "İstanbul" }, { value: "America/New_York", label: "New York" }, { value: "Asia/Tokyo", label: "Tokyo" }],
      toCode: (x) => (x ? JSON.stringify(x) : null), toProp: (x) => (x || undefined) },
    { key: "hour12", label: "Saat biçimi (hour12)", default: "auto", options: [{ value: "auto", label: "dile göre" }, { value: "24", label: "24 saat" }, { value: "12", label: "12 saat" }],
      toCode: { auto: null, "24": "{false}", "12": "" }, toProp: (x) => (x === "auto" ? undefined : x === "12") },
    { key: "seconds", label: "Saniye (seconds)", default: true, toCode: (x) => (x ? null : "{false}") },
    { key: "separator", label: "Ayraç (separator)", default: ":", options: [{ value: ":", label: ":" }, { value: ".", label: "." }, { value: "none", label: "yok" }],
      toCode: { ":": null, ".": '"."', none: "{false}" }, toProp: (x) => (x === "none" ? false : x) },
    { key: "blink", label: "Yanıp sönme (blink)", default: true, visibleWhen: (v) => v.separator !== "none", toCode: (x) => (x ? null : "{false}") },
    { key: "size", label: "Boyut (size)", default: "md", options: [{ value: "sm", label: "küçük" }, { value: "md", label: "orta" }, { value: "lg", label: "büyük" }] },
    { key: "color", label: "Rakam rengi (color)", default: "", options: [{ value: "", label: "beyaz" }, { value: "warning", label: "amber" }, { value: "danger", label: "kırmızı" }, { value: "info", label: "mavi" }],
      toCode: (x) => (x ? JSON.stringify(x) : null), toProp: (x) => (x || undefined) },
    { key: "frame", label: "Gövde (parts.frame)", default: true, prop: "parts", toCode: (x) => (x ? null : "{{ frame: false }}"), toProp: (x) => ({ frame: !!x }) },
    { key: "motion", label: "Hareket (motion)", default: true, toCode: (x) => (x ? null : "{false}") },
    { key: "label", label: "Erişilebilir ad (label)", default: "Saat", kind: "text" },
  ],
});
