// Showcase stage for SiteSection: a section with a heading group and a body for the Playground values.
import { SiteSection, type SectionTone } from "march/components/landing/site-section";

export const code = `<SiteSection eyebrow="Özellikler" title="İhtiyacın olan her şey" lead="…" tone="muted">
  <FeatureGrid items={features} />
</SiteSection>`

export default function SiteSectionDemo(props: { values: { content: string; eyebrow: string; title: string; lead: string; tone: string; align: string; width: string; color: string; reveal: string } }) {
  return <div class="sc-site-frame">
    {() => {
      const v = { ...props.values }
      return <SiteSection tone={v.tone as SectionTone} align={v.align as "center"} width={v.width as "default"} space="sm" m:color={v.color === "default" ? undefined : v.color as "brand-purple"} reveal={v.reveal === "off" ? false : { effect: v.reveal as "up" }} eyebrow={v.eyebrow || undefined} title={v.title || undefined} lead={v.lead || undefined}>
        <div class="sc-site-placeholder">{v.content || "İçerik"}</div>
      </SiteSection>
    }}
  </div>
}
