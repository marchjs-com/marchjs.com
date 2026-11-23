import { definePlayground } from "../../spec.ts";

// the options write real props of FileUpload: the hint a text or `{false}`, the preview `{false}`, the remove button
// an icon by its name (`removeIcon={trash}`). "Yükleme ilerlemesi" needs an upload function, which the Properties cannot pass: it
// changes the showcase card only (its fake upload) and writes nothing.
export default definePlayground<{ multiple: boolean; accept: string; upload: boolean; hint: string; preview: boolean; remove: string }>({
  options: [
    { key: "multiple", label: "Birden çok dosya", default: true },
    { key: "accept", label: "Kabul edilen", default: "image/*", options: [{ value: "", label: "her tür" }, { value: "image/*", label: "görsel" }, { value: ".pdf", label: "PDF" }] },
    { key: "upload", label: "Yükleme ilerlemesi", default: true, prop: false, toCode: { true: null, false: null } },
    { key: "hint", label: "Alt satır (ipucu)", default: "auto", options: [{ value: "auto", label: "tür · boyut" }, { value: "own", label: "kendi metnim" }, { value: "off", label: "yok" }],
      toCode: { auto: null, own: '"En çok 5 MB; görseller önerilir"', off: "{false}" } },
    { key: "preview", label: "Görsel önizlemesi", default: true, visibleWhen: (v) => v.accept !== ".pdf", toCode: { true: null, false: "{false}" } },
    { key: "remove", label: "Kaldır düğmesi", default: "x", options: [{ value: "x", label: "×" }, { value: "trash", label: "çöp kutusu ikonu" }], prop: "removeIcon", toCode: { x: null, trash: "{trash}" } },
  ],
});
