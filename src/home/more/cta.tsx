// The last section of the home page (a lazy part): the invitation. One big line, the three ways in (the browser IDE,
// the CDN, the repository) with their lines to copy.
import "./more.css";
import { Button, CopyButton } from "march/ui";
import { Reveal } from "march/components/landing/reveal";
import { Icon, arrowRight } from "march/icons";
import { github } from "march/icons/simple-icons";
import { version } from "march";
import { REPO, INSTALL } from "../../repo.ts";

const CDN = `<script type="module" src="https://cdn.marchjs.com/latest/march.js"></script>`

export default function Cta() {
  return <section class="sc-cta" aria-labelledby="sc-cta-h">
    <h2 id="sc-cta-h" class="sc-cta-title"><span>Hadi,</span> <span class="sc-cta-hl">başla.</span></h2>
    <p class="sc-cta-lead">Tarayıcıda yaz, CDN'den yükle ya da depodan kur: üç yoldan biri yeter.</p>
    <Reveal class="sc-cta-ways" effect="up" stagger={100}>
      <div class="sc-cta-way sc-card">
        <b>Tarayıcıda</b><span>Kurulum yok: MarchIDE'yi aç, yaz, dışa aktar.</span>
        <Button variant="primary" href="/ide" iconEnd={arrowRight}>MarchIDE</Button>
      </div>
      <div class="sc-cta-way sc-card">
        <b>CDN</b><span>{`Tek satır, hep en yeni sürüm. Sabitlemek için latest yerine ${version} yaz.`}</span>
        <code class="sc-cta-code">{CDN}</code><CopyButton text={CDN} label="CDN satırını kopyala" />
      </div>
      <div class="sc-cta-way sc-card">
        <b>Depodan</b><span>Açık kaynak, MIT lisanslı.</span>
        <code class="sc-cta-code">{INSTALL}</code><CopyButton text={INSTALL} label="Kurulum satırını kopyala" />
        <Button href={REPO} target="_blank" rel="noopener" icon={<Icon of={github} />}>GitHub</Button>
      </div>
    </Reveal>
  </section>
}
