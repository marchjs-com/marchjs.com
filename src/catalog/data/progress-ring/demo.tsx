// Showcase stage for ProgressRing: last night's sleep in three rings. The first ring takes every option (its value
// too); the other two show the low / mid / high levels: "Bir gece daha" draws new scores, those rings sweep to them and
// their numbers count along (`animate`: spring, a slow ease, or off).
import { ProgressRing } from "march/components/data/progress-ring";
import { Button } from "march/components/actions/button";
import { refresh } from "march/icons";
import type { ColorToken } from "march/theme";
import type { MultiColors } from "../../demo-util.ts";

export const code = `<ProgressRing value={$sleep} label="Uyku puanı" />
<ProgressRing value={7} max={10} size={88} thickness={10} color="brand-blue" format={(v) => \`\${v}/10\`} />
<ProgressRing value={64} colors="brand" paint="segments" label="Hafta" animate={{ easing: "out", duration: 1600 }} />`

const NIGHTS = [[45, 91], [81, 34], [63, 77]];

type V = { value: number; max: number; size: number; thickness: number; colors: string; paint: string; color: string; label: string; animate: string };
const anim = (a: string) => (a === "spring" ? true : a === "off" ? false : a === "slow" ? { easing: "out", duration: 1600 } : a);

export default function ProgressRingDemo(props: { values: V }) {
  let $night = 0
  const RINGS = [{ label: "Derin uyku" }, { label: "Rüya evresi" }]
  return <div class="sc-col">
    <div class="sc-row"><Button size="sm" icon={refresh} on:click={() => { $night = ($night + 1) % NIGHTS.length }}>Bir gece daha</Button></div>
    {() => {
      const v = props.values
      const look = { size: v.size, thickness: v.thickness, colors: (v.colors === "theme" ? undefined : v.colors) as MultiColors | undefined, paint: v.paint as "gradient", color: (v.color || undefined) as ColorToken | undefined, animate: anim(v.animate) }
      return <div class="sc-row">
        <ProgressRing value={(v.value * v.max) / 100} max={v.max} label={v.label} {...look}
          format={v.max === 100 ? undefined : (x: unknown) => `${Math.round(x as number * 10) / 10}`} />
        {RINGS.map((r, i) => <ProgressRing value={() => NIGHTS[$night]![i]!} label={r.label} {...look} />)}
      </div>
    }}
  </div>
}
