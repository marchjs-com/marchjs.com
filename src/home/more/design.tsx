// Home page section (a lazy part, the heaviest: loaded only as it comes near): the themes are not enough? Design your
// own. The real ThemeEditor, trimmed for the page: colours, type and shape with its live preview, "Apply to the app"
// switches this page to the draft (nothing is saved, nothing is read from the address).
import "./more.css";
import { Link } from "march/router";
import { ThemeEditor } from "march/components/composite/theme-editor";
import { Reveal } from "march/landing";
import { Head } from "../head.tsx";

export default function Design() {
  return <section class="sc-sec" aria-labelledby="sc-design-h">
    <Head id="sc-design-h" kicker="Kendi teman" color="brand-orange" title="Tema düzenleyiciyle kendi temanı tasarla" example="Temalar yetmedi mi? Zevkine göre tasarla"
      lead="Her renk, yazı tipi, köşe ve gölge bir belirteç. Burada değiştir, önizlemede canlı gör, kontrastı denetle; beğenince bu sayfaya uygula ya da kod olarak al." />
    <Reveal class="sc-design sc-card" effect="up">
      <ThemeEditor base={"hadi"} tabs={["colors", "type", "shape"]} storageKey={false} share={false} warnUnsaved={false} nameField={false} historyButtons={false} />
    </Reveal>
    <Link href="/themes/theme-editor" class="sc-fast-link">Tema editörünün tamamı</Link>
  </section>
}
