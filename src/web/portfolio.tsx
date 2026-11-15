// Sample page: a personal portfolio — projects open into their detail page with a shared element transition.
import { Button } from "march/ui";
import { lazy } from "march/lazy";
import { SiteNav, Hero, SiteSection, ProjectGrid, HorizontalScroll, SiteFooter, type Project } from "march/components/landing/index.ts";
import { sharedTransition } from "march/motion";
import { arrowRight, mail, message } from "march/icons";
import { PROJECTS, Cover } from "march/components/landing/project-grid/demo.tsx";

// about, skills, career and contact load as they come near (a long page stays light)
const PortfolioMore = lazy(() => import("./portfolio-more.tsx"), { when: "visible", placeholder: "block", height: "120rem" })
// a project's detail page: its own part, warmed up when idle (the shared cover needs it on screen on the first click)
const Detail = lazy(() => import("./portfolio-detail.tsx"), { placeholder: "block", height: "40rem" })

export default function PortfolioSample() {
  let $open: Project | null = null
  void Detail.preload()
  let $sent = false
  // the cover morphs both ways: grid cover and detail cover share the name project-<id>
  const open = (p: Project, cover: Element) => { void sharedTransition(`project-${p.id}`, cover, () => { $open = p; globalThis.scrollTo?.({ top: 0 }) }) }
  const back = (p: Project) => { void sharedTransition(`project-${p.id}`, document.querySelector(".m-pd-cover"), () => { $open = null }).then(() => document.getElementById("w-work")?.scrollIntoView({ block: "start" })) }
  return <div class="sc-sample-page">
    <SiteNav mode="transparent" brand={{ name: "Deniz Arı", sub: "Tasarım · Kod" }}
      links={[{ label: "İşler", href: "#w-work" }, { label: "Hakkımda", href: "#w-about" }, { label: "Deneyim", href: "#w-career" }, { label: "İletişim", href: "#w-contact" }]}
      actions={<Button size="sm" iconEnd={arrowRight}>Birlikte çalışalım</Button>} />
    {() => {
      const p = $open
      if (p) {
        const n = PROJECTS[(PROJECTS.indexOf(p) + 1) % PROJECTS.length]!
        return <SiteSection width="wide"><Detail project={p} onBack={() => back(p)} next={{ project: n, onOpen: open }} /></SiteSection>
      }
      return <>
        <Hero variant="split" size="lg" eyebrow="Yeni projelere açığım" title="Ürünleri sade ve canlı yapıyorum" highlight="sade ve canlı"
          lead="Ürün tasarımcısı ve ön yüz geliştiricisi. Girişimlerle markadan koda, uçtan uca çalışıyorum."
          actions={[{ label: "İşlerime bak", href: "#w-work" as never }, { label: "İletişim", variant: "secondary" }]}
          media={<div class="sc-portrait"><Cover n={2} /></div> as Node} />
        <SiteSection id="w-work" eyebrow="Seçilmiş işler" title="Son projeler" lead="Bir projeye tıkla: kapak, ayrıntı sayfasına doğru büyür.">
          <ProjectGrid projects={PROJECTS} onOpen={open} allLabel="Tümü" />
        </SiteSection>
        <SiteSection tone="muted" space="sm" eyebrow="Öne çıkanlar" title="Kısa vaka çalışmaları">
          <HorizontalScroll label="Vaka çalışmaları" panel="24rem">
            {PROJECTS.map((x, i) => <article class="sc-case"><Cover n={i} /><div><h3>{x.title}</h3><p>{x.summary}</p></div></article>)}
          </HorizontalScroll>
        </SiteSection>
        <PortfolioMore sent={() => $sent} onSent={() => { $sent = true }} />
      </>
    }}
    <SiteFooter brand={{ name: "Deniz Arı", sub: "Tasarım · Kod" }} toTop social={[{ label: "E-posta", href: "#", icon: mail }, { label: "Topluluk", href: "#", icon: message }]} copyright="© Deniz Arı" />
  </div>
}
