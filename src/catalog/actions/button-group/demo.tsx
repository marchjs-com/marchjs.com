// Showcase stage for ButtonGroup: attached or spaced follows the Playground value (playground.ts).
import { ButtonGroup } from "march/components/actions/button-group";
import { Button } from "march/components/actions/button";

export const code = `<ButtonGroup attached label="Hizalama">
  <Button>Başa</Button><Button>Ortaya</Button><Button>Sona</Button>
</ButtonGroup>`

export default function ButtonGroupDemo(props: { values: { attached: boolean } }) {
  let $align = "Ortaya"
  return <div class="sc-col">
    {() => <ButtonGroup attached={props.values.attached} label="Hizalama">
      {["Başa", "Ortaya", "Sona"].map((x) => <Button variant={() => ($align === x ? "primary" : "secondary")} aria-pressed={() => String($align === x)} on:click={() => { $align = x }}>{x}</Button>)}
    </ButtonGroup>}
  </div>
}
