import { definePlayground } from "../../spec.ts";

interface Values { sample: number; variant: string; enter: string; leave: string; glow: boolean; item: string; button: string; every: number; max: number }

// sample activity for the raw component in MarchIDE (plain JSON, newest first: an items array cannot come from a switch)
const SAMPLE = [
  { id: "s1", avatar: "E", title: "Elif akşam koşusuna katıldı", body: "Kadıköy · 5 km, tempo serbest", meta: "şimdi", color: "brand-orange" },
  { id: "s2", avatar: "M", title: "Mert tanışma yemeğinde yerini ayırdı", body: "Beşiktaş · 6 kişilik masa", meta: "1 dk", color: "brand-blue" },
  { id: "s3", avatar: "Z", title: "Zeynep bir kitap kulübü kurdu", body: "Çankaya · ilk buluşma pazar", meta: "3 dk", color: "brand-green" },
  { id: "s4", avatar: "C", title: "Can seramik atölyesine bilet aldı", body: "Karşıyaka · 2 yer kaldı", meta: "5 dk", color: "brand-purple" },
  { id: "s5", avatar: "D", title: "Deniz masa oyunu gecesine katıldı", body: "Nilüfer · yeni başlayanlar hoş geldi", meta: "8 dk", color: "brand-orange" },
  { id: "s6", avatar: "S", title: "Selin fotoğraf yürüyüşü başlattı", body: "Muratpaşa · cumartesi 10:00", meta: "12 dk", color: "brand-blue" },
];

export default definePlayground<Values>({
  // next is a function: the showcase card pulls new lines; the raw component in MarchIDE draws the sample items
  options: [
    { key: "sample", label: "Örnek satırlar", default: 5, min: 0, max: 6, prop: "items", toCode: (n) => (Number(n) ? `{${JSON.stringify(SAMPLE.slice(0, Number(n)))}}` : null) },
    { key: "variant", label: "Görünüm", default: "list", options: [{ value: "list", label: "satırlar" }, { value: "wall", label: "duvar" }] },
    { key: "enter", label: "Geliş", default: "flip", options: [{ value: "flip", label: "3B dönüş" }, { value: "slide", label: "kayma" }, { value: "fade", label: "solma" }, { value: "pop", label: "patlama" }, { value: "drop", label: "düşüp sekme" }, { value: "zoom", label: "önden gelme" }, { value: "blur", label: "netleşme" }, { value: "swing", label: "sallanma" }, { value: "unfold", label: "perde" }, { value: "glide", label: "yandan süzülme" }, { value: "spin", label: "dönerek" }, { value: "none", label: "yok" }] },
    { key: "leave", label: "Gidiş", default: "blur", options: [{ value: "blur", label: "bulanıklaşma" }, { value: "fade", label: "solma" }, { value: "shrink", label: "küçülme" }, { value: "fall", label: "düşme" }, { value: "slide", label: "kayma" }, { value: "dissolve", label: "ışığa karışma" }, { value: "fold", label: "katlanma" }, { value: "none", label: "yok" }] },
    { key: "glow", label: "Parıltı halkası", default: true, toCode: { true: null, false: "{false}" } },
    { key: "item", label: "Satır içeriği", default: "default", options: [{ value: "default", label: "hazır" }, { value: "own", label: "kendi çizimim" }], prop: "renderItem", toCode: { default: null, own: "{(item) => <span><b>{item.title}</b> <small>{item.body}</small></span>}" } },
    { key: "button", label: "Durdur düğmesi", default: "default", options: [{ value: "default", label: "hazır metin" }, { value: "own", label: "kendi metnim" }, { value: "off", label: "yok" }], prop: "pausable", toCode: { default: null, own: null, off: "{false}" } },
    { key: "every", label: "Aralık (ms)", default: 2400, min: 800, max: 6000, step: 200 },
    { key: "max", label: "Ekranda", default: 5, min: 2, max: 9, step: 1 },
  ],
});
