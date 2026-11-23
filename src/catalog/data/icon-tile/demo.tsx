// Showcase stage for IconTile: every tone side by side (the first takes the Playground icon and tone); a colour token from the Playground paints them all.
import { IconTile, type IconTone } from "march/data";
import { users, bell, check, star, trash, calendar, heart, home, settings } from "march/icons";

export const code = `<IconTile icon={users} tone="primary" />
<IconTile icon={bell} m:color="brand-orange" variant="solid" shape="round" size="lg" />
<IconTile icon={check} tone="success" label="Tamamlandı" />   // with a label it is an image, not decoration`

// the Playground's icon names → their glyphs
const ICONS: Record<string, unknown> = { users, bell, star, heart, home }
const TILES: readonly [IconTone, unknown][] = [["primary", users], ["neutral", settings], ["success", check], ["warn", star], ["danger", trash], ["info", bell], ["violet", calendar], ["pink", heart], ["teal", home]]

export default function IconTileDemo(props: { values: { icon: string; tone: string; label: string; size: string; variant: string; shape: string; color: string } }) {
  return <div class="sc-row">
    {() => {
      const v = { ...props.values }
      const color = v.color === "tones" ? undefined : v.color as "brand-orange"
      return TILES.map(([tone, icon], i) => <IconTile icon={i === 0 ? ICONS[v.icon] ?? icon : icon} tone={i === 0 ? (v.tone || tone) as IconTone : tone} label={i === 0 ? v.label || undefined : undefined} m:color={color} size={v.size as "md"} variant={v.variant as "soft"} shape={v.shape as "square"} />)
    }}
  </div>
}
