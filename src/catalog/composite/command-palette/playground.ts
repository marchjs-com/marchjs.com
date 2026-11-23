import { definePlayground } from "../../spec.ts";

// label, icon and kbd belong to the card's PaletteButton: card-only (prop: false)
export default definePlayground<{ group: string; label: string; icon: string; kbd: boolean }>({
  options: [
    { key: "group", label: "Eklenen komutlar", default: "doc", options: [{ value: "doc", label: "belge" }, { value: "team", label: "ekip" }],
      // MarchIDE: the raw CommandPalette gets the same commands as its own `commands` (without run: a row does nothing)
      prop: "commands", toCode: { doc: '{[{"id":"demo.doc.new","title":"Yeni belge","group":"Bu kart: belge"},{"id":"demo.doc.export","title":"PDF olarak dışa aktar","group":"Bu kart: belge","keywords":"indir pdf"},{"id":"demo.doc.copy","title":"Bağlantıyı kopyala","group":"Bu kart: belge","keywords":"paylaş link"}]}', team: '{[{"id":"demo.team.invite","title":"Ekibe kişi davet et","group":"Bu kart: ekip","keywords":"üye ekle"},{"id":"demo.team.list","title":"Ekip üyelerini göster","group":"Bu kart: ekip"}]}' } },
    { key: "label", label: "Düğme metni", default: "Komut ara…", options: [{ value: "Komut ara…", label: "Komut ara…" }, { value: "Ne yapmak istiyorsunuz?", label: "Ne yapmak istiyorsunuz?" }], prop: false },
    { key: "icon", label: "Düğme ikonu", default: "search", options: [{ value: "search", label: "büyüteç" }, { value: "own", label: "kendi ikonum" }, { value: "off", label: "yok" }], prop: false },
    { key: "kbd", label: "Kısayol rozeti", default: true, prop: false },
  ],
});
