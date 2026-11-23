// The topics of /sites (one page each, /sites/<slug>): titles, one-line descriptions, groups. The section page loads
// only this file; src/topics.ts gathers every section for the menu, MarchIDE and the start-up titles.
import type { Topic } from "./types.ts";

export const TOPICS: readonly Topic[] = [
  { slug: "product", title: "Ürün tanıtım sayfası", desc: "Yüzen menü, kaydırınca düzleşen ürün karesi, bento, hikâye, fiyatlar, yorum duvarı, SSS ve altbilgi.", group: "Açılış sayfaları", parent: "/sites/landing" },
  { slug: "portfolio", title: "Kişisel portfolyo", desc: "Süzgeçli proje ızgarası, kapağın ayrıntı sayfasına büyüdüğü geçiş, yatay vaka şeridi, deneyim çizelgesi, iletişim formu.", group: "Açılış sayfaları", parent: "/sites/landing" },
  { slug: "slides", title: "Sunum", desc: "Klavye, kaydırma ve dokunma; adım adım maddeler, konuşmacı penceresi, tam ekran, URL'de slayt numarası, yazdır.", group: "Açılış sayfaları", parent: "/sites/landing" },
  { slug: "redesign", title: "Yeniden tasarım", desc: "Anlatmak yerine göster: eski ve yeni ekran sürüklenen ayırıcıyla; akış, profil ve okuma için ayrı karşılaştırmalar.", group: "Açılış sayfaları", parent: "/sites/landing" },
  { slug: "honest", title: "Herkes için değil", desc: "Anti-landing: önce kimin için olmadığı (işaretle, sonucu gör), geride kalınan satırlarıyla karşılaştırma.", group: "Açılış sayfaları", parent: "/sites/landing" },
  { slug: "live", title: "Canlı duvar", desc: "Sen bakarken büyüyen sayaçlar ve durmadan gelen etkinlik duvarı: sayfa kalabalık olduğunu söylemez, gösterir.", group: "Açılış sayfaları", parent: "/sites/landing" },
  { slug: "story", title: "Kendi hikâyeni seç", desc: "Özellik listesi yerine oynanan bir hafta sonu: her seçim ürünün başka bir yüzünü gösterir; geri sarılan yol, bulunan sonlar.", group: "Açılış sayfaları", parent: "/sites/landing" },
];

/** Kinds of sample apps (/sites/<kind>): each lists its apps; more kinds (dashboards, CRM, e-commerce) come later. */
export const SITE_KINDS = [
  { slug: "landing", title: "Açılış sayfaları", desc: "Tanıtım ve açılış sayfaları: ürün, portfolyo, sunum, yeniden tasarım, dürüst tanıtım, canlı duvar, hikâye." },
] as const
