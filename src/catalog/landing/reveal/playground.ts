import { definePlayground } from "../../spec.ts";

interface Values { text: string; effect: string; stagger: number; scrub: boolean }

const TURN = `{{ from: { opacity: 0, transform: "rotate(-10deg) scale(.6)" }, to: { opacity: 1, transform: "rotate(0deg) scale(1)" } }}`

export default definePlayground<Values>({
  options: [
    // the raw component in MarchIDE has no children of its own: this text is what enters
    { key: "text", label: "İçerik (children)", default: "Görünüme girince belirir", kind: "text", prop: "children" },
    { key: "effect", label: "Efekt", default: "up", kind: "chips", options: [{ value: "fade", label: "solma" }, { value: "up", label: "yukarı" }, { value: "down", label: "aşağı" }, { value: "start", label: "baştan" }, { value: "end", label: "sondan" }, { value: "scale", label: "ölçek" }, { value: "blur", label: "bulanık" }, { value: "flip", label: "çevirme" }, { value: "own", label: "kendi karelerim (dönerek)" }, { value: "none", label: "yok" }], toCode: (x) => (x === "own" ? TURN : `"${String(x)}"`) },
    { key: "stagger", label: "Ardışık gecikme", default: 80, min: 0, max: 240, step: 20, unit: "ms", visibleWhen: (v) => !v.scrub },
    { key: "scrub", label: "Kaydırmaya bağlı", default: false },
  ],
});
