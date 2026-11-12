// Derived values, plain DOM (hand-optimized): a dependency index (field → computed cells that read it) is built once;
// an edit writes the field's text, recomputes only its dependents and writes only the texts and classes that changed.
import { evalComp, compClass, dependents, type Form, type Edit } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Form): ScenarioApp {
  const doc = host.ownerDocument
  const f = data.fields.slice(), get = (i: number) => f[i]!, deps = dependents(data)
  const root = doc.createElement("div"), fbox = doc.createElement("div"), cbox = doc.createElement("div")
  root.className = "dv"; fbox.className = "dv-fs"; cbox.className = "dv-cs"
  const ftext: Text[] = [], ctext: Text[] = [], cel: HTMLElement[] = [], cval: number[] = [], ccls: string[] = []
  for (const v of f) {
    const s = doc.createElement("span"), t = doc.createTextNode(String(v))
    s.className = "dv-f"; s.append(t); fbox.append(s); ftext.push(t)
  }
  for (const c of data.comps) {
    const v = evalComp(c, get), cls = compClass(c, v)
    const s = doc.createElement("span"), t = doc.createTextNode(String(v))
    s.className = cls; s.append(t); cbox.append(s)
    ctext.push(t); cel.push(s); cval.push(v); ccls.push(cls)
  }
  root.append(fbox, cbox)
  host.append(root)
  return {
    step: (p) => {
      const e = p as Edit
      if (f[e.i] === e.v) return
      f[e.i] = e.v
      ftext[e.i]!.data = String(e.v)
      for (const k of deps[e.i]!) {
        const c = data.comps[k]!, v = evalComp(c, get)
        if (v === cval[k]) continue
        cval[k] = v; ctext[k]!.data = String(v)
        const cls = compClass(c, v)
        if (cls !== ccls[k]) { ccls[k] = cls; cel[k]!.className = cls }
      }
    },
    destroy: () => root.remove(),
  }
}
