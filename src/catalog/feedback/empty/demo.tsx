// Showcase stage for Empty: size, icon, title, text and action follow the Playground values (playground.ts).
import { Empty } from "march/components/feedback/empty";
import { Button } from "march/components/actions/button";
import { inbox, plus } from "march/icons";

export const code = `<Empty icon={inbox} title="Gelen kutusu boş" action={[<Button variant="primary" icon={plus}>Yeni mesaj</Button>]}>
  Yeni bir konuşma başlatın ya da bir ekip arkadaşını davet edin.
</Empty>
<Empty size="sm" title="Eşleşme yok" />                      // panel, liste, açılır pencere içi`

export default function EmptyDemo(props: { values: { size: string; icon: string; title: string; text: string; action: boolean } }) {
  let $made = 0
  return <div class="sc-col">
    {() => {
      // read here: Empty reads its icon and size once, so the stage is drawn again when an option changes
      const v = { ...props.values }
      return <Empty size={v.size as "md"} icon={v.icon ? inbox : undefined} title={v.title ? () => ($made ? `${$made} taslak oluşturuldu` : v.title) : false}
        action={v.action ? [<Button variant="primary" icon={plus} on:click={() => { $made++ }}>Yeni mesaj</Button>] : undefined}>
        {v.text || null}
      </Empty>
    }}
  </div>
}
