// Showcase stage for AudioReactive: a call with two people. It starts on a number (the Değer slider: a number is a
// source too, no permission, at once), so every option shows; "ritim" pulses twice a second; "demo ses" plays the
// synthesized loop after "Ada konuşsun" (silent). Ada's avatar takes every option (effect, color, gain, intensity,
// smoothing, motion). The note shows the readings onLevel reports.
import { AudioReactive, type AudioEffect } from "march/components/media/audio-reactive";
import { Avatar } from "march/components/social/avatar";
import { Button } from "march/components/actions/button";
import { audioSource } from "march/audio";
import { onCleanup } from "march";
import type { ColorToken } from "march/theme";
import { beat } from "./playground.ts";

export const code = `const voice = audioSource("demo")
<Button on:click={() => voice.start()}>Ada konuşsun</Button>
<AudioReactive source={voice} effect="ring" color="brand-green">
  <Avatar name="Ada Yılmaz" size="xl" />
</AudioReactive>
<AudioReactive source={voice} as="span" effect={["pulse", "glow"]}>🎵</AudioReactive>`

type V = { input: string; value: number; effect: string; color: string; gain: number; intensity: number; smoothing: number; motion: boolean }

export default function AudioReactiveDemo(props: { values: V }) {
  const voice = audioSource("demo")
  onCleanup(() => voice.stop())
  let $level = 0
  return <div class="sc-col">
    <div class="sc-row">
      <Button size="sm" on:click={() => voice.start()}>▶ Ada konuşsun</Button>
      <Button size="sm" variant="ghost" on:click={() => voice.stop()}>⏹ Sustur</Button>
      <span sx={{ text: "sm", color: "muted" }}>Düzey: {() => $level}%</span>
    </div>
    {() => {
      const v = props.values
      const source = v.input === "demo" ? voice : v.input === "beat" ? beat : v.value / 100
      const effect = (v.effect === "ring+glow" ? ["ring", "glow"] : v.effect) as AudioEffect | AudioEffect[]
      return <div class="sc-row" sx={{ gap: 6 }}>
        <AudioReactive source={source} effect={effect} color={(v.color || undefined) as ColorToken | undefined} gain={v.gain}
          intensity={v.intensity} smoothing={v.smoothing} motion={v.motion} onLevel={(l) => { $level = Math.round(l.level * 100) }}>
          <Avatar name="Ada Yılmaz" size="xl" />
        </AudioReactive>
        <AudioReactive source={source} as="span" effect={["bounce", "pulse"]} gain={v.gain} motion={v.motion} sx={{ text: "2xl" }}>🎵</AudioReactive>
      </div>
    }}
  </div>
}
