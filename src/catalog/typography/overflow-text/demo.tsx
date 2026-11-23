// Showcase stage for OverflowText and Marquee: rows in several scripts (RTL scrolls the other way) and a ticker
// (Playground values in playground.ts).
import { OverflowText, Marquee, type MarqueeTrigger, type MarqueeMode } from "march/typography";
import { Icon, heart } from "march/icons";

export const code = `<OverflowText text={title} play={() => selected()} /> // the selected row keeps scrolling
<OverflowText text={title} />                         // hover + focus, bounces
<OverflowText trigger="visible" mode="loop" text={…} />  // endless ticker while visible
<OverflowText trigger="always" mode="once" speed={60} pause={800} />
<Marquee text="Duyuru · …" separator="✦" />          // trigger=visible, mode=loop
<Marquee text="Duyuru · …" separator={<Icon of={heart} />} />   // own separator; separator={false}: none
<OverflowText text={title} disabled={() => !prefs.motion} />   // never scrolls
<Marquee duplicate separator={false}>{logos}</Marquee>         // endless strip: short content is repeated`

const HINT: Record<string, string> = {
  hover: "Satırın üzerine gelin: sığmayan metin kayar.",
  focus: "Tab ile bir satıra gelin: odaktayken kayar.",
  always: "Sığmayan her metin sürekli kayar.",
  visible: "Ekranda göründükçe kayar.",
}

const SAMPLES = [
  ["TR", ""], // the Playground's text
  ["EN", "Weekly digest: Saturday running club, beach clean-up meetup and the community dinner"],
  ["AR", "ملخص الأسبوع: نادي الجري يوم السبت، لقاء تنظيف الشاطئ وعشاء المجتمع"],
  ["Karışık", "HADİ — مرحبا بكم في المجتمع — welcome to the community"],
  ["Kısa", "Sığan metin kaymaz"],
] as const

export default function OverflowTextDemo(props: { values: { text: string; duplicate: boolean; trigger: string; mode: string; speed: number; disabled: boolean; ticker: boolean; separator: string } }) {
  return <div class="sc-mq-demo">
    {() => { const trigger = props.values.trigger as MarqueeTrigger, mode = props.values.mode as MarqueeMode, speed = props.values.speed, disabled = props.values.disabled; return <div class="sc-mq-list">
      <p class="m-muted">{disabled ? "Kaydırma kapalı: sığmayan metin kırpılmış kalır." : `${HINT[trigger]} İlk satır seçili satır gibi hep kayar (play).`}</p>
      {SAMPLES.map(([lang, text], i) => <button type="button" class="sc-mq-row"><span class="sc-mq-lang">{lang}</span><OverflowText class="sc-mq-text" text={i === 0 ? props.values.text : text} trigger={trigger} mode={mode} speed={speed} disabled={disabled} play={i === 0 ? () => true : undefined} /></button>)}
    </div> }}
    {() => {
      if (!props.values.ticker) return null
      const sep = props.values.separator, speed = props.values.speed, disabled = props.values.disabled
      const mark = sep === "off" ? false : sep === "icon" ? <Icon of={heart} /> : "✦"
      // a short strip: it fits, so it only loops when `duplicate` repeats it to fill the box
      return [<div class="sc-mq-ticker"><Marquee text="Yeni: koyu tema · daha hızlı arama · tam RTL · dört resmi renk" separator={mark} speed={speed} disabled={disabled} /></div>,
        <div class="sc-mq-ticker"><Marquee duplicate={props.values.duplicate} pause={0} separator={mark} speed={speed} disabled={disabled}><span class="sc-row">{["HADİ", "Globex", "Initech", "Umbrella"].map((n) => <strong>{n}</strong>)}</span></Marquee></div>,
        <span class="m-muted">{props.values.duplicate ? "İkinci şerit: dört ad kutuyu doldurana kadar çoğaltılır ve durmadan döner." : "İkinci şerit: içerik sığdığı için kaymaz (duplicate kapalı)."}</span>]
    }}
  </div>
}
