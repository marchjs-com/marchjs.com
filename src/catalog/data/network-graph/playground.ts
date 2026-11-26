import { definePlayground } from "../../spec.ts";

interface Values { layout: string; charge: number; linkDistance: number; collide: boolean; nodeSize: string; labels: string; directed: boolean; zoom: boolean; draggable: boolean;
  legend: string; colors: string; animate: string; height: number; title: string }

export default definePlayground<Values>({
  options: [
    { key: "layout", label: "Yerleşim (layout)", default: "force", options: [{ value: "force", label: "kuvvet" }, { value: "circle", label: "çember" }, { value: "grid", label: "ızgara" }],
      toCode: { force: null } },
    { key: "charge", label: "İtme (charge)", default: -160, min: -420, max: -20, step: 20, visibleWhen: (v) => v.layout === "force", toCode: (v) => (v === -160 ? null : `{${v}}`) },
    { key: "linkDistance", label: "Bağlantı boyu (linkDistance)", default: 60, min: 20, max: 160, step: 10, unit: "px", visibleWhen: (v) => v.layout === "force", toCode: (v) => (v === 60 ? null : `{${v}}`) },
    { key: "collide", label: "Üst üste binmesin (collide)", default: true, visibleWhen: (v) => v.layout === "force", toCode: { true: null, false: "{false}" } },
    { key: "nodeSize", label: "Düğüm boyu (nodeSize)", default: "normal", options: [{ value: "small", label: "küçük" }, { value: "normal", label: "orta" }, { value: "big", label: "büyük" }],
      toProp: (v) => (v === "small" ? [3, 9] : v === "big" ? [8, 26] : [5, 16]), toCode: { normal: null, small: "{[3, 9]}", big: "{[8, 26]}" } },
    { key: "labels", label: "Etiketler (labels)", default: "on", options: [{ value: "on", label: "hep" }, { value: "hover", label: "üzerine gelince" }, { value: "off", label: "yok" }],
      toProp: (v) => (v === "hover" ? "hover" : v === "on"), toCode: { on: null, hover: '"hover"', off: "{false}" } },
    { key: "directed", label: "Oklar (directed)", default: false },
    { key: "zoom", label: "Yakınlaş / kaydır (zoom)", default: true, toCode: { true: null, false: "{false}" } },
    { key: "draggable", label: "Sürükle ve sabitle (draggable)", default: true, toCode: { true: null, false: "{false}" } },
    { key: "legend", label: "Açıklama (legend)", default: "auto", options: [{ value: "auto", label: "birden çok grupta" }, { value: "bottom", label: "altta" }, { value: "right", label: "sağda" }, { value: "none", label: "yok" }],
      toProp: (v) => (v === "none" ? false : v === "auto" ? undefined : v), toCode: { auto: null, none: "{false}" } },
    { key: "colors", label: "Renkler (colors)", default: "theme", options: [{ value: "theme", label: "tema" }, { value: "brand", label: "HADİ dört renk" }],
      toProp: (v) => (v === "brand" ? ["var(--m-brand-orange)", "var(--m-brand-blue)", "var(--m-brand-green)", "var(--m-brand-purple)"] : undefined),
      toCode: { theme: null, brand: '{["var(--m-brand-orange)", "var(--m-brand-blue)", "var(--m-brand-green)", "var(--m-brand-purple)"]}' } },
    { key: "animate", label: "Animasyon (animate)", default: "spring", options: [{ value: "spring", label: "yay" }, { value: "out", label: "yumuşak" }, { value: "stagger", label: "sırayla" }, { value: "off", label: "kapalı" }],
      toProp: (v) => (v === "spring" ? true : v === "off" ? false : v === "stagger" ? { stagger: 40 } : v), toCode: { spring: null, off: "{false}", stagger: "{{ stagger: 40 }}" } },
    { key: "height", label: "Yükseklik (height)", default: 380, min: 240, max: 560, step: 20, unit: "px" },
    { key: "title", label: "Başlık (title)", default: "Stüdyo ağı", kind: "text" },
  ],
});
