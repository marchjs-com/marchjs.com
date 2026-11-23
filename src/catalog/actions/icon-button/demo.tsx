// Showcase stage for IconButton: the second button's label and icon, size, variant, shape, pressed, the look on a dark ground and colour follow the Playground values (playground.ts).
import { IconButton } from "march/components/actions/icon-button";
import type { ColorToken } from "march/theme";
import { heart, star, bell, trash, globe } from "march/icons";

// the Playground's icon names → their glyphs
const ICONS = { heart, star, bell, trash, globe } as Record<string, typeof heart>;

export const code = `<IconButton icon={heart} label="Beğen" pressed={$liked} on:click={like} />   // toggle: aria-pressed + pressed look
<IconButton icon={trash} label="Sil" variant="danger" size="sm" />   // label is required (aria-label + title)
<IconButton icon={star} label="Yıldızla" m:color="brand-orange" title={false} />   // colour token; no native tooltip
<IconButton icon={send} label="Gönder" variant="solid" shape="round" />          // filled circle; "raised": floating
<IconButton icon={x} label="Kapat" inverse />                                    // on a photo / video
<IconButton icon={globe} label="Site" href="https://example.com" />              // a link`

export default function IconButtonDemo(props: { values: { label: string; icon: string; size: string; variant: string; shape: string; pressed: boolean; inverse: boolean; color: string } }) {
  let $liked = false
  return <div class="sc-row">
    {() => {
      const v = props.values, size = v.size as "md", color = (v.color || undefined) as ColorToken | undefined
      const variant = v.variant || undefined, shape = v.shape === "round" ? "round" as const : undefined
      const pressed = v.pressed ? true : undefined
      return <div class={v.inverse ? "sc-row sc-on-dark" : "sc-row"}>
        <IconButton icon={heart} label={() => ($liked ? "Beğenmekten vazgeç" : "Beğen")} size={size} variant={variant} shape={shape} inverse={v.inverse} m:color={color}
          pressed={() => $liked || v.pressed} on:click={() => { $liked = !$liked }} />
        <IconButton icon={ICONS[v.icon] ?? star} label={v.label || "Yıldızla"} size={size} variant={variant} shape={shape} inverse={v.inverse} m:color={color} pressed={pressed} />
        <IconButton icon={bell} label="Bildirimler" size={size} variant={variant} shape={shape} inverse={v.inverse} m:color={color} pressed={pressed} />
        <IconButton icon={globe} label="Site (bağlantı)" href="https://example.com" target="_blank" rel="noopener" size={size} variant={variant} shape={shape} inverse={v.inverse} m:color={color} />
        <IconButton icon={trash} label="Sil" size={size} variant={variant ?? "danger"} shape={shape} inverse={v.inverse} />
      </div>
    }}
    <span class="m-muted">{() => ($liked ? "Beğenildi" : "")}</span>
  </div>
}
