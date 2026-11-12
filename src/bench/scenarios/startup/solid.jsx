// Start-up, SolidJS: the normal start, render(); a start disposes the previous root and renders the page afresh.
// The compiled templates are cloned, the static data is written once, and only the counter text is bound to a
// signal; the "+1" button uses Solid's delegated onClick. Compiled with babel-preset-solid (tools/gen-bench.mjs → solid.gen.js).
import { createSignal } from "solid-js"
import { render } from "solid-js/web"
import { rowsFor, HEADS } from "./def.ts"

export function mount(host, data) {
  function Page(p) {
    const [n, setN] = createSignal(0)
    return (
      <div class="dash">
        <header class="hd"><h1>{data.title}</h1><span class="run">{p.k}</span><span class="count">{n()}</span><button class="inc" type="button" onClick={() => setN(n() + 1)}>+1</button></header>
        <nav class="nv"><ul>{data.nav.map((l) => <li><a href={l.href}>{l.label}</a></li>)}</ul></nav>
        <section class="cards">{data.stats.map((s) => <div class="card"><div class="lbl">{s.label}</div><div class="val">{s.value}</div><div class="delta">{s.delta}</div></div>)}</section>
        <table class="bt"><thead><tr>{HEADS.map((t) => <th>{t}</th>)}</tr></thead><tbody>
          {rowsFor(data.rows, p.k).map((r) => <tr><td class="id">{r.id}</td><td><a href={`#u${r.id}`}>{r.name}</a></td><td>{r.email}</td><td><span class={`badge ${r.status}`}>{r.status}</span></td><td class="amt">{r.amount}</td><td>{r.date}</td></tr>)}
        </tbody></table>
        <form class="fm">{data.fields.map((f) => <div class="f"><label>{f.label}</label><input name={f.name} type={f.type} /></div>)}<button type="button">Kaydet</button></form>
      </div>
    )
  }
  let dispose = render(() => <Page k={0} />, host)
  return {
    step: (k) => {
      dispose()
      dispose = render(() => <Page k={k} />, host)
      host.querySelector(".inc").click()
    },
    destroy: () => dispose(),
  }
}
