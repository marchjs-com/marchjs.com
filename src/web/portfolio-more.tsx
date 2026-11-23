// Sample portfolio, lower half: about, skills, career and contact (loaded when it comes near, see portfolio.tsx).
import { signal } from "march";
import { Button } from "march/ui";
import { TextInput, Textarea } from "march/forms";
import { SiteSection } from "march/components/landing/site-section";
import { FeatureGrid } from "march/components/landing/feature-grid";
import { Roadmap } from "march/components/landing/roadmap";
import { StatsBand } from "march/components/landing/stats-band";
import { palette, code, zap, globe, layers, users } from "march/icons";

/** A light contact form: three labelled fields and a button (the full form engine is not needed here). */
function ContactForm(props: { onSent: () => void }) {
  const name = signal(""), email = signal(""), message = signal(""), busy = signal(false)
  const send = (e: Event) => { e.preventDefault(); if (!name() || !/^[^@\s]+@[^@\s]+\.\w{2,}$/.test(email()) || message().length < 10) return; busy.set(true); setTimeout(props.onSent, 700) }
  return <form class="sc-contact" onSubmit={send}>
    <label class="sc-contact-field"><span>Adın</span><TextInput value={name} required autocomplete="name" /></label>
    <label class="sc-contact-field"><span>E-posta</span><TextInput value={email} type="email" required autocomplete="email" /></label>
    <label class="sc-contact-field"><span>Mesajın</span><Textarea value={message} required rows={4} /></label>
    <Button type="submit" loading={busy}>Gönder</Button>
  </form>
}

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

export default function PortfolioMore(props: { sent: () => boolean; onSent: () => void }) {
  return <>
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
          {() => (props.sent() ? <p class="sc-sent" role="status">Teşekkürler! En kısa sürede yazacağım.</p>
            : <ContactForm onSent={props.onSent} />)}
        </SiteSection>
  </>
}
