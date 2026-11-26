// Showcase stage for LedBoard: an event entrance sign. "Karşılama" greets with text, looking eyes and a heart;
// "Maç skoru" shows a score whose digits roll when a goal is scored (the buttons) and a ticker; "Saat" a live clock and a
// countdown; "Gözler" a face. Every option drives the board live.
import { LedBoard } from "march/led";
import { Button } from "march/components/actions/button";
import type { LedLookValues } from "../../led-look.ts";

export const code = `<LedBoard text="HADİ'ye hoş geldin :heart:" color="amber" />
<LedBoard transition="rain" scenes={[
  { text: "HADİ" }, { eye: "look-left" }, { eye: "look-right", mouth: "smile" }, { emoji: "heart" },
  { score: () => $score, teams: ["EV", "DEP"] }, { clock: true },
]} />`

type V = LedLookValues & { preset: string; text: string; direction: string; speed: number; effect: string; transition: string; font: string; scale: string; cols: number; rows: number };

export default function LedBoardDemo(props: { values: V }) {
  let $score: [number, number] = [2, 1]
  const nextHour = () => { const d = new Date(); d.setMinutes(60, 0, 0); return d }
  const scenes = () => {
    const v = props.values
    switch (v.preset) {
      case "match": return [{ score: () => $score, teams: ["EV", "DEP"] as [string, string], duration: 6000 }, { ticker: ["Devre arası 15 dk", "Bir sonraki maç Cumartesi 19:00", "İyi seyirler :star:"] }]
      case "clock": return [{ clock: true as const, duration: 6000 }, { countdown: nextHour(), done: "BAŞLADI", duration: 6000 }]
      case "eyes": return [{ eye: "open" as const, duration: 2600 }, { eye: "look-left" as const, duration: 1400 }, { eye: "look-right" as const, duration: 1400 }, { eye: "happy" as const, mouth: "smile" as const }, { eye: "love" as const }]
      case "text": return [{ text: v.text }]
      default: return [{ text: v.text }, { eye: "look-left" as const, duration: 1600 }, { eye: "look-right" as const, mouth: "smile" as const, duration: 2000 }, { emoji: "heart" }, { text: "Kapı 3 :arrow-right:" }]
    }
  }
  return <div class="sc-col" sx={{ w: "full" }}>
    {() => props.values.preset === "match"
      ? <div class="sc-row">
          <Button size="sm" on:click={() => { $score = [$score[0] + 1, $score[1]] }}>Gol: EV</Button>
          <Button size="sm" variant="secondary" on:click={() => { $score = [$score[0], $score[1] + 1] }}>Gol: DEP</Button>
        </div>
      : null}
    {() => {
      const v = props.values
      return <LedBoard scenes={scenes()} cols={v.cols} rows={v.rows} direction={v.direction as "left"} speed={() => props.values.speed}
        effect={v.effect as "none"} transition={v.transition as "wipe"} font={v.font as "5x7"} scale={v.scale === "auto" ? "auto" : Number(v.scale)}
        label="Etkinlik girişi tabelası"
        color={v.color as "rgb"} shape={v.shape as "round"} gap={v.gap} bloom={v.bloom || false} ghost={v.ghost} scanlines={v.scanlines} panel={v.panel as "dark"} />
    }}
  </div>
}
