// Showcase stage for CornerMark: a mark on a photo tile (focusable, so "on hover" also shows with the keyboard) and
// the same mark as a badge on an avatar (always overlapping). Every option of the Playground changes both.
import { CornerMark } from "march/components/media/corner-mark";
import { type Corner } from "march/components/layout/bottom-right-controls";
import { Picture } from "march/components/media/picture";
import { Avatar } from "march/components/social/avatar";
import { appUrl } from "march/base";
import { video, arrowUpRight, plus, play } from "march/icons";

export const code = `<div class="tile">                                   {/* position: relative */}
  <Picture source={photo} fit="cover" />
  <CornerMark icon={video} />                          // top-end, dark glass
</div>
<a class="card m-corner-host" href={p.href}>…<CornerMark icon={arrowUpRight} variant="surface" show="hover" /></a>
<span class="who"><Avatar name="Siz" /><CornerMark corner="bottom-end" icon={plus} variant="solid" m:color="brand-orange" size="sm" ring overlap /></span>`

const ICONS: Record<string, unknown> = { video, arrowUpRight, plus, play }

export default function CornerMarkDemo(props: { values: { corner: string; icon: string; variant: string; color: string; size: string; show: string; ring: boolean; overlap: boolean; label: string } }) {
  return <div class="sc-row">
    {() => {
      const v = { ...props.values }
      const shared = { corner: v.corner as Corner, icon: ICONS[v.icon] ?? video, variant: v.variant as "scrim", show: v.show as "always", label: v.label || undefined }
      return <>
        <div class="sc-pic-box m-corner-host" tabindex="0" role="img" aria-label="Gün batımında tepeler">
          <Picture src={appUrl("media/dusk.jpg")} alt="" fit="cover" />
          <CornerMark m:color={v.color === "none" ? undefined : v.color} {...shared} size={v.size as "md"} overlap={v.overlap} />
        </div>
        <span class="sc-pic-who m-corner-host" tabindex="0">
          <Avatar name="Koşu Kulübü" size="xl" />
          <CornerMark m:color={v.color === "none" ? undefined : v.color} {...shared} size={v.size as "md"} ring={v.ring} overlap />
        </span>
      </>
    }}
  </div>
}
