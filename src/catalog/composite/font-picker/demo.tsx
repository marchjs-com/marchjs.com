// Showcase stage for FontPicker: the picker and an event card written in the chosen font, for the Playground values
// (playground.ts).
import { setStyle } from "../../demo-util.ts";
import { effect, untrack, computed, signal } from "march";
import { storage } from "march/managers/storage";
import { FontPicker, type FontChoice, type FontCategory, type FontSort } from "march/components/composite/font-picker";
import type { Values } from "./playground.ts";

export const code = `<FontPicker bind:value={$font} onPick={(f) => setStyle(card, { "font-family": f.stack, "font-weight": f.weight })} />
<FontPicker view="dialog" askConsent preview="sample" sample="Merhaba dünya" bind:value={$font} />
<FontPicker view="inline" source="/fonts" category="serif" favorites={false} bind:value={$font} />`

export default function FontPickerDemo(props: { values: Values }) {
  let $font = "Georgia"
  // a first visit starts with two recent picks and a favourite (device fonts: nothing is requested), so those groups show
  const kept = untrack(storage).local
  if (kept.getSync<string[] | null>("showcase.fonts.recent", null) == null) { kept.setSync("showcase.fonts.recent", ["Georgia", "Trebuchet MS"]); kept.setSync("showcase.fonts.favorites", ["Palatino"]) }
  const choice = signal<FontChoice | null>(null)
  const card = (<div class="sc-fp-card">
    <span class="sc-fp-kicker">Cumartesi · 20.00</span>
    <b>Kadıköy'de tanışma yemeği</b>
    <p>Sekiz kişilik masa, yeni yüzler, uzun bir sohbet. Yerini ayırt, gerisini biz ayarlayalım.</p>
    <span class="sc-fp-meta">{() => { const c = choice(); return c ? `${c.stack} · ${c.weight}${c.italic ? " italik" : ""}` : `${$font}` }}</span>
  </div>) as HTMLElement
  effect(() => { const c = choice(); setStyle(card, { "font-family": c ? c.stack : $font, "--sc-fp-weight": c ? c.weight : null, "font-style": c?.italic ? "italic" : null }) })
  // the view decides how the picker is built, so the picker is made again when it changes (the font is kept); every
  // other value is followed live
  const view = computed(() => props.values.view)
  return <div class="sc-fp-demo">
    <div class="sc-fp-pick">
      {() => {
        const v = view()
        return untrack(() => <FontPicker view={v as "popover"} bind:value={$font} onPick={(c: FontChoice) => choice.set(c)}
          preview={props.values.preview as "name"} category={props.values.category as FontCategory} sort={props.values.sort as FontSort}
          source={props.values.source === "google" ? "google" : false} catalog={props.values.source === "none" ? false : undefined}
          askConsent={props.values.askConsent} search={props.values.search} categories={props.values.categories} sorts={props.values.sorts} subsets={props.values.subsets}
          favorites={props.values.favorites} recent={props.values.recent ? 5 : 0} meta={props.values.meta} count={props.values.count} specimen={props.values.specimen}
          sizeControl={props.values.sizeControl} styleControls={props.values.styleControls} css={props.values.css} closeOnPick={props.values.closeOnPick}
          disabled={props.values.disabled} storageKey="showcase.fonts" />)
      }}
    </div>
    {card}
  </div>
}
