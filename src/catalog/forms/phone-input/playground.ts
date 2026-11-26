import { definePlayground } from "../../spec.ts";

export default definePlayground<{ country: string; maskPlaceholder: string; maskMotion: boolean }>({
  options: [
    { key: "country", label: "Ülke", default: "TR", options: [{ value: "", label: "uluslararası" }, { value: "TR", label: "TR" }, { value: "GB", label: "GB" }, { value: "US", label: "US" }, { value: "DE", label: "DE" }, { value: "+90", label: "+90" }],
      toCode: (c) => (c ? `"${c}"` : null) },
    { key: "maskPlaceholder", label: "Şablon", default: "lazy", options: [{ value: "lazy", label: "yazdıkça" }, { value: "eager", label: "tümü" }, { value: "ghost", label: "hayalet" }] },
    { key: "maskMotion", label: "Animasyonlar", default: true, toCode: { true: null, false: "{false}" } },
  ],
});
