import { definePlayground } from "../../spec.ts";
import { LED_LOOK, type LedLookValues } from "../../led-look.ts";

interface Values extends LedLookValues { expression: string; mouth: string; alive: boolean; follow: boolean; cols: number; rows: number }

export default definePlayground<Values>({
  options: [
    { key: "expression", label: "İfade (expression)", default: "open", kind: "grid", options: [
      { value: "open", label: "açık" }, { value: "blink", label: "kırp" }, { value: "look-left", label: "sola bak" }, { value: "look-right", label: "sağa bak" },
      { value: "look-up", label: "yukarı" }, { value: "look-down", label: "aşağı" }, { value: "surprised", label: "şaşkın" }, { value: "sleepy", label: "uykulu" },
      { value: "happy", label: "mutlu" }, { value: "angry", label: "kızgın" }, { value: "sad", label: "üzgün" }, { value: "love", label: "âşık" }, { value: "closed", label: "kapalı" }] },
    { key: "mouth", label: "Ağız (mouth)", default: "none", options: [{ value: "none", label: "yok" }, { value: "smile", label: "gülümse" }, { value: "grin", label: "sırıt" }, { value: "talk", label: "konuş" }, { value: "o", label: "o" }, { value: "flat", label: "düz" }, { value: "sad", label: "üzgün" }] },
    { key: "alive", label: "Canlı: kendiliğinden kırp ve bakın (alive)", default: true, toCode: { true: null, false: "{false}" } },
    { key: "follow", label: "İşaretçiyi izle (follow)", default: false },
    { key: "cols", label: "Sütun (cols)", default: 32, min: 16, max: 64, step: 2 },
    { key: "rows", label: "Satır (rows)", default: 16, min: 8, max: 24, step: 1, toCode: (v) => (v === 16 ? null : `{${v}}`) },
    ...(LED_LOOK as never[]),
  ],
});
