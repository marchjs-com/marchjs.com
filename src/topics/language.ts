// The topics of /language (one page each, /language/<slug>): titles, one-line descriptions, groups. The section page loads
// only this file; src/topics.ts gathers every section for the menu, MarchIDE and the start-up titles.
import type { Topic } from "./types.ts";

export const TOPICS: readonly Topic[] = [
  { slug: "todos", title: "Yapılacaklar", desc: "$, türetme, <For>, bind:, on:submit|prevent", group: "Dil" },
  { slug: "pipes", title: "Borular (pipes)", desc: "{değer | boru(arg)}: Intl tabanlı, dile duyarlı biçimleme.", group: "Dil" },
  { slug: "sx-class", title: "sx ve class", desc: "sx derlemede statik sınıflara döner (satır içi stil üretmez); class:ad={koşul} sınıfı açar/kapatır.", group: "Dil" },
  { slug: "common-props", title: "Ortak prop'lar", desc: "m:color, m:theme, m:dir, m:tip, m:reveal, m:can, m:no-select, m:parts: her öğede ve her bileşende çalışan prop'lar.", group: "Dil" },
  { slug: "extensions", title: "Askılar ve araya giriciler", desc: "extend, intercept, <Extensions use>: her bileşene sarmalayıcısız yeni özellik; özellikleri, geri çağrıları ve çıktıyı değiştiren askılar.", group: "Dil" },
  { slug: "code-widget", title: "Kod sekmesi bir widget noktası", desc: "Bütün Kod sekmeleri <Widget sources={[codeView]} /> ile çizilir.", group: "Dil" },
];
