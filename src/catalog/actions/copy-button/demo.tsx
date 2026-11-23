// Showcase stage for CopyButton: what is copied, text or icon-only, the icons, the "copied" text and its colour follow the Playground values.
// What shows only after a copy (text, colour) is also said in a line next to the button, so a choice is seen at once.
import { CopyButton } from "march/components/actions/copy-button";
import type { ColorToken } from "march/theme";
import { link, heart } from "march/icons";

export const code = `<CopyButton text="npm i github:marchjs-com/march" />
<CopyButton text={() => token} iconOnly label="Anahtarı kopyala" />
<CopyButton text={url} icon={link} copiedIcon={heart} copiedLabel="Panoda!" copiedColor="brand-blue" />`

const COLORS: Record<string, string> = { "": "yeşil", "brand-blue": "mavi", "brand-orange": "turuncu", "brand-purple": "mor" }

export default function CopyButtonDemo(props: { values: { text: string; iconOnly: boolean; icon: string; copiedIcon: string; copiedLabel: string; copiedColor: string } }) {
  let $copies = 0
  const after = (): string => {
    const v = props.values, parts: string[] = []
    if (!v.iconOnly) parts.push(`“${v.copiedLabel || "Kopyalandı"}” yazar`)
    if (v.iconOnly || v.icon) parts.push(v.copiedIcon === "off" ? "ikon değişmez" : `ikon ${v.copiedIcon === "heart" ? "kalp" : "tik"} olur`)
    parts.push(`renk ${COLORS[v.copiedColor] ?? "yeşil"} olur`)
    return `Kopyalayınca: ${parts.join(", ")}`
  }
  return <div class="sc-row">
    <code>{() => props.values.text}</code>
    {() => {
      // CopyButton reads its props once: every choice builds the button again (the copy count lives here)
      const v = { ...props.values }
      const button = (<CopyButton text={v.text} iconOnly={v.iconOnly} label="Komutu kopyala" onCopy={() => { $copies++ }}
        icon={v.icon ? link : undefined} copiedIcon={v.copiedIcon === "off" ? false : v.copiedIcon === "heart" ? heart : undefined}
        copiedLabel={v.copiedLabel || undefined} copiedColor={(v.copiedColor || undefined) as never} />) as Element
      button.setAttribute("data-audit-try", "")
      return button
    }}
    <span class="sc-strip-label">{after}</span>
    <span class="m-muted">{() => ($copies ? `${$copies} kez kopyalandı` : "")}</span>
  </div>
}
