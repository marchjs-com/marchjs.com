// Showcase stage for ActivityBar: the bar beside the view it switches; its views and the active one come from the
// Playground (playground.ts) like the rest of its values.
import { signal, effect, untrack } from "march";
import { ActivityBar, type ActivityItem } from "march/components/navigation/activity-bar";
import type { ColorToken } from "march/theme";

export const code = `<ActivityBar value={$view} onChange={(v) => $view = v} controls="side-view" items={[
  { id: "files", label: "Dosyalar", icon: files, shortcut: "mod+shift+e" },
  { id: "search", label: "Ara", icon: search, badge: () => $hits },
  { id: "git", label: "Kaynak denetimi", icon: gitBranch, badge: () => $changes },
  { id: "settings", label: "Ayarlar", icon: settings, position: "end", onSelect: openSettings },
]} />
<ActivityBar items={views} value={$view} onChange={(v) => $view = v} m:color="brand-purple" motion="fade" tooltips={false} />
<ActivityBar items={views} value={$view} onChange={(v) => $view = v} indicator={false} />
<ActivityBar items={views} value={$view} onChange={(v) => $view = v} showLabels tooltips={false} />   // adlar ikonun altında
<ActivityBar items={sections} value={$section} onChange={pick} subItems subValue={$page} onSubSelect={(c) => go(c.id)} />   // seçilenin alt öğeleri altında`

// the indicator's motion shows only while the view changes: the stage says which one is on
const MOTIONS: Record<string, string> = { glide: "Çizgi etkin simgeye kayarak gider", fade: "Çizgi etkin simgede yerinde belirir", none: "Çizgi hareketsiz yer değiştirir", off: "Çizgi yok" }

export default function ActivityBarDemo(props: { values: { items: readonly ActivityItem[]; value: string; orientation: string; badges: boolean; indicator: boolean; motion: string; color: string; tooltips: boolean; showLabels: boolean; glass: boolean; subItems: boolean } }) {
  const view = signal<string | null>(props.values.value || null), sub = signal<string | null>("open")
  // the value option sets the active view; the bar changes it too
  effect(() => { const v = props.values.value; untrack(() => view.set(v || null)) })
  // the chosen views (playground.ts): badges follow their option; the end items are actions that close the side view
  const items = (): ActivityItem[] => props.values.items.map((it) => ({
    ...it, ...(it.badge !== undefined ? { badge: () => (props.values.badges ? it.badge as number : 0) } : {}),
    ...(it.position === "end" ? { onSelect: () => view.set(null) } : {}),
  }))
  const title = (): string => { const it = props.values.items.find((x) => x.id === view()); return it ? String(it.label) : "" }
  return <div class={() => (props.values.orientation === "horizontal" ? "sc-ab-stage is-h" : "sc-ab-stage")}>
    {() => {
      // the indicator, its motion, the tooltips and the color are read once: the bar is drawn again when one changes
      const ind = props.values.indicator, motion = props.values.motion as "glide", showLabels = props.values.showLabels, tooltips = props.values.tooltips && !showLabels, color = (props.values.color || undefined) as ColorToken
      return <ActivityBar value={view} onChange={(v: string | null) => view.set(v)} controls="sc-ab-view"
      indicator={ind} motion={ind ? motion : undefined} tooltips={tooltips} showLabels={showLabels} glass={props.values.glass} subItems={props.values.subItems} subValue={() => sub()} onSubSelect={(c: { id: string }) => sub.set(c.id)} m:color={color}
      orientation={() => props.values.orientation as "vertical"} label="Görünümler" items={items} />
    }}
    <div id="sc-ab-view" class="sc-ab-view" role="tabpanel">
      {() => (view() ? <strong>{title()}</strong> : <span class="m-muted">Yan görünüm kapalı: bir simgeye bas.</span>)}
      <small class="m-muted">{() => MOTIONS[props.values.indicator ? props.values.motion : "off"]}: başka bir simgeye basınca görünür.</small>
    </div>
  </div>
}
