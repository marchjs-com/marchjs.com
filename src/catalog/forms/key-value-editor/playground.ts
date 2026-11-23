import { definePlayground } from "../../spec.ts";

// sample rows: the raw component in MarchIDE starts with them (its rows and their remove buttons show at once)
export const START: Record<string, string> = { free: "1", team: "10" };

export default definePlayground<{ sample: boolean; numbers: boolean; readonly: boolean; addable: boolean; removable: boolean }>({
  options: [
    { key: "sample", label: "Örnek satırlar", default: true, prop: "value", toCode: { true: `{${JSON.stringify(START)}}`, false: null } },
    { key: "numbers", label: "Sayıları sayı olarak sakla", default: true },
    // default true: `false` is written ({false}), else the raw component would never get it
    { key: "addable", label: "Satır ekle düğmesi", default: true, toCode: { true: null, false: "{false}" } },
    { key: "removable", label: "Satır kaldır düğmesi", default: true, toCode: { true: null, false: "{false}" } },
    { key: "readonly", label: "Salt okunur", default: false },
  ],
});
