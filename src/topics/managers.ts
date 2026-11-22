// The topics of /managers (one page each, /managers/<slug>): titles, one-line descriptions, groups. The section page loads
// only this file; src/topics.ts gathers every section for the menu, MarchIDE and the start-up titles.
import type { Topic } from "./types.ts";

export const TOPICS: readonly Topic[] = [
  { slug: "viewport", title: "Viewport", desc: "Pencere ve kapsayıcı kırılma noktaları, dokunma, yön, tercihler: tek kaynaktan canlı sinyaller.", group: "Temel" },
  { slug: "consent", title: "Rıza", desc: "Çerez ve depolama rızası: banner, tercihler, rıza yokken kapalı analitik, üçüncü taraf içerik.", group: "Temel" },
  { slug: "command", title: "Komut", desc: "Tek kayıt: palette, menüde ve kısayolda aynı komut; çakışma ve geçmiş.", group: "Temel" },
];
