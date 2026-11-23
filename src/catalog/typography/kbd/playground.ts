import { definePlayground } from "../../spec.ts";

interface Values { combo: string; text: string }

export default definePlayground<Values>({
  options: [
    { key: "combo", label: "Kısayol", default: "mod+k", prop: "keys", options: [{ value: "mod+k", label: "mod+k" }, { value: "shift+enter", label: "shift+enter" }, { value: "mod+shift+z", label: "mod+shift+z" }, { value: "alt+arrowleft", label: "alt+←" }, { value: "", label: "metin" }] },
    // without keys the key is its text (children)
    { key: "text", label: "Metin", default: "Esc", kind: "text", prop: "children", visibleWhen: (v) => !v.combo },
  ],
});
