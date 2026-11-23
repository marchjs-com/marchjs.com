// Showcase stage for Wizard: an account setup in steps; the Playground sets the step count, the field layout and the color.
import { Wizard, type WizardStep } from "march/components/composite/wizard";
import { schema } from "march/schema";
import type { ColorToken } from "march/theme";

export const code = `<Wizard m:color="primary" layout="stack" submitLabel="Bitir" onSubmit={save} steps={[
  { title: "Hesap", schema: schema({ email: { type: "email", label: "E-posta", required: true } }) },
  { title: "Profil", schema: schema({ name: { type: "text", label: "Görünen ad", required: true } }) },
  { title: "Tercihler", schema: schema({ news: { type: "bool", label: "Haber bülteni", control: "switch" } }) },
]} />
<Wizard steps={steps} stepper={false} count={false} labels={{ back: "← Önceki", next: "Devam et →" }} />`

const ALL: WizardStep[] = [
  { title: "Hesap", schema: schema({ email: { type: "email", label: "E-posta", required: true }, phone: { type: "text", label: "Telefon" } }) },
  { title: "Profil", schema: schema({ name: { type: "text", label: "Görünen ad", required: true }, city: { type: "text", label: "Şehir" } }) },
  { title: "Ekip", schema: schema({ team: { type: "text", label: "Ekip adı", required: true }, size: { type: "int", label: "Kişi sayısı" } }) },
  { title: "Tercihler", schema: schema({ news: { type: "bool", label: "Haber bülteni", control: "switch" } }) },
]

export default function WizardDemo(props: { values: { steps: number; layout: string; color: string; stepper: boolean; progress: boolean; count: boolean; backButton: boolean; ownLabels: boolean } }) {
  // Wizard's steps, layout and color props are live: each Playground change reaches it without drawing the card again
  // the parts (stage list, bar, count, Back) and the texts are read once: changing one draws the wizard again
  return <>{() => {
    const v = props.values, own = v.ownLabels
    const parts = { stepper: v.stepper, progress: v.progress, count: v.count, backButton: v.backButton }
    return <Wizard steps={ALL.slice(0, props.values.steps - 1).concat(ALL[3]!)} submitLabel={own ? "Hesabı aç" : "Bitir"} {...parts}
      labels={own ? { back: "← Önceki", next: "Devam et →", count: (i: number, n: number) => `${i + 1} / ${n}` } : undefined}
      layout={props.values.layout as "stack"} cols={2} m:color={props.values.color as ColorToken} />
  }}</>
}
