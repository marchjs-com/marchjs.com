// Showcase stage for LinkCard: three cards in a grid; the first one's title, link, icon, description and end text are
// the Playground's, and the Playground switches every card's lead, tile colour, description, end text and arrow.
import { LinkCard } from "march/components/navigation/link-card";
import { Grid } from "march/components/layout/grid";
import { Avatar } from "march/components/social/avatar";
import { Icon, users, calendar, settings, chevronRight } from "march/icons";

export const code = `<LinkCard href="/members" icon={users} title="Üyeler" description="Ara, davet et, yönet" meta="128" />
<LinkCard href="/events" icon={calendar} color="brand-orange" title="Etkinlikler" arrow={false} />
<LinkCard href="/team" lead={<Avatar name="Koşu Kulübü" />} title="Koşu Kulübü" arrow={<Icon of={chevronRight} />} />`

// the Playground's icon names → their glyphs
const ICONS = { users, calendar, settings } as Record<string, typeof users>

const CARDS = [
  { icon: calendar, tone: "success", title: "Etkinlikler", description: "Bu haftanın buluşmaları ve katılım", meta: "12" },
  { icon: settings, tone: "violet", title: "Ayarlar", description: "Topluluk adı, görünürlük ve bildirimler", meta: "" },
] as const

interface Values { title: string; href: string; icon: string; lead: string; color: string; description: string; meta: string; arrow: string }

export default function LinkCardDemo(props: { values: Values }) {
  return <div>
    {() => {
      const v = { ...props.values }
      const color = (v.color || undefined) as "brand-orange" | undefined
      const arrow = (): boolean | Node => (v.arrow === "off" ? false : v.arrow === "own" ? <Icon of={chevronRight} /> as Node : true)
      const lead = (name: string): unknown => (v.lead === "own" ? <Avatar name={name} size="md" decorative /> : undefined)
      const first = v.title || "Üyeler"
      return <Grid cols={3}>
        <LinkCard href={(v.href || "/data/link-card") as never} icon={v.icon ? ICONS[v.icon] : undefined} tone="primary" color={color} lead={lead(first)}
          title={first} description={v.description || undefined} meta={v.meta || undefined} arrow={arrow()} />
        {CARDS.map((c) => <LinkCard href={"/data/link-card" as never} icon={v.icon ? c.icon : undefined} tone={c.tone} color={color} lead={lead(c.title)}
          title={c.title} description={v.description ? c.description : undefined} meta={v.meta && c.meta ? c.meta : undefined} arrow={arrow()} />)}
      </Grid>
    }}
  </div>
}
