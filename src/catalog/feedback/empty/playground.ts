import { definePlayground } from "../../spec.ts";

interface Values { size: string; icon: string; title: string; text: string; action: boolean }

export default definePlayground<Values>({
  options: [
    { key: "size", label: "Boyut", default: "md", kind: "segmented", options: [{ value: "md", label: "sayfa (md)" }, { value: "sm", label: "panel içi (sm)" }] },
    // MarchIDE shows an icon picker for this option (its value is an icon's name); the card: inbox or none
    { key: "icon", label: "İkon", default: "inbox", kind: "segmented", options: [{ value: "inbox", label: "var" }, { value: "", label: "yok" }], toCode: { inbox: "{inbox}", "": null } },
    // empty: no title (title={false})
    { key: "title", label: "Başlık (boşsa yok)", default: "Gelen kutusu boş", kind: "text", toCode: (x) => (x ? JSON.stringify(String(x)) : "{false}") },
    { key: "text", label: "Açıklama", default: "Yeni bir konuşma başlatın ya da bir ekip arkadaşını davet edin.", kind: "text", prop: "children" },
    { key: "action", label: "Eylem düğmesi", default: true, toCode: { true: "{<Button variant=\"primary\" icon={plus}>Yeni mesaj</Button>}", false: null } },
  ],
});
