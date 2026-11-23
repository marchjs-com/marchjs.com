import { definePlayground } from "../../spec.ts";

export default definePlayground<{ disabled: boolean; toggle: string }>({
  options: [
    // each choice writes the real toggle prop: the eye is the default (left out), "text" the words, off `toggle={false}`
    { key: "toggle", label: "Göster / gizle düğmesi", default: "icon", options: [{ value: "icon", label: "göz ikonu" }, { value: "text", label: "metin" }, { value: "off", label: "yok" }], toCode: { icon: null, off: "{false}" } },
    { key: "disabled", label: "Devre dışı", default: false },
  ],
});
