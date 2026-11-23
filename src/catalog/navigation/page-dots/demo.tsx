// Showcase stage for PageDots: the dots drive a page number; Previous / Next move it from outside, so read-only dots
// (interactive off) still change. The line shows the current page.
import { PageDots } from "march/navigation";
import { Button } from "march/actions";

export const code = `<PageDots count={5} bind:value={$page} />                        // buttons: click, arrow keys, Home / End
<PageDots count={steps.length} value={$active} m:color="brand-orange" />   // read-only: shows the position
<PageDots count={4} value={$i} onChange={(i) => $i = i} dot={(i) => i + 1} labels={{ page: (n) => \`\${n}. kart\` }} />`

export default function PageDotsDemo(props: { values: { count: number; interactive: boolean; variant: string; size: string; color: string; dot: string; orientation: string } }) {
  let $page = 0
  const move = (d: number): void => { const n = props.values.count; $page = (Math.min($page, n - 1) + d + n) % n }
  return <div class="sc-col">
    {() => {
      const v = { ...props.values }
      const color = v.color === "primary" ? undefined : v.color as "neutral"
      const dot = v.dot === "own" ? (i: number) => String(i + 1) : undefined
      const onChange = v.interactive ? (i: number) => { $page = i } : undefined
      return <PageDots count={v.count} value={() => $page} onChange={onChange} variant={v.variant as "pill"} size={v.size as "md"} m:color={color} dot={dot}
        orientation={v.orientation as "horizontal"} labels={{ page: (n) => `${n}. sayfa` }} />
    }}
    <div class="sc-row sc-row-center">
      <Button size="sm" on:click={() => move(-1)}>Önceki</Button>
      <Button size="sm" on:click={() => move(1)}>Sonraki</Button>
    </div>
    <p class="sc-demo-call">{() => `value: ${$page}`}</p>
  </div>
}
