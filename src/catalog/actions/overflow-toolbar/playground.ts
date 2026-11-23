import { definePlayground } from "../../spec.ts";
import type { ToolbarItem } from "march/components/actions/overflow-toolbar";
import { plus, undo, redo, columns, eye, search, copy, download, send, trash, bold, italic, strikethrough, heading, link, quote, list, listOrdered, image, code } from "march/icons";

interface Values { label: string; items: readonly ToolbarItem[]; width: number; size: string; labels: boolean; motion: string; moreIcon: string; color: string }

// items and label are required: two toolbars to choose from (plain data, so the raw component in MarchIDE draws them;
// the stage gives each its action, and the toggles their state)
/** A document's tools (the stage's default). */
export const DOCUMENT: readonly ToolbarItem[] = [
  { id: "new", label: "Yeni", icon: plus, priority: 10 },
  { id: "undo", label: "Geri al", icon: undo, shortcut: "mod+z", priority: 9 },
  { id: "redo", label: "Yinele", icon: redo, shortcut: "mod+shift+z", priority: 8 },
  { id: "s1", separator: true },
  { id: "split", label: "Yan yana", icon: columns, pressed: false, priority: 6 },
  { id: "preview", label: "Önizleme", icon: eye, pressed: true, priority: 5 },
  { id: "find", label: "Bul", icon: search, shortcut: "mod+f", priority: 4 },
  { id: "s2", separator: true },
  { id: "copy", label: "Kopyala", icon: copy, priority: 2 },
  { id: "export", label: "Dışa aktar", icon: download, shortcut: "mod+e", priority: 1 },
  { id: "share", label: "Paylaş", icon: send, priority: 1 },
  { id: "delete", label: "Sil", icon: trash, danger: true, priority: 0 },
];
/** A text editor's formatting bar. */
export const FORMAT: readonly ToolbarItem[] = [
  { id: "bold", label: "Kalın", icon: bold, shortcut: "mod+b", pressed: false, priority: 10 },
  { id: "italic", label: "İtalik", icon: italic, shortcut: "mod+i", pressed: false, priority: 9 },
  { id: "strike", label: "Üstü çizili", icon: strikethrough, pressed: false, priority: 4 },
  { id: "f1", separator: true },
  { id: "heading", label: "Başlık", icon: heading, priority: 8 },
  { id: "quote", label: "Alıntı", icon: quote, priority: 3 },
  { id: "list", label: "Madde listesi", icon: list, priority: 6 },
  { id: "olist", label: "Numaralı liste", icon: listOrdered, priority: 5 },
  { id: "f2", separator: true },
  { id: "link", label: "Bağlantı", icon: link, shortcut: "mod+k", priority: 7 },
  { id: "image", label: "Görsel", icon: image, priority: 2 },
  { id: "code", label: "Kod", icon: code, priority: 1 },
];

export default definePlayground<Values>({
  options: [
    { key: "label", label: "Ad (label)", default: "Belge araçları", kind: "text" },
    { key: "items", label: "Öğeler (items)", default: DOCUMENT, options: [{ value: DOCUMENT, label: "belge" }, { value: FORMAT, label: "yazı biçimi" }] },
    { key: "width", label: "Genişlik", default: 520, min: 180, max: 760, step: 20, unit: "px" },
    { key: "size", label: "Boyut", default: "sm", options: ["sm", "md"] },
    { key: "labels", label: "Etiketleri göster", default: false },
    { key: "motion", label: "Geri gelme hareketi", default: "pop", options: [{ value: "pop", label: "büyüyerek" }, { value: "fade", label: "belirerek" }, { value: "own", label: "kendi hareketim (yukarıdan)" }, { value: "none", label: "yok" }] },
    { key: "moreIcon", label: "Daha fazla ikonu", default: "more", options: [{ value: "more", label: "üç nokta" }, { value: "menu", label: "menü" }, { value: "plus", label: "artı" }] },
    { key: "color", label: "Basılı düğme rengi", default: "", options: [{ value: "", label: "tema" }, { value: "brand-blue", label: "mavi" }, { value: "brand-green", label: "yeşil" }, { value: "brand-purple", label: "mor" }] , prop: "m:color"},
  ],
});
