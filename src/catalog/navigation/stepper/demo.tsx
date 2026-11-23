// Showcase stage for Stepper: a checkout in four steps with the Playground values. Code is shown in the Code tab.
import { effect } from "march";
import { Stepper } from "march/components/navigation/stepper";
import type { StepItem } from "march/components/navigation/steps";
import type { ColorToken } from "march/theme";

export const code = `<Stepper steps={[{ title: "Sepet" }, { title: "Adres" }, { title: "Ödeme" }, { title: "Onay" }]}
  current={$step} onSelect={(i) => $step = i}
  panels={[<Cart />, <Address />, <Payment />, <Done />]} onFinish={submit}
  highlight={false} counter={(i, n) => (n - i - 1) + " adım kaldı"} doneIcon={false}
  labels={{ back: "Önceki", next: "Devam" }} finishLabel="Bitir" />`

type Values = { steps: readonly StepItem[]; current: number; vertical: boolean; morph: boolean; color: string; highlight: boolean; nav: boolean; counter: string; done: string }

export default function StepperDemo(props: { values: Values }) {
  let $step = 1
  let $done = false
  // the step follows the Playground's current when it is moved; the steps and Back / Next move it in between
  let last = -1
  effect(() => { const c = props.values.current; if (c !== last) { last = c; $step = c; $done = false } })
  const panels = [
    <div class="sc-step-pane"><b>Sepet</b><p>HADİ kahve makinesi, 2 filtre paketi ve bir kupa. Ara toplam 1.240 ₺.</p></div>,
    <div class="sc-step-pane"><b>Adres</b><p>Teslimat: HADİ Plaza, Kat 4. Kargo yarın teslim edilir. Fatura adresi aynı.</p><p>Kapıda imza gerekmez; kurye gelmeden önce kısa mesajla haber verir.</p></div>,
    <div class="sc-step-pane"><b>Ödeme</b><p>•••• 4242 ile ödenecek. 3 taksit seçeneği var.</p></div>,
    <div class="sc-step-pane"><b>Onay</b><p>{() => ($done ? "Sipariş alındı. Teşekkürler!" : "Her şey hazır: Bitir'e basın.")}</p></div>,
  ]
  const color = (): ColorToken | undefined => (props.values.color || undefined) as ColorToken
  // highlight, counter and the done mark are read once by the stepper: it is drawn again when one of them changes
  return <div class="sc-step-demo">
    {() => {
      const steps = props.values.steps, highlight = props.values.highlight, counter = props.values.counter, done = props.values.done
      return <Stepper steps={steps} current={() => $step} onSelect={(i) => { $step = i; $done = false }} vertical={() => props.values.vertical}
        morph={() => props.values.morph} m:color={color()} panels={panels} nav={props.values.nav} onFinish={() => { $done = true }} finishLabel="Bitir"
        highlight={highlight} doneIcon={done === "number" ? false : undefined}
        counter={counter !== "off"} />
    }}
  </div>
}
