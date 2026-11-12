// Playground: a live stage + an options panel. The general rule for every showcase option panel:
//   - an option is shown only while it has an effect (`visibleWhen`); the panel sits beside the stage (below it on a
//     phone), so options appearing or going never move the stage;
//   - no drop-down for a few values: choices go through ChoicePicker (2–6 → Segmented, more → chips, `preview` →
//     preview cards, kind "grid" → square tiles, 10+ → Combobox); booleans are switches, numbers sliders.
import type { PickerKind } from "hadi-march/ui";
import { ChoicePicker, Toggle, Slider, Field, Button } from "hadi-march/ui";
import { untrack, effect, If } from "hadi-march";
import { refresh } from "hadi-march/icons";
import { Demo } from "./demo.tsx";

export interface PlayOption {
  /** Shown label (Turkish in the showcase). */
  label: string;
  get: () => unknown;
  set: (v: never) => void;
  /** Choices: [value] or [{ value, label, preview?: () => node }]. Omit for a switch (boolean) or give min/max (slider). */
  options?: readonly unknown[] | (() => readonly unknown[]);
  /** Force a picker look ("grid" for swatch-like choices); default: the ChoicePicker rule. */
  kind?: PickerKind;
  min?: number;
  max?: number;
  step?: number;
  /** Shown after the number in a slider's label ("px", "%"). */
  unit?: string;
  /** The option is drawn only while this is true (it has no effect otherwise). */
  visibleWhen?: () => boolean;
}

function control(o: PlayOption): unknown {
  const set = o.set as (v: unknown) => void;
  if (o.options) return <Field label={o.label}><ChoicePicker value={o.get()} onChange={set} options={o.options} kind={o.kind} /></Field>
  if (o.min != null && o.max != null) return <Field label={`${o.label}: ${String(o.get())}${o.unit ?? ""}`}><Slider value={o.get() as number} onChange={set} min={o.min} max={o.max} step={o.step ?? 1} /></Field>
  return <Toggle value={!!o.get()} onChange={set} label={o.label} />
}

/**
 * An option row, drawn while the option has an effect. If redraws only when the visibility flips: a value change (a
 * slider being dragged) never rebuilds the row, so the input stays the same DOM node and keeps focus and pointer capture.
 */
const shown = (visibleWhen: (() => boolean) | undefined, draw: () => unknown): unknown =>
  visibleWhen ? If({ when: visibleWhen, children: () => <div class="sc-play-opt">{draw()}</div> }) : untrack(() => <div class="sc-play-opt">{draw()}</div>)

export function Playground(props: { options: readonly PlayOption[]; label?: string; children?: unknown }) {
  return <div class="sc-play"><div class="sc-play-inner">
    <div class="sc-play-stage">{props.children}</div>
    <div class="sc-play-panel" role="group" aria-label={props.label ?? "Seçenekler"}>
      {props.options.map((o) => shown(o.visibleWhen, () => control(o)))}
    </div>
  </div></div>
}

// Motion pages (Hareket › SVG, Morph, Sayfa geçişi efektleri): one block per animation = Demo (preview + Code tab)
// holding a Playground (stage + options), a replay button and the live call line. Changing an option replays.
export interface MotionDemoProps {
  title: string;
  desc: string;
  code: string;
  options: readonly PlayOption[];
  /** The call the current options make (shown under the stage). */
  call: () => string;
  /** Plays the animation; runs again whenever an option changes (it reads them). */
  play?: () => void;
  wide?: boolean;
  children?: unknown;
}

export function MotionDemo(props: MotionDemoProps) {
  // first run after mount (refs are set), then on every option change
  if (props.play) effect(() => { for (const o of props.options) o.get(); queueMicrotask(() => untrack(() => props.play!())) })
  return <Demo wide={props.wide} title={props.title} desc={props.desc} code={props.code}>
    <Playground options={props.options}>
      <div class="sc-mo-stage">{props.children}</div>
      <div class="sc-mo-foot">
        <code class="sc-mo-call">{props.call}</code>
        {props.play ? <Button size="sm" variant="ghost" icon={refresh} on:click={() => props.play!()}>Tekrar oynat</Button> : null}
      </div>
    </Playground>
  </Demo>
}

/** A Playground option over a getter / setter pair. */
export function opt<T>(label: string, get: () => T, set: (v: T) => void, more: Omit<PlayOption, "label" | "get" | "set"> = {}): PlayOption {
  return { label, get, set: set as (v: never) => void, ...more }
}

/** Easing choices shared by the motion pages. */
export const EASES = [
  { value: "in-out", label: "yumuşak" },
  { value: "spring", label: "yay" },
  { value: "back", label: "geri" },
  { value: "bounce", label: "sekme" },
  { value: "linear", label: "doğrusal" },
] as const
