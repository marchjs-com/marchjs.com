// Start-up, March: the page is one component (`let $n = 0` in its body is the counter signal) rendered with
// render(); a start disposes the previous instance and renders the page afresh. The compiled templates are cloned,
// the static data is written once, and only the counter text is bound to a signal. The click reaches the plain
// onClick handler.
import { render } from "hadi-march"
import { rowsFor, HEADS, type Dash, type Run } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Dash): ScenarioApp {
  function Page(p: { k: number }) {
    let $n = 0
    return <div class="dash">
      <header class="hd"><h1>{data.title}</h1><span class="run">{p.k}</span><span class="count">{$n}</span><button class="inc" type="button" onClick={() => { $n++ }}>+1</button></header>
      <nav class="nv"><ul>{data.nav.map((l) => <li><a href={l.href}>{l.label}</a></li>)}</ul></nav>
      <section class="cards">{data.stats.map((s) => <div class="card"><div class="lbl">{s.label}</div><div class="val">{s.value}</div><div class="delta">{s.delta}</div></div>)}</section>
      <table class="bt"><thead><tr>{HEADS.map((t) => <th>{t}</th>)}</tr></thead><tbody>
        {rowsFor(data.rows, p.k).map((r) => <tr><td class="id">{r.id}</td><td><a href={`#u${r.id}`}>{r.name}</a></td><td>{r.email}</td><td><span class={`badge ${r.status}`}>{r.status}</span></td><td class="amt">{r.amount}</td><td>{r.date}</td></tr>)}
      </tbody></table>
      <form class="fm">{data.fields.map((f) => <div class="f"><label>{f.label}</label><input name={f.name} type={f.type} /></div>)}<button type="button">Kaydet</button></form>
    </div>
  }
  let dispose = render(() => <Page k={0} />, host)
  return {
    step: (p) => {
      dispose()
      const k = p as Run
      dispose = render(() => <Page k={k} />, host)
      ;(host.querySelector(".inc") as HTMLElement).click()
    },
    destroy: () => dispose(),
  }
}
