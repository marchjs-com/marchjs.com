// Showcase stage for StoryRing: a story tray; the first ring follows the Playground, a tap marks a ring seen.
import { StoryRing, type StoryRingState } from "march/social";
import { USERS } from "../demo-data.ts";
import type { ColorToken } from "march/theme";
import { Icon, star } from "march/icons";

export const code = `<StoryRing name={u.name} state={u.seen ? "seen" : "new"} label={u.handle}
  loading={$opening === u.id} onClick={() => open(u)} />
<StoryRing name="Siz" add label="Hikâyen" onClick={addStory} />`

export default function StoryRingDemo(props: { values: { name: string; state: string; size: string; add: string; loading: boolean; color: string } }) {
  let $seen = new Set<string>()
  return <div class="sc-social-tray" role="list" aria-label="Hikâyeler">
    <div role="listitem">{() => <StoryRing name={props.values.name} state={() => props.values.state as StoryRingState} size={() => props.values.size as "md"} loading={() => props.values.loading} label="Hikâyen" onClick={() => {}}
      add={props.values.add !== "off"} addIcon={props.values.add === "own" ? <Icon of={star} /> : undefined}
      m:color={props.values.color === "sweep" ? undefined : props.values.color as ColorToken} />}</div>
    {USERS.slice(0, 5).map((u, i) => <div role="listitem"><StoryRing name={u.name} size={() => props.values.size as "md"} label={u.handle}
      m:color={() => (props.values.color === "sweep" ? undefined : props.values.color as ColorToken)}
      state={() => ($seen.has(u.id) ? "seen" : i === 3 ? "close" : "new")} onClick={() => { $seen = new Set([...$seen, u.id]) }} /></div>)}
  </div>
}
