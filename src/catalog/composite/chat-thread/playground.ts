import { definePlayground } from "../../spec.ts";

interface Values { first: string; group: boolean; replyDelay: number; days: string; motion: boolean }

// MarchIDE: the raw ChatThread takes the messages as a JSON list; the first message's text is the "İlk mesaj" option
const messagesCode = (first: unknown): string => `{${JSON.stringify([
  { id: "m1", senderId: "a", senderName: "HADİ Koşu Kulübü", text: String(first), time: "2026-11-18T09:02:00" },
  { id: "m2", senderId: "a", senderName: "HADİ Koşu Kulübü", text: "Orman yolu, 8 km 🌲", time: "2026-11-18T09:03:00" },
  { id: "m3", mine: true, text: "Süper, ben varım!", time: "2026-11-18T09:20:00", status: "read", reactions: [{ emoji: "❤️", count: 2 }] },
  { id: "m4", senderId: "b", senderName: "Kitap Kulübü", text: "Biz de dönüşte kahveye geçeriz ☕", time: "2026-11-19T08:41:00" },
  { id: "m5", mine: true, text: "👋", time: "2026-11-19T08:45:00", status: "delivered" },
])}}`;

export default definePlayground<Values>({
  options: [
    { key: "first", label: "İlk mesaj", default: "Herkese günaydın! Pazar rotası belli oldu.", kind: "text", prop: "messages", toCode: messagesCode },
    { key: "group", label: "Grup sohbeti", default: true },
    { key: "replyDelay", label: "Karşı taraf yanıtı", default: 1800, options: [{ value: 900, label: "hızlı" }, { value: 1800, label: "orta" }, { value: 0, label: "yanıt yok" }], prop: false },
    { key: "days", label: "Gün ayraçları", default: "on", options: [{ value: "on", label: "Bugün / Dün / tarih" }, { value: "own", label: "kendi biçimim (gün adı)" }, { value: "off", label: "yok" }], toCode: { on: null, own: null, off: "{false}" } },
    { key: "motion", label: "Mesaj giriş hareketi", default: true },
  ],
});
