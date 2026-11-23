import { definePlayground } from "../../spec.ts";

type V = { options: string; placeholder: string; disabled: boolean }

export default definePlayground<V>({
  code: { props: { "bind:value": "{$city}", options: "{CITIES}" }, root: "select" },
  options: [
    // options is required to draw anything: a comma-separated text (Select takes it as the list). The code under the
    // stage keeps `options={CITIES}` (prop: false: not written by the option); MarchIDE gives the text to the raw Select
    { key: "options", label: "Şıklar (virgülle)", kind: "text", default: "İstanbul, Ankara, İzmir, Bursa, Antalya, Konya, Trabzon", prop: false },
    // written even at its default: the empty first option's text is part of the example
    { key: "placeholder", label: "Boş şıkkın metni", kind: "text", default: "Seç…", toCode: { "Seç…": '"Seç…"' } },
    { key: "disabled", label: "Devre dışı", default: false },
  ],
});
