import { definePlayground } from "../../spec.ts";

interface Values {
  lineNumbers: boolean; complete: boolean; multiline: boolean; message: boolean; keys: boolean; shortcuts: boolean; tabSize: number; copy: boolean; flash: boolean; color: string; readonly: boolean; disabled: boolean;
  palette: string; bracketColors: boolean; matchBrackets: boolean; guides: boolean; currentLine: boolean; occurrences: boolean; autoClose: boolean; pasteIndent: boolean; find: boolean; fontSize: number; lineHeight: number;
}

export default definePlayground<Values>({
  options: [
    { key: "palette", label: "Sözdizimi renkleri", default: "ide", options: [{ value: "ide", label: "IDE paleti" }, { value: "theme", label: "tema (CodeView)" }] },
    { key: "bracketColors", label: "Parantez çiftleri renkli", default: true, toCode: { false: "{false}" } },
    { key: "matchBrackets", label: "Eşleşen parantez kutusu", default: true, toCode: { false: "{false}" } },
    { key: "guides", label: "Girinti çizgileri", default: true, toCode: { false: "{false}" } },
    { key: "currentLine", label: "İmlecin satırı vurgulu", default: true, toCode: { false: "{false}" } },
    { key: "occurrences", label: "Kelimenin diğer geçişleri", default: true, toCode: { false: "{false}" } },
    { key: "autoClose", label: "Parantez / tırnak kendiliğinden kapanır", default: true, toCode: { false: "{false}" } },
    { key: "pasteIndent", label: "Yapıştırmada girinti uyar", default: true, toCode: { false: "{false}" } },
    { key: "find", label: "Bul / değiştir / satıra git (Ctrl+F, H, G)", default: true, prop: "keys", toCode: { true: null, false: '{{"find":false,"replace":false,"goToLine":false}}' } },
    { key: "fontSize", label: "Yazı boyutu (Ctrl + = / -)", default: 0, options: [{ value: 0, label: "tema" }, { value: 12, label: "12" }, { value: 14, label: "14" }, { value: 16, label: "16" }, { value: 18, label: "18" }], toCode: { 0: null } },
    { key: "lineHeight", label: "Satır yüksekliği", default: 1.7, options: [{ value: 1.5, label: "1.5" }, { value: 1.7, label: "1.7" }, { value: 2, label: "2" }] },
    { key: "complete", label: "Öneri listesi", default: true, prop: false },
    { key: "lineNumbers", label: "Satır numaraları (tıkla: işaret)", default: false },
    { key: "message", label: "Alt satır (durum)", default: true, toCode: { true: '"Kod okundu: düğme ona uydu."', false: "{false}" } },
    { key: "keys", label: "IDE tuşları (Tab, Ctrl+/, Alt+↑↓…)", default: true, toCode: { true: null, false: "{false}" } },
    { key: "tabSize", label: "Girinti (boşluk)", default: 2, options: [{ value: 2, label: "2" }, { value: 4, label: "4" }], visibleWhen: (v) => v.keys },
    { key: "shortcuts", label: "Kısayollar menüsü", default: true, visibleWhen: (v) => v.message, toCode: { false: "{false}" } },
    { key: "copy", label: "Kopyala düğmesi", default: true, visibleWhen: (v) => v.message, toCode: { false: "{false}" } },
    { key: "flash", label: "Değişen yer parlar", default: true, prop: false },
    { key: "multiline", label: "Enter yeni satır açar", default: true, toCode: { false: "{false}" } },
    { key: "color", label: "Renk", default: "", options: [{ value: "", label: "vurgu" }, { value: "brand-blue", label: "mavi" }, { value: "brand-green", label: "yeşil" }, { value: "brand-purple", label: "mor" }], prop: "m:color" },
    { key: "readonly", label: "Salt okunur", default: false },
    { key: "disabled", label: "Devre dışı", default: false },
  ],
});
