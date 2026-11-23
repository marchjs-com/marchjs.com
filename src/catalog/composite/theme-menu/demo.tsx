// Showcase stage for ThemeMenu: the menu button as it would sit in a top bar; the choices change the whole showcase.
import { ThemeMenu } from "march/components/composite/theme-menu";
import type { ColorToken } from "march/theme";
import { sun } from "march/icons";

export const code = `<ThemeMenu />
<ThemeMenu themes={false} accents={["primary", "brand-orange", "brand-blue", "brand-green", "brand-purple"]} />
<ThemeMenu icon={sun} modes={false} headings={false} labels={{ theme: "Palet", accent: "Vurgu" }} />
<ThemeMenu view="cards" current />   // önizleme kartları; düğmede geçerli temanın örneği ve adı`

const BRAND: ColorToken[] = ["primary", "brand-orange", "brand-blue", "brand-green", "brand-purple"]

export default function ThemeMenuDemo(props: { values: { themes: boolean; view: string; current: boolean; accents: string; modes: boolean; headings: boolean; icon: string } }) {
  return <div class="sc-row">{() => <ThemeMenu label="Görünüm" placement="bottom-start" themes={props.values.themes} view={props.values.view as "list"} current={props.values.current}
    modes={props.values.modes} headings={props.values.headings} icon={props.values.icon === "none" ? false : props.values.icon === "sun" ? sun : undefined}
    accents={props.values.accents === "none" ? false : props.values.accents === "brand" ? BRAND : undefined} />}
    <span class="m-muted">Seçim bütün vitrine uygulanır</span></div>
}
