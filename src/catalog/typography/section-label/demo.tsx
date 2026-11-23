// Showcase stage for SectionLabel: two groups of a small panel, their labels follow the Playground values (the first
// one's text is the "Metin" option).
import { SectionLabel } from "march/typography";
import { IconButton } from "march/actions";
import { star, clock, plus } from "march/icons";

export const code = `<SectionLabel icon={star} count={3}
  actions={<IconButton size="sm" icon={plus} label="Ekle" />}>Sık kullanılanlar</SectionLabel>
<SectionLabel as="h3" upper={false} rule>Son açılanlar</SectionLabel>`

interface Values { label: string; icon: string; count: boolean; actions: boolean; upper: boolean; rule: boolean; size: string; color: string }

// the Playground's icon names → their glyphs
const ICONS = { star, clock } as Record<string, typeof star>

export default function SectionLabelDemo(props: { values: Values }) {
  return <div class="sc-a6-panel sc-a6-pad">
    {() => {
      const v = { ...props.values }
      const color = (v.color || undefined) as "primary" | undefined
      const icon = ICONS[v.icon]
      const add = v.actions ? <IconButton size="sm" icon={plus} label="Ekle" /> : undefined
      return <>
        <SectionLabel label={v.label || "Sık kullanılanlar"} icon={icon} count={v.count ? 3 : undefined} actions={add} upper={v.upper} rule={v.rule} size={v.size as "sm"} m:color={color} />
        <ul class="sc-a6-list"><li>Gösterge paneli</li><li>Üyeler</li><li>Etkinlikler</li></ul>
        <SectionLabel icon={icon ? clock : undefined} count={v.count ? 2 : undefined} upper={v.upper} rule={v.rule} size={v.size as "sm"} m:color={color}>Son açılanlar</SectionLabel>
        <ul class="sc-a6-list"><li>Ayarlar</li><li>Raporlar</li></ul>
      </>
    }}
  </div>
}
