import { definePlayground } from "../../spec.ts";

export default definePlayground<{ themes: boolean; view: string; current: boolean; accents: string; modes: boolean; headings: boolean; icon: string }>({
  options: [
    { key: "themes", label: "Renk temaları", default: true },
    { key: "view", label: "Temaların görünümü", default: "list", options: [{ value: "list", label: "liste" }, { value: "cards", label: "önizleme kartları" }], visibleWhen: (v) => v.themes },
    { key: "current", label: "Düğmede geçerli tema", default: false },
    { key: "accents", label: "Vurgu renkleri", default: "all", options: [{ value: "all", label: "hepsi" }, { value: "brand", label: "HADİ renkleri" }, { value: "none", label: "yok" }],
      // MarchIDE: the raw ThemeMenu gets the real `accents` value (all: its own default)
      toCode: { all: null, brand: '{["primary","brand-orange","brand-blue","brand-green","brand-purple"]}', none: "{false}" } },
    { key: "modes", label: "Açık / koyu / sistem", default: true },
    { key: "headings", label: "Bölüm başlıkları", default: true },
    { key: "icon", label: "Düğme ikonu", default: "palette", options: [{ value: "palette", label: "palet" }, { value: "sun", label: "güneş" }, { value: "none", label: "yok (yalnız yazı)" }], visibleWhen: (v) => !v.current },
  ],
});
