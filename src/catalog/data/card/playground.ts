import { definePlayground } from "../../spec.ts";

interface Values { title: string; subtitle: string; body: string; footer: string; as: string; flush: boolean; plain: boolean; actions: boolean }

export default definePlayground<Values>({
  options: [
    { key: "title", label: "Başlık (title)", default: "HADİ", kind: "text" },
    { key: "subtitle", label: "Alt başlık (subtitle)", default: "Kurumsal plan", kind: "text" },
    { key: "body", label: "Gövde (children)", default: "48 kullanıcı · 12,4 GB depolama", kind: "text", prop: "children" },
    { key: "footer", label: "Alt bilgi (footer)", default: "Son güncelleme: bugün", kind: "text" },
    { key: "as", label: "Kök etiketi (as)", default: "section", options: ["section", "article", "div"] },
    { key: "flush", label: "Kenar boşluksuz gövde", default: false },
    { key: "plain", label: "Çerçevesiz (zemin, kenar, gölge yok)", default: false },
    // the showcase card's own: an Edit button in the header (in MarchIDE: actions={[…]} in the code)
    { key: "actions", label: "Başlık eylemleri", default: true, prop: false },
  ],
});
