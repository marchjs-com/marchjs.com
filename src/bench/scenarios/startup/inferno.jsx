// Start-up, Inferno: the normal start, render(); a start unmounts the previous page and renders page k afresh. The
// counter lives in the page (a class component) and the "+1" button uses Inferno's delegated onClick; forceUpdate()
// is synchronous. Compiled with babel-plugin-inferno (tools/gen-bench.mjs → inferno.gen.js).
import { render, Component } from "inferno"
import { rowsFor, HEADS } from "./def.ts"

export function mount(host, data) {
  class Page extends Component {
    constructor(props) { super(props); this.n = 0; this.inc = () => { this.n++; this.forceUpdate() } }
    render() {
      const k = this.props.k
      return (
        <div className="dash">
          <header className="hd"><h1>{data.title}</h1><span className="run">{k}</span><span className="count">{this.n}</span><button className="inc" type="button" onClick={this.inc}>+1</button></header>
          <nav className="nv"><ul>{data.nav.map((l) => <li><a href={l.href}>{l.label}</a></li>)}</ul></nav>
          <section className="cards">{data.stats.map((s) => <div className="card"><div className="lbl">{s.label}</div><div className="val">{s.value}</div><div className="delta">{s.delta}</div></div>)}</section>
          <table className="bt"><thead><tr>{HEADS.map((t) => <th>{t}</th>)}</tr></thead><tbody $HasKeyedChildren>
            {rowsFor(data.rows, k).map((r) => <tr key={r.id}><td className="id">{r.id}</td><td><a href={`#u${r.id}`}>{r.name}</a></td><td>{r.email}</td><td><span className={`badge ${r.status}`}>{r.status}</span></td><td className="amt">{r.amount}</td><td>{r.date}</td></tr>)}
          </tbody></table>
          <form className="fm">{data.fields.map((f) => <div className="f"><label>{f.label}</label><input name={f.name} type={f.type} /></div>)}<button type="button">Kaydet</button></form>
        </div>
      )
    }
  }
  render(<Page k={0} />, host)
  return {
    step: (k) => {
      render(null, host)
      render(<Page k={k} />, host)
      host.querySelector(".inc").click()
    },
    destroy: () => render(null, host),
  }
}
