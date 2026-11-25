import { definePlayground } from "../../spec.ts";

interface Values { input: string; level: number; variant: string; bars: number; scale: string; minHz: number; maxHz: number; peaks: boolean; peakFall: number; gap: number;
  radius: number; gain: number; colors: string; paint: string; color: string; height: number; motion: boolean; label: string; idleText: string }

export default definePlayground<Values>({
  options: [
    // the stage's input: the synthesized loop, a number (a tone whose loudness is `level`), or nothing (the idle state)
    { key: "input", label: "Kaynak (source)", default: "demo", options: [{ value: "demo", label: "demo müzik" }, { value: "tone", label: "ton (sayı)" }, { value: "none", label: "yok" }],
      prop: "source", toCode: { demo: "{song}", tone: "{() => $level / 100}", none: null }, toProp: (x) => (x === "none" ? undefined : x === "tone" ? 0.6 : "demo") },
    { key: "level", label: "Ses (sayı kaynağında)", default: 60, min: 0, max: 100, step: 5, unit: "%", visibleWhen: (v) => v.input === "tone", prop: false },
    { key: "variant", label: "Görünüm (variant)", default: "bars", options: [{ value: "bars", label: "çubuk" }, { value: "mirror", label: "ayna" }, { value: "circle", label: "halka" }, { value: "line", label: "çizgi" }] },
    { key: "bars", label: "Çubuk sayısı (bars)", default: 48, min: 8, max: 128, step: 4, toCode: (x) => (x === 48 ? null : `{${x}}`) },
    { key: "scale", label: "Frekans ölçeği (scale)", default: "log", options: [{ value: "log", label: "logaritmik" }, { value: "linear", label: "doğrusal" }] },
    { key: "minHz", label: "En düşük frekans (minHz)", default: 30, min: 20, max: 500, step: 10, unit: "Hz", toCode: (x) => (x === 30 ? null : `{${x}}`) },
    { key: "maxHz", label: "En yüksek frekans (maxHz)", default: 16000, min: 2000, max: 20000, step: 1000, unit: "Hz", toCode: (x) => (x === 16000 ? null : `{${x}}`) },
    { key: "peaks", label: "Tepe başlıkları (peaks)", default: true, visibleWhen: (v) => v.input !== "none" && v.motion, toCode: (x) => (x ? null : "{false}") },
    { key: "peakFall", label: "Düşüş hızı (peakFall)", default: 50, min: 10, max: 200, step: 10, unit: "%/s", visibleWhen: (v) => v.input !== "none" && v.peaks && v.motion,
      toCode: (x) => (x === 50 ? null : `{${Number(x) / 100}}`), toProp: (x) => Number(x) / 100 },
    { key: "gap", label: "Boşluk (gap)", default: 2, min: 0, max: 8, step: 1, unit: "px", toCode: (x) => (x === 2 ? null : `{${x}}`) },
    { key: "radius", label: "Köşe (radius)", default: 2, min: 0, max: 8, step: 1, unit: "px", visibleWhen: (v) => v.variant === "bars" || v.variant === "mirror", toCode: (x) => (x === 2 ? null : `{${x}}`) },
    { key: "gain", label: "Kazanç (gain)", default: 100, min: 50, max: 300, step: 25, unit: "%", visibleWhen: (v) => v.input !== "none",
      toCode: (x) => (x === 100 ? null : `{${Number(x) / 100}}`), toProp: (x) => Number(x) / 100 },
    { key: "colors", label: "Renkler (colors)", default: "theme", options: [{ value: "theme", label: "tema" }, { value: "brand", label: "HADİ dört renk" }],
      toProp: (v) => (v === "theme" ? undefined : v), toCode: { theme: null } },
    { key: "paint", label: "Dizilim (paint)", default: "gradient", options: [{ value: "gradient", label: "gradyan" }, { value: "segments", label: "parçalar" }],
      visibleWhen: (v) => v.colors === "brand", toCode: { gradient: null } },
    { key: "color", label: "Renk (color)", default: "", options: [{ value: "", label: "vurgu" }, { value: "brand-blue", label: "mavi" }, { value: "brand-pink", label: "pembe" }, { value: "success", label: "yeşil" }],
      visibleWhen: (v) => v.colors !== "brand", toProp: (x) => (x || undefined), toCode: (x) => (x ? JSON.stringify(x) : null) },
    { key: "height", label: "Yükseklik (height)", default: 160, min: 80, max: 320, step: 20, unit: "px", toCode: (x) => (x === 160 ? null : `{${x}}`) },
    { key: "motion", label: "Hareket (motion)", default: true, toCode: (x) => (x ? null : "{false}") },
    { key: "label", label: "Erişilebilir ad (label)", default: "Spektrum", kind: "text" },
    { key: "idleText", label: "Boşta metni (idleText; boş = yok)", default: "Sinyal yok", kind: "text", visibleWhen: (v) => v.input === "none",
      toCode: (x) => (x ? JSON.stringify(x) : "{false}"), toProp: (x) => (x ? x : false) },
  ],
});
