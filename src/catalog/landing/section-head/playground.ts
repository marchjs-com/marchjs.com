import { definePlayground } from "../../spec.ts";

interface Values { title: string; eyebrow: string; lead: boolean; actions: boolean; note: boolean; align: string; size: string; level: string; color: string; reveal: string }

export default definePlayground<Values>({
  options: [
    // the raw component in MarchIDE gets this title (and the parts below as literal texts)
    { key: "title", label: "Başlık (title)", default: "İhtiyacın olan her şey, tek pakette", kind: "text" },
    { key: "size", label: "Ölçek", default: "md", options: [{ value: "sm", label: "sm (kart)" }, { value: "md", label: "md (bölüm)" }, { value: "lg", label: "lg (çağrı)" }, { value: "xl", label: "xl (hero)" }] },
    { key: "align", label: "Hizalama", default: "center", options: [{ value: "start", label: "başa" }, { value: "center", label: "ortaya" }, { value: "end", label: "sona" }] },
    { key: "eyebrow", label: "Üst etiket", default: "text", options: [{ value: "text", label: "metin" }, { value: "badge", label: "kendi rozetim" }, { value: "off", label: "yok" }], toCode: { text: `"Özellikler"`, badge: `{<Badge tone="primary">Yeni</Badge>}`, off: null } },
    { key: "color", label: "Etiket rengi", default: "default", options: [{ value: "default", label: "aksan" }, { value: "brand-blue", label: "mavi" }, { value: "brand-purple", label: "mor" }, { value: "success", label: "yeşil" }], visibleWhen: (v) => v.eyebrow === "text", prop: "m:color", toCode: { default: null } },
    { key: "lead", label: "Açıklama", default: true, toCode: (x) => (x ? `"Bileşenler, tema, hareket ve hız: hepsi aynı dili konuşur."` : null) },
    // the buttons as JSON action objects (the raw component in MarchIDE draws them too)
    { key: "actions", label: "Eylemler", default: true, toCode: (x) => (x ? `{${JSON.stringify([{ label: "Hemen başla" }, { label: "Belgeler" }])}}` : null) },
    { key: "note", label: "Not", default: true, toCode: (x) => (x ? `"Kart gerekmez · 1 dakikada kurulur"` : null) },
    { key: "level", prop: "as", label: "Başlık düzeyi", default: "h2", options: ["h1", "h2", "h3", "h4"] },
    { key: "reveal", label: "Giriş hareketi", default: "off", options: [{ value: "off", label: "yok" }, { value: "up", label: "yukarı" }, { value: "blur", label: "bulanıktan" }, { value: "scale", label: "büyüyerek" }], toCode: (x) => (x === "off" ? null : x === "up" ? "{true}" : `{${JSON.stringify({ effect: String(x) })}}`) },
  ],
});
