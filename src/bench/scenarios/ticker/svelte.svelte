<!-- Live ticker, Svelte 5 (runes): the quotes are deep $state; a tick assigns the changed quotes' price and class and
     Svelte updates only those bindings. Compiled with fragments: "tree" (tools/gen-bench.mjs → svelte.gen.js). -->
<script>
  import { fmtPrice, dir } from "../core.ts";
  let { data } = $props();
  let rows = $state(data.map((q) => ({ id: q.id, sym: q.sym, price: q.price, cls: "px" })));
  export function step(ticks) {
    for (const t of ticks) { const r = rows[t.i]; r.cls = `px ${dir(t.price, r.price)}`; r.price = t.price; }
  }
</script>

<table class="bt"><tbody>
  {#each rows as r (r.id)}
    <tr><td class="sym">{r.sym}</td><td class={r.cls}>{fmtPrice(r.price)}</td></tr>
  {/each}
</tbody></table>
