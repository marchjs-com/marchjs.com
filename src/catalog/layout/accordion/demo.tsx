// Showcase stage for Accordion: a help centre's questions (Playground values in playground.ts).
import { Accordion } from "march/components/layout/accordion";
import { truck, receipt, shieldCheck, plus, minus, Icon } from "march/icons";

export const code = `<Accordion multiple open={[0]} items={[
  { title: "Kargo", subtitle: "2–3 iş günü", content: <Shipping /> },
  { title: "İade", content: <Returns /> },
]} />
<Accordion items={faq} chevron={(open) => <Icon of={open() ? minus : plus} />} m:color="brand-orange" animated={false} />`

export default function AccordionDemo(props: { values: { multiple: boolean; variant: string; icons: boolean; chevron: string; animated: boolean; color: string } }) {
  const items = () => [
    { title: "Kargo", subtitle: "2–3 iş günü", icon: props.values.icons ? truck : undefined, content: <p>Siparişler aynı gün paketlenir; HADİ Kargo ile gönderilir.</p> },
    { title: "İade ve değişim", subtitle: "30 gün", icon: props.values.icons ? receipt : undefined, content: <p>Ürünü 30 gün içinde ücretsiz iade edebilirsiniz. Etiketi hesabınızdan yazdırın.</p> },
    { title: "Garanti", icon: props.values.icons ? shieldCheck : undefined, content: <p>Bütün cihazlar iki yıl garantilidir.</p> },
    { title: "Toptan satış", subtitle: "Yakında", disabled: true, content: <p>—</p> },
  ]
  return <div class="sc-acc-demo">
    {() => {
      const multiple = props.values.multiple, variant = props.values.variant as "separated", list = items()
      const animated = props.values.animated, color = props.values.color as "primary"
      const chevron = props.values.chevron === "off" ? false : props.values.chevron === "plus" ? (open: () => boolean) => <span>{() => <Icon of={open() ? minus : plus} />}</span> : true
      // with several allowed, two start open (the difference shows at once)
      return <Accordion items={list} multiple={multiple} open={multiple ? [0, 1] : [0]} variant={variant} chevron={chevron} animated={animated} m:color={color} />
    }}
    <p class="m-muted">{() => (props.values.animated ? "Bölümler yüksekliği kayarak açılır ve kapanır" : "Bölümler hareketsiz, anında açılır ve kapanır")}: bir başlığa basınca görünür.</p>
  </div>
}
