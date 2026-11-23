// Showcase stage for CtaBand.
import { CtaBand } from "march/components/landing/cta-band";
import { arrowRight } from "march/icons";
import { appUrl } from "march/base";

export const code = `<CtaBand variant="gradient" title="Bu hafta sonu bir plan yap" lead="…"
  actions={[{ label: "HADİ'ye katıl", href: "/join", iconEnd: arrowRight }, { label: "Etkinliklere göz at" }]} note="Ücretsiz" />
<CtaBand title="…" reveal="up" />   <CtaBand title="…" backdrop={false} reveal="none" />   // another entrance · a bare panel`

export default function CtaBandDemo(props: { values: { sample: number; sampleVideo: boolean; title: string; lead: string; note: string; variant: string; align: string; backdrop: boolean; reveal: string } }) {
  return <div class="sc-site-frame">
    {() => {
      const v = { ...props.values }
      return <CtaBand variant={v.variant as "gradient"} align={v.align as "center"} backdrop={v.backdrop} reveal={v.reveal as "scale"} title={v.title || "Bu hafta sonu bir plan yap"}
        lead={v.lead || undefined}
        actions={[{ label: "HADİ'ye katıl", iconEnd: arrowRight }, { label: "Etkinliklere göz at" }].slice(0, v.sample)} note={v.note || undefined}
        video={v.sampleVideo ? { src: appUrl("media/hadi-waves.webm"), poster: appUrl("media/hadi-waves.jpg") } : undefined} />
    }}
  </div>
}
