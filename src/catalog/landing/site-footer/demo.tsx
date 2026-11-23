// Showcase stage for SiteFooter.
import { SiteFooter } from "march/landing";
import { sparkles, globe, message, mail } from "march/icons";

export const code = `<SiteFooter brand={{ name: "HADİ", mark: logo }} about="…" wordmark="HADİ"
  columns={[{ title: "HADİ", links: [{ label: "Premium", href: "/premium" }] }]}
  social={[{ label: "Blog", href: "/blog", icon: globe }]}
  newsletter={{ title: "Bülten", onSubmit: (e) => api.subscribe(e) }}
  legal={[{ label: "Gizlilik", href: "/privacy" }]} />`

export const FOOTER_COLUMNS = [
  { title: "HADİ", links: [{ label: "Etkinlikler", href: "#" }, { label: "Tanışma yemekleri", href: "#" }, { label: "Premium", href: "#" }] },
  { title: "Şirket", links: [{ label: "Hakkımızda", href: "#" }, { label: "Kariyer", href: "#" }, { label: "İletişim", href: "#" }] },
  { title: "Destek", links: [{ label: "Yardım merkezi", href: "#" }, { label: "Topluluk kuralları", href: "#" }, { label: "Güvenlik", href: "#" }] },
]

export default function SiteFooterDemo(props: { values: { sample: number; sampleLegal: boolean; brand: string; about: string; newsletter: boolean; wordmark: boolean; social: boolean; toTop: boolean; copyright: boolean } }) {
  return <div class="sc-site-frame">
    {() => {
      const v = { ...props.values }
      return <SiteFooter brand={{ name: v.brand || "HADİ", mark: sparkles }} about={v.about || undefined} columns={FOOTER_COLUMNS.slice(0, v.sample ?? 3)}
        social={v.social ? [{ label: "Web", href: "#", icon: globe }, { label: "Topluluk", href: "#", icon: message }, { label: "E-posta", href: "#", icon: mail }] : undefined}
        newsletter={v.newsletter ? { title: "Bülten", lead: "Ayda bir, yalnız yenilikler.", onSubmit: () => new Promise((r) => setTimeout(r, 700)) } : undefined}
        legal={v.sampleLegal === false ? undefined : [{ label: "Gizlilik", href: "#" }, { label: "Koşullar", href: "#" }]} wordmark={v.wordmark ? v.brand || "HADİ" : undefined} toTop={v.toTop} copyright={v.copyright ? undefined : false} />
    }}
  </div>
}
