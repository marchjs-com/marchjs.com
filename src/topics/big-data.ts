// The topics of /big-data (one page each, /big-data/<slug>): titles, one-line descriptions, groups. The section page loads
// only this file; src/topics.ts gathers every section for the menu, MarchIDE and the start-up titles.
import type { Topic } from "./types.ts";

export const TOPICS: readonly Topic[] = [
  { slug: "data-grid", title: "Veri ızgarası", name: "DataGrid", desc: "100 bin satır; sanal satır ve sütun, gruplama, düzenleme.", group: "Tablo ve ağaç" },
  { slug: "tree-view", title: "Ağaç görünümü", name: "TreeView", desc: "Binlerce düğüm, tembel yükleme, arama, sürükle bırak.", group: "Tablo ve ağaç" },
  { slug: "scheduler", title: "Takvim", name: "Scheduler", desc: "Ay, hafta, gün; sürükleyerek taşı ve boyutla.", group: "Zaman" },
  { slug: "gantt", title: "Gantt şeması", name: "Gantt", desc: "Bağımlılıklar, ölçek, ilerleme.", group: "Zaman" },
];
