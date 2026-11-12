// Top bar tools (page title extras and actions via portal targets, slow 3G indicator, search, accent, theme, light/dark): a lazy chunk with a placeholder of the same size.
import { PaletteButton, ThemePicker, ThemeToggle, AccentPicker, Button } from "hadi-march/ui";
import { PortalTarget } from "hadi-march";
import { slow } from "./slow.ts";

export default function ShellTools() {
  return <div class="sc-tools">
    {/* pages put their own title extras and actions here (<Portal to="title"> / <Portal to="toolbar">); empty = hidden */}
    <PortalTarget name="title" class="sc-target-title" />
    <PortalTarget name="toolbar" class="sc-target-toolbar" label="Sayfa eylemleri" />
    {() => (slow() ? <Button size="sm" variant="secondary" title="Yavaş 3G benzetimi açık: kapatmak için tıkla" on:click={() => slow.set(false)}>Yavaş 3G</Button> : null)}
    <PaletteButton label="Bileşen ara…" />
    <AccentPicker label="Vurgu rengi" />
    <ThemePicker label="Tema" />
    <ThemeToggle />
  </div>
}
