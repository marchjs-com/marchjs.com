// Top bar tools (search button, accent, theme, light/dark): a lazy chunk with a placeholder of the same size.
import { PaletteButton, ThemePicker, ThemeToggle, AccentPicker } from "hadi-march/ui";

export default function ShellTools() {
  return <div class="sc-tools">
    <PaletteButton label="Bileşen ara…" />
    <AccentPicker label="Vurgu rengi" />
    <ThemePicker label="Tema" />
    <ThemeToggle />
  </div>
}
