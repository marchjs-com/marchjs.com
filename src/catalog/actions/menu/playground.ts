import { definePlayground } from "../../spec.ts";

interface Values { label: string; items: readonly unknown[]; icon: string; variant: string; size: string; color: string }

// the entries are plain data (a label, a shortcut, a second line, a check), so the raw Menu in MarchIDE takes them as
// they are; demo.tsx adds what each one does (onSelect) and the delete action()
const PLAIN = [{ label: "Düzenle", shortcut: "E" }, { label: "Kopyala", shortcut: "mod+c" }, { label: "Arşivle", disabled: true }, "-", { label: "Sil", danger: true }]
const RADIO = [{ label: "Ada göre", radio: true, checked: true }, { label: "Tarihe göre", radio: true, checked: false }, { label: "Boyuta göre", radio: true, checked: false }, "-", { label: "Gizli dosyaları göster", checked: false }]
const SUBS = [{ label: "Formlar", sub: "Alanlar ve seçiciler", current: true }, { label: "Tablolar", sub: "Sıralama, süzme, sayfalama" }, { label: "Grafikler", sub: "Çizgi, sütun, pasta" }]

export default definePlayground<Values>({
  options: [
    // label and items are required (the trigger's name and the entries): the raw component in MarchIDE gets these defaults
    { key: "label", label: "Ad (label)", default: "Eylemler", kind: "text" },
    { key: "items", label: "Girdiler (items)", default: PLAIN, options: [{ value: PLAIN, label: "eylemler" }, { value: RADIO, label: "işaretli (radyo, aç / kapat)" }, { value: SUBS, label: "açıklama satırı, bulunulan" }] },
    // an icon: an icon-only trigger (empty: a text trigger)
    { key: "icon", label: "İkon (yalnız ikonlu tetik)", default: "" },
    { key: "variant", label: "Tetik görünümü", default: "secondary", options: ["secondary", "primary", "ghost", "dark"], visibleWhen: (v) => !v.icon },
    { key: "size", label: "Tetik boyutu", default: "md", options: ["sm", "md", "lg"] },
    { key: "color", label: "Tetik rengi", default: "", options: [{ value: "", label: "tema" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-blue", label: "mavi" }, { value: "brand-green", label: "yeşil" }, { value: "brand-purple", label: "mor" }], visibleWhen: (v) => !!v.icon || v.variant === "primary", prop: "m:color" },
  ],
});
