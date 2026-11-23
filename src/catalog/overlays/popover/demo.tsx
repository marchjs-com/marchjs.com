// Showcase stage for Popover: a filter panel (or a list of choices) behind a button; the panel follows the Playground values.
import { Popover } from "march/components/overlays/popover";
import { Button } from "march/components/actions/button";
import { OptionList } from "march/components/forms/option-list";
import { Checkbox } from "march/components/forms/checkbox";
import { filter } from "march/icons";

export const code = `<Popover trigger={<Button icon={filter}>Süzgeçler</Button>} title="Süzgeçler" placement="bottom-start"
  footer={<Button size="sm" variant="primary">Uygula</Button>}>
  {(close) => <FilterForm onDone={close} />}
</Popover>
<Popover bind:open={$open} anchor={() => input} role="listbox" flush autoFocus={false}>…</Popover>   // bir alana bağlı`

const SORTS = [{ value: "new", label: "En yeni", hint: "Önce son eklenenler" }, { value: "old", label: "En eski" }, { value: "name", label: "Ada göre" }]

interface Values { trigger: string; defaultOpen: boolean; content: string; placement: string; motion: string; title: boolean; closable: boolean; width: string; outside: boolean }

export default function PopoverDemo(props: { values: Values }) {
  let $sort = "new"
  let $log = "kapalı"
  return <div class="sc-a6-pop-stage">
    {() => {
      const v = { ...props.values }
      const list = v.content === "list"
      return <Popover trigger={<Button icon={filter} variant="secondary">{list ? "Sırala" : v.trigger}</Button>} defaultOpen={v.defaultOpen} placement={v.placement as "bottom-start"} motion={v.motion as "scale"}
        title={v.title ? (list ? "Sıralama" : "Süzgeçler") : undefined} label={list ? "Sıralama" : "Süzgeçler"} closable={v.closable} closeLabel="Kapat" width={v.width as "auto"} flush={list}
        closeOnOutside={v.outside} onOpenChange={(open, why) => { $log = open ? "açık" : `kapandı (${why})` }}
        footer={list ? undefined : <Button size="sm" variant="primary">Uygula</Button>}>
        {(close: () => void) => list
          ? <OptionList bind:value={$sort} options={SORTS} label="Sıralama" onPick={() => close()} />
          : <div class="sc-a6-stack"><Checkbox label="Yalnız açık etkinlikler" value={true} /><Checkbox label="Ücretsiz" /><Checkbox label="Bu hafta" /></div>}
      </Popover>
    }}
    <p class="sc-demo-call">{() => `<Popover placement="${props.values.placement}" motion="${props.values.motion}" closeOnOutside={${props.values.outside}} />`}</p>
    <p class="sc-demo-call">{() => `${$log} · sıralama: ${$sort}`}</p>
  </div>
}
