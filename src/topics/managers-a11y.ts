// The topics of /managers-a11y (one page each, /managers-a11y/<slug>): titles, one-line descriptions, groups. The section page loads
// only this file; src/topics.ts gathers every section for the menu, MarchIDE and the start-up titles.
import type { Topic } from "./types.ts";

export const TOPICS: readonly Topic[] = [
  { slug: "layer", title: "Katman", desc: "Yığın, en üstteki ve Esc sırası.", group: "Erişilebilirlik" },
  { slug: "focus", title: "Odak", desc: "Odak tuzağı, geri dönüş, focus-visible, gezici odak.", group: "Erişilebilirlik" },
  { slug: "hotkey", title: "Kısayol", desc: "Kapsam, dizi ve duraklatma.", group: "Erişilebilirlik" },
  { slug: "announcer", title: "Duyurucu", desc: "Ekran okuyucuya canlı duyurular.", group: "Erişilebilirlik" },
  { slug: "accessibility", title: "Erişilebilirlik tercihleri", desc: "Uygulama genelinde tercihler ve sayfa denetimi.", group: "Erişilebilirlik" },
  { slug: "shortcut-hints", title: "Kısayol ipuçları", desc: "Alt tuşuyla görünen kısayol rozetleri.", group: "Erişilebilirlik" },
];
