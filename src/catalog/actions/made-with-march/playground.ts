import { definePlayground } from "../../spec.ts";

interface Values { variant: string; heart: string; text: string }

export default definePlayground<Values>({
  options: [
    { key: "variant", label: "Görünüm", default: "text", options: [{ value: "text", label: "metin" }, { value: "badge", label: "rozet" }, { value: "small", label: "küçük" }] },
    // what each choice gives the component (the raw one in MarchIDE too): nothing (💗), "☕", false
    { key: "heart", label: "Kalp", default: "on", options: [{ value: "on", label: "💗" }, { value: "own", label: "kendi işaretim (☕)" }, { value: "off", label: "yok" }],
      toCode: { on: null, own: "\"☕\"", off: "{false}" } },
    // "own" is a function in code (demo.tsx draws it); the raw component in MarchIDE cannot take it from here
    { key: "text", label: "Cümle", default: "default", options: [{ value: "default", label: "hazır" }, { value: "own", label: "kendi cümlem" }],
      // a function in code (the Code tab's example shows it): the stage's choice, not a prop MarchIDE can pass
      prop: false },
  ],
});
