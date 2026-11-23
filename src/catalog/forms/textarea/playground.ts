import { definePlayground } from "../../spec.ts";

export default definePlayground<{ rows: number; maxLength: number; autosize: boolean; mono: boolean; tabIndent: boolean; placeholder: string }>({
  options: [
    { key: "rows", label: "Satır", default: 3, min: 2, max: 8 },
    // 0: no limit (and no counter in the demo)
    { key: "maxLength", label: "En fazla karakter (sayaç)", default: 280, min: 0, max: 500, step: 20, toCode: (n) => (n ? `{${String(n)}}` : null) },
    { key: "autosize", label: "İçerikle büyür", default: true, toCode: { true: null, false: "{false}" } },
    { key: "mono", label: "Eş aralıklı yazı (kod)", default: false },
    { key: "tabIndent", label: "Tab girinti yapar", default: false },
    { key: "placeholder", label: "Yer tutucu", default: "Kendinden kısaca bahset", kind: "text" },
  ],
});
