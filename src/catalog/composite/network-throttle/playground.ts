import { definePlayground } from "../../spec.ts";

interface Values { gauge: boolean; custom: boolean; requests: boolean; max: number }

export default definePlayground<Values>({
  options: [
    { key: "gauge", label: "Hız göstergesi", default: true },
    { key: "custom", label: "Özel bant genişliği ve gecikme", default: true },
    { key: "requests", label: "İstek şelalesi", default: true },
    { key: "max", label: "Gösterilen istek", default: 8, min: 3, max: 20, step: 1, visibleWhen: (v) => v.requests },
  ],
});
