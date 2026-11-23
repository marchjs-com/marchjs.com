// Showcase stage for CodeInput: length, characters, colors, font, size, look, groups and masking.
import { CodeInput } from "march/forms";
import { toast } from "march/overlays";

export const code = `<CodeInput length={6} groups={[3, 3]} onComplete={verify} />            // HADİ: brand colors + display font
<CodeInput length={8} pattern="alphanumeric" colors="palette" font="mono" variant="filled" />
<CodeInput length={4} mask size="lg" />                                     // PIN
<CodeInput groups={[3, 3]} separator="•" boxLabel={(i, n) => \`\${n} hanenin \${i}.\`} animate={false} />   // separator={false}: only the gap`

type V = { length: number; pattern: string; colors: string; font: string; size: string; variant: string; groups: boolean; mask: boolean; separator: string }

export default function CodeInputDemo(props: { values: V }) {
  return <div>{() => {
    // length, pattern, colors and groups shape the boxes: the preview is rebuilt when they change
    const v = props.values, n = v.length
    const sample = (v.pattern === "numeric" ? "482915730264" : v.pattern === "alpha" ? "MARCHDEMOKOD" : "M4RCHD3M0K0D").slice(0, n)
    let $code = sample
    return <CodeInput bind:value={$code} length={n} pattern={v.pattern as "numeric"} colors={v.colors as "brand"} font={v.font as "display"} size={v.size as "md"} variant={v.variant as "outline"}
      groups={v.groups && n >= 4 ? Math.ceil(n / 2) : undefined} mask={v.mask} separator={v.separator === "off" ? false : v.separator === "dot" ? "•" : undefined} boxLabel={(i: number, len: number) => `${len} hanenin ${i}.`} aria-label="Doğrulama kodu" onComplete={(c: string) => toast(`Kod: ${c}`, { kind: "success" })} />
  }}</div>
}
