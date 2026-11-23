// Showcase stage for LikeButton: one heart with the Playground options, plus heartBurst on a plain tile.
import { computed, effect, untrack } from "march";
import { LikeButton, heartBurst, heartPop } from "march/social";
import type { ColorToken } from "march/theme";
import { Icon, star, sparkles } from "march/icons";

export const code = `<LikeButton liked={$liked} count={$likes}
  onToggle={(on) => { $liked = on; $likes += on ? 1 : -1 }} />
heartBurst(photoEl)   // the same burst anywhere (double-tap on a photo)`

type Values = { liked: boolean; size: string; burst: boolean; colors: string; color: string; count: boolean; icon: string; pop: boolean; ring: boolean }

export default function LikeButtonDemo(props: { values: Values }) {
  let $liked = props.values.liked
  let $likes = 128
  let tile!: HTMLElement, mark!: HTMLElement
  const play = (): void => { if (props.values.pop) heartPop(mark, true); if (props.values.burst) heartBurst(tile, { radius: 46, count: 14, colors: props.values.colors as "brand", ring: props.values.ring }) }
  // the pop and the burst show only on a tap: a new choice plays them once on the tile, so it is seen at once
  const motion = computed(() => `${props.values.pop} ${props.values.burst} ${props.values.ring} ${props.values.colors}`), iconOf = computed(() => props.values.icon)
  let played = false
  effect(() => {
    motion()
    if (played) untrack(play)
    played = true
  })
  return <div class="sc-row sc-social-like" data-m-color={props.values.color}>
    {() => {
      // the icon is read once by the button: a new icon choice builds it again (the other props stay live)
      const icon = iconOf()
      const button = (<LikeButton liked={() => $liked} count={() => (props.values.count ? $likes : 0)} size={props.values.size as "md"}
        burst={props.values.burst} colors={props.values.colors as "brand"} m:color={props.values.color as ColorToken}
        icon={icon === "star" ? <Icon of={star} /> as Node : icon === "swap" ? (on: boolean) => <Icon of={on ? star : sparkles} /> : undefined}
        pop={props.values.pop} burstOptions={{ ring: props.values.ring }}
        onToggle={(on) => { $liked = on; $likes = $likes + (on ? 1 : -1) }} />) as Element
      button.setAttribute("data-audit-try", "toggle")
      return button
    }}
    <button type="button" class="sc-social-burst-tile" ref={(x: Element) => { tile = x as HTMLElement }} onClick={play}>
      <span class="sc-social-burst-mark" aria-hidden="true" ref={(x: Element) => { mark = x as HTMLElement }}>♥</span>
      <code>heartBurst()</code>
    </button>
    <span class="sc-strip-label">{() => `Dokununca: ${[props.values.pop ? "zıplar" : "zıplamaz", props.values.burst ? `patlar (${props.values.ring ? "halkalı" : "halkasız"}, ${props.values.colors === "single" ? "kalp renginde" : "dört HADİ renginde"})` : "patlamaz"].join(", ")}`}</span>
  </div>
}
