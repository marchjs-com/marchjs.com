// Showcase stage for MadeWithMarch: the credit line in the Playground's variant, with the chosen heart and sentence.
import { MadeWithMarch } from "march/components/actions/made-with-march";

export const code = `<MadeWithMarch />
<MadeWithMarch variant="badge" />
<MadeWithMarch variant="small" />
<MadeWithMarch heart="☕" heartLabel="Kahve" />           // heart: false | your own mark
<MadeWithMarch text={(link, heart) => <>{link} üzerine kuruldu {heart}</>} />`

export default function MadeWithMarchDemo(props: { values: { variant: string; heart: string; text: string } }) {
  return <div class="sc-row">{() => {
    const v = props.values
    return <MadeWithMarch variant={v.variant as "text"} heart={v.heart === "off" ? false : v.heart === "own" ? "☕" : true} heartLabel={v.heart === "own" ? "Kahve" : undefined}
      text={v.text === "own" ? (link, heart) => <>{link} üzerine kuruldu {heart}</> : undefined} />
  }}</div>
}
