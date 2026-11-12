// Top bar tools (slow 3G indicator when on, search button, accent, theme, light/dark): a lazy chunk with a placeholder of the same size.
import { PaletteButton, ThemePicker, ThemeToggle, AccentPicker, Button } from "hadi-march/ui";
import { slow } from "./slow.ts";

export default function ShellTools() {
  return <div class="sc-tools">
    {() => (slow() ? <Button size="sm" variant="secondary" title="Yavaş 3G benzetimi açık: kapatmak için tıkla" on:click={() => slow.set(false)}>Yavaş 3G</Button> : null)}
    <PaletteButton label="Bileşen ara…" />
    <AccentPicker label="Vurgu rengi" />
    <ThemePicker label="Tema" />
    <ThemeToggle />
  </div>
}
