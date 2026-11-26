// Showcase stage for PixelFont: the text from the Options panel, and below it the whole Turkish alphabet in both fonts.
import { PixelFont } from "march/components/media/pixel-font";
import type { LedLookValues } from "../../led-look.ts";

export const code = `<PixelFont text="HADİ :heart:" color="amber" />
<PixelFont text="Kapı 3" font="8x8" shape="square" ink="#3ddc84" />`

type V = LedLookValues & { text: string; font: string; spacing: number; pitch: number };

export default function PixelFontDemo(props: { values: V }) {
  return <div class="sc-col">
    {() => {
      const v = props.values
      return <PixelFont text={v.text} font={v.font as "5x7"} spacing={v.spacing} pitch={v.pitch}
        color={v.color as "rgb"} shape={v.shape as "round"} gap={v.gap} bloom={v.bloom || false} ghost={v.ghost} scanlines={v.scanlines} panel={v.panel as "dark"} />
    }}
    <PixelFont text="ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ" pitch={4} color="amber" />
    <PixelFont text="abcçdefgğhıijklmnoöprsştuüvyz 0123456789 ₺" pitch={4} color="green" font="8x8" />
  </div>
}
