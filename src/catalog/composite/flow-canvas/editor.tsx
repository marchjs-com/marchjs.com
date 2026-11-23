// The live flow editor of the showcase page: controls, palette / JSON, canvas, timeline on one sample order flow.
import { effect, untrack, onCleanup } from "march";
import { Button } from "march/components/actions/button";
import { CopyButton } from "march/components/actions/copy-button";
import { UndoRedo } from "march/components/actions/undo-redo";
import { Tabs } from "march/components/navigation/tabs";
import { Toggle } from "march/components/forms/toggle";
import { undoStack } from "march/managers/undo";
import { JsonEditor } from "march/components/composite/json-editor";
import { FlowCanvas, createFlow, validateFlow, type FlowDoc } from "march/components/composite/flow-canvas";
import { FlowPalette } from "march/components/composite/flow-palette";
import { FlowControls, FlowTimeline, createFlowRunner } from "march/components/composite/flow-controls";
import { sampleTypes, sampleDoc } from "./sample.ts";

/** The live editor of the showcase page: controls, palette / JSON, canvas, timeline. */
export function FlowEditorStage() {
  const flow = createFlow({ types: sampleTypes, doc: sampleDoc() })
  const runner = createFlowRunner(flow)
  const u = undoStack()
  let $loop = false
  // the JSON view edits the document as a value: the parsed JSON, or the raw text while it cannot be parsed
  let $doc: unknown = flow.toJSON()
  let $msg = ""
  // continuous mode: start again a moment after a run ends
  effect(() => {
    const s = runner.state()
    if (!$loop || (s !== "done" && s !== "error")) return
    const id = setTimeout(() => { if (untrack(() => $loop)) void runner.run() }, 1400)
    onCleanup(() => clearTimeout(id))
  })
  // JsonEditor checks the syntax; the flow schema (validateFlow) is its extra check
  const problem = (v: unknown): string | null => validateFlow(v as FlowDoc, sampleTypes)[0] ?? null
  const refresh = () => { $doc = flow.toJSON(); $msg = "" }
  const apply = () => {
    const doc = $doc
    const bad = typeof doc === "string" ? "JSON okunamadı." : problem(doc)
    if (bad) { $msg = bad; return }
    runner.reset()
    flow.load(doc as FlowDoc, "JSON içe aktar")
    flow.view.peek()?.fit()
    $msg = "İçe aktarıldı. Geri almak için Ctrl+Z."
  }
  const panel = (content: unknown) => <div class="sc-flow-aside-body">{content}</div>
  return <div class="sc-flow-editor">
    <div class="sc-flow-top">
      <FlowControls runner={runner} flow={flow} />
      <div class="sc-row">
        <Toggle bind:value={$loop}>Sürekli çalıştır</Toggle>
        <UndoRedo history={u} />
      </div>
    </div>
    <div class="sc-flow-main">
      <aside class="sc-flow-aside">
        <Tabs label="Akış araçları" tabs={[
          { id: "palette", label: "Palet", content: () => panel(<FlowPalette flow={flow} />) },
          { id: "json", label: "JSON", content: () => panel(<div class="sc-flow-stack">
            <JsonEditor bind:value={$doc} rows={14} validate={problem} class="sc-flow-json" aria-label="Akış JSON" labels={{ valid: "Geçerli: march.flow/v1" }} />
            <div class="sc-row">
              <Button size="sm" variant="primary" on:click={apply}>İçe aktar</Button>
              <Button size="sm" variant="secondary" on:click={refresh}>Tuvalden al</Button>
              <CopyButton text={() => JSON.stringify(flow.toJSON(), null, 2)} label="Kopyala" />
            </div>
            <p class="sc-flow-muted" role="status">{() => $msg}</p>
          </div>) },
        ]} />
      </aside>
      <div class="sc-flow-stage sc-flow-stage-lg"><FlowCanvas flow={flow} snap={16} label="HADİ sipariş akışı" /></div>
    </div>
    <FlowTimeline runner={runner} flow={flow} />
  </div>
}
