import { definePlayground } from "../../spec.ts";

interface Values { size: string; burst: boolean; colors: string; color: string; count: boolean; icon: string; pop: boolean; ring: boolean; liked: boolean }

export default definePlayground<Values>({
  stage: "center",
  code: { props: { onToggle: "{toggle}" } },
  options: [
    // liked is required: the bare LikeButton in MarchIDE starts liked or not
    { key: "liked", label: "Beğenildi (liked)", default: false, toCode: { true: "{true}", false: "{false}" } },
    { key: "size", label: "Boyut", default: "lg", options: ["sm", "md", "lg"], toCode: { md: null, lg: '"lg"' }, toProp: (x) => x },
    { key: "icon", label: "İkon", default: "heart", options: [{ value: "heart", label: "kalp" }, { value: "star", label: "yıldız (kendi ikonum)" }, { value: "swap", label: "duruma göre değişen" }],
      toCode: { heart: null, star: "{<Icon of={star} />}", swap: "{(on) => <Icon of={on ? star : sparkles} />}" }, toProp: (x) => (x === "star" ? "icon:star" : x === "swap" ? (on: boolean) => (on ? "★" : "✦") : undefined) },
    { key: "pop", label: "Zıplama", default: true },
    { key: "burst", label: "Patlama", default: true },
    { key: "ring", label: "Halka", default: true, visibleWhen: (v) => v.burst, prop: "burstOptions", toCode: { true: null, false: "{{ ring: false }}" }, toProp: (x) => (x ? undefined : { ring: false }) },
    { key: "colors", label: "Parçacık rengi", default: "brand", options: [{ value: "brand", label: "dört HADİ rengi" }, { value: "single", label: "kalp rengi" }], visibleWhen: (v) => v.burst },
    { key: "color", label: "Kalp rengi", default: "brand-pink", options: [{ value: "brand-pink", label: "pembe" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-purple", label: "mor" }, { value: "danger", label: "kırmızı" }], prop: "m:color" },
    // off: 0, which the count hides (MarchIDE leaves undefined out, so an instance's own count would stay)
    { key: "count", label: "Sayaç", default: true, toProp: (x) => (x ? 128 : 0), toCode: { true: "{$likes}", false: null } },
  ],
});
