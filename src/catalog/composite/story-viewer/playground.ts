import { definePlayground } from "../../spec.ts";

interface Values { open: boolean; people: number; duration: number; reply: boolean; like: boolean; start: string; progress: boolean; header: boolean; buttons: boolean; arrows: boolean; ownLabels: boolean }

// MarchIDE: the raw StoryViewer takes the groups as a JSON list (the stories are 2×2 PNG data URLs: soft colour blends)
const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFklEQVR42m";
const SCENES = ["P4WSz2xmMmQ43VWzlpbwAsKgV3rhVt4w", "Ow2PuDb+lLBlm/Gz+LxQAthgZP+C/Xcg", "PY/f2C0tE4BrFUE5FgXQAtngULJa1nqA", "OQk/Y21GtkeLWZg19cCwAXQQNaq9+sQQ", "P4+6xrSzAnQ4Up/7/PxwExlAbyzjJBwg", "P4+6zr9yQbhuXdvwz1GgE6ZgdD1tcTig"];
const NAMES = ["HADİ Koşu Kulübü", "Pazar Bisiklet Grubu", "Fotoğraf Atölyesi", "Kitap Kulübü", "Sahil Yürüyüşçüleri"];
const CAPTIONS = ["Sabah koşusu başladı!", "Günün son ışıkları", "Orman yolu bugün çok sakin", "Gece turu", "Kahve molası", "Şafak"];
const groupsCode = (n: unknown): string => `{${JSON.stringify(NAMES.slice(0, Number(n)).map((name, g) => ({ id: `u${g + 1}`, name,
  items: [0, 1].map((i) => { const k = (g * 2 + i) % SCENES.length; return { id: `u${g + 1}-${i}`, src: `${PNG}${SCENES[k]}AAAAABJRU5ErkJggg==`, alt: CAPTIONS[k], caption: CAPTIONS[k] } }) })))}}`;

export default definePlayground<Values>({
  options: [
    // the card opens the viewer from its story tray: a change of this option opens or closes it there
    { key: "open", label: "Açık (open)", default: true },
    { key: "people", label: "Kişi sayısı", default: 5, options: [3, 4, 5], prop: "groups", toCode: groupsCode },
    { key: "start", label: "Başlangıç", default: "u1", options: [{ value: "u1", label: "ilk kişi" }, { value: "u3", label: "üçüncü kişi" }] },
    { key: "duration", label: "Hikâye süresi", default: 5000, options: [{ value: 3000, label: "3 sn" }, { value: 5000, label: "5 sn" }, { value: 8000, label: "8 sn" }] },
    { key: "reply", label: "Yanıt alanı", default: true, prop: false },
    { key: "like", label: "Beğeni", default: true, prop: false },
    { key: "progress", label: "İlerleme çubukları", default: true },
    { key: "header", label: "Avatar ve zaman", default: true, prop: "avatar" },
    { key: "buttons", label: "Duraklat / kapat düğmeleri", default: true, prop: "pauseButton" },
    { key: "arrows", label: "Önceki / sonraki okları", default: true },
    { key: "ownLabels", label: "Kendi metinlerim (yanıt alanı)", default: false, visibleWhen: (v) => v.reply, prop: "labels", toCode: { true: '{{"sent":"İletildi ✓","close":"Hikâyeyi kapat","pause":"Durdur","play":"Oynat"}}', false: null } },
  ],
});
