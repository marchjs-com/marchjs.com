// Showcase stage for UndoRedo: a counter with a real undo history (managers/undo). Each "+1" / "×2" is a named step;
// the buttons go back and forth. The line under them writes the tooltips the two buttons carry (step name, shortcut).
// The history starts with two steps, one of them undone, so both buttons have something to do. canUndo / canRedo off
// turn one button off over the history (the props win over it).
import { UndoRedo, Button } from "march/actions";
import { undoHistory } from "march/managers/undo/history";
import { labelWithKey } from "../../demo-util.ts";
import { rotateCcw, rotateCw } from "march/icons";

export const code = `const history = undoHistory()
<UndoRedo history={history} />                              // names the step: "Geri al: +1 (Ctrl+Z)"
<UndoRedo canUndo={$past.length > 0} canRedo={$future.length > 0} onUndo={undo} onRedo={redo} size="sm" />
<UndoRedo history={history} actions={["undo"]} shortcuts={false} icons={{ undo: rotateCcw }} labels={{ undo: "Vazgeç" }} />`

export default function UndoRedoDemo(props: { values: { canUndo: boolean; canRedo: boolean; actions: string; size: string; icons: string; steps: boolean; shortcuts: boolean; disabled: boolean } }) {
  let $n = 1
  const history = undoHistory()
  const step = (label: string, next: number): void => { const prev = $n; history.run(label, () => { $n = next }, () => { $n = prev }) }
  step("+1", 2); step("×2", 4)
  void history.undo()
  const tip = (base: string, name: string | undefined, combo: string): string => {
    const v = props.values
    return labelWithKey(v.steps && name ? `${base}: ${name}` : base, v.shortcuts ? combo : null)
  }
  return <div class="sc-col">
    <div class="sc-row">
      {() => {
        const v = { ...props.values }
        const icons = v.icons === "own" ? { undo: rotateCcw, redo: rotateCw } : undefined
        return <UndoRedo history={history} actions={v.actions === "undo" ? ["undo"] : undefined} size={v.size as "md"} icons={icons}
          steps={v.steps ? undefined : false} shortcuts={v.shortcuts} disabled={v.disabled}
          canUndo={v.canUndo ? undefined : false} canRedo={v.canRedo ? undefined : false} />
      }}
      <Button size="sm" on:click={() => step("+1", $n + 1)}>+1</Button>
      <Button size="sm" on:click={() => step("×2", $n * 2)}>×2</Button>
      <strong>{() => $n}</strong>
    </div>
    <p class="sc-demo-call">{() => `ipuçları: "${tip("Geri al", history.past()[0], "mod+z")}" · "${tip("Yinele", history.future()[0], "mod+shift+z")}"`}</p>
  </div>
}
