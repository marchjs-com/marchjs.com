// Showcase stage for StoryProgress: bars over a dark card; each segment fills, then the next starts (loops).
import { StoryProgress } from "march/social";
import type { ColorToken } from "march/theme";

export const code = `<StoryProgress count={items.length} index={$i} run={item.id}
  duration={6000} paused={$hold} onDone={() => $i++} />`

export default function StoryProgressDemo(props: { values: { index: number; count: number; duration: number; paused: boolean; color: string } }) {
  let $i = props.values.index
  let $round = 0
  return <div class="sc-social-sprog">
    <StoryProgress count={() => props.values.count} index={() => Math.min($i, props.values.count - 1)} run={() => `${$round}:${$i}`} duration={() => props.values.duration} paused={() => props.values.paused}
      color={() => (props.values.color === "white" ? undefined : props.values.color as ColorToken)}
      onDone={() => { if ($i < props.values.count - 1) $i = $i + 1; else { $i = 0; $round = $round + 1 } }} />
    <p>{() => `${Math.min($i, props.values.count - 1) + 1} / ${props.values.count}${props.values.paused ? " · duraklatıldı" : ""}`}</p>
  </div>
}
