// Showcase stage for ChoicePicker: the same control with more or fewer options, or a forced look.
import { ChoicePicker, pickerKind } from "march/components/forms/choice-picker";
import { normOptions } from "../../demo-util.ts";
import { CITIES } from "./playground.ts";

export const code = `<ChoicePicker bind:value={$v} options={["Gün", "Hafta", "Ay"]} />                 // segmented
<ChoicePicker bind:value={$v} options={eightCities} />                             // chips
<ChoicePicker bind:value={$v} options={cities} />                                  // 10+ → combobox
<ChoicePicker bind:value={$v} kind="cards" options={themes.map((t) => ({ ...t, preview: () => <Swatch of={t} /> }))} />`

export default function ChoicePickerDemo(props: { values: { count: number; kind: string } }) {
  let $city = "İzmir"
  return <div class="sc-stack">
    {() => {
      const opts = CITIES.slice(0, props.values.count)
      return [<ChoicePicker value={$city} onChange={(v: unknown) => { $city = String(v ?? "") }} options={opts} kind={props.values.kind as "auto"} aria-label="Şehir" />,
        <p class="m-muted">{`Görünüm: ${pickerKind(normOptions(opts), props.values.kind as "auto")} (${props.values.kind === "auto" ? "seçenek sayısına göre kendisi seçti" : `kind="${props.values.kind}" ile zorlandı`})`}</p>]
    }}
  </div>
}
