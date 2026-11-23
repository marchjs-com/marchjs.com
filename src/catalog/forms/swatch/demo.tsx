// Showcase stage for Swatch: a small palette (plain colours, gradients, transparent colours over the checkerboard, or
// theme tokens). A click selects a swatch; the line under it shows the chosen value.
import { Swatch } from "march/forms";
import { heart } from "march/icons";

export const code = `<Swatch color="#ff7a1a" label="Turuncu" selected={$c === "#ff7a1a"} onClick={() => $c = "#ff7a1a"} />
<Swatch color="linear-gradient(135deg, #ff7a1a, #7c3aed)" shape="circle" size="lg" mark />   // gradient, tick when selected
<Swatch color="rgb(37 99 235 / .4)" label="Yarı saydam mavi" />                               // picture; checkerboard shows through
<Swatch color="brand-green" />                                                                 // theme token
<div class={CHECKER} />                                                                        // the shared checkerboard on any element`

const PALETTES: Record<string, [string, string][]> = {
  solid: [["#ff7a1a", "Turuncu"], ["#2563eb", "Mavi"], ["#16a34a", "Yeşil"], ["#7c3aed", "Mor"], ["#eab308", "Altın"], ["#111827", "Gece"]],
  gradient: [["linear-gradient(135deg, #ff7a1a, #7c3aed)", "Gün batımı"], ["linear-gradient(135deg, #2563eb, #16a34a)", "Deniz"], ["linear-gradient(90deg, #eab308, #ff7a1a)", "Sıcak"], ["conic-gradient(#ff7a1a, #2563eb, #16a34a, #7c3aed, #ff7a1a)", "Dört renk"]],
  alpha: [["rgb(255 122 26 / .25)", "Turuncu %25"], ["rgb(37 99 235 / .4)", "Mavi %40"], ["rgb(22 163 74 / .6)", "Yeşil %60"], ["transparent", "Saydam"]],
  token: [["brand-orange", "brand-orange"], ["brand-blue", "brand-blue"], ["brand-green", "brand-green"], ["brand-purple", "brand-purple"], ["danger", "danger"], ["primary", "primary"]],
}

export default function SwatchDemo(props: { values: { palette: string; size: string; shape: string; mark: string; checker: boolean; selected: boolean; clickable: boolean } }) {
  return <div class="sc-col">
    {() => {
      const v = { ...props.values }
      // "Seçili başla" off: nothing is selected until a click
      let $picked = v.selected === false ? -1 : 0
      const list = PALETTES[v.palette] ?? PALETTES.solid!
      const mark = v.mark === "check" ? true : v.mark === "own" ? heart : false
      return <>
        <div class="sc-row" role="group" aria-label="Renk seç">
          {list.map(([color, label], i) => {
            const onClick = v.clickable ? () => { $picked = i } : undefined
            return <Swatch color={color} label={label} size={v.size as "md"} shape={v.shape as "round"} checker={v.checker} mark={mark}
              selected={() => $picked === i} onClick={onClick} />
          })}
        </div>
        <p class="m-muted">{() => { const at = list[$picked]; return at ? `${at[1]}: ${at[0]}` : "Seçili renk yok" }}</p>
      </>
    }}
  </div>
}
