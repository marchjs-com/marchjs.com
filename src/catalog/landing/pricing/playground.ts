import { definePlayground } from "../../spec.ts";

// sample plans in plain JSON (strings, numbers, plain objects): the raw component in MarchIDE receives them as they are
const SAMPLE = [
  { name: "HADİ", description: "Herkes için, ücretsiz.", price: 0, features: ["Etkinlik keşfet ve katıl", "Sohbet ve görüntülü görüşme", { label: "Reklamsız", included: false }], cta: { label: "Ücretsiz katıl" } },
  { name: "HADİ Premium", description: "Daha fazlasını isteyenler için.", price: { monthly: 999, yearly: 666 }, featured: true, badge: "Premium", features: ["Reklamsız", "Öne çıkan profil", "Gelişmiş filtreler"], cta: { label: "Premium'a geç" } },
  { name: "Kurumsal", description: "Ekipler ve topluluklar için.", price: null, features: ["Toplu bilet", "Ekip panosu"], cta: { label: "Bize ulaşın" } },
];

interface Values { sample: number; currency: string; saving: boolean; color: string; featureIcon: string; priceEffect: string }

export default definePlayground<Values>({
  options: [
    // the raw component in MarchIDE (and the card's code) gets this many sample plans: an array cannot come from a switch
    { key: "sample", label: "Örnek içerik", default: 2, min: 0, max: 3, prop: "plans", toCode: (n) => (Number(n) ? `{${JSON.stringify(SAMPLE.slice(0, Number(n)))}}` : null) },
    { key: "currency", label: "Para birimi", default: "TRY", options: ["TRY", "EUR", "USD"] },
    { key: "saving", label: "Yıllık kazanç etiketi", default: true, toCode: (x) => (x ? `"4 ay bedava"` : null) },
    { key: "color", label: "Öne çıkan plan rengi", default: "default", options: [{ value: "default", label: "marka geçişi" }, { value: "brand-purple", label: "mor" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-green", label: "yeşil" }], prop: "m:color", toCode: { default: null } },
    { key: "featureIcon", label: "Özellik işareti", default: "on", options: [{ value: "on", label: "tik / çizgi" }, { value: "own", label: "kendi işaretim (+ / –)" }, { value: "off", label: "yok" }], toCode: { on: null, own: `{(on) => (on ? "+" : "–")}`, off: "{false}" } },
    { key: "priceEffect", label: "Fiyat geçişi", default: "roll", options: [{ value: "roll", label: "odometre" }, { value: "count", label: "sayma" }, { value: "none", label: "yok" }] },
  ],
});
