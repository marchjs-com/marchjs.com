// API examples of march/flow: the node editor (FlowCanvas, Minimap, FlowPalette), running a flow (createFlowRunner,
// FlowControls, FlowTimeline) and the model helpers (createFlow, validateFlow, layout and geometry). One small order
// flow serves every example; the flows here keep their changes out of the app's undo history (undo: false).
// Layout and rules: tools/api-examples.js.
import "./flow.css";
import { signal, computed, effect, onCleanup, Await } from "march";
import { Button, Segmented } from "march/ui";
// the model and the runner are small and load with this part; the editor components (FlowCanvas …) load on demand
import {
  createFlow, boundsOf, edgePath, emit, emitted, endOf, FLOW_SCHEMA, layeredLayout, NODE_HEAD, NODE_W, PORT_ROW, portPoint, portsOf,
  validateFlow, type FlowDoc, type FlowNodeType, type FlowRunContext,
} from "march/components/composite/flow-canvas/model.ts";
import { createFlowRunner } from "march/components/composite/flow-controls/runner.ts";
import { examples } from "./types.ts";
import { Out, Log, Row } from "./_kit.tsx";
export { default as SIG } from "./flow.sig.gen.ts";

const TYPES: readonly FlowNodeType[] = [
  { type: "order", label: "Sipariş geldi", category: "Tetikleyici", color: "brand-orange", outputs: [{ id: "out" }],
    fields: [{ key: "total", label: "Tutar (₺)", kind: "number", default: 240, min: 0 }], run: ({ data }) => Number(data["total"] ?? 240) },
  { type: "check", label: "Tutar > 200?", category: "Mantık", color: "brand-blue", inputs: [{ id: "in" }], outputs: [{ id: "yes", label: "evet" }, { id: "no", label: "hayır" }],
    run: ({ input }) => emit(Number(input) > 200 ? { yes: input } : { no: input }) },
  { type: "mail", label: "Teşekkür e-postası", category: "Eylem", color: "brand-green", inputs: [{ id: "in" }], run: ({ input }) => `e-posta (${String(input)} ₺)` },
  { type: "note", label: "Kayda yaz", category: "Eylem", color: "brand-purple", inputs: [{ id: "in" }], run: ({ input }) => `kayıt (${String(input)} ₺)` },
]
const doc = (): FlowDoc => ({
  schema: FLOW_SCHEMA, name: "HADİ siparişleri",
  nodes: [{ id: "order", type: "order", x: 0, y: 48 }, { id: "check", type: "check", x: 320, y: 48 }, { id: "mail", type: "mail", x: 640, y: 0 }, { id: "note", type: "note", x: 640, y: 176 }],
  edges: [{ id: "e1", from: "order.out", to: "check.in" }, { id: "e2", from: "check.yes", to: "mail.in" }, { id: "e3", from: "check.no", to: "note.in" }],
})
const newFlow = (d: FlowDoc = doc()) => createFlow({ types: TYPES, doc: d, undo: false })
const flowLib = () => import("march/flow")
/** Renders `children(module)` once march/flow has loaded. */
function Load<M>(p: { from: () => Promise<M>; children: (m: M) => unknown }) {
  return <Await for={p.from} loading={<p class="m-muted">Yükleniyor…</p>}>{p.children}</Await>
}
const Stack = (p: { children?: unknown }) => <div class="sc-ex-flow-stack">{p.children}</div>
const json = (v: unknown) => JSON.stringify(v)
const pt = (p: { x: number; y: number } | null) => (p ? `${Math.round(p.x)}, ${Math.round(p.y)}` : "null")

export default examples({
  "march/flow": {
    boundsOf: {
      code: `boundsOf(flow)                    // { x, y, w, h } of every node
boundsOf(flow, flow.selection())  // only the selected ones`,
      run: () => {
        const flow = newFlow()
        return <Stack>
          <Row><Button onClick={() => flow.moveBy(["note"], 0, 48)}>“Kayda yaz” aşağı</Button><Button onClick={() => flow.moveBy(["order"], -48, 0)}>“Sipariş” sola</Button></Row>
          <Out label="boundsOf(flow)" value={() => json(boundsOf(flow))} />
          <Out label="mail + note" value={() => json(boundsOf(flow, ["mail", "note"]))} />
        </Stack>
      },
    },
    createFlow: {
      code: `const flow = createFlow({ types, doc })
const id = flow.addNode("mail", 640, 320)
flow.connect("check.no", id + ".in")
save(flow.toJSON())`,
      run: () => {
        const flow = newFlow()
        const dump = signal("")
        const add = () => { const id = flow.addNode("mail", 640, 96 + flow.nodes.peek().length * 40); flow.connect("check.no", `${id}.in`) }
        return <Stack>
          <Row><Button variant="primary" onClick={add}>addNode + connect</Button><Button onClick={() => dump.set(JSON.stringify(flow.toJSON(), null, 1))}>toJSON()</Button>
            <Out label="düğüm" value={() => flow.nodes().length} /><Out label="kenar" value={() => flow.edges().length} /></Row>
          {() => (dump() ? <pre class="sc-ex-flow-pre">{dump()}</pre> : null)}
        </Stack>
      },
    },
    createFlowRunner: {
      code: `const runner = createFlowRunner(flow, { nodeMs: 400 })
await runner.run()   // "done" | "error"; runner.state(), runner.timeline()`,
      run: () => {
        const flow = newFlow(), runner = createFlowRunner(flow, { nodeMs: 300, travelMs: 260 })
        onCleanup(() => runner.reset())
        const result = signal("—")
        return <Load from={flowLib}>{({ flowStatusText }) => <Stack>
          <Row><Button variant="primary" onClick={async () => result.set(await runner.run())}>run()</Button><Button onClick={() => runner.step()}>step()</Button><Button variant="ghost" onClick={() => runner.reset()}>reset()</Button></Row>
          <Row><Out label="state" value={runner.state} /><Out label="sonuç" value={result} /><Out label="süre" value={() => `${(runner.elapsed() / 1000).toFixed(2)} s`} /></Row>
          <ul class="sc-ex-flow-list">{() => flow.nodes().map((n) => <li>{n.id}: {() => flowStatusText(flow.status().get(n.id) ?? "idle")}</li>)}</ul>
        </Stack>}</Load>
      },
    },
    edgePath: {
      code: `const d = edgePath(portPoint(flow, "check.yes", "out"), portPoint(flow, "mail.in", "in"))
<path d={d} />`,
      run: () => {
        const bx = signal(300)
        const NS = "http://www.w3.org/2000/svg"
        const svg = document.createElementNS(NS, "svg"), path = document.createElementNS(NS, "path")
        svg.setAttribute("viewBox", "0 0 400 120"); svg.setAttribute("class", "sc-ex-flow-svg"); svg.setAttribute("aria-hidden", "true")
        const dots = [0, 1].map(() => { const c = document.createElementNS(NS, "circle"); c.setAttribute("r", "6"); return c })
        svg.append(path, ...dots)
        const d = computed(() => edgePath({ x: 60, y: 30 }, { x: bx(), y: 90 }))
        effect(() => { path.setAttribute("d", d()); dots[0]!.setAttribute("cx", "60"); dots[0]!.setAttribute("cy", "30"); dots[1]!.setAttribute("cx", String(bx())); dots[1]!.setAttribute("cy", "90") })
        return <Stack>
          <Segmented value={bx} options={[{ value: 300, label: "ileri" }, { value: 140, label: "yakın" }, { value: 30, label: "geri dönüş" }]} aria-label="Hedef nokta" />
          {svg}
          <Out label="d" value={d} />
        </Stack>
      },
    },
    emit: {
      code: `run: ({ input }) => emit(input > 200 ? { yes: input } : { no: input })   // only that port fires`,
      run: () => {
        const total = signal(240)
        const out = computed(() => emitted(TYPES[1]!.run!({ input: total(), inputs: { in: total() }, data: {}, node: { id: "check", type: "check", x: 0, y: 0 }, signal: new AbortController().signal } as FlowRunContext)))
        return <Stack>
          <Segmented value={total} options={[90, 180, 240, 500].map((v) => ({ value: v, label: `${v} ₺` }))} aria-label="Tutar" />
          <Row><Out label="çalışan çıkış" value={() => Object.keys(out() ?? {}).join(", ")} /><Out label="değer" value={() => json(out())} /></Row>
        </Stack>
      },
    },
    emitted: {
      code: `emitted(emit({ no: 90 }))   // { no: 90 }
emitted(90)                 // null: a plain value goes to every output`,
      run: () => <Stack>{([["emit({ no: 90 })", emit({ no: 90 })], ["emit({ yes: 1, no: 2 })", emit({ yes: 1, no: 2 })], ["90", 90], ["{ yes: 1 }", { yes: 1 }]] as [string, unknown][]).map(([k, v]) =>
        <Out label={`emitted(${k})`} value={json(emitted(v))} />)}</Stack>,
    },
    endOf: {
      code: `endOf("check.yes")        // ["check", "yes"]
endOf("api.v2.out")       // ["api.v2", "out"] — the port is after the last dot`,
      run: () => {
        const ref = signal("check.yes")
        return <Stack>
          <Segmented value={ref} options={["check.yes", "api.v2.out", "order"].map((v) => ({ value: v, label: v }))} aria-label="Uç" />
          <Out label="endOf" value={() => json(endOf(ref()))} />
        </Stack>
      },
    },
    FLOW_NODE: {
      code: `const portY = (i: number) => FLOW_NODE.head + i * FLOW_NODE.row + FLOW_NODE.row / 2`,
      run: () => <Load from={flowLib}>{({ FLOW_NODE }) => <Stack><Out label="FLOW_NODE" value={json(FLOW_NODE)} />
        {[0, 1, 2].map((i) => <Out label={`${i + 1}. port y`} value={FLOW_NODE.head + i * FLOW_NODE.row + FLOW_NODE.row / 2} />)}</Stack>}</Load>,
    },
    FLOW_SCHEMA: {
      code: `const saved = { schema: FLOW_SCHEMA, nodes, edges }   // "march.flow/v1"`,
      run: () => {
        const wrong = signal(false)
        return <Stack>
          <Out label="FLOW_SCHEMA" value={FLOW_SCHEMA} />
          <Row><Button onClick={() => wrong.update((w) => !w)}>{() => (wrong() ? "Doğru şemayı yaz" : "Eski şemayı dene")}</Button>
            <Out label="validateFlow" value={() => validateFlow({ ...doc(), schema: wrong() ? "march.flow/v0" : FLOW_SCHEMA }).join(" ") || "geçerli"} /></Row>
        </Stack>
      },
    },
    FlowCanvas: {
      code: `const flow = createFlow({ types, doc })
<FlowCanvas flow={flow} tool="pan" minimap={false} label="Sipariş akışı" />`,
      play: { options: [
        { key: "tool", label: "Araç", default: "select", options: [{ value: "select", label: "Seçim" }, { value: "pan", label: "Kaydırma" }] },
        { key: "fields", label: "Alanlar", default: true },
      ] },
      run: (p: { values: { tool: "select" | "pan"; fields: boolean } }) => {
        const flow = newFlow()
        return <Load from={flowLib}>{({ FlowCanvas }) => <Stack>
          <div class="sc-ex-flow-stage"><FlowCanvas flow={flow} tool={() => p.values.tool} fields={() => p.values.fields} minimap={false} label="HADİ sipariş akışı" /></div>
          <Row><Out label="seçili" value={() => [...flow.selection()].join(", ") || "—"} /><Out label="tutar" value={() => String(flow.node("order")?.data()["total"] ?? "—")} /></Row>
        </Stack>}</Load>
      },
    },
    FlowControls: {
      code: `const runner = createFlowRunner(flow)
<FlowControls runner={runner} flow={flow} speeds={[0.5, 1, 3]} timeline />`,
      play: { options: [
        { key: "timeline", label: "Zaman çizelgesi", default: false },
        { key: "speeds", label: "Hızlar", default: "std", options: [{ value: "std", label: "0,5–4×" }, { value: "slow", label: "0,25–1×" }] },
      ] },
      run: (p: { values: { timeline: boolean; speeds: string } }) => {
        const flow = newFlow(), runner = createFlowRunner(flow)
        onCleanup(() => runner.reset())
        return <Load from={flowLib}>{({ FlowCanvas, FlowControls }) => <Stack>
          <div class="sc-ex-flow-stage"><FlowCanvas flow={flow} minimap={false} fields={false} label="HADİ sipariş akışı" /></div>
          {() => <FlowControls runner={runner} flow={flow} timeline={() => p.values.timeline} speeds={p.values.speeds === "slow" ? [0.25, 0.5, 1] : [0.5, 1, 2, 4]} />}
        </Stack>}</Load>
      },
    },
    FlowPalette: {
      code: `<FlowPalette flow={flow} types={actions} search={false} onAdd={(id) => flow.view()?.focusNode(id)} />`,
      play: { options: [
        { key: "search", label: "Arama", default: true },
        { key: "only", label: "Türler", default: "all", options: [{ value: "all", label: "Hepsi" }, { value: "act", label: "Yalnız eylemler" }] },
      ] },
      run: (p: { values: { search: boolean; only: string } }) => {
        const flow = newFlow()
        const lines = signal<string[]>([])
        return <Load from={flowLib}>{({ FlowCanvas, FlowPalette }) => <Stack>
          <div class="sc-ex-flow-split">
            {() => <FlowPalette flow={flow} search={p.values.search} types={p.values.only === "act" ? TYPES.filter((t) => t.category === "Eylem") : TYPES}
              onAdd={(id, ty) => lines.update((l) => [...l, `${String(ty.label)} eklendi (${id})`].slice(-4))} />}
            <div class="sc-ex-flow-stage"><FlowCanvas flow={flow} minimap={false} fields={false} label="HADİ sipariş akışı" /></div>
          </div>
          <Log lines={lines} />
        </Stack>}</Load>
      },
    },
    flowStatusText: {
      code: `<Chip>{flowStatusText(status)}</Chip>   // "running" → the UI language's word`,
      run: () => <Load from={flowLib}>{({ flowStatusText }) => <Stack>{(["queued", "running", "done", "error", "skipped", "idle"] as const).map((s) => <Out label={s} value={flowStatusText(s)} />)}</Stack>}</Load>,
    },
    FlowTimeline: {
      code: `<FlowTimeline runner={runner} flow={flow} />   // one bar per node that ran`,
      play: { options: [{ key: "speed", label: "Hız", default: 2, options: [{ value: 1, label: "1×" }, { value: 2, label: "2×" }, { value: 4, label: "4×" }] }] },
      run: (p: { values: { speed: number } }) => {
        const total = signal(240)
        const flow = newFlow(), runner = createFlowRunner(flow, { nodeMs: 500 })
        effect(() => runner.speed.set(p.values.speed))
        effect(() => { const t = total(); const n = flow.node("order"); if (n) n.data.set({ ...n.data.peek(), total: t }) })
        onCleanup(() => runner.reset())
        return <Load from={flowLib}>{({ FlowTimeline }) => <Stack>
          <Row><Button variant="primary" onClick={() => void runner.run()}>Çalıştır</Button>
            <Segmented value={total} options={[{ value: 240, label: "240 ₺" }, { value: 90, label: "90 ₺" }]} aria-label="Sipariş tutarı" /></Row>
          <FlowTimeline runner={runner} />
        </Stack>}</Load>
      },
    },
    layeredLayout: {
      code: `for (const [id, p] of layeredLayout(flow, { gapX: 64 })) flow.node(id)?.x.set(p.x)   // or view.layout()`,
      run: () => {
        const flow = newFlow({ ...doc(), nodes: doc().nodes.map((n, i) => ({ ...n, x: [500, 40, 260, 0][i]!, y: [300, 10, 200, 90][i]! })) })
        const apply = () => { for (const [id, q] of layeredLayout(flow, { gapX: 64 })) { const n = flow.node(id); n?.x.set(q.x); n?.y.set(q.y) } }
        return <Stack>
          <Row><Button variant="primary" onClick={apply}>layeredLayout uygula</Button></Row>
          <ul class="sc-ex-flow-list">{() => flow.nodes().map((n) => <li>{n.id}: {() => `${Math.round(n.x())}, ${Math.round(n.y())}`}</li>)}</ul>
        </Stack>
      },
    },
    Minimap: {
      code: `<Minimap flow={flow} size={() => ({ w: canvas.clientWidth, h: canvas.clientHeight })} />`,
      play: { options: [{ key: "view", label: "Görünen alan", default: "md", options: [{ value: "sm", label: "küçük" }, { value: "md", label: "orta" }, { value: "lg", label: "büyük" }] }] },
      run: (p: { values: { view: string } }) => {
        const flow = newFlow()
        const size = () => (p.values.view === "sm" ? { w: 320, h: 200 } : p.values.view === "lg" ? { w: 1100, h: 520 } : { w: 640, h: 320 })
        const pan = (dx: number, dy: number) => flow.viewport.update((v) => ({ ...v, x: v.x + dx, y: v.y + dy }))
        return <Load from={flowLib}>{({ Minimap }) => <Stack>
          <Minimap flow={flow} size={size} />
          <Row><Button size="sm" onClick={() => pan(120, 0)}>←</Button><Button size="sm" onClick={() => pan(-120, 0)}>→</Button><Button size="sm" onClick={() => pan(0, 80)}>↑</Button><Button size="sm" onClick={() => pan(0, -80)}>↓</Button>
            <Out label="viewport" value={() => { const v = flow.viewport(); return `${Math.round(v.x)}, ${Math.round(v.y)}` }} /></Row>
        </Stack>}</Load>
      },
    },
    NODE_HEAD: {
      code: `const firstPortY = node.y() + NODE_HEAD + PORT_ROW / 2   // ports sit below the header`,
      run: () => <Row><Out label="NODE_HEAD" value={NODE_HEAD} /><Out label="y = 48 düğümde 1. port" value={48 + NODE_HEAD + PORT_ROW / 2} /></Row>,
    },
    NODE_W: {
      code: `const outX = node.x() + NODE_W   // outputs sit on the inline-end edge`,
      run: () => {
        const x = signal(320)
        return <Stack><Segmented value={x} options={[0, 320, 640].map((v) => ({ value: v, label: `x = ${v}` }))} aria-label="Düğüm x" />
          <Row><Out label="NODE_W" value={NODE_W} /><Out label="çıkış x" value={() => x() + NODE_W} /></Row></Stack>
      },
    },
    PORT_ROW: {
      code: `const height = NODE_HEAD + Math.max(inputs.length, outputs.length) * PORT_ROW`,
      run: () => <Stack><Out label="PORT_ROW" value={PORT_ROW} />{TYPES.map((t) => <Out label={String(t.label)} value={`${NODE_HEAD + Math.max(t.inputs?.length ?? 0, t.outputs?.length ?? 0) * PORT_ROW} px`} />)}</Stack>,
    },
    portPoint: {
      code: `portPoint(flow, "check.no", "out")   // { x, y } in world units`,
      run: () => {
        const flow = newFlow()
        return <Stack>
          <Row><Button onClick={() => flow.moveBy(["check"], 0, 32)}>“Tutar” düğümünü indir</Button><Button variant="ghost" onClick={() => flow.load(doc())}>Sıfırla</Button></Row>
          {(["check.in|in", "check.yes|out", "check.no|out", "mail.in|in"] as const).map((k) => { const [ref, side] = k.split("|") as [string, "in" | "out"]; return <Out label={`${ref} (${side})`} value={() => pt(portPoint(flow, ref, side))} /> })}
        </Stack>
      },
    },
    portsOf: {
      code: `const { inputs, outputs } = portsOf(flow.typeOf("check"))`,
      run: () => {
        const type = signal("check")
        const ports = computed(() => portsOf(TYPES.find((t) => t.type === type())))
        return <Stack>
          <Segmented value={type} options={[...TYPES.map((t) => ({ value: t.type, label: String(t.label) })), { value: "?", label: "bilinmeyen" }]} aria-label="Düğüm türü" />
          <Row><Out label="inputs" value={() => ports().inputs.map((x) => x.id).join(", ") || "—"} /><Out label="outputs" value={() => ports().outputs.map((x) => x.id).join(", ") || "—"} /></Row>
        </Stack>
      },
    },
    validateFlow: {
      code: `const problems = validateFlow(JSON.parse(text), types)   // [] when valid
if (problems.length) showErrors(problems); else flow.load(doc)`,
      run: () => {
        const kind = signal("ok")
        const broken = (): unknown => {
          const d = doc()
          if (kind() === "edge") return { ...d, edges: [...d.edges, { id: "e9", from: "mail.out", to: "ghost.in" }] }
          if (kind() === "type") return { ...d, nodes: [...d.nodes, { id: "sms", type: "sms", x: 0, y: 300 }] }
          if (kind() === "id") return { ...d, nodes: [...d.nodes, { ...d.nodes[0]! }] }
          return d
        }
        return <Stack>
          <Segmented value={kind} options={[{ value: "ok", label: "geçerli" }, { value: "edge", label: "kopuk kenar" }, { value: "type", label: "bilinmeyen tür" }, { value: "id", label: "yinelenen id" }]} aria-label="Belge" />
          <ul class="sc-ex-flow-list">{() => { const out = validateFlow(broken(), TYPES); return out.length ? out.map((m) => <li>{m}</li>) : <li>Sorun yok.</li> }}</ul>
        </Stack>
      },
    },
  },
})
