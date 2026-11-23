import { definePlayground } from "../../spec.ts";

interface Values { max: number; size: string; spacing: string; more: string; shape: string; color: string; people: number }

// MarchIDE: the bare AvatarGroup's people (names is required)
export const NAMES = ["HADİ Koşu Kulübü", "Pazar Bisiklet Grubu", "Fotoğraf Atölyesi", "Kitap Kulübü", "Sahil Yürüyüşçüleri", "Masa Oyunları Ekibi", "Deniz Kaya", "Elif Arslan", "Can Demir", "Ada Yıldız"];

export default definePlayground<Values>({
  options: [
    { key: "people", label: "Kişi sayısı (names)", default: 8, min: 1, max: 10, step: 1, prop: "names", toProp: (n) => NAMES.slice(0, Number(n)), toCode: (n) => `{names.slice(0, ${String(n)})}` },
    { key: "max", label: "Gösterilen kişi", default: 4, min: 1, max: 8, step: 1 },
    { key: "size", label: "Boyut", default: "sm", options: ["xs", "sm", "md", "lg"] },
    { key: "spacing", label: "Aralık", default: "overlap", options: [{ value: "overlap", label: "üst üste" }, { value: "gap", label: "yan yana" }] },
    { key: "more", label: "+N balonu", default: "on", options: [{ value: "on", label: "var" }, { value: "own", label: "kendi içeriğim" }, { value: "off", label: "yok" }], toProp: (x) => (x === "off" ? false : x === "own" ? (n: number) => `${n}+` : true), toCode: { on: null, own: "{(n) => <b>{`${n}+`}</b>}", off: "{false}" } },
    { key: "shape", label: "Biçim", default: "circle", options: [{ value: "circle", label: "daire" }, { value: "square", label: "kare" }] },
    { key: "color", label: "Renk", default: "name", options: [{ value: "name", label: "addan" }, { value: "brand-blue", label: "mavi" }, { value: "brand-green", label: "yeşil" }, { value: "neutral", label: "nötr" }], toProp: (x) => (x === "name" ? undefined : x) },
  ],
});
