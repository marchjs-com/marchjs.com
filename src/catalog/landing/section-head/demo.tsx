// Showcase stage for SectionHead: one heading group whose parts follow the Playground values (playground.ts).
import { SectionHead } from "march/landing";
import { Badge } from "march/data";

export const code = `<SectionHead eyebrow="Özellikler" title="İhtiyacın olan her şey" lead="Bileşenler, tema, hareket ve hız tek pakette."
  actions={[{ label: "Hemen başla", href: "/start" }, { label: "Belgeler", href: "/docs" }]} note="Kart gerekmez" />
<SectionHead as="h3" size="sm" align="start" title="Bülten" lead="Ayda bir e-posta." />`

interface Values { title: string; eyebrow: string; lead: boolean; actions: boolean; note: boolean; align: string; size: string; level: string; color: string; reveal: string }

export default function SectionHeadDemo(props: { values: Values }) {
  return <div class="sc-a6-wide">
    {() => {
      const v = { ...props.values }
      const eyebrow = v.eyebrow === "off" ? undefined : v.eyebrow === "badge" ? <Badge tone="primary">Yeni</Badge> : "Özellikler"
      const color = v.color === "default" ? undefined : v.color as "primary"
      const reveal = v.reveal === "off" ? false : { effect: v.reveal as "up" }
      return <SectionHead eyebrow={eyebrow} title={v.title || "İhtiyacın olan her şey, tek pakette"} as={v.level as "h2"} size={v.size as "md"} align={v.align as "center"} m:color={color} reveal={reveal}
        lead={v.lead ? "Bileşenler, tema, hareket ve hız: hepsi aynı dili konuşur." : undefined}
        actions={v.actions ? [{ label: "Hemen başla" }, { label: "Belgeler" }] : undefined}
        note={v.note ? "Kart gerekmez · 1 dakikada kurulur" : undefined} />
    }}
    <p class="sc-demo-call">{() => `<${props.values.level} class="m-section-head-title">`}</p>
  </div>
}
