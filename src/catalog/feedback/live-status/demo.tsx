// Showcase stage for LiveStatus: the buttons change a selection count; the status line says it (the Playground text after the count). With "Görünür metin"
// off the line is only read, so the stage prints what a screen reader hears.
import { LiveStatus } from "march/components/feedback/live-status";
import { Button } from "march/components/actions/button";
import { Kbd } from "march/components/typography/kbd";

export const code = `<LiveStatus text={() => \`\${$count} satır seçildi\`} />                       // görünür, kibarca okunur
<LiveStatus visible={false} text={$moved} help="Taşımak için sürükleyin" helpId="plan-help" />   // ipucu + yalnız okunan durum
<section aria-describedby="plan-help">…</section>`

export default function LiveStatusDemo(props: { values: { text: string; visible: boolean; help: string; politeness: string; as: string } }) {
  let $count = 2
  // the Playground text with the live count in front of it ("2 satır seçildi" → "3 satır seçildi")
  const text = (): string => ($count ? `${$count} ${(props.values.text || "satır seçildi").replace(/^\d+\s*/, "")}` : "Seçim yok")
  return <div class="sc-col">
    <div class="sc-row">
      <Button size="sm" on:click={() => { $count = $count + 1 }}>Bir satır seç</Button>
      <Button size="sm" variant="ghost" on:click={() => { $count = 0 }}>Seçimi temizle</Button>
    </div>
    {() => {
      const v = { ...props.values }
      const help = v.help === "off" ? false : v.help === "own" ? <span>Seçmek için <Kbd keys="space" /> tuşuna basın</span> : "Satır seçmek için düğmeye basın."
      return <LiveStatus text={text} visible={v.visible} politeness={v.politeness as "polite"} as={v.as as "span"} help={help} helpId="sc-live-status-help" />
    }}
    <p class="sc-demo-call">{() => `role="status" · aria-live="${props.values.politeness}" (${props.values.politeness === "assertive" ? "okunanı keser, hemen söyler" : "okunan bitince söyler"}) · ${props.values.visible ? "görünür" : "yalnız ekran okuyucu"}: "${text()}"`}</p>
  </div>
}
