// Showcase stage for DotMatrix: one LED board that takes every option, and buttons that change its text (each
// change wipes or dissolves across the board). "Uzun yazı" puts a text longer than the window on it, so it scrolls.
import { DotMatrix } from "march/components/data/dot-matrix";
import { Button } from "march/components/actions/button";
import type { ColorToken } from "march/theme";

export const code = `<DotMatrix value="ANKARA  14:05" />
<DotMatrix value={$score} columns={3} align="end" color="danger" size="lg" />
<DotMatrix value="Kapılar kapanıyor, lütfen geri çekilin" columns={16} speed={24} />
<DotMatrix value={$text} transition="dissolve" dot="square" parts={{ glow: false }} />`

type V = { value: string; columns: number; align: string; scroll: boolean; speed: number; dot: string; size: string; color: string;
  transition: string; duration: number; parts: string; motion: boolean; label: string }

const PARTS: Record<string, { off?: boolean; glow?: boolean; bezel?: boolean } | undefined> = { all: undefined, noglow: { glow: false }, bare: { bezel: false, off: false } };

export default function DotMatrixDemo(props: { values: V }) {
  // a text from the buttons replaces the option's text until the option changes again
  let $text: string | null = null
  let $n = 0
  const v = () => props.values
  return <div class="sc-col">
    <DotMatrix value={() => $text ?? v().value} columns={() => v().columns} align={() => v().align as "start"} scroll={() => (v().scroll ? "auto" : false)}
      speed={() => v().speed} dot={() => v().dot as "round"} size={() => v().size as "md"} color={() => (v().color || undefined) as ColorToken | undefined}
      transition={() => v().transition as "wipe"} duration={() => v().duration} parts={() => PARTS[v().parts]} motion={() => v().motion}
      label={() => v().label} />
    <div class="sc-row">
      <Button size="sm" data-audit-try on:click={() => { $n++; $text = `SKOR ${$n}` }}>Skor +1</Button>
      <Button size="sm" variant="ghost" on:click={() => { $text = "İSTANBUL - ANKARA 14:05 PERON 3" }}>Uzun yazı</Button>
      <Button size="sm" variant="ghost" on:click={() => { $text = null }}>Seçenekteki yazı</Button>
    </div>
  </div>
}
