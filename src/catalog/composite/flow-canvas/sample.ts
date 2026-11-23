// Sample node types and an order flow for the flow demos (HADİ store).
import { emit, FLOW_SCHEMA, type FlowDoc, type FlowNodeType } from "march/components/composite/flow-canvas";
import { zap, globe, filter, creditCard, mail, hourglass, database, layers, userCheck } from "march/icons";

let orderNo = 1040;

export const sampleTypes: readonly FlowNodeType[] = [
  {
    type: "webhook", label: "Sipariş geldi", description: "Tetikleyici: yeni sipariş", category: "Tetikleyiciler", icon: zap, color: "brand-orange",
    outputs: [{ id: "out", label: "sipariş" }],
    fields: [{ key: "source", label: "Kaynak", kind: "select", options: ["web", "mobil", "mağaza"], default: "web" }],
    run: ({ data }) => ({ id: ++orderNo, total: 120 + ((orderNo * 137) % 620), source: data.source }),
  },
  {
    type: "fetch", label: "Müşteriyi getir", description: "HTTP isteği", category: "Eylemler", icon: globe, color: "brand-blue",
    inputs: [{ id: "in", label: "sipariş" }], outputs: [{ id: "out", label: "müşteri" }],
    fields: [{ key: "url", label: "Adres", kind: "text", default: "/api/customers" }],
    run: ({ input }) => ({ ...(input as object), customer: "HADİ" }),
  },
  {
    type: "condition", label: "Tutar kontrolü", description: "Eşiğe göre iki yol", category: "Mantık", icon: filter, color: "brand-purple",
    inputs: [{ id: "in" }], outputs: [{ id: "yes", label: "eşik üstü" }, { id: "no", label: "altında" }],
    fields: [{ key: "limit", label: "Eşik (₺)", kind: "number", default: 400, min: 0 }],
    run: ({ input, data }) => ((input as { total: number }).total >= Number(data.limit) ? emit({ yes: input }) : emit({ no: input })),
  },
  {
    type: "payment", label: "Ödeme al", description: "Kart tahsilatı", category: "Eylemler", icon: creditCard, color: "brand-green",
    inputs: [{ id: "in" }], outputs: [{ id: "out", label: "makbuz" }],
    fields: [{ key: "fail", label: "Kart reddedilsin", kind: "toggle", default: false }],
    run: ({ input, data }) => { if (data.fail) throw new Error("Kart reddedildi (402)"); return { ...(input as object), paid: true }; },
  },
  {
    type: "review", label: "Elle onay", description: "Ekipten onay bekle", category: "Mantık", icon: userCheck, color: "brand-gold",
    inputs: [{ id: "in" }], outputs: [{ id: "out", label: "onaylı" }],
    fields: [{ key: "team", label: "Ekip", kind: "select", options: ["Satış", "Finans"], default: "Satış" }],
    run: ({ input }) => ({ ...(input as object), approved: true }),
  },
  {
    type: "merge", label: "Birleştir", description: "Yolları tek akışa topla", category: "Mantık", icon: layers, color: "brand-purple",
    inputs: [{ id: "a", label: "A" }, { id: "b", label: "B" }], outputs: [{ id: "out" }],
    run: ({ inputs }) => inputs.a ?? inputs.b,
  },
  {
    type: "wait", label: "Bekle", description: "Belirli süre beklet", category: "Mantık", icon: hourglass, color: "cat-6",
    inputs: [{ id: "in" }], outputs: [{ id: "out" }],
    fields: [{ key: "ms", label: "Süre (ms)", kind: "number", default: 500, min: 0, max: 5000 }],
    run: ({ input, data }) => new Promise((r) => setTimeout(() => r(input), Math.min(Number(data.ms) || 0, 1500))),
  },
  {
    type: "mail", label: "E-posta gönder", description: "Müşteriye bildirim", category: "Eylemler", icon: mail, color: "brand-blue",
    inputs: [{ id: "in" }],
    fields: [{ key: "channel", label: "Kanal", kind: "select", options: ["E-posta", "SMS", "Bildirim"], default: "E-posta" }],
    run: ({ input }) => input,
  },
  {
    type: "log", label: "Kaydet", description: "Veritabanına yaz", category: "Eylemler", icon: database, color: "cat-3",
    inputs: [{ id: "in" }],
    fields: [{ key: "table", label: "Tablo", kind: "text", default: "orders" }],
    run: ({ input }) => input,
  },
];

/** The order flow: two branches (payment / review) that meet again, a group, a notification and a log. */
export function sampleDoc(): FlowDoc {
  return {
    schema: FLOW_SCHEMA, name: "HADİ sipariş akışı",
    nodes: [
      { id: "hook", type: "webhook", x: 0, y: 112 },
      { id: "customer", type: "fetch", x: 320, y: 112 },
      { id: "check", type: "condition", x: 640, y: 112 },
      { id: "pay", type: "payment", x: 960, y: 0 },
      { id: "review", type: "review", x: 960, y: 256 },
      { id: "join", type: "merge", x: 1280, y: 112 },
      { id: "mail", type: "mail", x: 1600, y: 0 },
      { id: "save", type: "log", x: 1600, y: 224 },
    ],
    edges: [
      { id: "e1", from: "hook.out", to: "customer.in" },
      { id: "e2", from: "customer.out", to: "check.in" },
      { id: "e3", from: "check.yes", to: "pay.in" },
      { id: "e4", from: "check.no", to: "review.in" },
      { id: "e5", from: "pay.out", to: "join.a" },
      { id: "e6", from: "review.out", to: "join.b" },
      { id: "e7", from: "join.out", to: "mail.in" },
      { id: "e8", from: "join.out", to: "save.in" },
    ],
    groups: [{ id: "g1", label: "Tahsilat", nodes: ["pay", "review"], color: "brand-green" }],
  };
}
