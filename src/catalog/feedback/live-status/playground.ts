import { definePlayground } from "../../spec.ts";

interface Values { text: string; visible: boolean; help: string; politeness: string; as: string }

export default definePlayground<Values>({
  options: [
    // what is said (the card puts its live count in front of it)
    { key: "text", label: "Söylenen (text)", default: "2 satır seçildi", kind: "text" },
    { key: "visible", label: "Görünür metin", default: true, toCode: { false: "{false}" } },
    { key: "help", label: "Yardım satırı", default: "text", options: [{ value: "off", label: "yok" }, { value: "text", label: "metin" }, { value: "own", label: "kendi düğümüm" }],
      toCode: { off: null, text: '"Satır seçmek için düğmeye basın."', own: "{<span>Seçmek için <Kbd keys=\"space\" /> tuşuna basın</span>}" } },
    { key: "politeness", label: "Okuma", default: "polite", options: [{ value: "polite", label: "sırasını bekler" }, { value: "assertive", label: "araya girer" }] },
    { key: "as", label: "Öğe", default: "span", options: ["span", "div", "p"], visibleWhen: (v) => v.visible },
  ],
});
