// The topics of /text (one page each, /text/<slug>): titles, one-line descriptions, groups. The section page loads
// only this file; src/topics.ts gathers every section for the menu, MarchIDE and the start-up titles.
import type { Topic } from "./types.ts";

export const TOPICS: readonly Topic[] = [
  { slug: "kbd", title: "Klavye tuşu", name: "Kbd", desc: "mod macOS'ta ⌘, ötekilerde Ctrl yazılır; kısayol dizisi key() ve kısayol listesiyle aynı biçimde okunur.", group: "Metin" },
  { slug: "clamp-text", title: "Katlanan metin", name: "ClampText", desc: "N satıra katlanır; sığmıyorsa \"devamı\", açılınca \"daha az\".", group: "Metin" },
  { slug: "section-label", title: "Bölüm etiketi", name: "SectionLabel", desc: "Panel içindeki grubun küçük başlığı: büyük harf, soluk; ikon, sayı ve sonda eylem yuvası.", group: "Metin" },
  { slug: "made-with-march", title: "March ile yapıldı", name: "MadeWithMarch", desc: "İsteğe bağlı küçük \"March ile yapıldı\" yazısı ya da rozeti.", group: "Metin" },
  { slug: "tooltip", title: "İpucu", name: "Tooltip", desc: "Üstüne gelince kısa bir gecikmeyle, klavye odağında hemen görünür; aria-describedby ile bağlanır, Esc gizler.", group: "İpuçları" },
];
