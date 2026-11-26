// Start-up, ivi: a start clears the root and renders page k afresh (ivi clones its compiled templates); the counter
// is the page component's state (useState) and the "+1" button an @click listener; the click's update runs in ivi's
// microtask, before the paint. Templates compiled with ivi's template compiler (tools/gen-bench.mjs → ivi.gen.js).
import { createRoot, update, component, useState, html } from "ivi"
import { rowsFor, HEADS, type Dash, type Run } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Dash): ScenarioApp {
  const Page = component<number>((c) => {
    const [n, setN] = useState(c, 0)
    const inc = () => setN(n() + 1)
    return (k) => html`<div class="dash">
      <header class="hd"><h1>${data.title}</h1><span class="run">${k}</span><span class="count">${n()}</span><button class="inc" type="button" @click=${inc}>+1</button></header>
      <nav class="nv"><ul>${data.nav.map((l) => html`<li><a href=${l.href}>${l.label}</a></li>`)}</ul></nav>
      <section class="cards">${data.stats.map((s) => html`<div class="card"><div class="lbl">${s.label}</div><div class="val">${s.value}</div><div class="delta">${s.delta}</div></div>`)}</section>
      <table class="bt"><thead><tr>${HEADS.map((t) => html`<th>${t}</th>`)}</tr></thead><tbody>
        ${rowsFor(data.rows, k).map((r) => html`<tr><td class="id">${r.id}</td><td><a href=${`#u${r.id}`}>${r.name}</a></td><td>${r.email}</td><td><span class=${`badge ${r.status}`}>${r.status}</span></td><td class="amt">${r.amount}</td><td>${r.date}</td></tr>`)}
      </tbody></table>
      <form class="fm">${data.fields.map((f) => html`<div class="f"><label>${f.label}</label><input name=${f.name} type=${f.type}></div>`)}<button type="button">Kaydet</button></form>
    </div>`
  })
  const root = createRoot(host)
  update(root, Page(0))
  return {
    step: (k) => {
      update(root, null)
      update(root, Page(k as Run))
      ;(host.querySelector(".inc") as HTMLButtonElement).click()
    },
    destroy: () => update(root, null),
  }
}
