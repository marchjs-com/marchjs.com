import { definePlayground } from "../../spec.ts";

interface Values { group: string; fit: boolean; search: boolean; create: boolean; landscape: boolean }

export default definePlayground<Values>({
  options: [
    { key: "group", label: "İlk grup", default: "all", options: [{ value: "all", label: "Tümü" }, { value: "phone", label: "Telefon" }, { value: "tablet", label: "Tablet" }, { value: "desktop", label: "Masaüstü" }] },
    { key: "fit", label: "Panele sığdır seçeneği", default: true },
    { key: "search", label: "Arama", default: true },
    { key: "create", label: "Kendi cihazın", default: true },
    { key: "landscape", label: "Dikey / yatay anahtarı", default: true, prop: false },
  ],
});
