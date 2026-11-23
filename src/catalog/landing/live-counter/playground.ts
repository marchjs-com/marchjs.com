import { definePlayground } from "../../spec.ts";
import { splitFlap, scramble, decode, odometer, pop, glitch } from "march/motion/text";

interface Values { from: number; label: string; effect: string; dot: string; bubble: string; beat: boolean; rate: number }

// MarchIDE: the text animation itself (its code is a bare name, which MarchIDE would take for an icon)
const EFFECTS: Record<string, unknown> = { splitFlap, scramble, decode, odometer, pop, glitch };
const fn = (x: unknown): string | null => (x === "roll" ? null : x === "none" ? `"none"` : `{${String(x)}}`);

export default definePlayground<Values>({
  options: [
    { key: "from", label: "Başlangıç (from)", default: 18420, min: 0, max: 100000, step: 10 },
    { key: "label", label: "Ne sayılıyor (label)", default: "kişi bu hafta bir etkinliğe katıldı", kind: "text" },
    { key: "effect", label: "Rakam animasyonu", default: "roll", options: [{ value: "roll", label: "sayaç (odometre)" }, { value: "splitFlap", label: "havaalanı panosu" }, { value: "scramble", label: "karışık harfler" }, { value: "decode", label: "çözülme" }, { value: "odometer", label: "çark" }, { value: "pop", label: "patlama" }, { value: "glitch", label: "bozulma" }, { value: "none", label: "yok" }], toCode: fn, toProp: (x) => EFFECTS[String(x)] ?? x },
    // the dot's colour is the showcase card's; the raw component takes the dot itself (off, or your own mark)
    { key: "dot", label: "Canlı noktası", default: "success", options: [{ value: "success", label: "yeşil" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-purple", label: "mor" }, { value: "own", label: "kendi işaretim" }, { value: "off", label: "yok" }], toCode: { success: null, "brand-orange": null, "brand-purple": null, own: "{<Icon of={heart} />}", off: "{false}" } },
    { key: "bubble", label: "+N balonu", default: "on", options: [{ value: "on", label: "var" }, { value: "own", label: "kendi içeriğim" }, { value: "off", label: "yok" }], toCode: { on: null, own: "{(d) => <b>❤ {d}</b>}", off: "{false}" } },
    { key: "beat", label: "Vuruş", default: true, toCode: { true: null, false: "{false}" } },
    { key: "rate", label: "Dakikada artış", default: 40, min: 4, max: 400, step: 4 },
  ],
});
