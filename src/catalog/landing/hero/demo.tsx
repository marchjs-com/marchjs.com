// Showcase stage for Hero: every variant with the same copy; product and split get the markup product mock.
import { Hero, type HeroVariant } from "march/components/landing/hero";
import { MockApp } from "../demo-kit.tsx";
import { arrowRight } from "march/icons";
import { appUrl } from "march/base";

export const code = `<Hero variant="mesh" eyebrow="Yeni: tanışma yemekleri" title="Yakınındaki insanlarla bugün buluş" highlight="bugün buluş"
  lead="…" note="Ücretsiz" actions={[{ label: "HADİ'ye katıl", href: "/join", iconEnd: arrowRight }, { label: "Etkinliklere göz at" }]} />
<Hero variant="product" media={<img src="/screen.png" alt="…" width={1600} height={1000} />} … />
<Hero variant="video" video={{ src: "/clip.webm", poster: "/clip.jpg" }} … />
<Hero variant="product" backdrop={false} frameBar={false} tilt={false} reveal="blur" … />   // every part can be left out
<Hero reveal={{ from: { opacity: 0, transform: "scale(.8) rotate(-3deg)" }, to: { opacity: 1, transform: "scale(1) rotate(0deg)" } }} … />`

export default function HeroDemo(props: { values: { title: string; highlight: string; lead: string; variant: string; size: string; eyebrow: boolean; note: boolean; backdrop: boolean; reveal: string; frameBar: boolean; tilt: boolean } }) {
  return <div class="sc-site-frame sc-hero-frame">
    {() => {
      const v = props.values, variant = v.variant as HeroVariant
      return <Hero level={2} variant={variant} size={v.size as "md"} eyebrow={v.eyebrow ? "Yeni: tanışma yemekleri" : undefined} eyebrowHref={v.eyebrow ? "#" : undefined}
        backdrop={v.backdrop} frameBar={v.frameBar} tilt={v.tilt}
        reveal={v.reveal === "own" ? { from: { opacity: 0, transform: "scale(.8) rotate(-3deg)" }, to: { opacity: 1, transform: "scale(1) rotate(0deg)" } } : v.reveal as "up"}
        title={v.title || "Yakınındaki insanlarla bugün buluş"} highlight={v.highlight || undefined}
        lead={v.lead || undefined}
        note={v.note ? "Ücretsiz · telefonda ve tarayıcıda" : undefined}
        actions={[{ label: "HADİ'ye katıl", iconEnd: arrowRight }, { label: "Etkinliklere göz at", variant: "secondary" }]}
        media={variant === "product" || variant === "split" ? <MockApp /> as Node : undefined}
        video={{ src: appUrl("media/hadi-waves.webm"), poster: appUrl("media/hadi-waves.jpg") }}
        layers={[{ content: <div class="sc-plx-sky" />, speed: 0.45 }, { content: <svg class="sc-plx-far" viewBox="0 0 1200 400" preserveAspectRatio="none" aria-hidden="true"><path d="M0 260 C 200 160 340 220 520 170 S 900 120 1200 210 V400 H0 Z" /></svg>, speed: 0.3 }, { content: <svg class="sc-plx-mid" viewBox="0 0 1200 400" preserveAspectRatio="none" aria-hidden="true"><path d="M0 300 C 160 240 380 300 600 250 S 980 230 1200 290 V400 H0 Z" /></svg>, speed: 0.15 }]} />
    }}
  </div>
}
