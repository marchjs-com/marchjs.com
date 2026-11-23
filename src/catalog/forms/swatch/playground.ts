import { definePlayground } from "../../spec.ts";

interface Values { palette: string; size: string; shape: string; mark: string; checker: boolean; selected: boolean; clickable: boolean }

// the raw Swatch in MarchIDE takes these as props: palette → color (one sample of that palette), mark → mark (tick /
// an icon), checker and selected as they are. `clickable` is the card's own (it gives the palette an onClick); in
// MarchIDE a click handler is set in the Events panel, so it is left out there (prop: false).
export default definePlayground<Values>({
  options: [
    { key: "palette", label: "Renkler", default: "solid", prop: "color", options: [{ value: "solid", label: "düz renkler" }, { value: "gradient", label: "gradyanlar" }, { value: "alpha", label: "saydam renkler" }, { value: "token", label: "tema belirteçleri" }],
      toCode: { solid: '"#ff7a1a"', gradient: '"linear-gradient(135deg, #ff7a1a, #7c3aed)"', alpha: '"rgb(37 99 235 / .4)"', token: '"brand-green"' } },
    { key: "size", label: "Boyut", default: "md", options: ["xs", "sm", "md", "lg"] },
    { key: "shape", label: "Biçim", default: "round", options: [{ value: "round", label: "yuvarlak köşe" }, { value: "square", label: "kare" }, { value: "circle", label: "daire" }] },
    { key: "selected", label: "Seçili başla", default: true },
    { key: "mark", label: "Seçili işareti", default: "ring", options: [{ value: "ring", label: "yalnız halka" }, { value: "check", label: "tik" }, { value: "own", label: "kendi işaretim" }], toCode: { ring: null, check: "{true}", own: "{heart}" } },
    { key: "checker", label: "Dama zemini", default: true, visibleWhen: (v) => v.palette === "alpha", toCode: { true: null, false: "{false}" } },
    { key: "clickable", label: "Tıklanabilir (düğme)", default: true, prop: false },
  ],
});
