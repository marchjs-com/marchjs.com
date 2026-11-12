// Sample page: a personal portfolio — projects open into their detail page with a shared element transition.
import { Button } from "hadi-march/ui";
import { Form } from "hadi-march/forms";
import { schema } from "hadi-march/schema";
import { SiteNav, Hero, SiteSection, ProjectGrid, ProjectDetail, FeatureGrid, Roadmap, StatsBand, HorizontalScroll, SiteFooter, type Project } from "hadi-march/components/landing/index.ts";
import { sharedTransition } from "hadi-march/motion";
import { arrowRight, palette, code, zap, globe, layers, users, mail, message } from "hadi-march/icons";
import { PROJECTS, Cover } from "hadi-march/components/landing/project-grid/demo.tsx";
import { details } from "hadi-march/components/landing/project-detail/demo.tsx";

const Contact = schema({
  name: { type: "text", label: "Adın", required: true, max: 80 },
  email: { type: "email", label: "E-posta", required: true },
  message: { type: "textarea", label: "Mesajın", required: true, min: 10 },
})

const SKILLS = [
  { icon: palette, title: "Ürün ve arayüz tasarımı", body: "Kullanıcı araştırması, akışlar, tasarım sistemleri." },
  { icon: code, title: "Ön yüz geliştirme", body: "Erişilebilir, hızlı ve temalı arayüzler." },
  { icon: zap, title: "Hareket tasarımı", body: "Anlam taşıyan, akıcı mikro etkileşimler." },
  { icon: globe, title: "Çok dilli siteler", body: "RTL dahil, her dilde aynı özen." },
  { icon: layers, title: "Tasarım sistemleri", body: "Token, bileşen ve belge: tek kaynak." },
  { icon: users, title: "Atölye ve mentorluk", body: "Ekiplere tasarım ve ön yüz eğitimi." },
]
const CAREER = [
  { time: "2024 – bugün", title: "Bağımsız tasarımcı ve geliştirici", body: "Girişimler için ürün siteleri ve tasarım sistemleri.", status: "now" as const },
  { time: "2021 – 2024", title: "Kıdemli ürün tasarımcısı, Northwind", body: "Tasarım sistemini kurdu, 40 ekibe yaydı.", status: "done" as const },
  { time: "2018 – 2021", title: "Ön yüz geliştirici, Lumen", body: "Gerçek zamanlı analitik panosu.", status: "done" as const },
  { time: "2016 – 2018", title: "Stajyer tasarımcı, Orbit", body: "Etkinlik kimlikleri ve web siteleri.", status: "done" as const },
]

export default function PortfolioSample() {
  let $open: Project | null = null
  let $sent = false
  // the cover morphs both ways: grid cover and detail cover share the name project-<id>
  const open = (p: Project, cover: Element) => { void sharedTransition(`project-${p.id}`, cover, () => { $open = p; globalThis.scrollTo?.({ top: 0 }) }) }
  const back = (p: Project) => { void sharedTransition(`project-${p.id}`, document.querySelector(".hm-pd-cover"), () => { $open = null }).then(() => document.getElementById("w-work")?.scrollIntoView({ block: "start" })) }
  return <div class="sc-sample-page">
    <SiteNav mode="transparent" brand={{ name: "Deniz Arı", sub: "Tasarım · Kod" }}
      links={[{ label: "İşler", href: "#w-work" }, { label: "Hakkımda", href: "#w-about" }, { label: "Deneyim", href: "#w-career" }, { label: "İletişim", href: "#w-contact" }]}
      actions={<Button size="sm" iconEnd={arrowRight}>Birlikte çalışalım</Button>} />
    {() => {
      const p = $open
      if (p) {
        const n = PROJECTS[(PROJECTS.indexOf(p) + 1) % PROJECTS.length]!
        return <SiteSection width="wide"><ProjectDetail project={details(p)} onBack={() => back(p)} next={{ project: n, onOpen: open }} /></SiteSection>
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
        <SiteSection id="w-about" eyebrow="Hakkımda" title="On yıldır ekranlar için tasarlıyorum" align="start">
          <div class="sc-about"><p>İyi bir arayüzün sessiz olduğuna inanıyorum: kullanıcı ne yapacağını bilir, hareket yalnız anlam taşır. Her projede araştırmadan başlıyor, sistemle bitiriyorum.</p>
            <StatsBand variant="plain" items={[{ value: 64, label: "proje" }, { value: 10, label: "yıl", suffix: "+" }, { value: 4.9, decimals: 1, label: "ortalama puan" }]} /></div>
        </SiteSection>
        <SiteSection tone="muted" eyebrow="Yetenekler" title="Neler yapıyorum">
          <FeatureGrid variant="list" items={SKILLS} />
        </SiteSection>
        <SiteSection id="w-career" eyebrow="Deneyim" title="Yolculuk" width="narrow">
          <Roadmap items={CAREER} badges={false} />
        </SiteSection>
        <SiteSection id="w-contact" tone="muted" eyebrow="İletişim" title="Bir projen mi var?" lead="Birkaç cümleyle anlat, iki gün içinde döneyim." width="narrow">
          {() => ($sent ? <p class="sc-sent" role="status">Teşekkürler! En kısa sürede yazacağım.</p>
            : <Form schema={Contact} submitLabel="Gönder" onSubmit={() => new Promise<void>((r) => setTimeout(() => { $sent = true; r() }, 700))} />)}
        </SiteSection>
      </>
    }}
    <SiteFooter brand={{ name: "Deniz Arı", sub: "Tasarım · Kod" }} toTop social={[{ label: "E-posta", href: "#", icon: mail }, { label: "Topluluk", href: "#", icon: message }]} copyright="© Deniz Arı" />
  </div>
}
