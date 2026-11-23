import { definePlayground } from "../../spec.ts";

interface Values { people: number; variant: string; text: boolean; motion: string; color: string; label: string }

export default definePlayground<Values>({
  options: [
    { key: "people", label: "Yazan", default: 1, options: [{ value: 0, label: "kimse" }, { value: 1, label: "1" }, { value: 2, label: "2" }, { value: 4, label: "4" }], prop: "names", toProp: (n) => ["HADİ Koşu Kulübü", "Kitap Kulübü", "Fotoğraf Atölyesi", "Masa Oyunları Ekibi"].slice(0, Number(n)), toCode: (n) => `{people.slice(0, ${String(n)})}` },
    { key: "variant", label: "Görünüm", default: "bubble", options: [{ value: "bubble", label: "balon" }, { value: "inline", label: "satır" }], visibleWhen: (v) => v.people > 0 },
    { key: "text", label: "Metin", default: true, visibleWhen: (v) => v.people > 0 },
    { key: "label", label: "Cümle", default: "default", options: [{ value: "default", label: "… yazıyor" }, { value: "own", label: "kendi cümlem" }], visibleWhen: (v) => v.people > 0 && v.text, toProp: (x) => (x === "own" ? (n: readonly string[]) => `${n.length} kişi bir şeyler yazıyor ✍️` : undefined), toCode: { default: null, own: "{(n) => `${n.length} kişi bir şeyler yazıyor`}" } },
    { key: "motion", label: "Nokta hareketi", default: "lift", options: [{ value: "lift", label: "zıplama" }, { value: "fade", label: "yanıp sönme" }, { value: "none", label: "yok" }], visibleWhen: (v) => v.people > 0 },
    { key: "color", label: "Nokta rengi", default: "brand-blue", options: [{ value: "brand-blue", label: "mavi" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-green", label: "yeşil" }, { value: "brand-purple", label: "mor" }], visibleWhen: (v) => v.people > 0, prop: "m:color" },
  ],
});
