// Top bar tools: the search button in the middle (opens the command palette, Ctrl K), then at the end the page's own
// title extras and actions (portal targets), the slow 3G indicator, the theme button (preview cards of every theme,
// the accent list), the four HADİ accents as dots and light / dark. A lazy chunk with a placeholder of the same size.
import { PaletteButton, ThemeMenu, ThemeToggle, Swatch, Button, accent, setAccent } from "march/ui";
import { PortalTarget } from "march";
import type { ColorToken } from "march/theme";
import { slow } from "./slow.ts";

/** The accents one press away in the top bar (the theme menu lists them all). */
const DOTS: readonly { color: ColorToken; label: string }[] = [
  { color: "brand-orange", label: "Turuncu" }, { color: "brand-blue", label: "Mavi" }, { color: "brand-green", label: "Yeşil" }, { color: "brand-purple", label: "Mor" },
]

export default function ShellTools() {
  return <div class="sc-tools">
    <PaletteButton class="sc-search" label="Bileşen, sayfa ya da eylem ara…" />
    <div class="sc-tools-end">
      {/* pages put their own title extras and actions here (<Portal to="title"> / <Portal to="toolbar">); empty = hidden */}
      <PortalTarget name="title" class="sc-target-title" />
      <PortalTarget name="toolbar" class="sc-target-toolbar" label="Sayfa eylemleri" />
      {() => (slow() ? <Button size="sm" variant="secondary" title="Yavaş 3G benzetimi açık: kapatmak için tıkla" on:click={() => slow.set(false)}>Yavaş 3G</Button> : null)}
      <ThemeMenu label="Tema" view="cards" current modes={false} labels={{ theme: "Temalar", accent: "Vurgu rengi" }} />
      <div class="sc-accents" role="group" aria-label="Vurgu rengi">
        {DOTS.map((d) => <Swatch color={d.color} size="xs" shape="circle" checker={false} label={d.label} selected={() => accent() === d.color}
          onClick={() => setAccent(accent() === d.color ? "primary" : d.color)} />)}
      </div>
      <ThemeToggle />
    </div>
  </div>
}
