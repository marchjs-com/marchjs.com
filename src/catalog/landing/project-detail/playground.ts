import { definePlayground } from "../../spec.ts";

interface Values { sample: boolean; gallery: boolean; next: boolean; facts: boolean; color: string; reveal: string }

// a sample project for the raw component in MarchIDE (plain JSON: an image cover of the showcase, size reserved)
const SAMPLE = {
  id: "bag-evi", title: "Bağ Evi, Urla", category: "Konut", year: 2025,
  summary: "Zeytin ağaçlarının arasında, güneşi takip eden tek katlı bir ev.",
  role: "Mimari tasarım ve uygulama", client: "Özel müşteri", services: ["Mimari", "İç mekân", "Peyzaj"],
  cover: { src: "/media/dusk.jpg", alt: "Akşam ışığında ev", width: 1200, height: 800 },
  body: "Arsadaki zeytin ağaçlarının hiçbiri kesilmedi; ev, ağaçların arasındaki boşluğa yerleşti. Geniş saçaklar yazın güneşi keser, kışın içeri alır.",
  links: [{ label: "Basında", href: "#basin" }],
};
// the next project's card (plain JSON: without onOpen it is a link to its href)
const NEXT = { id: "kiyi-kutuphanesi", title: "Kıyı Kütüphanesi", category: "Kamu", href: "#kiyi-kutuphanesi", cover: { src: "/media/hadi-waves.jpg", alt: "Kütüphanenin okuma salonu", width: 960, height: 540 } };
const GALLERY = [
  { src: "/media/hadi-waves.jpg", alt: "Malzeme paleti", width: 960, height: 540 },
  { src: "/media/dusk.jpg", alt: "Batıya bakan teras", width: 1200, height: 800 },
  { src: "/media/hadi-waves.jpg", alt: "Avlu", width: 960, height: 540 },
];

export default definePlayground<Values>({
  options: [
    // the raw component in MarchIDE (and the card's code) gets a sample project: a project object cannot come from a switch;
    // "Galeri" adds the sample gallery to it
    { key: "sample", label: "Örnek proje", default: true, prop: "project", toCode: (x, v) => (x ? `{${JSON.stringify(v.gallery ? { ...SAMPLE, gallery: GALLERY } : SAMPLE)}}` : null) },
    // gallery shapes the project above (not a prop of its own); next is a sample next project's card
    { key: "gallery", label: "Galeri", default: true, toCode: () => null },
    { key: "next", label: "Sonraki proje", default: true, toCode: (x) => (x ? `{${JSON.stringify({ project: NEXT })}}` : null) },
    { key: "facts", label: "Künye (rol, müşteri, yıl)", default: true, toCode: { true: null, false: "{false}" } },
    { key: "color", label: "Kategori satırı rengi", default: "default", options: [{ value: "default", label: "vurgu rengi" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-purple", label: "mor" }, { value: "brand-green", label: "yeşil" }], prop: "m:color", toCode: { default: null } },
    { key: "reveal", label: "Giriş hareketi", default: "up", options: [{ value: "up", label: "yukarı" }, { value: "blur", label: "bulanık" }, { value: "scale", label: "ölçek" }, { value: "off", label: "yok" }], toCode: (x) => (x === "off" ? "{false}" : x === "up" ? null : `{{ effect: "${String(x)}" }}`) },
  ],
});
