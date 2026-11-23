// Showcase stage for Card: title, subtitle, body, footer, root tag, flush body, plain and the header's Edit button follow the Playground values (playground.ts).
import { Card } from "march/components/data/card";
import { KeyValue } from "march/components/data/key-value";
import { Button } from "march/components/actions/button";
import { edit } from "march/icons";

export const code = `<Card title="HADİ" subtitle="Kurumsal plan" actions={[<Button size="sm" icon={edit}>Düzenle</Button>]}
  footer={<span class="m-muted">Son güncelleme: bugün</span>}>
  …
</Card>
<Card flush>…</Card>                                   // body without padding (tables, lists)`

export default function CardDemo(props: { values: { title: string; subtitle: string; body: string; footer: string; as: string; flush: boolean; plain: boolean; actions: boolean } }) {
  let $edits = 0
  return <div class="sc-col">
    {() => {
      const v = props.values
      return <Card title={v.title || undefined} subtitle={v.subtitle || undefined} as={v.as || "section"}
        actions={v.actions ? [<Button size="sm" icon={edit} on:click={() => { $edits++ }}>Düzenle</Button>] : undefined}
        footer={v.footer ? <span class="m-muted">{() => ($edits ? `${$edits} düzenleme yapıldı` : v.footer)}</span> : undefined} flush={!!v.flush} plain={!!v.plain}>
        {v.body ? <p>{v.body}</p> : null}
        <KeyValue columns={2} items={[{ label: "Kullanıcı", value: "48" }, { label: "Depolama", value: "12,4 GB" }]} />
      </Card>
    }}
  </div>
}
