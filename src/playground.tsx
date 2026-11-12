// Playground: a live stage + an options panel. The general rule for every showcase option panel:
//   - an option is shown only while it has an effect (`visibleWhen`); the panel sits beside the stage (below it on a
//     phone), so options appearing or going never move the stage;
//   - no drop-down for a few values: choices go through ChoicePicker (2–6 → Segmented, more → chips, `preview` →
//     preview cards, kind "grid" → square tiles, 10+ → Combobox); booleans are switches, numbers sliders.
import { ChoicePicker, Toggle, Slider, Field } from "hadi-march/ui";
import type { PickerKind } from "hadi-march/ui";
import { untrack } from "hadi-march";

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

export function Playground(props: { options: readonly PlayOption[]; label?: string; children?: unknown }) {
  return <div class="sc-play"><div class="sc-play-inner">
    <div class="sc-play-stage">{props.children}</div>
    <div class="sc-play-panel" role="group" aria-label={props.label ?? "Seçenekler"}>
      {props.options.map((o) => () => (o.visibleWhen && !o.visibleWhen() ? null : untrack(() => <div class="sc-play-opt">{control(o)}</div>)))}
    </div>
  </div></div>
}
