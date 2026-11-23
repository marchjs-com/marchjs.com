import { definePlayground } from "../../spec.ts";

interface Values { kind: string; title: string; lead: string; sub: boolean; trail: string; size: string; color: string; overflow: string; active: boolean; indicator: boolean; disabled: boolean; direction: string; heading: boolean }

// each option writes a real prop (toCode): MarchIDE's raw <ListRow /> takes the same values (an icon by its name,
// a text, a node of the code as a stand-in mark)
export default definePlayground<Values>({
  options: [
    { key: "title", label: "Başlık (title)", default: "Ana sayfa", kind: "text" },
    { key: "lead", label: "Baş yuva", default: "icon", options: [{ value: "icon", label: "ikon" }, { value: "avatar", label: "avatar" }, { value: "dot", label: "durum noktası" }, { value: "emoji", label: "emoji" }, { value: "none", label: "yok" }],
      toCode: { icon: "{home}", avatar: "{<Avatar name=\"Deniz Kaya\" size=\"sm\" decorative />}", dot: "{<StatusDot tone=\"success\" />}", emoji: "\"🏠\"", none: null } },
    { key: "sub", label: "Alt metin", default: true, toCode: { true: "\"Genel bakış\"", false: null } },
    { key: "trail", label: "Son yuva", default: "badge", options: [{ value: "badge", label: "rozet" }, { value: "kbd", label: "kısayol" }, { value: "chevron", label: "ok" }, { value: "actions", label: "eylem düğmesi" }, { value: "none", label: "yok" }],
      toCode: { badge: "{<Badge count={3} />}", kbd: "{<Kbd keys=\"mod+1\" />}", chevron: "{<Chevron />}", actions: null, none: null } },
    { key: "size", label: "Boyut", default: "md", options: ["sm", "md", "lg"], toCode: { md: null } },
    { key: "color", label: "Etkin rengi", default: "", options: [{ value: "", label: "vurgu" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-green", label: "yeşil" }, { value: "brand-purple", label: "mor" }] },
    { key: "overflow", label: "Sığmayan metin", default: "scroll", options: [{ value: "scroll", label: "kayar" }, { value: "ellipsis", label: "üç nokta" }, { value: "wrap", label: "alt satıra geçer" }], toCode: { scroll: null } },
    { key: "direction", label: "Yön", default: "row", options: [{ value: "row", label: "satır" }, { value: "column", label: "karo (dikey)" }, { value: "center", label: "karo, ortalı" }], toCode: { row: null, column: "\"column\"", center: "\"column\"" } },
    { key: "heading", label: "Başlık h3 öğesi", default: false, prop: "titleAs", toCode: { true: "\"h3\"", false: null } },
    { key: "active", label: "Etkin (active; kartta ilk satır)", default: false },
    { key: "indicator", label: "Etkin çubuğu", default: false },
    { key: "disabled", label: "Devre dışı (kartta üçüncü satır)", default: false },
    // the showcase card's own: what its rows are (in MarchIDE: href / onClick / as in the code)
    { key: "kind", label: "Satır türü", default: "button", prop: false, options: [{ value: "button", label: "düğme (onClick)" }, { value: "link", label: "bağlantı (href)" }, { value: "option", label: "seçenek (li role=option)" }, { value: "static", label: "düz" }] },
  ],
});
