import { definePlayground } from "../../spec.ts";

export default definePlayground<{ kind: string; prefix: string; placeholder: string; disabled: boolean; readonly: boolean; error: boolean }>({
  code: { tag: (v) => (v.kind === "email" ? "EmailInput" : v.kind === "url" ? "UrlInput" : "TextInput"), props: { "bind:value": "{$text}" }, root: "input" },
  options: [
    // the raw TextInput takes it as `type` (EmailInput / UrlInput set it themselves)
    { key: "kind", label: "Tür", default: "text", options: [{ value: "text", label: "metin" }, { value: "email", label: "e-posta" }, { value: "url", label: "web adresi" }], prop: "type",
      toCode: { text: null, email: '"email"', url: '"url"' } },
    { key: "prefix", label: "Ön ek", default: "icon", options: [{ value: "none", label: "yok" }, { value: "icon", label: "ikon" }, { value: "text", label: "metin" }],
      toCode: (p, v) => (p === "none" ? null : p === "icon" ? `{<Icon of={${v.kind === "url" ? "globe" : "search"}} />}` : v.kind === "url" ? '"www"' : '"@"') },
    { key: "placeholder", label: "Yer tutucu", default: "Üye, sipariş, etiket…", kind: "text" },
    { key: "disabled", label: "Devre dışı", default: false },
    { key: "readonly", label: "Salt okunur", default: false },
    { key: "error", label: "Hata metni (error)", default: false, toCode: { true: '"Bu alan boş bırakılamaz."', false: null } },
  ],
});
